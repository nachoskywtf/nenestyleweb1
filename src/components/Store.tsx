import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Footprints, Package, Box } from "lucide-react";
import { supabaseService } from "../services/supabaseService";

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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Set up real-time subscription for categories
    let unsubscribeCategories: (() => void) | null = null;
    try {
      unsubscribeCategories = supabaseService.subscribeToCategories((updatedCategories) => {
        try {
          const mappedCategories = updatedCategories?.map((c: any) => ({
            id: c.id,
            name: c.name,
            createdAt: c.created_at
          })) || [];
          setCategories(mappedCategories);
        } catch (error) {
          console.error('Error processing category update:', error);
        }
      });
    } catch (error) {
      console.error('Error setting up category subscription:', error);
    }

    // Set up real-time subscription for products
    let unsubscribeProducts: (() => void) | null = null;
    try {
      unsubscribeProducts = supabaseService.subscribeToProducts((updatedProducts) => {
        try {
          const mappedProducts = updatedProducts?.map((p: any) => ({
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
        } catch (error) {
          console.error('Error processing product update:', error);
        }
      });
    } catch (error) {
      console.error('Error setting up product subscription:', error);
    }

    return () => {
      if (unsubscribeCategories) unsubscribeCategories();
      if (unsubscribeProducts) unsubscribeProducts();
    };
  }, []);

  const loadData = async () => {
    try {
      let loadedCategories: Category[] = [];
      
      // Try loading categories from Supabase first
      try {
        const supabaseCategories = await supabaseService.getCategories();
        if (supabaseCategories && supabaseCategories.length > 0) {
          loadedCategories = supabaseCategories.map((c: any) => ({
            id: c.id,
            name: c.name,
            createdAt: c.created_at
          }));
          setCategories(loadedCategories);
        }
      } catch (supabaseError) {
        console.error('Error loading categories from Supabase:', supabaseError);
      }

      // Fallback to localStorage if Supabase has no categories or failed
      if (loadedCategories.length === 0) {
        try {
          const storedCategories = localStorage.getItem("categories");
          if (storedCategories) {
            loadedCategories = JSON.parse(storedCategories);
            setCategories(loadedCategories);
          } else {
            // Default categories if none exist
            const defaultCategories = [
              { id: "1", name: "Ropa Urbana", createdAt: new Date().toISOString() },
              { id: "2", name: "Zapatillas", createdAt: new Date().toISOString() },
              { id: "3", name: "Perfumes", createdAt: new Date().toISOString() }
            ];
            localStorage.setItem("categories", JSON.stringify(defaultCategories));
            setCategories(defaultCategories);
          }
        } catch (localStorageError) {
          console.error('Error loading categories from localStorage:', localStorageError);
          // Use default categories as last resort
          const defaultCategories = [
            { id: "1", name: "Ropa Urbana", createdAt: new Date().toISOString() },
            { id: "2", name: "Zapatillas", createdAt: new Date().toISOString() },
            { id: "3", name: "Perfumes", createdAt: new Date().toISOString() }
          ];
          setCategories(defaultCategories);
        }
      }

      // Try loading products from Supabase first
      try {
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
      } catch (supabaseError) {
        console.error('Error loading products from Supabase:', supabaseError);
      }

      // Fallback to localStorage if Supabase has no products or failed
      if (products.length === 0) {
        try {
          const storedProducts = localStorage.getItem("products");
          if (storedProducts) {
            setProducts(JSON.parse(storedProducts));
          }
        } catch (localStorageError) {
          console.error('Error loading products from localStorage:', localStorageError);
        }
      }
    } catch (error) {
      console.error('Error in loadData:', error);
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
      <section id="tienda" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Cargando tienda...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="tienda" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
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
