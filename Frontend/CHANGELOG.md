# Changelog - Sistema de Minutas Cartório

## [Unreleased] - 2025-01-30

### ✅ Melhorias de Alta Prioridade Implementadas

---

### 1. 🔔 Toast Notifications (Sonner)

**Arquivos:**
- `src/components/ui/sonner.tsx` - Componente e helpers
- `src/App.tsx` - Provider global

**Como usar:**
```tsx
import { showToast, toast } from "@/components/ui/sonner";

// Funções helper
showToast.success("Operação realizada!", "Dados salvos com sucesso");
showToast.error("Erro!", "Não foi possível salvar");
showToast.warning("Atenção!", "Verifique os dados");
showToast.info("Informação", "Novos dados disponíveis");

// Com promise
showToast.promise(fetchData(), {
  loading: "Carregando...",
  success: "Dados carregados!",
  error: "Erro ao carregar",
});

// API direta do Sonner
toast("Mensagem simples");
toast.dismiss();
```

**Estilos:**
- Dark theme integrado
- Cores personalizadas por tipo (success=emerald, error=red, warning=amber, info=blue)
- Botão de fechar habilitado
- Posição: top-right

---

### 2. 🎭 Máscaras de Input

**Arquivos:**
- `src/components/ui/masked-input.tsx` - Componentes de máscara
- `src/components/forms/FormField.tsx` - Integração com formulários

**Máscaras disponíveis:**

| Tipo | Formato | Componente |
|------|---------|------------|
| CPF | 000.000.000-00 | `<CPFInput />` |
| CNPJ | 00.000.000/0000-00 | `<CNPJInput />` |
| Telefone | +55 (11) 99999-9999 | `<PhoneInput />` |
| CEP | 00000-000 | `<CEPInput />` |
| RG | 00.000.000-0 | `<RGInput />` |
| Moeda | R$ 1.234,56 | `<CurrencyInput />` |
| Data | DD/MM/AAAA | `<DateInput />` |

**Como usar no FormField:**
```tsx
// Via prop type
<FormField
  label="CPF"
  type="cpf"
  value={data.cpf}
  onChange={(v) => updateField("cpf", v)}
/>

// Via prop mask (genérico)
<FormField
  label="Campo"
  mask="phone"
  value={data.telefone}
  onChange={(v) => updateField("telefone", v)}
/>
```

**Uso direto:**
```tsx
import { CPFInput, MaskedInput } from "@/components/ui/masked-input";

<CPFInput 
  value={cpf} 
  onChange={(formatted, raw) => setCpf(raw)} 
/>

<MaskedInput 
  mask="cnpj" 
  onValueChange={(raw) => setCnpj(raw)} 
/>
```

---

### 3. 🍞 Breadcrumbs

**Arquivos:**
- `src/components/ui/breadcrumbs.tsx` - Componente
- `src/components/layout/PageHeader.tsx` - Integração

**Características:**
- Geração automática baseada na rota atual
- Animação com Framer Motion
- Ícone Home clicável
- Último item não clicável (página atual)
- Responsivo (ícone em mobile, texto em desktop)

**Como usar:**
```tsx
// Automático (já integrado no PageHeader)
<PageHeader
  title="Cadastro"
  subtitle="Pessoa Natural"
  showBreadcrumbs={true}  // default
/>

// Manual (custom breadcrumbs)
<Breadcrumbs
  items={[
    { label: "Cadastros", href: "/cadastros" },
    { label: "Pessoa Natural" },  // sem href = não clicável
  ]}
/>

// Com título integrado
<BreadcrumbBar title="Minha Página" />
```

**Rotas mapeadas:**
- `/` → Dashboard
- `/pessoa-natural` → Pessoa Natural
- `/pessoa-juridica` → Pessoa Jurídica
- `/imovel` → Imóvel
- `/negocio-juridico` → Negócio Jurídico
- `/upload` → Upload de Arquivos

---

### 4. 💀 Skeleton Loaders

**Arquivos:**
- `src/components/ui/skeleton.tsx` - Todos os componentes
- `src/index.css` - Animação shimmer

**Componentes disponíveis:**

| Componente | Uso |
|------------|-----|
| `<Skeleton />` | Base, customizável |
| `<SkeletonText />` | Linha de texto |
| `<SkeletonHeading />` | Título/heading |
| `<SkeletonAvatar />` | Avatar circular (sm/md/lg) |
| `<SkeletonInput />` | Label + Input |
| `<SkeletonButton />` | Botão |
| `<SkeletonCard />` | Card completo |
| `<SkeletonForm />` | Formulário com seções |
| `<SkeletonTable />` | Tabela |
| `<SkeletonDashboardCard />` | Card de dashboard |

**Como usar:**
```tsx
import { 
  SkeletonCard, 
  SkeletonForm, 
  SkeletonTable 
} from "@/components/ui/skeleton";

// Loading state
{isLoading ? (
  <SkeletonForm sections={3} fieldsPerSection={4} />
) : (
  <MeuFormulario />
)}

// Card com avatar e ações
<SkeletonCard lines={3} showAvatar showActions />

// Tabela
<SkeletonTable rows={5} columns={4} />

// Dashboard cards
<div className="grid grid-cols-4 gap-4">
  <SkeletonDashboardCard />
  <SkeletonDashboardCard />
  <SkeletonDashboardCard />
  <SkeletonDashboardCard />
</div>
```

---

## Estrutura de Arquivos

```
src/
├── components/
│   ├── ui/
│   │   ├── index.ts          # Export centralizado
│   │   ├── sonner.tsx        # Toast notifications
│   │   ├── masked-input.tsx  # Inputs com máscara
│   │   ├── breadcrumbs.tsx   # Navegação hierárquica
│   │   ├── skeleton.tsx      # Loading skeletons
│   │   └── ...
│   ├── forms/
│   │   ├── FormField.tsx     # (atualizado com máscaras)
│   │   └── ...
│   └── layout/
│       ├── PageHeader.tsx    # (atualizado com breadcrumbs)
│       └── ...
├── index.css                 # (shimmer animation adicionada)
└── App.tsx                   # (Toaster provider adicionado)
```

---

## Próximos Passos (Backlog)

- [ ] Auto-save draft (localStorage)
- [ ] Integração com backend
- [ ] Validação em tempo real
- [ ] Undo/Redo
- [ ] Export PDF
