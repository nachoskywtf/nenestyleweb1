import { Clock, MapPin, MessageCircle } from "lucide-react";

const Contact = () => (
  <section id="horarios" className="py-20">
    <div className="container mx-auto px-4 max-w-3xl">
      <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">Horarios y Contacto</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Schedule */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">Horarios</h3>
          </div>
          <div className="space-y-2 text-sm">
            {[
              ["Lunes – Viernes", "10:00 – 20:00"],
              ["Sábado", "10:00 – 19:00"],
              ["Domingo", "Cerrado"],
            ].map(([day, time]) => (
              <div key={day} className="flex justify-between">
                <span className="text-muted-foreground">{day}</span>
                <span className={time === "Cerrado" ? "text-destructive" : ""}>{time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold">Ubicación</h3>
          </div>
          <p className="text-muted-foreground text-sm">Av. Los Presidentes 1375, Concepción</p>
        </div>
      </div>
    </div>
  </section>
);

export default Contact;
