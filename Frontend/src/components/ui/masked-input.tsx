import * as React from "react"
import { cn } from "@/lib/utils"

// Máscaras disponíveis
export type MaskType = "cpf" | "cnpj" | "phone" | "cep" | "rg" | "currency" | "date"

interface MaskedInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  mask: MaskType
  onChange?: (value: string, rawValue: string) => void
  onValueChange?: (rawValue: string) => void
}

// Funções de formatação
const formatters: Record<MaskType, (value: string) => string> = {
  cpf: (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  },
  
  cnpj: (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14)
    return digits
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
  },
  
  phone: (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 13)
    
    // Formato internacional: +55 (11) 99999-9999
    if (digits.length <= 2) {
      return digits.length > 0 ? `+${digits}` : ""
    }
    if (digits.length <= 4) {
      return `+${digits.slice(0, 2)} (${digits.slice(2)}`
    }
    if (digits.length <= 9) {
      return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`
    }
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`
  },
  
  cep: (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8)
    return digits.replace(/(\d{5})(\d)/, "$1-$2")
  },
  
  rg: (value: string) => {
    const chars = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 9).toUpperCase()
    return chars
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})([a-zA-Z0-9]{1})$/, "$1-$2")
  },
  
  currency: (value: string) => {
    const digits = value.replace(/\D/g, "")
    const number = parseInt(digits || "0", 10) / 100
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  },
  
  date: (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8)
    return digits
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
  },
}

// Função para extrair apenas dígitos (valor raw)
const getRawValue = (value: string, mask: MaskType): string => {
  if (mask === "currency") {
    return value.replace(/\D/g, "")
  }
  if (mask === "rg") {
    return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
  }
  return value.replace(/\D/g, "")
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, mask, onChange, onValueChange, value, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("")
    
    // Sincroniza valor externo
    React.useEffect(() => {
      if (value !== undefined) {
        const formatted = formatters[mask](String(value))
        setDisplayValue(formatted)
      }
    }, [value, mask])
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const formatted = formatters[mask](inputValue)
      const raw = getRawValue(inputValue, mask)
      
      setDisplayValue(formatted)
      onChange?.(formatted, raw)
      onValueChange?.(raw)
    }
    
    return (
      <input
        type="text"
        className={cn(
          "flex h-10 w-full rounded-lg border-2 border-border bg-input px-3 py-2 text-sm text-foreground",
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground/60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary",
          "hover:border-accent/50 transition-colors duration-200",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
MaskedInput.displayName = "MaskedInput"

// Componentes específicos para cada tipo de máscara
const CPFInput = React.forwardRef<
  HTMLInputElement,
  Omit<MaskedInputProps, "mask">
>((props, ref) => (
  <MaskedInput ref={ref} mask="cpf" placeholder="000.000.000-00" {...props} />
))
CPFInput.displayName = "CPFInput"

const CNPJInput = React.forwardRef<
  HTMLInputElement,
  Omit<MaskedInputProps, "mask">
>((props, ref) => (
  <MaskedInput ref={ref} mask="cnpj" placeholder="00.000.000/0000-00" {...props} />
))
CNPJInput.displayName = "CNPJInput"

const PhoneInput = React.forwardRef<
  HTMLInputElement,
  Omit<MaskedInputProps, "mask">
>((props, ref) => (
  <MaskedInput ref={ref} mask="phone" placeholder="+55 (11) 99999-9999" {...props} />
))
PhoneInput.displayName = "PhoneInput"

const CEPInput = React.forwardRef<
  HTMLInputElement,
  Omit<MaskedInputProps, "mask">
>((props, ref) => (
  <MaskedInput ref={ref} mask="cep" placeholder="00000-000" {...props} />
))
CEPInput.displayName = "CEPInput"

const RGInput = React.forwardRef<
  HTMLInputElement,
  Omit<MaskedInputProps, "mask">
>((props, ref) => (
  <MaskedInput ref={ref} mask="rg" placeholder="00.000.000-0" {...props} />
))
RGInput.displayName = "RGInput"

const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  Omit<MaskedInputProps, "mask">
>((props, ref) => (
  <MaskedInput ref={ref} mask="currency" placeholder="R$ 0,00" {...props} />
))
CurrencyInput.displayName = "CurrencyInput"

const DateInput = React.forwardRef<
  HTMLInputElement,
  Omit<MaskedInputProps, "mask">
>((props, ref) => (
  <MaskedInput ref={ref} mask="date" placeholder="DD/MM/AAAA" {...props} />
))
DateInput.displayName = "DateInput"

export {
  MaskedInput,
  CPFInput,
  CNPJInput,
  PhoneInput,
  CEPInput,
  RGInput,
  CurrencyInput,
  DateInput,
  formatters,
  getRawValue,
}
