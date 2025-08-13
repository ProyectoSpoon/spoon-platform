/**
 * TEST SIMPLE PARA VERIFICAR CONFIGURACIÓN
 * Verifica que el setup de testing funciona correctamente
 */

describe('Configuración de Testing', () => {
  test('Jest está configurado correctamente', () => {
    expect(true).toBe(true);
  });

  test('Matchers de jest-dom funcionan', () => {
    const div = document.createElement('div');
    div.textContent = 'Test';
    expect(div).toBeInTheDocument();
  });

  test('Console mocks funcionan', () => {
    console.log('Test log');
    expect(console.log).toHaveBeenCalledWith('Test log');
  });
});
