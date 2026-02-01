// UI Components - Export centralizado

// Base components
export { Button, buttonVariants } from "./button";
export { Input } from "./input";
export { Label } from "./label";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card";
export { Checkbox } from "./checkbox";
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./select";

// Toast Notifications
export { Toaster, showToast, toast } from "./sonner";

// Masked Inputs
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
} from "./masked-input";
export type { MaskType } from "./masked-input";

// Breadcrumbs
export {
  Breadcrumbs,
  BreadcrumbBar,
  generateBreadcrumbs,
  routeLabels,
} from "./breadcrumbs";
export type { BreadcrumbItem } from "./breadcrumbs";

// Skeleton Loaders
export {
  Skeleton,
  SkeletonText,
  SkeletonHeading,
  SkeletonAvatar,
  SkeletonInput,
  SkeletonButton,
  SkeletonCard,
  SkeletonForm,
  SkeletonTable,
  SkeletonDashboardCard,
} from "./skeleton";

// Theme Switcher
export {
  ThemeSwitcher,
  ThemeSwitcherCompact,
  useTheme,
} from "./theme-switcher";
