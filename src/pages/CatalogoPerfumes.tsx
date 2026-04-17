import { ArrowLeft, ShoppingBag, ShoppingCart, Package } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabaseService } from "../services/supabaseService";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  image: string;
  description: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  createdAt: string;
}

const CatalogoPerfumes = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Set up real-time subscription for products only after categories are loaded
    if (categories.length > 0) {
      const unsubscribe = supabaseService.subscribeToProducts((updatedProducts) => {
        // Filter for Perfumes category
        const perfumeCategory = categories.find(c => c.name === "Perfumes");
        if (perfumeCategory) {
          const filtered = updatedProducts
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              stock: p.sizes?.reduce((total: number, s: any) => total + s.stock, 0) || 0,
              categoryId: p.category_id,
              image: p.images[0] || "",
              description: p.description,
              createdAt: p.created_at
            }))
            .filter(p => p.categoryId === perfumeCategory.id);
          setProducts(filtered);
        }
      });
      return () => unsubscribe();
    }
  }, [categories]);

  const loadData = async () => {
    try {
      // Try loading from Supabase first
      const supabaseCategories = await supabaseService.getCategories();
      if (supabaseCategories.length > 0) {
        const mappedCategories = supabaseCategories.map((c: any) => ({
          id: c.id,
          name: c.name,
          createdAt: c.created_at
        }));
        setCategories(mappedCategories);
      }

      // Fallback to localStorage
      const storedCategories = localStorage.getItem("categories");
      if (storedCategories && categories.length === 0) {
        const categories: Category[] = JSON.parse(storedCategories);
        setCategories(categories);
      }

      // Find Perfumes category
      const perfumeCategory = categories.find(c => c.name === "Perfumes");
      if (perfumeCategory) {
        // Load products from Supabase first
        const supabaseProducts = await supabaseService.getProducts();
        if (supabaseProducts.length > 0) {
          const filteredProducts = supabaseProducts
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              stock: p.sizes?.reduce((total: number, s: any) => total + s.stock, 0) || 0,
              categoryId: p.category_id,
              image: p.images[0] || "",
              description: p.description,
              createdAt: p.created_at
            }))
            .filter(p => p.categoryId === perfumeCategory.id);
          setProducts(filteredProducts);
        } else {
          // Fallback to localStorage
          const storedProducts = localStorage.getItem("products");
          if (storedProducts) {
            const allProducts: Product[] = JSON.parse(storedProducts);
            const filteredProducts = allProducts.filter(p => p.categoryId === perfumeCategory.id);
            setProducts(filteredProducts);
          }
        }
      }
    } catch (error) {
      // Fallback to localStorage if Supabase fails
      const storedCategories = localStorage.getItem("categories");
      if (storedCategories) {
        const categories: Category[] = JSON.parse(storedCategories);
        setCategories(categories);
      }
      const perfumeCategory = categories.find(c => c.name === "Perfumes");
      if (perfumeCategory) {
        const storedProducts = localStorage.getItem("products");
        if (storedProducts) {
          const allProducts: Product[] = JSON.parse(storedProducts);
          const filteredProducts = allProducts.filter(p => p.categoryId === perfumeCategory.id);
          setProducts(filteredProducts);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
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
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Cargando productos...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-card border border-card-border rounded-xl overflow-hidden group">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-semibold">${product.price.toLocaleString('es-CL')}</p>
                  </div>
                  {/* Stock Status Badge */}
                  <div className="absolute top-4 right-4">
                    {product.stock > 0 ? (
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
                        product.stock > 0
                          ? 'bg-primary text-primary-foreground hover:opacity-90' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={() => product.stock > 0 && addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.stock > 0 ? 'Agregar al Carrito' : 'No Disponible'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay productos disponibles</h3>
            <p className="text-muted-foreground">Pronto agregaremos nuevos productos a esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogoPerfumes;
