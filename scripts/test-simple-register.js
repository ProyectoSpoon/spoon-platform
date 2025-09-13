/**
 * Script simplificado para probar registro sin complicaciones
 * Ejecutar con: node scripts/test-simple-register.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno faltantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSimpleRegister() {
  const testUser = {
    email: `test.${Date.now()}@example.com`,
    password: 'test123456',
    first_name: 'Test',
    last_name: 'User',
    phone: '1234567890'
  };

  console.log('🧪 Probando registro simple:', testUser.email);

  try {
    // 1. Solo crear en auth.users (sin inserción automática en public.users)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          first_name: testUser.first_name,
          last_name: testUser.last_name,
          phone: testUser.phone
        }
      }
    });

    if (authError) {
      console.error('❌ Error en auth.signUp:', authError);
      return;
    }

    console.log('✅ Usuario creado en auth.users:', authData.user?.id);
    console.log('📧 Email confirmado:', authData.user?.email_confirmed_at ? 'SÍ' : 'NO');

    // 2. Intentar crear perfil manualmente
    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          first_name: testUser.first_name,
          last_name: testUser.last_name,
          email: testUser.email,
          phone: testUser.phone,
          role: 'restaurant_owner',
          is_active: true
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Error creando perfil:', profileError);
      } else {
        console.log('✅ Perfil creado en public.users:', profileData.id);
      }
    }

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

testSimpleRegister().catch(console.error);
