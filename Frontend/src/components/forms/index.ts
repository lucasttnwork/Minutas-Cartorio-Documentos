/* =============================================================================
   FORM COMPONENTS - Premium Design System
   -----------------------------------------------------------------------------
   Export all form-related components for easy importing.

   Usage:
   import { FormField, FormSection, CheckboxGroup } from "@/components/forms"
   ============================================================================= */

// Core Form Components
export { FormField, FormFieldGroup } from "./FormField"
export type { FormFieldProps, FormFieldGroupProps, FieldType } from "./FormField"

// Form Section Components
export {
  FormSection,
  FormSectionDivider,
  FormSectionGrid,
  FormSectionCard,
} from "./FormSection"
export type {
  FormSectionProps,
  FormSectionAction,
  FormSectionDividerProps,
  FormSectionGridProps,
  FormSectionCardProps,
} from "./FormSection"

// Editable Field Components
export {
  EditableField,
  EditableFieldRow,
  EditableFieldGroup,
} from "./EditableField"
export type {
  EditableFieldProps,
  EditableFieldType,
  EditableFieldRowProps,
  EditableFieldGroupProps,
} from "./EditableField"

// Checkbox Components
export {
  CheckboxGroup,
  CheckboxCard,
  CheckboxList,
} from "./CheckboxGroup"
export type {
  CheckboxGroupProps,
  CheckboxItem,
  CheckboxCardProps,
  CheckboxListProps,
} from "./CheckboxGroup"

// Address Components
export {
  AddressFields,
  AddressDisplay,
  AddressCard,
  ESTADOS_BR,
} from "./AddressFields"
export type {
  AddressData,
  AddressFieldsProps,
  AddressDisplayProps,
  AddressCardProps,
} from "./AddressFields"

// Contact Components
export {
  ContactFields,
  ContactDisplay,
  ContactCard,
  MultiContactFields,
} from "./ContactFields"
export type {
  ContactData,
  ContactFieldsProps,
  ContactDisplayProps,
  ContactCardProps,
  MultiContactEntry,
  MultiContactFieldsProps,
} from "./ContactFields"

// Textarea with Counter
export { TextareaWithCounter } from "./TextareaWithCounter"

// Certidao Section
export { CertidaoSection } from "./CertidaoSection"

// Pessoa Forms
export { PessoaNaturalForm } from "./pessoa/PessoaNaturalForm"
export { PessoaJuridicaForm } from "./pessoa/PessoaJuridicaForm"
export { RepresentanteCard } from "./pessoa/RepresentanteCard"

// Negocio Forms
export { NegocioJuridicoForm } from "./negocio/NegocioJuridicoForm"
export { ParticipanteCard } from "./negocio/ParticipanteCard"
