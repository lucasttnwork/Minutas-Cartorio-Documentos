import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  instruction?: string;
}

export function PageHeader({ title, subtitle, instruction }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-8"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <h2 className="text-lg md:text-xl font-semibold text-muted-foreground mt-1">
          {subtitle}
        </h2>
      )}
      {instruction && (
        <p className="text-sm text-muted-foreground mt-4 uppercase tracking-wide">
          {instruction}
        </p>
      )}
    </motion.header>
  );
}
