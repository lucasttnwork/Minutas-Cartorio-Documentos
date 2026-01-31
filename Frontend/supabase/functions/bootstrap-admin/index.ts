import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Verifica se esta em ambiente local
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const isLocal = supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost');

  if (!isLocal) {
    return new Response(
      JSON.stringify({ error: 'This function is only available in local development' }),
      {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const adminEmail = 'admin@minutas.local';
    const adminPassword = 'admin123456';

    // Verificar se admin ja existe
    const { data: existing, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    const adminExists = existing?.users?.some(u => u.email === adminEmail);

    if (adminExists) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Admin user already exists',
          credentials: { email: adminEmail, password: '(already set)' }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar usuario admin
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Ja confirmado
      user_metadata: {
        nome: 'Administrador',
        cargo: 'admin'
      }
    });

    if (error) {
      throw new Error(`Failed to create admin: ${error.message}`);
    }

    // Atualizar perfil para admin (o trigger ja cria, mas garantimos o cargo)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ cargo: 'admin', nome: 'Administrador' })
      .eq('id', data.user.id);

    if (updateError) {
      console.warn('Warning: Could not update profile:', updateError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        user_id: data.user.id,
        credentials: {
          email: adminEmail,
          password: adminPassword
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
