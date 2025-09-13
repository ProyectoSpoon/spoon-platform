// Test rápido de conexión a Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (correcta desde .env.local)
const supabaseUrl = 'https://lwwmmufsdtbetgieoefo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3d21tdWZzZHRiZXRnaWVvZWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODIxNTYsImV4cCI6MjA2ODk1ODE1Nn0.Nt3EBRdcdOjDqenY2WvUd1_zZSXWN7TLo-sRIWwh6Iw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Probando conexión a Supabase...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Test 1: Listar tablas (intentar obtener countries)
    console.log('\n1️⃣ Probando tabla countries...');
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .limit(5);

    if (countriesError) {
      console.error('❌ Error en countries:', countriesError);
    } else {
      console.log('✅ Countries encontradas:', countries?.length || 0);
      countries?.forEach(c => console.log(`  - ${c.name} (${c.code}) - ID: ${c.id}`));
    }

    // Test 2: Probar departments
    console.log('\n2️⃣ Probando tabla departments...');
    const { data: departments, error: depError } = await supabase
      .from('departments')
      .select('*')
      .limit(5);

    if (depError) {
      console.error('❌ Error en departments:', depError);
    } else {
      console.log('✅ Departments encontrados:', departments?.length || 0);
      departments?.forEach(d => console.log(`  - ${d.name} (${d.code})`));
    }

    // Test 3: Probar cities
    console.log('\n3️⃣ Probando tabla cities...');
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .limit(5);

    if (citiesError) {
      console.error('❌ Error en cities:', citiesError);
    } else {
      console.log('✅ Cities encontradas:', cities?.length || 0);
      cities?.forEach(c => console.log(`  - ${c.name} (${c.department_id})`));
    }

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

testDatabase();
