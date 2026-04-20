import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Package, DollarSign, Box, X, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCLP } from "../utils/currency";
import { supabaseService } from "../services/supabaseService";
import { supabase } from "../supabase";

interface ProductSize {
  size: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  images: string[];
  description: string;
  sizes?: ProductSize[];
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  createdAt: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      // Load product from Supabase
      const products = await supabaseService.getProducts();
      const productData = products?.find((p: any) => p.id === productId);
      if (productData) {
        const mappedProduct = {
          id: productData.id,
          name: productData.name,
          price: productData.price,
          categoryId: productData.category_id,
          images: productData.images,
          description: productData.description,
          sizes: productData.sizes,
          createdAt: productData.created_at
        };
        setProduct(mappedProduct);

        // Load category from Supabase
        const categories = await supabaseService.getCategories();
        const categoryData = categories?.find((c: any) => c.id === productData.category_id);
        if (categoryData) {
          setCategory({
            id: categoryData.id,
            name: categoryData.name,
            createdAt: categoryData.created_at
          });
        }

        // Auto-select first size if available
        if (mappedProduct.sizes && mappedProduct.sizes.length > 0) {
          const firstAvailableSize = mappedProduct.sizes.find(s => s.stock > 0);
          setSelectedSize(firstAvailableSize?.size || "");
        }
      } else {
        setError("Producto no encontrado");
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setError("Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  };


  const handleWhatsAppPurchase = () => {
    if (!product) return;

    // Validate size selection for products with sizes
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setError("Por favor selecciona una talla antes de continuar");
      return;
    }

    // Calculate total price
    const totalPrice = product.price * quantity;

    // Construct structured WhatsApp message
    const mensajeBase = `¡Hola! Vengo desde la tienda web y quiero confirmar la siguiente compra:
🛍️ *Producto:* ${product.name}
${selectedSize ? `📏 *Talla:* ${selectedSize}` : ''}
🔢 *Cantidad:* ${quantity}
💰 *Total a pagar:* ${formatCLP(totalPrice)}

¿Me confirmas disponibilidad para coordinar la entrega?`;

    // Encode message for URL
    const mensajeCodificado = encodeURIComponent(mensajeBase);
    const whatsappNumber = "56912345678"; // Replace with actual WhatsApp number
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${mensajeCodificado}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleMercadoPagoPurchase = async () => {
    if (!product) return;

    // Validate size selection for products with sizes
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setError("Por favor selecciona una talla antes de continuar");
      return;
    }

    try {
      // Calculate total price
      const totalPrice = product.price * quantity;

      // Prepare order data
      const orderData = {
        customer_name: '', // Will be collected in checkout
        customer_phone: '',
        customer_address: '',
        customer_city: '',
        items: [{
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          size: selectedSize || undefined,
          image: product.images[0]
        }],
        subtotal: totalPrice,
        shipping: 0,
        total: totalPrice
      };

      // Store order data in localStorage for checkout
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));

      // Navigate to checkout
      navigate('/checkout');
    } catch (error) {
      console.error('Error initiating Mercado Pago purchase:', error);
      setError("Error al iniciar compra con Mercado Pago");
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && product) {
      if (product.sizes && product.sizes.length > 0 && selectedSize) {
        const selectedSizeData = product.sizes.find(s => s.size === selectedSize);
        if (selectedSizeData && newQuantity <= selectedSizeData.stock) {
          setQuantity(newQuantity);
        }
      } else {
        setQuantity(newQuantity);
      }
    }
  };

  const getAvailableStock = () => {
    if (!product) return 0;
    if (product.sizes && product.sizes.length > 0 && selectedSize) {
      const selectedSizeData = product.sizes.find(s => s.size === selectedSize);
      return selectedSizeData?.stock || 0;
    }
    return 0;
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Producto no encontrado</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link
            to="/#tienda"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-card-border">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/#tienda"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>
        </div>
      </div>

      {/* Product Detail - Nike Style */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Product Image Gallery - Sticky on PC */}
          <div className="md:sticky md:top-24 h-fit space-y-4">
            {/* Main Image with 4:5 aspect ratio */}
            <div className="bg-gray-50 rounded-xl overflow-hidden cursor-pointer aspect-[4/5]">
              <img
                src={product.images[selectedImageIndex]}
                alt={`${product.name} - Imagen ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onClick={() => openImageModal(product.images[selectedImageIndex])}
              />
            </div>
            
            {/* Thumbnails - Snap Carousel for Mobile */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:justify-center">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all snap-center ${
                      selectedImageIndex === index
                        ? 'border-primary scale-105'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Fixed on PC */}
          <div className="space-y-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/#tienda" className="hover:text-foreground">Tienda</Link>
              <span>/</span>
              {category && (
                <>
                  <Link to={`/catalogo/${category.name.toLowerCase().replace(" ", "-")}`} className="hover:text-foreground">
                    {category.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-foreground">{product.name}</span>
            </div>

            {/* Product Name */}
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{formatCLP(product.price)}</span>
            </div>

            {/* Size Selector - Premium */}
            {product.sizes && product.sizes.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-6 text-lg text-foreground">Talla</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {product.sizes.map((size) => (
                      <button
                        key={size.size}
                        onClick={() => {
                          setSelectedSize(size.size);
                          setQuantity(1);
                        }}
                        disabled={size.stock === 0}
                        className={`py-4 px-6 rounded-lg font-semibold text-base transition-all duration-300 ${
                          selectedSize === size.size
                            ? 'bg-[#FFD700] text-black scale-105 shadow-lg'
                            : size.stock === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-white border-2 border-gray-200 text-foreground hover:scale-105 hover:border-gray-400 hover:shadow-md hover:-translate-y-1'
                        }`}
                      >
                        {size.size}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedSize && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Box className="h-4 w-4" />
                    <span>
                      {product.sizes.find(s => s.size === selectedSize)?.stock || 0} unidades disponibles
                    </span>
                  </div>
                )}
              </div>
            ) : null}

            {/* Quantity Selector - Premium Stepper */}
            {(!product.sizes || product.sizes.length === 0 || selectedSize) && (
              <div className="space-y-8">
                <div className="flex items-center gap-8">
                  <span className="font-semibold text-lg text-foreground">Cantidad</span>
                  <div className="flex items-center border-2 border-[#FFD700] rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className={`px-6 py-4 text-xl font-bold transition-all duration-200 ${
                        quantity <= 1
                          ? 'bg-white text-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-white text-black hover:bg-[#FFD700] hover:text-black hover:scale-105 active:scale-95'
                      }`}
                    >
                      −
                    </button>
                    <div className="w-16 text-center py-4 text-2xl font-bold text-black bg-white border-x-2 border-[#FFD700]">
                      {quantity}
                    </div>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= getAvailableStock()}
                      className={`px-6 py-4 text-xl font-bold transition-all duration-200 ${
                        quantity >= getAvailableStock()
                          ? 'bg-white text-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-white text-black hover:bg-[#FFD700] hover:text-black hover:scale-105 active:scale-95'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Payment Options - Minimalist Nike Style */}
                <div className="space-y-4 pt-4">
                  <h3 className="font-semibold text-lg">Método de pago</h3>
                  
                  {/* WhatsApp Option */}
                  <button
                    onClick={handleWhatsAppPurchase}
                    disabled={getAvailableStock() === 0 || (product.sizes && product.sizes.length > 0 && !selectedSize)}
                    className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.349.173-1.413-.074-.064-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </button>

                  {/* Mercado Pago Option */}
                  <button
                    onClick={handleMercadoPagoPurchase}
                    disabled={getAvailableStock() === 0 || (product.sizes && product.sizes.length > 0 && !selectedSize)}
                    className="w-full bg-white hover:bg-gray-50 text-black py-4 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-2 border-gray-200"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c.55 0 1-.45 1-1V4h2c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1v3h-1c-.9 0-1.64.58-1.9 1.39-.07.22-.1.45-.1.69 0 .95.78 1.73 1.73 1.73h.27c.95 0 1.73-.78 1.73-1.73 0-.24-.03-.47-.1-.69z"/>
                    </svg>
                    Mercado Pago
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description Section - Full Width at Bottom */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold mb-6">Descripción</h2>
            <p className="text-gray-600 leading-loose text-lg">
              {product.description || "Producto de alta calidad con diseño exclusivo. Perfecto para complementar tu estilo personal."}
            </p>
          </div>
        </div>
      </div>

      {/* Simple Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors text-2xl font-bold"
            >
              ×
            </button>

            {/* Modal Image */}
            <img
              src={selectedImage}
              alt="Imagen ampliada"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
