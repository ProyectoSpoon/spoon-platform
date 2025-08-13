import { useState } from "react";
import { supabase } from "@spoon/shared/lib/supabase";

export function usePasswordRecovery() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!email) {
      setError("Por favor ingresa tu correo electrónico.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Te hemos enviado un correo para recuperar tu contraseña.");
    }
    setLoading(false);
  };

  return {
    email,
    loading,
    error,
    success,
    handleChange,
    handleSubmit,
  };
}
