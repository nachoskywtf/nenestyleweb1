import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Scissors } from "lucide-react";

const Header = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-heading font-bold text-lg">
          <Scissors className="h-5 w-5 text-primary" />
          <span>NeneStyle</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <button onClick={() => scrollTo("servicios")} className="text-muted-foreground hover:text-foreground transition-colors">
            Servicios
          </button>
          <button onClick={() => navigate("/tienda")} className="text-muted-foreground hover:text-foreground transition-colors">
            Tienda
          </button>
          <button onClick={() => scrollTo("horarios")} className="text-muted-foreground hover:text-foreground transition-colors">
            Horarios
          </button>
          <button
            onClick={() => scrollTo("agendar")}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Agendar Hora
          </button>
        </nav>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button className="text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-3">
          <button onClick={() => scrollTo("servicios")} className="block w-full text-left text-muted-foreground hover:text-foreground py-1">
            Servicios
          </button>
          <button onClick={() => navigate("/tienda")} className="block w-full text-left text-muted-foreground hover:text-foreground py-1">
            Tienda
          </button>
          <button onClick={() => scrollTo("horarios")} className="block w-full text-left text-muted-foreground hover:text-foreground py-1">
            Horarios
          </button>
          <button
            onClick={() => scrollTo("agendar")}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm"
          >
            Agendar Hora
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
