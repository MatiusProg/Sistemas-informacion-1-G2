import { ReactNode } from "react";
import Logo from "./Logo";

export default function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="lg:w-1/2 bg-gradient-hero text-primary-foreground p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary-glow/30 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative">
          <Logo size="lg" />
        </div>
        <div className="relative max-w-md">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Almacén <span className="text-accent">Inteligente</span>.
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Gestiona tu almacén gastronómico con control de Merma, Caducidad y Estacionalidad de los insumos
          </p>
        </div>
        <div className="relative text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} Inf 342 - SC
        </div>
      </div>

      {/* Form panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-soft">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
