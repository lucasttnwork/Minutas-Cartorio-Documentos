import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationBarProps {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  showBack?: boolean;
  showNext?: boolean;
  nextDisabled?: boolean;
  className?: string;
}

export function NavigationBar({
  onBack,
  onNext,
  backLabel = "VOLTAR",
  nextLabel = "AVANÇAR",
  showBack = true,
  showNext = true,
  nextDisabled = false,
  className,
}: NavigationBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={cn(
        "flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border",
        className
      )}
    >
      {showBack && (
        <Button
          variant="secondary"
          onClick={onBack}
          className="uppercase tracking-wide font-medium"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {backLabel}
        </Button>
      )}
      {showNext && (
        <Button
          onClick={onNext}
          disabled={nextDisabled}
          className="uppercase tracking-wide font-medium bg-primary hover:bg-primary/90"
        >
          {nextLabel}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </motion.div>
  );
}
