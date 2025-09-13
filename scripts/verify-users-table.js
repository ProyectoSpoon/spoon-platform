/**
 * Script para verificar la existencia de la tabla 'users' en Supabase
 * Ejecutar con: node scripts/verify-users-table.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/web/.env.local' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno faltantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   - SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyUsersTable() {
  console.log('🔍 Verificando existencia de la tabla "users"...\n');

  try {
    // 1. Verificar si la tabla existe consultando information_schema
    console.log('📋 1. Consultando esquema de la base de datos...');
    const { data: tableInfo, error: schemaError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'users');

    if (schemaError) {
      console.error('❌ Error consultando esquema:', schemaError.message);
    } else if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Tabla "users" encontrada:', tableInfo[0]);
    } else {
      console.log('❌ Tabla "users" NO encontrada');
    }

    // 2. Intentar consultar directamente la tabla
    console.log('\n📋 2. Intentando consulta directa a la tabla "users"...');
    const { data: userData, error: queryError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (queryError) {
      console.error('❌ Error consultando tabla "users":', queryError.message);
      console.error('   Código:', queryError.code);
      console.error('   Detalles:', queryError.details);
    } else {
      console.log('✅ Consulta exitosa a tabla "users"');
      console.log('   Registros encontrados:', userData?.length || 0);
      if (userData && userData.length > 0) {
        console.log('   Estructura de ejemplo:', Object.keys(userData[0]));
      }
    }

    // 3. Verificar columnas de la tabla si existe
    console.log('\n📋 3. Consultando estructura de columnas...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Error consultando columnas:', columnsError.message);
    } else if (columns && columns.length > 0) {
      console.log('✅ Estructura de la tabla "users":');
      console.table(columns);
    } else {
      console.log('❌ No se encontraron columnas para la tabla "users"');
    }

    // 4. Listar todas las tablas disponibles
    console.log('\n📋 4. Tablas disponibles en el esquema "public":');
    const { data: allTables, error: allTablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');

    if (allTablesError) {
      console.error('❌ Error listando tablas:', allTablesError.message);
    } else if (allTables && allTables.length > 0) {
      console.log('✅ Tablas encontradas:');
      allTables.forEach(table => {
        console.log(`   - ${table.table_name} (${table.table_type})`);
      });
    } else {
      console.log('❌ No se encontraron tablas');
    }

    // 5. Verificar si existe auth.users (tabla de autenticación)
    console.log('\n📋 5. Verificando tabla de autenticación auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error accediendo a auth.users:', authError.message);
    } else {
      console.log('✅ Acceso exitoso a auth.users');
      console.log(`   Total de usuarios registrados: ${authUsers.users?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando verificación de tabla "users"');
  console.log('📍 URL Supabase:', supabaseUrl);
  console.log('🔑 Service Key configurada:', !!supabaseServiceKey);
  console.log('═'.repeat(60));
  
  await verifyUsersTable();
  
  console.log('\n═'.repeat(60));
  console.log('✅ Verificación completada');
}

// Ejecutar el script
main().catch(console.error);
