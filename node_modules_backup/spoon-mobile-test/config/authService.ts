import { supabase } from './supabase';

export const authService = {
  signUp: async (email: string, password: string, name: string, phone: string) => {
    try {
      console.log('🔄 Iniciando signUp para:', email);
      
      // 1. Crear usuario en auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      console.log('📝 Auth result:', { authData, authError });
      
      if (authError) {
        console.log('❌ Auth error:', authError);
        return { success: false, error: authError.message, user: null };
      }
      
      if (!authData.user) {
        console.log('❌ No user created');
        return { success: false, error: 'No user created', user: null };
      }
      
      console.log('✅ Usuario creado en auth.users:', authData.user.id);
      
      // 2. Insertar perfil en user_profiles_app
      console.log('🔄 Insertando en user_profiles_app...');
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles_app')
        .insert({
          id: authData.user.id,
          email: email,
          name: name,
          phone: phone,
          role: 'customer'
        });
      
      console.log('📝 Profile result:', { profileData, profileError });
      
      if (profileError) {
        console.log('❌ Profile error:', profileError);
        return { success: false, error: `Profile error: ${profileError.message}`, user: null };
      }
      
      console.log('✅ Perfil creado exitosamente');
      return { 
        success: true, 
        user: { 
          id: authData.user.id,
          email: email,
          name: name,
          phone: phone 
        }, 
        error: null 
      };
    } catch (err) {
      console.log('💥 Exception:', err);
      return { success: false, error: `Error: ${err}`, user: null };
    }
  },
  
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { success: false, error: error.message, user: null };
      }
      
      return { 
        success: true, 
        user: {
          id: data.user?.id,
          email: data.user?.email,
        }, 
        error: null 
      };
    } catch (err) {
      return { success: false, error: `Error: ${err}`, user: null };
    }
  }
};
