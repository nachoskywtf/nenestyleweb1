import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Package, DollarSign, Box, X, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCLP } from "../utils/currency";

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
      // Load products from localStorage
      const storedProducts = localStorage.getItem("products");
      if (storedProducts) {
        const products: Product[] = JSON.parse(storedProducts);
        const foundProduct = products.find(p => p.id === productId);
        if (foundProduct) {
          // Handle migration from old model (single image) to new model (images array)
          let finalProduct = { ...foundProduct };
          if ((finalProduct as any).image && !finalProduct.images) {
            finalProduct.images = [(finalProduct as any).image];
          }

          setProduct(finalProduct);

          // Load category
          const storedCategories = localStorage.getItem("categories");
          if (storedCategories) {
            const categories: Category[] = JSON.parse(storedCategories);
            const foundCategory = categories.find(c => c.id === foundProduct.categoryId);
            setCategory(foundCategory || null);
          }

          // Auto-select first size if available
          if (finalProduct.sizes && finalProduct.sizes.length > 0) {
            const firstAvailableSize = finalProduct.sizes.find(s => s.stock > 0);
            setSelectedSize(firstAvailableSize?.size || "");
          }
        } else {
          setError("Producto no encontrado");
        }
      } else {
        setError("No hay productos disponibles");
      }
    } catch (error) {
      setError("Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Validate size selection for products with sizes
    if (product.sizes && product.sizes.length > 0) {
      if (!selectedSize) {
        setError("Debe seleccionar una talla");
        return;
      }

      const selectedSizeData = product.sizes.find(s => s.size === selectedSize);
      if (!selectedSizeData || selectedSizeData.stock < quantity) {
        setError("No hay suficiente stock disponible para esta talla");
        return;
      }

      // Check if item is already in cart
      const existingCart = localStorage.getItem("cart");
      const cart = existingCart ? JSON.parse(existingCart) : [];
      const existingItem = cart.find((item: any) =>
        item.productId === product.id && item.selectedSize === selectedSize
      );

      if (existingItem) {
        const totalQuantity = existingItem.quantity + quantity;
        if (totalQuantity > selectedSizeData.stock) {
          setError(`Solo hay ${selectedSizeData.stock} unidades disponibles para esta talla (ya tienes ${existingItem.quantity} en el carrito)`);
          return;
        }
      }
    }

    // Add to cart logic
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0],
      selectedSize: selectedSize || undefined
    };

    const existingCart = localStorage.getItem("cart");
    const cart = existingCart ? JSON.parse(existingCart) : [];

    const existingItemIndex = cart.findIndex((item: any) =>
      item.productId === product.id && item.selectedSize === (selectedSize || undefined)
    );
    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart-updated'));

    // Navigate to checkout
    navigate("/checkout");
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

      {/* Product Detail */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Product Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-card border border-card-border rounded-xl overflow-hidden cursor-pointer">
              <img
                src={product.images[selectedImageIndex]}
                alt={`${product.name} - Imagen ${selectedImageIndex + 1}`}
                className="w-full h-96 object-cover"
                onClick={() => openImageModal(product.images[selectedImageIndex])}
              />
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
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

          {/* Product Info */}
          <div className="space-y-6">
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
            <h1 className="text-3xl md:text-4xl font-heading font-bold">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{formatCLP(product.price)}</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "Producto de alta calidad con diseño exclusivo. Perfecto para complementar tu estilo personal."}
              </p>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Talla:</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size.size}
                        onClick={() => {
                          setSelectedSize(size.size);
                          setQuantity(1); // Reset quantity when size changes
                        }}
                        disabled={size.stock === 0}
                        className={`py-2 px-3 rounded-lg font-medium transition-all ${
                          selectedSize === size.size
                            ? 'bg-primary text-primary-foreground'
                            : size.stock === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-secondary hover:bg-secondary/80 border border-border'
                        }`}
                      >
                        {size.size}
                        {size.stock === 0 && ' (Agotado)'}
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

            {/* Quantity Selector */}
            {(!product.sizes || product.sizes.length === 0 || selectedSize) && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Cantidad:</span>
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="px-3 py-2 hover:bg-secondary transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 text-center border-x border-border py-2 focus:outline-none text-black font-medium"
                      min="1"
                      max={getAvailableStock()}
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="px-3 py-2 hover:bg-secondary transition-colors"
                      disabled={quantity >= getAvailableStock()}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={getAvailableStock() === 0 || (product.sizes && product.sizes.length > 0 && !selectedSize)}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {getAvailableStock() === 0 ? 'Sin stock' : 'Agregar al carrito'}
                </button>
              </div>
            )}

            {/* Product Details */}
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-4">Detalles del producto</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">SKU:</span>
                  <span>{product.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Precio:</span>
                  <span>{formatCLP(product.price)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Stock:</span>
                  <span>
                    {product.sizes && product.sizes.length > 0 
                      ? `${product.sizes.reduce((total, size) => total + size.stock, 0)} unidades`
                      : 'Sin tallas definidas'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Categoría:</span>
                  <span>{category?.name || "Sin categoría"}</span>
                </div>
              </div>
            </div>
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
