'use client';

import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { signInUser, signUpUser, getUserProfile, getUserRestaurant } from '@spoon/shared';

const AuthPage = () => {
  const router = useRouter();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  // Estados separados para login y registro
  const [datosLogin, setDatosLogin] = useState({
    correo: '',
    contrasena: ''
  });

  const [datosRegistro, setDatosRegistro] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Manejadores de cambio separados
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

  // Validaciones para registro
  const validarFormularioRegistro = () => {
    if (!datosRegistro.first_name.trim()) return 'El nombre es requerido';
    if (!datosRegistro.last_name.trim()) return 'El apellido es requerido';
    if (!datosRegistro.email.trim()) return 'El correo electrónico es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosRegistro.email)) 
      return 'Correo electrónico inválido';
    if (datosRegistro.password.length < 6) 
      return 'La contraseña debe tener al menos 6 caracteres';
    if (datosRegistro.password !== datosRegistro.confirmPassword) 
      return 'Las contraseñas no coinciden';
    if (!datosRegistro.phone.trim()) 
      return 'El teléfono es requerido';
    if (!/^\d{10}$/.test(datosRegistro.phone)) 
      return 'El teléfono debe tener 10 dígitos';
    return '';
  };

  // Función helper para determinar el siguiente paso
  const getNextStepUrl = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return '/config-restaurante/informacion-general';
      case 2:
        return '/config-restaurante/ubicacion';
      case 3:
        return '/config-restaurante/horario-comercial';
      case 4:
        return '/config-restaurante/logo-portada';
      default:
        return '/config-restaurante';
    }
  };

  // Lógica común para verificar restaurante después del login
  const verificarConfiguracionRestaurante = async () => {
    try {
      const profile = await getUserProfile();
      const restaurant = await getUserRestaurant();
      
      if (!profile) {
        throw new Error('Error al obtener datos del usuario');
      }

      if (!restaurant) {
        console.log('❌ Usuario no tiene restaurante, redirigiendo a configuración...');
        toast.success('¡Bienvenido! Vamos a configurar tu restaurante.');
        router.push('/config-restaurante');
      } else {
        console.log('📊 Datos del restaurante:', {
          id: restaurant.id,
          name: restaurant.name,
          setup_completed: restaurant.setup_completed,
          setup_step: restaurant.setup_step
        });
        
        if (restaurant.setup_completed) {
          console.log('✅ Configuración completa, redirigiendo al dashboard');
          toast.success(`¡Bienvenido de vuelta${restaurant.name ? ` a ${restaurant.name}` : ''}!`);
          router.push('/dashboard');
        } else {
          const nextStep = getNextStepUrl(restaurant.setup_step);
          console.log(`⚠️ Configuración incompleta (paso ${restaurant.setup_step}/4), redirigiendo a:`, nextStep);
          toast.success(
            `¡Bienvenido! Completa la configuración de tu restaurante (paso ${restaurant.setup_step}/4)`,
            { duration: 4000 }
          );
          router.push(nextStep);
        }
      }
    } catch (restaurantError) {
      console.error('❌ Error al verificar restaurante:', restaurantError);
      router.push('/config-restaurante');
    }
  };

  // Manejador para LOGIN
  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      console.log('🔐 Intentando login con:', datosLogin.correo);
      await signInUser(datosLogin.correo, datosLogin.contrasena);
      toast.success('¡Bienvenido!');
      await verificarConfiguracionRestaurante();
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      
      let mensajeError = 'Error al iniciar sesión';
      if (err.message?.includes('Invalid login credentials')) {
        mensajeError = 'Email o contraseña incorrectos';
      } else if (err.message?.includes('Email not confirmed')) {
        mensajeError = 'Debes confirmar tu email antes de iniciar sesión';
      } else if (err.message?.includes('Too many requests')) {
        mensajeError = 'Demasiados intentos. Intenta de nuevo en unos minutos';
      } else if (err.message) {
        mensajeError = err.message;
      }
      
      setError(mensajeError);
      toast.error(mensajeError);
      setCargando(false);
    }
  };

  // Manejador para REGISTRO
  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validarFormularioRegistro();
    if (validationError) {
      setError(validationError);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      console.log('📝 Iniciando registro con Supabase...');
      
      const result = await signUpUser({
        email: datosRegistro.email,
        password: datosRegistro.password,
        first_name: datosRegistro.first_name,
        last_name: datosRegistro.last_name,
        phone: datosRegistro.phone
      });

      console.log('✅ Registro exitoso:', {
        user_id: result.user.id,
        email: result.user.email
      });

      toast.success('¡Cuenta creada exitosamente!');
      toast.success('¡Bienvenido! Configuremos tu restaurante.');
      
      console.log('🆕 Usuario nuevo, redirigiendo a configuración...');
      router.push('/config-restaurante');

    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      
      let mensajeError = 'Error al crear la cuenta';
      if (error.message?.includes('already registered')) {
        mensajeError = 'Este email ya está registrado';
      } else if (error.message?.includes('weak_password')) {
        mensajeError = 'La contraseña es muy débil';
      } else if (error.message?.includes('invalid_email')) {
        mensajeError = 'Email inválido';
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      setError(mensajeError);
      toast.error(mensajeError);
      setCargando(false);
    }
  };

  // Función para alternar entre modos
  const toggleModo = () => {
    setModoRegistro(!modoRegistro);
    setError(null);
    setDatosLogin({ correo: '', contrasena: '' });
    setDatosRegistro({
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setMostrarContrasena(false);
    setMostrarConfirmPassword(false);
  };

  return (
    <div className="flex min-h-screen">
      <Toaster position="top-right" />
      
      {/* Columna izquierda - Información de Spoon */}
      <div className="hidden md:flex w-1/2 relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/images/fondologinusr.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="relative z-20 w-full flex flex-col justify-center p-12">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold text-white mb-6">
              {modoRegistro 
                ? "Únete a la revolución gastronómica" 
                : "Conecta con más clientes en tu zona"
              }
            </h1>
            <p className="text-xl text-white/90 mb-10">
              {modoRegistro
                ? "Crea tu cuenta y empieza a digitalizar tu restaurante hoy mismo"
                : "Expande tu negocio con nuestra plataforma de gestión de restaurantes y domicilios"
              }
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-orange-400 font-semibold mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                  Geolocalización
                </h3>
                <p className="text-white/90">Alcanza clientes en cualquier zona y optimiza tus entregas</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-orange-400 font-semibold mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                  Sistema de Reseñas
                </h3>
                <p className="text-white/90">Mejora tu servicio con feedback real de los clientes</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-orange-400 font-semibold mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                  Notificaciones
                </h3>
                <p className="text-white/90">Mantén informados a tus clientes sobre sus pedidos</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <h3 className="text-orange-400 font-semibold mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                  Gestión de Domicilios
                </h3>
                <p className="text-white/90">Control total sobre tus entregas y repartidores</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Columna derecha - Formulario */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header dinámico */}
          <div className="text-center">
            <img
              src="/images/spoon-logo.jpg"
              alt="Spoon Logo"
              className="mx-auto h-[120px] w-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {modoRegistro ? 'Crear cuenta en SPOON' : 'Bienvenido de nuevo'}
            </h2>
            <p className="text-gray-600">
              {modoRegistro 
                ? 'Únete y empieza a gestionar tu restaurante'
                : 'Ingresa a tu cuenta para gestionar tu restaurante'
              }
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* FORMULARIO CONDICIONAL */}
          {modoRegistro ? (
            /* ========== FORMULARIO DE REGISTRO ========== */
            <form onSubmit={manejarRegistro} className="space-y-4">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    name="first_name"
                    value={datosRegistro.first_name}
                    onChange={manejarCambioRegistro}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellido</label>
                  <input
                    type="text"
                    name="last_name"
                    value={datosRegistro.last_name}
                    onChange={manejarCambioRegistro}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={datosRegistro.email}
                  onChange={manejarCambioRegistro}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  maxLength={255}
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono móvil</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">+57</span>
                  <input
                    type="tel"
                    name="phone"
                    value={datosRegistro.phone}
                    onChange={manejarCambioRegistro}
                    className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="3001234567"
                    maxLength={10}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Solo números, 10 dígitos</p>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <div className="relative mt-1">
                  <input
                    type={mostrarContrasena ? "text" : "password"}
                    name="password"
                    value={datosRegistro.password}
                    onChange={manejarCambioRegistro}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                <div className="relative mt-1">
                  <input
                    type={mostrarConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={datosRegistro.confirmPassword}
                    onChange={manejarCambioRegistro}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {mostrarConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Botón de registro */}
              <button
                type="submit"
                disabled={cargando}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    <span>Creando cuenta...</span>
                  </div>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </form>
          ) : (
            /* ========== FORMULARIO DE LOGIN ========== */
            <form onSubmit={manejarLogin} className="space-y-6">
              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  required
                  value={datosLogin.correo}
                  onChange={manejarCambioLogin}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Ingresa tu email"
                />
              </div>

              <div>
                <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">Contraseña</label>
                <div className="relative mt-1">
                  <input
                    id="contrasena"
                    name="contrasena"
                    type={mostrarContrasena ? 'text' : 'password'}
                    required
                    value={datosLogin.contrasena}
                    onChange={manejarCambioLogin}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {mostrarContrasena ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => toast('Recuperar contraseña próximamente', { 
                    icon: 'ℹ️',
                    duration: 3000
                  })}
                  className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  'Iniciar sesión'
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O continúa con</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.error('Google Sign-In estará disponible próximamente')}
                disabled={true}
                className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-400 font-medium py-3 px-4 border border-gray-200 rounded-lg shadow-sm cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#9CA3AF"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#9CA3AF"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#9CA3AF"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#9CA3AF"/>
                </svg>
                <span>Continuar con Google (Próximamente)</span>
              </button>
            </form>
          )}

          {/* Toggle entre modos */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              {modoRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
              <button
                onClick={toggleModo}
                className="font-medium text-orange-500 hover:text-orange-600 transition-colors"
              >
                {modoRegistro ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            </p>
            
            <p className="text-center text-sm text-gray-600">
              ¿Necesitas ayuda?{' '}
              <Link href="/soporte" className="font-medium text-orange-500 hover:text-orange-600 transition-colors">
                Contacta soporte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;