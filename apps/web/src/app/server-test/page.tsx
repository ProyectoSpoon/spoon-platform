import { supabase } from '@spoon/shared/lib/supabase';

async function testServerSideConnection() {
  console.log('🔍 Iniciando test server-side...');
  
  try {
    // Test countries
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .limit(3);
    
    console.log('Countries result:', { data: countries, error: countriesError });
    
    // Test departments
    const { data: departments, error: departmentsError } = await supabase
      .from('departments')
      .select('*')
      .limit(3);
    
    console.log('Departments result:', { data: departments, error: departmentsError });
    
    return {
      countries: countries || [],
      departments: departments || [],
      hasErrors: !!(countriesError || departmentsError),
      errorMessages: [
        countriesError?.message,
        departmentsError?.message
      ].filter(Boolean)
    };
  } catch (error) {
    console.error('Server-side error:', error);
    return {
      countries: [],
      departments: [],
      hasErrors: true,
      errorMessages: [String(error)]
    };
  }
}

export default async function ServerTestPage() {
  const testResult = await testServerSideConnection();
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Server-Side Supabase Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Resultados del servidor:</h2>
        <p className={`text-lg ${testResult.hasErrors ? 'text-red-600' : 'text-green-600'}`}>
          {testResult.hasErrors ? 'Errores encontrados' : 'Conexión exitosa'}
        </p>
      </div>

      {testResult.hasErrors && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Errores:</h3>
          <ul className="text-red-700">
            {testResult.errorMessages.map((error, index) => (
              <li key={index} className="mb-1">• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">🌍 Countries ({testResult.countries.length})</h3>
          <div className="space-y-1 text-sm">
            {testResult.countries.map((country: any) => (
              <div key={country.id} className="bg-gray-100 p-2 rounded">
                <div className="font-medium">{country.name}</div>
                <div className="text-gray-600">{country.iso_code}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">🏛️ Departments ({testResult.departments.length})</h3>
          <div className="space-y-1 text-sm">
            {testResult.departments.map((dept: any) => (
              <div key={dept.id} className="bg-gray-100 p-2 rounded">
                <div className="font-medium">{dept.name}</div>
                <div className="text-gray-600">{dept.code}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="text-lg font-semibold mb-2">📝 Información:</h3>
        <p className="text-sm">
          Esta página ejecuta las consultas en el servidor (Server Components de Next.js)
          para verificar si el problema está en el cliente o en la configuración general.
        </p>
      </div>
    </div>
  );
}
