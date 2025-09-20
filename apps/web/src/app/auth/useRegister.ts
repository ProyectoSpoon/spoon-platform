import { useState } from 'react';
import { signUpUser } from '@spoon/shared/lib/supabase';
import toast from 'react-hot-toast';

export interface RegisterData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  ord: string;
  confirmord: string;
}

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validación y sanitización
  const validateRegister = (data: RegisterData) => {
    if (!data.first_name.trim()) return 'El nombre es requerido';
    if (!data.last_name.trim()) return 'El apellido es requerido';
    if (!data.email.trim()) return 'El correo electrónico es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Correo electrónico inválido';
    if (data.ord.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (data.ord !== data.confirmord) return 'Las contraseñas no coinciden';
    if (!data.phone.trim()) return 'El teléfono es requerido';
    if (!/^\d{10}$/.test(data.phone)) return 'El teléfono debe tener 10 dígitos';
    return null;
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    const validationError = validateRegister(data);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      setLoading(false);
      return false;
    }
    try {
      const result = await signUpUser({
        email: data.email.trim(),
  password: data.ord,
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone: data.phone.trim()
      });
      toast.success('¡Registro exitoso!');
      setLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error en el registro');
      toast.error(err.message || 'Error en el registro');
      setLoading(false);
      return false;
    }
  };

  return { register, loading, error };
}
