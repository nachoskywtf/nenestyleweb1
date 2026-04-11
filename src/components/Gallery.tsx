const services = [
  {
    src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80",
    alt: "Corte de pelo",
    service: "Corte de pelo",
    description: "Corte personalizado según tu estilo, tipo de rostro y preferencias. Si no tienes claro qué elegir, el barbero te asesorará para lograr un resultado que realmente te favorezca. (incluye Cejas GRATIS)",
    price: "$8.000",
    time: "~45 min"
  },
  {
    src: "https://www.labarberiashop.com/blog/wp-content/uploads/2025/05/Hombre-usando-brocha-de-afeitar-en-ritual-de-afeitado-clasico.webp",
    alt: "Afeitado tradicional",
    service: "Afeitado Tradicional",
    description: "Un servicio pensado para lograr máxima prolijidad y confort.",
    price: "$3.000",
    time: "~30 min"
  },
  {
    src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80",
    alt: "Corte + Barba",
    service: "Corte + Barba",
    description: "Corte de cabello y diseño de barba trabajados en conjunto para lograr un resultado equilibrado y acorde a tu estilo. Se adapta la forma según tu rostro, asegurando un acabado limpio, definido y profesional.",
    price: "$10.000",
    time: "~60 min"
  }
];

const domicilios = [
  { clientes: "1 persona", price: "$12.000" },
  { clientes: "2 personas", price: "$20.000" },
  { clientes: "3 personas", price: "$27.000" }
];

const Gallery = () => (
  <section id="galeria" className="py-20 bg-secondary/30">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">Servicios</h2>
      
      {/* Services Grid */}
      <div className="mb-16">
        <h3 className="text-2xl font-heading font-bold text-center mb-8">SERVICIO — PRECIO</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {services.map((service, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.src} 
                  alt={service.alt} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  loading="lazy" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm font-semibold">{service.price}</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-heading font-bold text-lg mb-2">{service.service}</h3>
                <p className="text-muted-foreground text-sm mb-3">{service.description}</p>
                <div className="flex justify-between items-center">
                  <p className="text-primary font-bold text-xl">{service.price}</p>
                  <p className="text-muted-foreground text-sm">{service.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Domicilios Section */}
      <div>
        <h3 className="text-2xl font-heading font-bold text-center mb-8">DOMICILIO — PRECIO</h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
          {domicilios.map((dom, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-6 text-center">
              <p className="text-muted-foreground text-sm mb-2">{dom.clientes}</p>
              <p className="text-primary font-bold text-2xl">{dom.price}</p>
            </div>
          ))}
        </div>
        
        {/* WhatsApp Contact */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-muted-foreground mb-4">
            Contáctanos por WhatsApp para agendar tu corte a la comodidad de tu casa.
          </p>
          <a
            href="https://wa.me/56912345678?text=Hola,%20quiero%20agendar%20un%20corte%20a%20domicilio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.705-.508-.173-.006-.371-.006-.57-.006-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default Gallery;
