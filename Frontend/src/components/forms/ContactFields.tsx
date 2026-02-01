import * as React from "react"
import { FormField } from "./FormField"
import { cn } from "@/lib/utils"
import { Phone, Mail, Globe, MessageCircle, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

/* =============================================================================
   CONTACT FIELDS COMPONENT - Premium Design System
   -----------------------------------------------------------------------------
   Professional contact form fields with email and phone inputs.
   Supports multiple contacts with add/remove functionality.

   Features:
   - Email and phone with proper validation hints
   - Optional additional contact types (WhatsApp, website)
   - Multiple contacts support
   - Visual grouping with optional card wrapper
   - Error state propagation
   ============================================================================= */

export interface ContactData {
  email?: string
  telefone?: string
  celular?: string
  whatsapp?: string
  website?: string
}

export interface ContactFieldsProps {
  /** Current contact values */
  values: ContactData
  /** Field change handler */
  onChange: (field: keyof ContactData, value: string) => void
  /** Disabled state */
  disabled?: boolean
  /** Field errors */
  errors?: Partial<Record<keyof ContactData, string>>
  /** Additional className */
  className?: string
  /** Show as card wrapper */
  asCard?: boolean
  /** Section title */
  title?: string
  /** Show title */
  showTitle?: boolean
  /** Which fields to show */
  fields?: (keyof ContactData)[]
  /** Required fields */
  requiredFields?: (keyof ContactData)[]
  /** Layout direction */
  layout?: "horizontal" | "vertical" | "grid"
  /** Number of columns for grid layout */
  columns?: 1 | 2 | 3
}

export function ContactFields({
  values,
  onChange,
  disabled = false,
  errors = {},
  className,
  asCard = false,
  title = "Contato",
  showTitle = false,
  fields = ["email", "telefone"],
  requiredFields = [],
  layout = "grid",
  columns = 2,
}: ContactFieldsProps) {
  // Check if field is required
  const isRequired = (field: keyof ContactData) => requiredFields.includes(field)

  // Field configurations
  const fieldConfigs: Record<keyof ContactData, {
    label: string
    type: "email" | "phone" | "text"
    placeholder: string
    icon: React.ReactNode
  }> = {
    email: {
      label: "E-mail",
      type: "email",
      placeholder: "exemplo@email.com",
      icon: <Mail className="h-4 w-4" />,
    },
    telefone: {
      label: "Telefone",
      type: "phone",
      placeholder: "(00) 0000-0000",
      icon: <Phone className="h-4 w-4" />,
    },
    celular: {
      label: "Celular",
      type: "phone",
      placeholder: "(00) 00000-0000",
      icon: <Phone className="h-4 w-4" />,
    },
    whatsapp: {
      label: "WhatsApp",
      type: "phone",
      placeholder: "(00) 00000-0000",
      icon: <MessageCircle className="h-4 w-4" />,
    },
    website: {
      label: "Website",
      type: "text",
      placeholder: "https://www.exemplo.com",
      icon: <Globe className="h-4 w-4" />,
    },
  }

  // Layout classes
  const layoutClasses = {
    horizontal: "flex flex-wrap items-start gap-4",
    vertical: "flex flex-col gap-4",
    grid: cn(
      "grid gap-4",
      columns === 1 && "grid-cols-1",
      columns === 2 && "grid-cols-1 sm:grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    ),
  }

  const content = (
    <div className={layoutClasses[layout]}>
      {fields.map((field) => {
        const config = fieldConfigs[field]
        if (!config) return null

        return (
          <FormField
            key={field}
            label={config.label}
            type={config.type}
            value={values[field]}
            onChange={(v) => onChange(field, v)}
            disabled={disabled}
            required={isRequired(field)}
            error={errors[field]}
            placeholder={config.placeholder}
            className={layout === "horizontal" ? "flex-1 min-w-[200px]" : undefined}
          />
        )
      })}
    </div>
  )

  if (asCard) {
    return (
      <div className={cn(
        "rounded-xl p-5",
        "glass-subtle",
        className
      )}>
        {/* Card Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className={cn(
            "p-2 rounded-lg bg-primary/10 text-primary",
            "transition-colors duration-200"
          )}>
            <Phone className="h-4 w-4" />
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
          <Phone className={cn(
            "h-4 w-4 text-muted-foreground",
            "transition-colors duration-200"
          )} />
          <h4 className={cn(
            "text-xs font-semibold tracking-widest uppercase text-muted-foreground",
            "transition-colors duration-200"
          )}>
            {title}
          </h4>
        </div>
      )}
      {content}
    </div>
  )
}

/* -----------------------------------------------------------------------------
   ContactDisplay - Read-only contact display
   ----------------------------------------------------------------------------- */

export interface ContactDisplayProps {
  /** Contact data */
  contact: ContactData
  /** Additional className */
  className?: string
  /** Format style */
  format?: "inline" | "list" | "icons"
}

export function ContactDisplay({
  contact,
  className,
  format = "list",
}: ContactDisplayProps) {
  const hasContact = Object.values(contact).some(v => v)

  if (!hasContact) {
    return (
      <p className={cn("text-sm text-muted-foreground italic", className)}>
        Contato nao informado
      </p>
    )
  }

  const items = [
    { key: "email", value: contact.email, icon: <Mail className="h-3.5 w-3.5" />, href: `mailto:${contact.email}` },
    { key: "telefone", value: contact.telefone, icon: <Phone className="h-3.5 w-3.5" />, href: `tel:${contact.telefone}` },
    { key: "celular", value: contact.celular, icon: <Phone className="h-3.5 w-3.5" />, href: `tel:${contact.celular}` },
    { key: "whatsapp", value: contact.whatsapp, icon: <MessageCircle className="h-3.5 w-3.5" />, href: `https://wa.me/${contact.whatsapp?.replace(/\D/g, "")}` },
    { key: "website", value: contact.website, icon: <Globe className="h-3.5 w-3.5" />, href: contact.website },
  ].filter(item => item.value)

  if (format === "inline") {
    return (
      <p className={cn("text-sm text-foreground", className)}>
        {items.map(item => item.value).join(" | ")}
      </p>
    )
  }

  if (format === "icons") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        {items.map((item) => (
          <a
            key={item.key}
            href={item.href}
            target={item.key === "website" ? "_blank" : undefined}
            rel={item.key === "website" ? "noopener noreferrer" : undefined}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg",
              "bg-muted text-muted-foreground",
              "hover:bg-primary/10 hover:text-primary",
              "transition-colors duration-150"
            )}
            title={item.value}
          >
            {item.icon}
          </a>
        ))}
      </div>
    )
  }

  return (
    <ul className={cn("space-y-1.5", className)}>
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{item.icon}</span>
          <a
            href={item.href}
            target={item.key === "website" ? "_blank" : undefined}
            rel={item.key === "website" ? "noopener noreferrer" : undefined}
            className="text-foreground hover:text-primary transition-colors"
          >
            {item.value}
          </a>
        </li>
      ))}
    </ul>
  )
}

/* -----------------------------------------------------------------------------
   MultiContactFields - Support for multiple contact entries
   ----------------------------------------------------------------------------- */

export interface MultiContactEntry extends ContactData {
  id: string
  label?: string
  isPrimary?: boolean
}

export interface MultiContactFieldsProps {
  /** Array of contact entries */
  contacts: MultiContactEntry[]
  /** Add new contact */
  onAdd: () => void
  /** Update contact */
  onUpdate: (id: string, field: keyof ContactData, value: string) => void
  /** Remove contact */
  onRemove: (id: string) => void
  /** Set as primary */
  onSetPrimary?: (id: string) => void
  /** Disabled state */
  disabled?: boolean
  /** Additional className */
  className?: string
  /** Maximum number of contacts */
  maxContacts?: number
  /** Fields to show per contact */
  fields?: (keyof ContactData)[]
}

export function MultiContactFields({
  contacts,
  onAdd,
  onUpdate,
  onRemove,
  onSetPrimary,
  disabled = false,
  className,
  maxContacts = 5,
  fields = ["email", "telefone"],
}: MultiContactFieldsProps) {
  const canAddMore = contacts.length < maxContacts

  return (
    <div className={cn("space-y-4", className)}>
      {/* Contact Entries */}
      {contacts.map((contact, index) => (
        <div
          key={contact.id}
          className={cn(
            "relative p-4 rounded-xl border",
            contact.isPrimary
              ? "border-primary/30 bg-primary/5"
              : "border-border/60 bg-card/30"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Contato {index + 1}
              </span>
              {contact.isPrimary && (
                <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
                  Principal
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {onSetPrimary && !contact.isPrimary && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onSetPrimary(contact.id)}
                  disabled={disabled}
                  className="h-7 text-xs"
                >
                  Definir como principal
                </Button>
              )}
              {contacts.length > 1 && (
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => onRemove(contact.id)}
                  disabled={disabled}
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label="Remover contato"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Fields */}
          <ContactFields
            values={contact}
            onChange={(field, value) => onUpdate(contact.id, field, value)}
            disabled={disabled}
            fields={fields}
            layout="grid"
            columns={2}
          />
        </div>
      ))}

      {/* Add Button */}
      {canAddMore && (
        <Button
          type="button"
          variant="outline"
          onClick={onAdd}
          disabled={disabled}
          className="w-full h-10 border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar contato
        </Button>
      )}

      {/* Max reached message */}
      {!canAddMore && (
        <p className="text-xs text-muted-foreground text-center">
          Limite de {maxContacts} contatos atingido
        </p>
      )}
    </div>
  )
}

/* -----------------------------------------------------------------------------
   ContactCard - Card display for contact information
   ----------------------------------------------------------------------------- */

export interface ContactCardProps {
  /** Contact data */
  contact: ContactData
  /** Card title */
  title?: string
  /** Edit handler */
  onEdit?: () => void
  /** Additional className */
  className?: string
  /** Is primary contact */
  isPrimary?: boolean
}

export function ContactCard({
  contact,
  title = "Contato",
  onEdit,
  className,
  isPrimary = false,
}: ContactCardProps) {
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
            <Phone className="h-4 w-4" />
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
            <div className="mt-2">
              <ContactDisplay contact={contact} format="list" />
            </div>
          </div>
        </div>

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
      </div>
    </div>
  )
}
