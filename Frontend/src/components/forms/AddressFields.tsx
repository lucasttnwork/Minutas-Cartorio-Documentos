/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { FormField } from "./FormField"
import { cn } from "@/lib/utils"
import { MapPin, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

/* =============================================================================
   ADDRESS FIELDS COMPONENT - Premium Design System
   -----------------------------------------------------------------------------
   Professional address form field group with Brazilian states, CEP lookup,
   and elegant visual organization. Designed for clarity and easy data entry.

   Features:
   - All Brazilian address fields properly organized
   - CEP auto-complete capability (hook ready)
   - Responsive grid layout
   - Visual grouping with optional card wrapper
   - Error state propagation
   ============================================================================= */

export interface AddressData {
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
}

export interface AddressFieldsProps {
  /** Current address values */
  values: AddressData
  /** Field change handler */
  onChange: (field: keyof AddressData, value: string) => void
  /** Disabled state */
  disabled?: boolean
  /** Field errors */
  errors?: Partial<Record<keyof AddressData, string>>
  /** Additional className */
  className?: string
  /** Show as card wrapper */
  asCard?: boolean
  /** CEP lookup handler */
  onCepLookup?: (cep: string) => Promise<Partial<AddressData> | null>
  /** Section title */
  title?: string
  /** Show title */
  showTitle?: boolean
  /** Required fields */
  requiredFields?: (keyof AddressData)[]
  /** Compact mode (less spacing) */
  compact?: boolean
}

// Brazilian states list
export const ESTADOS_BR = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapa" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceara" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espirito Santo" },
  { value: "GO", label: "Goias" },
  { value: "MA", label: "Maranhao" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Para" },
  { value: "PB", label: "Paraiba" },
  { value: "PR", label: "Parana" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piaui" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondonia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "Sao Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
]

export function AddressFields({
  values,
  onChange,
  disabled = false,
  errors = {},
  className,
  asCard = false,
  onCepLookup,
  title = "Endereco",
  showTitle = false,
  requiredFields = [],
  compact = false,
}: AddressFieldsProps) {
  const [isLookingUp, setIsLookingUp] = React.useState(false)
  const [recentlyFilledFields, setRecentlyFilledFields] = React.useState<Set<string>>(new Set())

  // Check if field is required
  const isRequired = (field: keyof AddressData) => requiredFields.includes(field)

  // CEP lookup handler with auto-fill highlight
  const handleCepLookup = async () => {
    if (!onCepLookup || !values.cep || values.cep.length < 8) return

    setIsLookingUp(true)
    try {
      const result = await onCepLookup(values.cep)
      if (result) {
        // Track which fields were auto-filled
        const filledFields = new Set<string>()

        // Update fields with result
        Object.entries(result).forEach(([key, value]) => {
          if (value) {
            onChange(key as keyof AddressData, value)
            filledFields.add(key)
          }
        })

        // Flash highlight on auto-filled fields
        setRecentlyFilledFields(filledFields)
        setTimeout(() => setRecentlyFilledFields(new Set()), 1500)
      }
    } catch (error) {
      console.error("CEP lookup failed:", error)
    } finally {
      setIsLookingUp(false)
    }
  }

  // Handle CEP change with auto-lookup
  const handleCepChange = (value: string) => {
    onChange("cep", value)
    // Auto-lookup when CEP is complete (8 digits)
    if (onCepLookup && value.replace(/\D/g, "").length === 8) {
      setTimeout(handleCepLookup, 300)
    }
  }

  const content = (
    <div className={cn(
      "grid gap-4",
      compact ? "gap-3" : "gap-4 gap-y-5",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    )}>
      {/* CEP with lookup button and loading indicator */}
      <div className={cn(
        "relative",
        isLookingUp && "animate-pulse"
      )}>
        <FormField
          label="CEP"
          type="cep"
          value={values.cep}
          onChange={handleCepChange}
          disabled={disabled || isLookingUp}
          required={isRequired("cep")}
          error={errors.cep}
          placeholder="00000-000"
          variant={isLookingUp ? "filled" : "default"}
        />
        {onCepLookup && (
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={handleCepLookup}
            disabled={disabled || isLookingUp || !values.cep}
            className={cn(
              "absolute right-1 top-8 h-7 w-7",
              "transition-all duration-200"
            )}
            aria-label="Buscar endereco pelo CEP"
          >
            {isLookingUp ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
        {/* Loading overlay indicator */}
        {isLookingUp && (
          <div className="absolute inset-0 top-6 rounded-lg bg-primary/5 pointer-events-none animate-pulse" />
        )}
      </div>

      {/* Logradouro - spans 2 columns with auto-fill highlight */}
      <FormField
        label="Logradouro"
        value={values.logradouro}
        onChange={(v) => onChange("logradouro", v)}
        disabled={disabled}
        required={isRequired("logradouro")}
        error={errors.logradouro}
        placeholder="Rua, Avenida, etc."
        success={recentlyFilledFields.has("logradouro")}
        className={cn(
          "sm:col-span-2 lg:col-span-2",
          recentlyFilledFields.has("logradouro") && "animate-in fade-in-0 duration-300"
        )}
      />

      {/* Numero */}
      <FormField
        label="Numero"
        value={values.numero}
        onChange={(v) => onChange("numero", v)}
        disabled={disabled}
        required={isRequired("numero")}
        error={errors.numero}
        placeholder="123"
      />

      {/* Complemento */}
      <FormField
        label="Complemento"
        value={values.complemento}
        onChange={(v) => onChange("complemento", v)}
        disabled={disabled}
        error={errors.complemento}
        placeholder="Apto, Bloco, etc."
        optional
      />

      {/* Bairro with auto-fill highlight */}
      <FormField
        label="Bairro"
        value={values.bairro}
        onChange={(v) => onChange("bairro", v)}
        disabled={disabled}
        required={isRequired("bairro")}
        error={errors.bairro}
        placeholder="Nome do bairro"
        success={recentlyFilledFields.has("bairro")}
        className={cn(
          recentlyFilledFields.has("bairro") && "animate-in fade-in-0 duration-300"
        )}
      />

      {/* Cidade with auto-fill highlight */}
      <FormField
        label="Cidade"
        value={values.cidade}
        onChange={(v) => onChange("cidade", v)}
        disabled={disabled}
        required={isRequired("cidade")}
        error={errors.cidade}
        placeholder="Nome da cidade"
        success={recentlyFilledFields.has("cidade")}
        className={cn(
          recentlyFilledFields.has("cidade") && "animate-in fade-in-0 duration-300"
        )}
      />

      {/* Estado with auto-fill highlight */}
      <FormField
        label="Estado"
        type="select"
        value={values.estado}
        onChange={(v) => onChange("estado", v)}
        options={ESTADOS_BR}
        disabled={disabled}
        required={isRequired("estado")}
        error={errors.estado}
        placeholder="Selecione o estado"
        success={recentlyFilledFields.has("estado")}
        className={cn(
          recentlyFilledFields.has("estado") && "animate-in fade-in-0 duration-300"
        )}
      />
    </div>
  )

  if (asCard) {
    return (
      <div className={cn(
        "rounded-xl border border-border/60 bg-card/30 p-5",
        className
      )}>
        {/* Card Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <MapPin className="h-4 w-4" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            {title}
          </h4>
        </div>
        {content}
      </div>
    )
  }

  return (
    <div className={cn(className)}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            {title}
          </h4>
        </div>
      )}
      {content}
    </div>
  )
}

/* -----------------------------------------------------------------------------
   AddressDisplay - Read-only address display
   ----------------------------------------------------------------------------- */

export interface AddressDisplayProps {
  /** Address data */
  address: AddressData
  /** Additional className */
  className?: string
  /** Format style */
  format?: "inline" | "block" | "compact"
}

export function AddressDisplay({
  address,
  className,
  format = "block",
}: AddressDisplayProps) {
  const hasAddress = Object.values(address).some(v => v)

  if (!hasAddress) {
    return (
      <p className={cn("text-sm text-muted-foreground italic", className)}>
        Endereco nao informado
      </p>
    )
  }

  // Format address parts
  const line1 = [
    address.logradouro,
    address.numero && `n${String.fromCharCode(186)} ${address.numero}`,
    address.complemento,
  ].filter(Boolean).join(", ")

  const line2 = [
    address.bairro,
    address.cidade,
    address.estado,
  ].filter(Boolean).join(" - ")

  const cepFormatted = address.cep?.replace(/(\d{5})(\d{3})/, "$1-$2")

  if (format === "inline") {
    return (
      <p className={cn("text-sm text-foreground", className)}>
        {[line1, line2, cepFormatted].filter(Boolean).join(", ")}
      </p>
    )
  }

  if (format === "compact") {
    return (
      <div className={cn("text-sm", className)}>
        <p className="text-foreground">{line1}</p>
        <p className="text-muted-foreground">
          {[line2, cepFormatted].filter(Boolean).join(" - ")}
        </p>
      </div>
    )
  }

  return (
    <address className={cn("not-italic text-sm space-y-0.5", className)}>
      {line1 && <p className="text-foreground">{line1}</p>}
      {line2 && <p className="text-foreground">{line2}</p>}
      {cepFormatted && <p className="text-muted-foreground">CEP: {cepFormatted}</p>}
    </address>
  )
}

/* -----------------------------------------------------------------------------
   AddressCard - Card wrapper with address display and edit option
   ----------------------------------------------------------------------------- */

export interface AddressCardProps {
  /** Address data */
  address: AddressData
  /** Edit handler */
  onEdit?: () => void
  /** Delete handler */
  onDelete?: () => void
  /** Additional className */
  className?: string
  /** Card title */
  title?: string
  /** Is primary address */
  isPrimary?: boolean
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  className,
  title = "Endereco",
  isPrimary = false,
}: AddressCardProps) {
  return (
    <div className={cn(
      "rounded-xl border p-4",
      isPrimary ? "border-primary/30 bg-primary/5" : "border-border bg-card",
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isPrimary ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-foreground">{title}</h4>
              {isPrimary && (
                <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
                  Principal
                </span>
              )}
            </div>
            <div className="mt-1">
              <AddressDisplay address={address} format="compact" />
            </div>
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="h-7 text-xs"
              >
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="h-7 text-xs text-destructive hover:text-destructive"
              >
                Remover
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
