'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { getUserProfile, getUserRestaurant } from '@spoon/shared';
import { useLogin } from './useLogin';
import { useRegister } from './useRegister';
import { usePasswordRecovery } from './usePasswordRecovery';

const AuthPage = () => {
  const router = useRouter();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useLogin();
  const { register } = useRegister();
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [datosLogin, setDatosLogin] = useState({ correo: '', contrasena: '' });
  const [datosRegistro, setDatosRegistro] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const recovery = usePasswordRecovery();

  const manejarCambioLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosLogin(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const manejarCambioRegistro = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosRegistro(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const getNextStepUrl = (currentStep: number) => {
    switch (currentStep) {
      case 1: return '/config-restaurante/informacion-general';
      case 2: return '/config-restaurante/ubicacion';
      case 3: return '/config-restaurante/horario-comercial';
      case 4: return '/config-restaurante/logo-portada';
      default: return '/config-restaurante';
    }
  };

  const verificarConfiguracionRestaurante = async () => {
    try {
      const profile = await getUserProfile();
      const restaurant = await getUserRestaurant();
      if (!profile) throw new Error('Error al obtener datos del usuario');
      if (!restaurant) {
        toast.success('¡Bienvenido! Vamos a configurar tu restaurante.');
        router.push('/config-restaurante');
      } else if (restaurant.setup_completed) {
        toast.success(`¡Bienvenido de vuelta${restaurant.name ? ` a ${restaurant.name}` : ''}!`);
        router.push('/dashboard');
      } else {
        const nextStep = getNextStepUrl(restaurant.setup_step);
        toast.success(`¡Bienvenido! Completa la configuración de tu restaurante (paso ${restaurant.setup_step}/4)`, { duration: 4000 });
        router.push(nextStep);
      }
    } catch {
      router.push('/config-restaurante');
    }
  };

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = await login(datosLogin.correo, datosLogin.contrasena);
    if (success) {
      await verificarConfiguracionRestaurante();
    }
  };

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await register(datosRegistro);
    if (result && result.user) {
      setModoRegistro(false);
      router.push('/config-restaurante');
    }
  };

  const toggleModo = () => setModoRegistro(!modoRegistro);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300">
      {/* Columna izquierda - Información/promoción */}
      <div className="hidden md:flex w-1/2 flex-col justify-center items-center bg-gradient-to-br from-orange-300 via-orange-200 to-orange-100 p-12 relative">
        <img src="/images/spoon-logo.jpg" alt="Spoon Logo" className="mx-auto h-[120px] w-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-6 text-center drop-shadow-lg">
          {modoRegistro ? 'Únete a la revolución gastronómica' : 'Conecta con más clientes en tu zona'}
        </h1>
        <p className="text-lg text-white/90 mb-8 text-center">
          {modoRegistro
            ? 'Crea tu cuenta y empieza a digitalizar tu restaurante hoy mismo'
            : 'Expande tu negocio con nuestra plataforma de gestión de restaurantes y domicilios'}
        </p>
        <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
            <h3 className="text-orange-400 font-semibold mb-2">Geolocalización</h3>
            <p className="text-white/90">Alcanza clientes en cualquier zona y optimiza tus entregas</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
            <h3 className="text-orange-400 font-semibold mb-2">Sistema de Reseñas</h3>
            <p className="text-white/90">Mejora tu servicio con feedback real de los clientes</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
            <h3 className="text-orange-400 font-semibold mb-2">Notificaciones</h3>
            <p className="text-white/90">Mantén informados a tus clientes sobre sus pedidos</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
            <h3 className="text-orange-400 font-semibold mb-2">Gestión de Domicilios</h3>
            <p className="text-white/90">Control total sobre tus entregas y repartidores</p>
          </div>
        </div>
      </div>
      {/* Columna derecha - Formulario */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <img src="/images/spoon-logo.jpg" alt="Spoon Logo" className="mx-auto h-[120px] w-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {modoRegistro ? 'Crear cuenta en SPOON' : 'Bienvenido de nuevo'}
            </h2>
            <p className="text-gray-600">
              {modoRegistro ? 'Únete y empieza a gestionar tu restaurante' : 'Ingresa a tu cuenta para gestionar tu restaurante'}
            </p>
          </div>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          {modoRegistro ? (
            <form onSubmit={manejarRegistro} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input type="text" name="first_name" value={datosRegistro.first_name} onChange={manejarCambioRegistro} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required maxLength={100} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellido</label>
                  <input type="text" name="last_name" value={datosRegistro.last_name} onChange={manejarCambioRegistro} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required maxLength={100} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                <input type="email" name="email" value={datosRegistro.email} onChange={manejarCambioRegistro} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required maxLength={255} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono móvil</label>
                <input type="tel" name="phone" value={datosRegistro.phone} onChange={manejarCambioRegistro} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="3001234567" maxLength={10} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <div className="relative mt-1">
                  <input type={mostrarContrasena ? "text" : "password"} name="password" value={datosRegistro.password} onChange={manejarCambioRegistro} className="block w-full px-3 py-2 border border-gray-300 rounded-md" required minLength={6} />
                  <button type="button" onClick={() => setMostrarContrasena(!mostrarContrasena)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                    {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                <div className="relative mt-1">
                  <input type={mostrarConfirmPassword ? "text" : "password"} name="confirmPassword" value={datosRegistro.confirmPassword} onChange={manejarCambioRegistro} className="block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                  <button type="button" onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                    {mostrarConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={cargando} className="w-full py-3 px-4 rounded-lg text-white bg-orange-500 hover:bg-orange-600">
                {cargando ? (<span>Creando cuenta...</span>) : 'Crear cuenta'}
              </button>
            </form>
          ) : (
            <form onSubmit={manejarLogin} className="space-y-6">
              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700">Email</label>
                <input id="correo" name="correo" type="email" required value={datosLogin.correo} onChange={manejarCambioLogin} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Ingresa tu email" />
              </div>
              <div>
                <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">Contraseña</label>
                <div className="relative mt-1">
                  <input id="contrasena" name="contrasena" type={mostrarContrasena ? 'text' : 'password'} required value={datosLogin.contrasena} onChange={manejarCambioLogin} className="block w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="••••••••" />
                  <button type="button" onClick={() => setMostrarContrasena(!mostrarContrasena)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {mostrarContrasena ? (<EyeOff className="h-5 w-5 text-gray-400" />) : (<Eye className="h-5 w-5 text-gray-400" />)}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={cargando} className="w-full py-3 px-4 rounded-lg text-white bg-orange-500 hover:bg-orange-600">
                {cargando ? (<span>Iniciando sesión...</span>) : 'Iniciar sesión'}
              </button>
              <div className="text-right">
                <button type="button" onClick={() => setMostrarRecuperar(true)} className="text-sm text-orange-500 hover:text-orange-600">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>
          )}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {modoRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
              <button onClick={toggleModo} className="font-medium text-orange-500 hover:text-orange-600">
                {modoRegistro ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            </p>
          </div>
        </div>
        {/* Modal recuperación, sobre la columna derecha */}
        {mostrarRecuperar && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-orange-500" onClick={() => setMostrarRecuperar(false)}>
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4 text-orange-500">Recuperar contraseña</h3>
              {(recovery.error || recovery.success) && (
                <div className={`p-4 rounded mb-4 ${recovery.error ? 'bg-red-50 border-l-4 border-red-500' : 'bg-green-50 border-l-4 border-green-500'}`}>
                  <p className={recovery.error ? 'text-red-700 text-sm' : 'text-green-700 text-sm'}>{recovery.error || recovery.success}</p>
                </div>
              )}
              <form onSubmit={recovery.handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="recuperar-email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                  <input
                    id="recuperar-email"
                    name="recuperar-email"
                    type="email"
                    required
                    value={recovery.email}
                    onChange={recovery.handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Ingresa tu correo"
                  />
                </div>
                <button type="submit" disabled={recovery.loading} className="w-full py-3 px-4 rounded-lg text-white bg-orange-500 hover:bg-orange-600">
                  {recovery.loading ? (<span>Enviando...</span>) : 'Recuperar contraseña'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;