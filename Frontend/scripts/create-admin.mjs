import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  try {
    console.log('Verificando usuários existentes...');

    // Verificar se admin já existe
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Erro ao listar usuários:', listError);
      return;
    }

    const adminEmail = 'admin@minutas.local';
    const adminExists = users?.users?.some(u => u.email === adminEmail);

    if (adminExists) {
      console.log('✓ Usuário admin já existe!');
      console.log('Email:', adminEmail);
      console.log('Senha: admin123456');
      return;
    }

    console.log('Criando usuário admin...');

    // Criar usuário admin
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: 'admin123456',
      email_confirm: true,
      user_metadata: {
        nome: 'Administrador',
        cargo: 'admin'
      }
    });

    if (error) {
      console.error('Erro ao criar admin:', error);
      return;
    }

    console.log('✓ Usuário admin criado com sucesso!');
    console.log('User ID:', data.user.id);
    console.log('Email:', adminEmail);
    console.log('Senha: admin123456');

    // Atualizar perfil para garantir que é admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ cargo: 'admin', nome: 'Administrador' })
      .eq('id', data.user.id);

    if (updateError) {
      console.warn('Aviso: Não foi possível atualizar o perfil:', updateError.message);
    } else {
      console.log('✓ Perfil admin atualizado!');
    }

  } catch (err) {
    console.error('Erro:', err);
  }
}

createAdmin();
