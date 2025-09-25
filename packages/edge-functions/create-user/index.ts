import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      role_id,
      restaurant_id,
      assigned_by
    } = await req.json()

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !role_id || !restaurant_id || !assigned_by) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create user in Supabase Auth (admin API - only works in Edge Functions)
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        first_name,
        last_name,
        phone,
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ success: false, error: authError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!authUser.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create user' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create user record in the users table
    const { data: usuario, error: userError } = await supabaseClient
      .from('users')
      .insert({
        id: authUser.user.id,
        first_name,
        last_name,
        email,
        phone,
        is_active: true,
        role: 'user',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      // Try to clean up the auth user if user creation failed
      await supabaseClient.auth.admin.deleteUser(authUser.user.id)

      return new Response(
        JSON.stringify({ success: false, error: userError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create user role relationship
    const { data: rol, error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role_id,
        restaurant_id,
        assigned_by,
        notes: 'Usuario creado directamente - sin invitación por email',
        is_active: true,
      })
      .select()
      .single()

    if (roleError) {
      console.error('Role assignment error:', roleError)
      // Clean up created records
      await supabaseClient.from('users').delete().eq('id', authUser.user.id)
      await supabaseClient.auth.admin.deleteUser(authUser.user.id)

      return new Response(
        JSON.stringify({ success: false, error: roleError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        usuario,
        rol,
        auth_user: authUser.user
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
