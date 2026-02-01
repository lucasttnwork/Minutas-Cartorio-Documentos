import { motion } from 'framer-motion';
import { Linkedin, Instagram, Youtube, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { footer } from '../../data/landing-copy';

const premiumEasing = [0.16, 1, 0.3, 1] as const;

const iconMap = {
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
};

export function Footer() {
  return (
    <footer
      data-testid="footer"
      aria-label="Footer Section"
      className="relative bg-card/60 border-t border-border"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-8 pt-16 pb-8 lg:grid-cols-12 lg:gap-12">

          {/* Brand Column - Spans 4 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: premiumEasing }}
            className="lg:col-span-4 space-y-4"
          >
            {/* Brand Name */}
            <a
              href="#"
              className="text-2xl font-semibold text-foreground hover:text-primary transition-colors duration-200"
              data-testid="footer-brand"
            >
              Sistema de Minutas
            </a>

            {/* Tagline */}
            <p
              className="text-sm text-muted-foreground leading-relaxed max-w-md"
              data-testid="footer-tagline"
            >
              {footer.tagline}
            </p>

            {/* Contact Info */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href={`mailto:${footer.contato.email}`}>{footer.contato.email}</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href={`tel:${footer.contato.telefone}`}>{footer.contato.telefone}</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{footer.contato.endereco}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 pt-4">
              {footer.social.map((social) => {
                const Icon = iconMap[social.icon as keyof typeof iconMap];
                return (
                  <motion.a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    data-testid={`footer-social-${social.name.toLowerCase()}`}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground border border-border hover:border-primary transition-all duration-200"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2, ease: premiumEasing }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Navigation Links Grid - Spans 8 columns on large screens */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-8 md:grid-cols-3 lg:grid-cols-5 lg:justify-items-end">

            {/* Produto Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: premiumEasing }}
              className="space-y-4"
            >
              <h3 className="text-sm font-semibold text-foreground">Produto</h3>
              <ul className="space-y-3">
                {footer.links.produto.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      data-testid={`footer-produto-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Recursos Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: premiumEasing }}
              className="space-y-4"
            >
              <h3 className="text-sm font-semibold text-foreground">Recursos</h3>
              <ul className="space-y-3">
                {footer.links.recursos.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      data-testid={`footer-recursos-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Empresa Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: premiumEasing }}
              className="space-y-4"
            >
              <h3 className="text-sm font-semibold text-foreground">Empresa</h3>
              <ul className="space-y-3">
                {footer.links.empresa.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      data-testid={`footer-empresa-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Suporte Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4, ease: premiumEasing }}
              className="space-y-4"
            >
              <h3 className="text-sm font-semibold text-foreground">Suporte</h3>
              <ul className="space-y-3">
                {footer.links.suporte.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      data-testid={`footer-suporte-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5, ease: premiumEasing }}
              className="space-y-4"
            >
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <ul className="space-y-3">
                {footer.links.legal.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      data-testid={`footer-legal-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>
        </div>

        {/* Bottom Border */}
        <div className="h-px bg-border" />

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="py-8"
        >
          <p
            className="text-xs text-muted-foreground text-center"
            data-testid="footer-copyright"
          >
            {footer.copyright}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
