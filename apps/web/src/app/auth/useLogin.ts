import { useState } from 'react';
import { signInUser } from '@spoon/shared';
import toast from 'react-hot-toast';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sanitiza y valida los datos antes de enviar
  const validateLogin = (correo: string, contrasena: string) => {
    if (!correo.trim()) return 'El correo es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return 'Correo inválido';
    if (!contrasena || contrasena.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return null;
  };

  const login = async (correo: string, contrasena: string) => {
    setLoading(true);
    setError(null);
    const validationError = validateLogin(correo, contrasena);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      setLoading(false);
      return false;
    }
    try {
      await signInUser(correo.trim(), contrasena);
      toast.success('¡Bienvenido!');
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
      toast.error(err.message || 'Error de autenticación');
      setLoading(false);
      return false;
    }
  };

  return { login, loading, error };
}
