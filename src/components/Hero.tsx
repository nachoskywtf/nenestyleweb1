import { ChevronDown } from "lucide-react";

const Hero = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1400&q=80"
          alt="Barbería"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-6 leading-tight">
          ¡BIENVENIDO A NENESTYLE!
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-8">
          Barbería, ropa urbana y zapatillas en un solo lugar. Tu estilo empieza aquí.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={() => scrollTo("agendar")}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Reserva tu hora
          </button>
          <button
            onClick={() => scrollTo("galeria")}
            className="border border-border text-foreground px-8 py-3 rounded-lg font-semibold text-lg hover:bg-secondary transition-colors"
          >
            Ver Servicios
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
          {[
            ["1500+", "Clientes"],
            ["3+", "Años"],
            ["98%", "Satisfacción"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-2xl md:text-3xl font-heading font-bold text-primary">{value}</p>
              <p className="text-muted-foreground text-sm">{label}</p>
            </div>
          ))}
        </div>

        <ChevronDown className="mx-auto mt-12 h-6 w-6 text-muted-foreground animate-bounce" />
      </div>
    </section>
  );
};

export default Hero;
