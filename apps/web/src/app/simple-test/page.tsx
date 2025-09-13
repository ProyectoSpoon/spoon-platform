'use client';

import { useState } from 'react';
import { supabase } from '@spoon/shared/lib/supabase';

export default function SimpleClientTestPage() {
  const [result, setResult] = useState<string>('Haz clic en "Probar Conexión" para comenzar');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setResult('Probando conexión...');
    
    try {
      console.log('🔍 Probando conexión client-side...');
      
      // Test simple
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .limit(1);
      
      console.log('📊 Resultado:', { data, error });
      
      if (error) {
        setResult(`❌ Error: ${error.message}`);
      } else {
        setResult(`✅ Conexión exitosa! Encontrado: ${data?.length || 0} países`);
      }
      
    } catch (error) {
      console.error('💥 Error de conexión:', error);
      setResult(`💥 Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Test Cliente Simple</h1>
      
      <div className="mb-6">
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Probando...' : 'Probar Conexión'}
        </button>
      </div>

      <div className="p-4 border rounded bg-gray-50">
        <h3 className="font-semibold mb-2">Resultado:</h3>
        <p className="text-sm">{result}</p>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="text-lg font-semibold mb-2">📝 Instrucciones:</h3>
        <ol className="text-sm space-y-1">
          <li>1. Abre las herramientas de desarrollador (F12)</li>
          <li>2. Ve a la pestaña "Console"</li>
          <li>3. Haz clic en "Probar Conexión"</li>
          <li>4. Revisa los logs en la consola</li>
        </ol>
      </div>
    </div>
  );
}
