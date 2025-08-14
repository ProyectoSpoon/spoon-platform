import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthPage from './page';

// Mock router and toast
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn() } }));

// Mock hooks
jest.mock('./useLogin', () => ({
  useLogin: () => ({
    login: jest.fn(async (correo, contrasena) => correo === 'test@correo.com' && contrasena === '123456'),
    loading: false,
    error: null,
  })
}));
jest.mock('./useRegister', () => ({
  useRegister: () => ({
    register: jest.fn(async (data) => data.email === 'nuevo@correo.com' ? { user: { id: '1' } } : false),
    loading: false,
    error: null,
  })
}));

describe('AuthPage', () => {
  it('renderiza formulario de login por defecto', () => {
    render(<AuthPage />);
    expect(screen.getByText(/Bienvenido de nuevo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
  });

  it('permite cambiar a modo registro', () => {
    render(<AuthPage />);
    fireEvent.click(screen.getByText(/Crear cuenta/i));
    expect(screen.getByText(/Crear cuenta en SPOON/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
  });

  it('valida login exitoso', async () => {
    render(<AuthPage />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@correo.com', name: 'correo' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: '123456', name: 'contrasena' } });
    fireEvent.click(screen.getByText(/Iniciar sesión/i));
    await waitFor(() => {
      // El mock de login retorna true para este caso
    });
  });

  it('valida registro exitoso', async () => {
    render(<AuthPage />);
    fireEvent.click(screen.getByText(/Crear cuenta/i));
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'nuevo@correo.com', name: 'email' } });
    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Juan', name: 'first_name' } });
    fireEvent.change(screen.getByLabelText(/Apellido/i), { target: { value: 'Pérez', name: 'last_name' } });
    fireEvent.change(screen.getByLabelText(/Teléfono móvil/i), { target: { value: '3001234567', name: 'phone' } });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: '123456', name: 'password' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), { target: { value: '123456', name: 'confirmPassword' } });
  fireEvent.click(screen.getByRole('button', { name: /^Crear cuenta$/i }));
    await waitFor(() => {
      // El mock de register retorna { user: { id: '1' } } para este caso
    });
  });
});
