import { useNavigate } from "react-router-dom";
import { Lock, Shield, ArrowRight } from "lucide-react";

const LoginSection = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-heading font-bold">Acceso Administrativo</h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Panel de control exclusivo para personal autorizado. Gestiona horarios, 
              disponibilidad y reservas desde un lugar centralizado.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-card border border-card-border rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-center mb-6">
              <Lock className="h-12 w-12 text-primary" />
            </div>
            
            <h3 className="text-2xl font-heading font-bold mb-4">Panel de Administración</h3>
            
            <p className="text-muted-foreground mb-8">
              Acceso restringido para gestión de horarios y reservas del sistema.
            </p>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Seguro</h4>
                <p className="text-sm text-muted-foreground">Acceso protegido con credenciales únicas</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Privado</h4>
                <p className="text-sm text-muted-foreground">Panel exclusivo para administradores</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Directo</h4>
                <p className="text-sm text-muted-foreground">Acceso rápido a herramientas de gestión</p>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLoginClick}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Iniciar Sesión Administrativa
            </button>

            {/* Security Note */}
            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Este panel está destinado únicamente al personal autorizado. 
                El acceso no autorizado está prohibido y será registrado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginSection;
