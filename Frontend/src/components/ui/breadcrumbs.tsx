import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

// Mapeamento automático de rotas para labels
const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/pessoa-natural": "Pessoa Natural",
  "/pessoa-juridica": "Pessoa Jurídica",
  "/imovel": "Imóvel",
  "/negocio-juridico": "Negócio Jurídico",
  "/upload": "Upload de Arquivos",
}

// Gera breadcrumbs automaticamente baseado na rota
const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []
  
  let currentPath = ""
  
  for (const segment of segments) {
    currentPath += `/${segment}`
    const label = routeLabels[currentPath] || segment.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    
    breadcrumbs.push({
      label,
      href: currentPath,
    })
  }
  
  return breadcrumbs
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
  showHome = true,
}) => {
  const location = useLocation()
  
  // Usa items passados ou gera automaticamente
  const breadcrumbItems = items || generateBreadcrumbs(location.pathname)
  
  // Se estiver na home, não mostra breadcrumbs
  if (location.pathname === "/" && !items) {
    return null
  }
  
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm", className)}
    >
      <ol className="flex items-center gap-1.5">
        {/* Home link */}
        {showHome && (
          <>
            <motion.li
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-1.5 text-muted-foreground",
                  "hover:text-foreground transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                )}
              >
                <Home className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Dashboard</span>
              </Link>
            </motion.li>
            
            <li className="text-muted-foreground/50">
              <ChevronRight className="h-4 w-4" />
            </li>
          </>
        )}
        
        {/* Breadcrumb items */}
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          
          return (
            <React.Fragment key={item.href || index}>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: (index + 1) * 0.05 }}
              >
                {isLast ? (
                  // Item atual (não clicável)
                  <span
                    className={cn(
                      "flex items-center gap-1.5 font-medium text-foreground"
                    )}
                    aria-current="page"
                  >
                    {item.icon}
                    {item.label}
                  </span>
                ) : (
                  // Link navegável
                  <Link
                    to={item.href || "#"}
                    className={cn(
                      "flex items-center gap-1.5 text-muted-foreground",
                      "hover:text-foreground transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )}
              </motion.li>
              
              {!isLast && (
                <li className="text-muted-foreground/50">
                  <ChevronRight className="h-4 w-4" />
                </li>
              )}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

// Componente de Breadcrumb com container estilizado
const BreadcrumbBar: React.FC<BreadcrumbsProps & { title?: string }> = ({
  title,
  ...props
}) => {
  const location = useLocation()
  const pageTitle = title || routeLabels[location.pathname] || "Página"
  
  return (
    <div className="mb-6 space-y-2">
      <Breadcrumbs {...props} />
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
      >
        {pageTitle}
      </motion.h1>
    </div>
  )
}

export { Breadcrumbs, BreadcrumbBar, generateBreadcrumbs, routeLabels }
export type { BreadcrumbItem }
