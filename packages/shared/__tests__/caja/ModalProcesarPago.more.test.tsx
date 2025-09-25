import { render, screen, fireEvent, act } from '@testing-library/react';
import { NotificationProvider } from '@spoon/shared/Context/notification-provider';
import { ModalProcesarPago } from '../../../../apps/web/src/app/dashboard/caja/pages/modals/ModalProcesarPago';

describe('ModalProcesarPago - non-cash flows', () => {
  it('procesa tarjeta sin monto recibido y autocierra', async () => {
    jest.useFakeTimers();
    const onConfirmar = jest.fn().mockResolvedValue({ success: true });
    const onClose = jest.fn();
    const orden = { id: 'o1', tipo: 'mesa' as const, identificador: 'Mesa 2', monto_total: 1000 } as any;

    render(
      <NotificationProvider>
        <ModalProcesarPago
          orden={orden}
          isOpen
          onClose={onClose}
          onConfirmar={onConfirmar}
        />
      </NotificationProvider>
    );

    // Cambia a tarjeta
    fireEvent.click(screen.getByText('Tarjeta'));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar Pago' }));
      // allow onConfirmar promise to resolve and UI to update to success state
      await Promise.resolve();
    });

    expect(onConfirmar).toHaveBeenCalledWith(orden, 'tarjeta', undefined);

    // advance timers to autoclose
    await act(async () => {
      jest.runOnlyPendingTimers();
      jest.advanceTimersByTime(2100);
      await Promise.resolve();
    });
  expect(onClose).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
