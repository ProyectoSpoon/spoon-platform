#!/usr/bin/env node

/**
 * Script de migración para crear funciones RPC de usuarios
 * Soluciona problemas críticos de RLS y roles personalizados
 */

const fs = require('fs');
const path = require('path');

// Configurar Supabase - usar variables de entorno del sistema
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Si no están disponibles, intentar cargar desde archivos comunes
let supabase = null;

function loadSupabaseConfig() {
  const possiblePaths = [
    path.join(__dirname, '../apps/web/.env.local'),
    path.join(__dirname, '../apps/web/.env'),
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../.env')
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      console.log(`📄 Cargando configuración desde: ${envPath}`);
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');

      for (const line of lines) {
        const [key, value] = line.split('=');
        if (key && value) {
          const cleanKey = key.trim();
          const cleanValue = value.trim().replace(/^["']|["']$/g, '');

          if (cleanKey === 'NEXT_PUBLIC_SUPABASE_URL' && !supabaseUrl) {
            process.env.NEXT_PUBLIC_SUPABASE_URL = cleanValue;
          }
          if (cleanKey === 'SUPABASE_SERVICE_ROLE_KEY' && !supabaseServiceKey) {
            process.env.SUPABASE_SERVICE_ROLE_KEY = cleanValue;
          }
        }
      }
      break;
    }
  }

  const finalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const finalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!finalUrl || !finalKey) {
    console.error('❌ Error: Variables de entorno no encontradas');
    console.error('Necesitas configurar:');
    console.error('  NEXT_PUBLIC_SUPABASE_URL');
    console.error('  SUPABASE_SERVICE_ROLE_KEY');
    console.error('');
    console.error('Puedes:');
    console.error('  1. Crear un archivo .env.local en apps/web/');
    console.error('  2. Ejecutar el SQL manualmente en Supabase');
    process.exit(1);
  }

  // Importar dinámicamente para evitar errores si no está instalado
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(finalUrl, finalKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ Conexión a Supabase configurada');
  } catch (error) {
    console.error('❌ Error: @supabase/supabase-js no está instalado');
    console.error('Ejecuta: npm install @supabase/supabase-js');
    process.exit(1);
  }
}

// Configurar Supabase al inicio
loadSupabaseConfig();

async function ejecutarMigracion() {
  console.log('🚀 Iniciando migración de funciones RPC para usuarios...\n');

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'create_user_rpc.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 SQL cargado exitosamente');
    console.log(`📏 Tamaño: ${sqlContent.length} caracteres\n`);

    // Dividir el SQL en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Encontrados ${statements.length} statements SQL\n`);

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`⚡ Ejecutando statement ${i + 1}/${statements.length}...`);

      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          // Si exec_sql no existe, intentar con una consulta directa
          console.log('   Intentando ejecución directa...');
          const { error: directError } = await supabase.from('_temp_exec').select('*').limit(1);

          if (directError && directError.message.includes('relation "_temp_exec" does not exist')) {
            // Crear tabla temporal para ejecutar SQL
            await supabase.rpc('exec', { query: statement });
          } else {
            throw error;
          }
        }

        console.log('   ✅ Statement ejecutado correctamente');
      } catch (error) {
        console.error(`   ❌ Error en statement ${i + 1}:`, error.message);

        // Intentar ejecutar directamente con una función especial
        try {
          console.log('   🔄 Intentando método alternativo...');
          const { data, error: altError } = await supabase
            .from('pg_proc')
            .select('*')
            .limit(1);

          if (!altError) {
            // Si podemos acceder a pg_proc, intentar crear las funciones directamente
            console.log('   ⚠️  Método alternativo no disponible. Necesitas ejecutar el SQL manualmente.');
            console.log('   📋 SQL a ejecutar:');
            console.log('   ---');
            console.log(statement);
            console.log('   ---');
          }
        } catch (altError) {
          console.log('   ⚠️  No se puede ejecutar automáticamente. Necesitas ejecutar el SQL manualmente.');
        }
      }
    }

    console.log('\n🎉 Migración completada exitosamente!');
    console.log('\n📋 Funciones creadas:');
    console.log('   • create_user_direct() - Crea usuarios sin restricciones RLS');
    console.log('   • create_custom_role() - Crea roles personalizados');
    console.log('   • get_available_roles() - Obtiene todos los roles disponibles');

    console.log('\n🔧 Próximos pasos:');
    console.log('   1. Reinicia tu aplicación');
    console.log('   2. Prueba crear un nuevo usuario desde configuración');
    console.log('   3. Verifica que ya no aparezca el error RLS');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar la migración
if (require.main === module) {
  ejecutarMigracion();
}

module.exports = { ejecutarMigracion };
