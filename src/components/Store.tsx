import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Footprints, Package, Box } from "lucide-react";
import { supabaseService } from "../services/supabaseService";
import { supabase } from "../supabase";

interface Category {
  id: string;
  name: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  images: string[];
  description: string;
  sizes?: Array<{ size: string; stock: number }>;
  createdAt: string;
}

const Store = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [updateNotification, setUpdateNotification] = useState<string | null>(null);
  const [subscriptionLogs, setSubscriptionLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSubscriptionLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  useEffect(() => {
    loadData();
    
    // Show skeleton after 0.5s if data not loaded
    const skeletonTimeout = setTimeout(() => {
      if (loading) {
        setShowSkeleton(true);
      }
    }, 500);

    return () => clearTimeout(skeletonTimeout);
  }, []);

  useEffect(() => {
    // Re-enable Realtime with error handling
    let productChannel: any = null;
    let categoryChannel: any = null;

    try {
      productChannel = supabase
        .channel('public:products')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          async (payload) => {
            try {
              console.log('Store: Product change received', payload);
              const products = await supabaseService.getProducts();
              const mappedProducts = products?.map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                categoryId: p.category_id,
                images: p.images,
                description: p.description,
                sizes: p.sizes,
                createdAt: p.created_at
              })) || [];
              setProducts(mappedProducts);
              setUpdateNotification(`Productos actualizados: ${mappedProducts.length} productos`);
              setTimeout(() => setUpdateNotification(null), 3000);
            } catch (error) {
              console.error('Error processing product update:', error);
            }
          }
        )
        .subscribe((status: any) => {
          if (status === 'SUBSCRIBED') {
            console.log('Realtime product channel subscribed');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Realtime product channel error');
          }
        });

      categoryChannel = supabase
        .channel('public:categories')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'categories' },
          async (payload) => {
            try {
              console.log('Store: Category change received', payload);
              const categories = await supabaseService.getCategories();
              const mappedCategories = categories?.map((c: any) => ({
                id: c.id,
                name: c.name,
                createdAt: c.created_at
              })) || [];
              setCategories(mappedCategories);
            } catch (error) {
              console.error('Error processing category update:', error);
            }
          }
        )
        .subscribe((status: any) => {
          if (status === 'SUBSCRIBED') {
            console.log('Realtime category channel subscribed');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Realtime category channel error');
          }
        });
    } catch (error) {
      console.error('Error setting up Realtime subscriptions:', error);
    }

    return () => {
      try {
        if (productChannel) supabase.removeChannel(productChannel);
        if (categoryChannel) supabase.removeChannel(categoryChannel);
      } catch (error) {
        console.error('Error removing channels:', error);
      }
    };
  }, []);

  const loadData = async () => {
    try {
      // Load categories from Supabase exclusively
      const supabaseCategories = await supabaseService.getCategories();
      if (supabaseCategories && supabaseCategories.length > 0) {
        const mappedCategories = supabaseCategories.map((c: any) => ({
          id: c.id,
          name: c.name,
          createdAt: c.created_at
        }));
        setCategories(mappedCategories);
      }

      // Load products from Supabase exclusively
      const supabaseProducts = await supabaseService.getProducts();
      if (supabaseProducts && supabaseProducts.length > 0) {
        const mappedProducts = supabaseProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          categoryId: p.category_id,
          images: p.images,
          description: p.description,
          sizes: p.sizes,
          createdAt: p.created_at
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error in loadData:', error);
      // Set empty arrays to prevent crashes
      setCategories([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "ropa urbana":
        return ShoppingBag;
      case "zapatillas":
        return Footprints;
      case "perfumes":
        return Package;
      default:
        return Package;
    }
  };

  const getCategoryImage = (categoryName: string) => {
    const categoryProducts = products.filter(p => {
      const category = categories.find(c => c.id === p.categoryId);
      return category?.name === categoryName;
    });
    
    if (categoryProducts.length > 0) {
      return categoryProducts[0].images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80";
    }

    // Default images for categories
    switch (categoryName.toLowerCase()) {
      case "ropa urbana":
        return "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600&q=80";
      case "zapatillas":
        return "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80";
      case "perfumes":
        return "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80";
      default:
        return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80";
    }
  };

  const getCategoryDescription = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "ropa urbana":
        return "Poleras, hoodies y accesorios con estilo streetwear.";
      case "zapatillas":
        return "Las últimas tendencias en sneakers y calzado urbano.";
      case "perfumes":
        return "Fragancias exclusivas para complementar tu estilo.";
      default:
        return "Descubre nuestros productos seleccionados.";
    }
  };

  const getProductCount = (categoryId: string) => {
    return products.filter(p => p.categoryId === categoryId).length;
  };

  const handleCategoryClick = (category: Category) => {
    navigate(`/catalogo/${category.name.toLowerCase().replace(" ", "-")}`, { 
      state: { categoryId: category.id } 
    });
  };

  if (loading) {
    return (
      <section id="tienda" className="py-20 bg-secondary/30 min-h-screen">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">Tienda</h2>
          <p className="text-muted-foreground text-center mb-12">Completa tu estilo con nosotros.</p>
          
          {showSkeleton ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <div className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="mt-2 text-muted-foreground">Cargando productos...</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="tienda" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {updateNotification && (
          <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
            {updateNotification}
          </div>
        )}
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">Tienda</h2>
        <p className="text-muted-foreground text-center mb-12">Completa tu estilo con nosotros.</p>
        
        {/* Render each category as an independent section */}
        <div className="space-y-16">
          {categories?.map((category) => {
            const Icon = getCategoryIcon(category?.name);
            const categoryProducts = products?.filter(p => p?.categoryId === category?.id);
            
            return (
              <div key={category?.id} className="max-w-6xl mx-auto">
                {/* Category Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold">{category?.name}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">{getCategoryDescription(category?.name)}</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>{categoryProducts?.length || 0} productos disponibles</span>
                  </div>
                </div>

                {/* Products Grid for this Category */}
                {categoryProducts?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryProducts?.map((product) => (
                      <div
                        key={product?.id}
                        className="bg-card border border-card-border rounded-xl overflow-hidden group transform transition-all hover:scale-105 hover:shadow-xl"
                      >
                        <div
                          onClick={() => navigate(`/product/${product?.id}`)}
                          className="relative h-48 overflow-hidden cursor-pointer"
                        >
                          <img
                            src={product?.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80"}
                            alt={product?.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          {product?.sizes && product?.sizes?.length > 0 && product?.sizes?.every(s => s?.stock === 0) && (
                            <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-semibold">
                              SIN STOCK
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4
                            onClick={() => navigate(`/product/${product?.id}`)}
                            className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors cursor-pointer"
                          >
                            {product?.name}
                          </h4>
                          <p className="text-primary font-bold text-xl mb-2">${product?.price}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Box className="h-4 w-4" />
                            <span>
                              Stock: {product?.sizes && product?.sizes?.length > 0
                                ? product?.sizes?.reduce((total, size) => total + (size?.stock || 0), 0)
                                : 'N/A'
                              }
                            </span>
                          </div>
                          {product?.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {product?.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-card border border-card-border rounded-xl">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-semibold text-lg mb-2">No hay productos disponibles</h4>
                    <p className="text-muted-foreground">Pronto agregaremos nuevos productos a esta categoría.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Store;
