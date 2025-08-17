import { render, screen, fireEvent, act } from '@testing-library/react';
import { ModalProcesarPago } from '../../../../apps/web/src/app/dashboard/caja/pages/modals/ModalProcesarPago';

const baseOrden = {
  id: 'o1',
  tipo: 'mesa' as const,
  identificador: 'Mesa 1',
  monto_total: 1000,
  fecha_creacion: new Date().toISOString(),
};

describe('ModalProcesarPago', () => {
  it('valida monto insuficiente en efectivo', async () => {
    const onConfirmar = jest.fn().mockResolvedValue({ success: false, error: 'Monto insuficiente' });
    render(
      <ModalProcesarPago
        orden={baseOrden}
        isOpen={true}
        onClose={() => {}}
        onConfirmar={onConfirmar}
      />
    );

  const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '5' } }); // 500

    const btn = screen.getByRole('button', { name: 'Confirmar Pago' });
    expect(btn).toBeDisabled();
  });

  it('muestra cambio cuando aplica y llama onConfirmar', async () => {
    const onConfirmar = jest.fn().mockResolvedValue({ success: true, cambio: 500 });
    render(
      <ModalProcesarPago
        orden={baseOrden}
        isOpen={true}
        onClose={() => {}}
        onConfirmar={onConfirmar}
      />
    );

    // By default montoRecibido === total
  const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '15' } }); // 1500

    const btn = screen.getByRole('button', { name: 'Confirmar Pago' });
    expect(btn).toBeEnabled();

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(onConfirmar).toHaveBeenCalled();
    expect(await screen.findByText(/Cambio a entregar/)).toBeInTheDocument();
  });
});
