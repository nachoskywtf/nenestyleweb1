import { ArrowLeft, ShoppingBag, ShoppingCart, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const perfumeProducts = [
  {
    name: "Xerjoff Erba Pura Edp",
    description: "Fragancia exclusiva con notas frescas y naturales",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
    price: "$249.990",
    stock: false
  },
  {
    name: "Valentino Born In Roma Intense Uomo Edp Hombre",
    description: "Aroma sofisticado y moderno para el hombre contemporáneo",
    image: "https://images.unsplash.com/photo-1594035910387-fea4779a4034?w=400&q=80",
    price: "$159.990",
    stock: false
  },
  {
    name: "Stronger With You Intensely EDP",
    description: "Fragancia intensa y carismática con notas especiadas",
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&q=80",
    price: "$84.990",
    stock: false
  }
];

const CatalogoPerfumes = () => {
  const navigate = useNavigate();

  const addToCart = (product: any) => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      selectedSize: undefined
    };

    const existingCart = localStorage.getItem("cart");
    const cart = existingCart ? JSON.parse(existingCart) : [];

    const existingItemIndex = cart.findIndex((item: any) => item.productId === product.id);
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart-updated'));
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate("/#tienda")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Tienda
          </button>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Perfumes</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Descubre nuestra colección exclusiva de fragancias para complementar tu estilo personal.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {perfumeProducts.map((product, index) => (
            <div key={index} className="bg-card border border-card-border rounded-xl overflow-hidden group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm font-semibold">{product.price}</p>
                </div>
                {/* Stock Status Badge */}
                <div className="absolute top-4 right-4">
                  {product.stock ? (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      EN STOCK
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      SIN STOCK
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-heading font-bold text-xl mb-2">{product.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
                <div className="flex gap-2">
                  <button 
                    className={`flex-1 py-2 rounded-lg font-semibold transition-opacity flex items-center justify-center gap-2 ${
                      product.stock 
                        ? 'bg-primary text-primary-foreground hover:opacity-90' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={() => product.stock && addToCart(product)}
                    disabled={!product.stock}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {product.stock ? 'Agregar al Carrito' : 'No Disponible'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogoPerfumes;
