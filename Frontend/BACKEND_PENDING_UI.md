# Componentes de UI Pendentes para Integracao

Este arquivo documenta os componentes visuais que precisam ser construidos
para completar a integracao entre frontend e backend Supabase.

## Status do Backend

### Concluido
- [x] Schema do banco de dados (9 migrations)
- [x] Edge Functions de IA (classify, extract, map, generate)
- [x] Prompts de extracao (22 tipos de documento)
- [x] Tabela de profiles com RLS
- [x] Bootstrap de admin para desenvolvimento
- [x] Cliente Supabase tipado
- [x] Configuracao de sessao persistente (7 dias JWT)

### Credenciais de Desenvolvimento
```
Email: admin@minutas.local
Password: admin123456
```

---

## Componentes de Autenticacao

### 1. Pagina de Login
- **Rota:** `/login`
- **Componente:** `src/pages/Login.tsx`
- **Campos:**
  - Email (input type="email")
  - Senha (input type="password")
  - Botao "Entrar"
  - Link "Esqueci minha senha" (futuro)
- **Integracao:**
  ```typescript
  import { supabase } from '@/lib/supabase';

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  ```
- **Comportamento:**
  - Redirect apos login: `/minutas` ou rota original
  - Mostrar erro se credenciais invalidas
  - Salvar sessao automaticamente (persistSession: true)

### 2. Botao de Logout
- **Localizacao:** `HubSidebar.tsx` (parte inferior)
- **Estilo:** Icone de logout + texto "Sair"
- **Integracao:**
  ```typescript
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  ```
- **Comportamento:**
  - Limpar sessao local
  - Redirecionar para `/login`

### 3. ProtectedRoute
- **Componente:** `src/components/auth/ProtectedRoute.tsx`
- **Funcao:** Wrapper para rotas que requerem autenticacao
- **Integracao:**
  ```typescript
  import { supabase } from '@/lib/supabase';

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    // Salvar rota atual e redirecionar para login
    navigate('/login', { state: { from: location.pathname } });
  }
  ```
- **Uso:**
  ```tsx
  <Route path="/minutas" element={
    <ProtectedRoute>
      <MinutasPage />
    </ProtectedRoute>
  } />
  ```

### 4. AuthProvider (Context)
- **Componente:** `src/contexts/AuthContext.tsx`
- **Funcao:** Prover estado de autenticacao para toda a aplicacao
- **Estado:**
  ```typescript
  interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
  }
  ```

---

## Componentes de Upload

### 1. UploadZone Integrado
- **Componente:** `src/components/agentes/UploadZone.tsx`
- **Modificacoes necessarias:**
  - Substituir mock por `supabase.storage.upload()`
  - Chamar Edge Function `classify-document` apos upload
  - Atualizar estado em tempo real

- **Integracao Storage:**
  ```typescript
  const { data, error } = await supabase.storage
    .from('documentos')
    .upload(`${minutaId}/${file.name}`, file);
  ```

- **Integracao Edge Function:**
  ```typescript
  const { data, error } = await supabase.functions.invoke('classify-document', {
    body: { storage_path: data.path }
  });
  ```

### 2. Status de Processamento
- **Componente:** `src/pages/Processando.tsx` ou componente inline
- **Usar Realtime para atualizar status:**
  ```typescript
  const channel = supabase
    .channel('documento-status')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'documentos',
      filter: `minuta_id=eq.${minutaId}`
    }, (payload) => {
      setDocumentos(prev =>
        prev.map(d => d.id === payload.new.id ? payload.new : d)
      );
    })
    .subscribe();
  ```
- **Estados visuais:**
  - `pendente` - Aguardando
  - `classificando` - Spinner + "Classificando..."
  - `extraindo` - Spinner + "Extraindo dados..."
  - `concluido` - Check verde
  - `erro` - X vermelho + mensagem

---

## Componentes de Dashboard

### 1. Indicador de Usuario Logado
- **Localizacao:** Sidebar ou header
- **Mostrar:**
  - Nome do usuario (ou email se nome nao definido)
  - Cargo (admin, escrevente, tabeliao)
  - Avatar opcional

- **Integracao:**
  ```typescript
  const { data: profile } = await supabase
    .from('profiles')
    .select('nome, cargo, email')
    .eq('id', user.id)
    .single();
  ```

### 2. Lista de Minutas do Usuario
- **Substituir localStorage por query Supabase:**
  ```typescript
  const { data: minutas } = await supabase
    .from('minutas')
    .select('*')
    .order('updated_at', { ascending: false });
  ```
- **RLS garante que usuario so ve suas minutas**

### 3. Contador de Estatisticas
- **Mostrar no dashboard:**
  - Total de minutas
  - Minutas em processamento
  - Minutas concluidas este mes

- **Query exemplo:**
  ```typescript
  const { count } = await supabase
    .from('minutas')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'concluida');
  ```

---

## Prioridades de Implementacao

### Alta Prioridade
1. **Login/Logout/ProtectedRoute** - Bloqueante para qualquer funcionalidade
2. **AuthProvider** - Base para estado de autenticacao
3. **UploadZone integrado** - Funcionalidade core

### Media Prioridade
4. **Status de processamento com Realtime**
5. **Dashboard com dados do Supabase**
6. **Indicador de usuario na sidebar**

### Baixa Prioridade
7. **Esqueci minha senha**
8. **Gerenciamento de usuarios (admin)**
9. **Logs de atividade**

---

## Comandos Uteis

### Iniciar Supabase Local
```bash
npx supabase start
```

### Aplicar Migrations
```bash
npx supabase db reset
```

### Gerar Tipos TypeScript
```bash
npx supabase gen types typescript --local > src/types/database.types.ts
```

### Servir Edge Functions
```bash
npx supabase functions serve --env-file ./supabase/.env.local
```

### Criar Usuario Admin
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/bootstrap-admin
```

### Testar Login
```bash
curl -X POST "http://127.0.0.1:54321/auth/v1/token?grant_type=password" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@minutas.local","password":"admin123456"}'
```

---

## Arquivos de Referencia

| Arquivo | Descricao |
|---------|-----------|
| `src/lib/supabase.ts` | Cliente Supabase tipado |
| `src/lib/auth-config.ts` | Configuracoes de autenticacao |
| `src/types/database.types.ts` | Tipos gerados do schema |
| `supabase/config.toml` | Configuracao do Supabase local |
| `supabase/.env.local` | Variaveis de ambiente |

---

## Notas Importantes

1. **Sessao Persistente:** JWT expira em 7 dias, mas refresh token permite renovacao automatica enquanto usuario nao fizer logout explicito.

2. **Sem Timeout:** O frontend usa `autoRefreshToken: true` para manter sessao ativa indefinidamente.

3. **Admin Local:** Credenciais `admin@minutas.local` / `admin123456` sao apenas para desenvolvimento.

4. **RLS Ativo:** Todas as queries so retornam dados do usuario autenticado.

5. **Storage Bucket:** Documentos sao armazenados no bucket `documentos` com path `{minuta_id}/{filename}`.
