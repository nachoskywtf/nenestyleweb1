import { useState, useEffect } from "react";
import { Package, Plus, Edit2, Trash2, Save, X, Image, DollarSign, Box, Tag, PlusCircle } from "lucide-react";
import { formatCLP } from "../utils/currency";
import { supabaseService } from "../services/supabaseService";

interface Category {
  id: string;
  name: string;
  createdAt: string;
}

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

interface ProductFormData {
  name: string;
  price: string;
  categoryId: string;
  images: string[];
  description: string;
  sizes: ProductSize[];
}

const ProductManager = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'add-product'>('products');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    categoryId: "",
    images: [""],
    description: "",
    sizes: []
  });

  // Category form state
  const [categoryName, setCategoryName] = useState("");

  // Load categories and products
  useEffect(() => {
    loadCategories();
    loadProducts();
    // Set up real-time subscriptions
    const unsubscribeProducts = supabaseService.subscribeToProducts((updatedProducts) => {
      const mappedProducts = updatedProducts.map((p: any) => ({
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
    });
    const unsubscribeCategories = supabaseService.subscribeToCategories((updatedCategories) => {
      const mappedCategories = updatedCategories.map((c: any) => ({
        id: c.id,
        name: c.name,
        createdAt: c.created_at
      }));
      setCategories(mappedCategories);
    });
    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  const loadCategories = async () => {
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
        // Also update localStorage as backup
        localStorage.setItem("categories", JSON.stringify(mappedCategories));
      } else {
        // Fallback to localStorage
        const storedCategories = localStorage.getItem("categories");
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        } else {
          const defaultCategories = [
            { id: "1", name: "Ropa Urbana", createdAt: new Date().toISOString() },
            { id: "2", name: "Zapatillas", createdAt: new Date().toISOString() },
            { id: "3", name: "Perfumes", createdAt: new Date().toISOString() }
          ];
          localStorage.setItem("categories", JSON.stringify(defaultCategories));
          setCategories(defaultCategories);
        }
      }
    } catch (err) {
      // Fallback to localStorage if Supabase fails
      const storedCategories = localStorage.getItem("categories");
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        const defaultCategories = [
          { id: "1", name: "Ropa Urbana", createdAt: new Date().toISOString() },
          { id: "2", name: "Zapatillas", createdAt: new Date().toISOString() },
          { id: "3", name: "Perfumes", createdAt: new Date().toISOString() }
        ];
        localStorage.setItem("categories", JSON.stringify(defaultCategories));
        setCategories(defaultCategories);
      }
    }
  };

  const loadProducts = async () => {
    try {
      // Try loading from Supabase first
      const supabaseProducts = await supabaseService.getProducts();
      if (supabaseProducts.length > 0) {
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
        // Also update localStorage as backup
        localStorage.setItem("products", JSON.stringify(mappedProducts));
      } else {
        // Fallback to localStorage
        const storedProducts = localStorage.getItem("products");
        if (storedProducts) {
          const products = JSON.parse(storedProducts);
          const migratedProducts = products.map((p: any) => {
            if (p.image && !p.images) {
              return {
                ...p,
                images: [p.image],
                sizes: p.sizes || []
              };
            }
            return p;
          });
          setProducts(migratedProducts);
        }
      }
    } catch (err) {
      // Fallback to localStorage if Supabase fails
      const storedProducts = localStorage.getItem("products");
      if (storedProducts) {
        const products = JSON.parse(storedProducts);
        const migratedProducts = products.map((p: any) => {
          if (p.image && !p.images) {
            return {
              ...p,
              images: [p.image],
              sizes: p.sizes || []
            };
          }
          return p;
        });
        setProducts(migratedProducts);
      }
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setError("El nombre del producto es obligatorio");
      setLoading(false);
      return;
    }

    const price = parseFloat(formData.price);

    if (isNaN(price) || price <= 0) {
      setError("El precio debe ser mayor a 0");
      setLoading(false);
      return;
    }

    if (!formData.categoryId) {
      setError("Debe seleccionar una categoría");
      setLoading(false);
      return;
    }

    // Validate images
    const validImages = formData.images.filter(img => img.trim() !== "");
    if (validImages.length === 0) {
      setError("Debe agregar al menos una imagen");
      setLoading(false);
      return;
    }

    // Validate sizes for clothing/shoes categories
    const category = categories.find(c => c.id === formData.categoryId);
    const requiresSizes = category?.name.toLowerCase().includes('ropa') || category?.name.toLowerCase().includes('zapatilla');
    
    if (requiresSizes && formData.sizes.length === 0) {
      setError("Debe agregar al menos una talla para este producto");
      setLoading(false);
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        price,
        category_id: formData.categoryId,
        images: validImages,
        description: formData.description.trim(),
        sizes: formData.sizes,
        createdAt: new Date().toISOString()
      };

      console.log('ProductManager: Attempting to save to Supabase', productData);

      // Save to Supabase
      if (editingProduct) {
        await supabaseService.updateProduct(editingProduct.id, productData);
        console.log('ProductManager: Product updated in Supabase');
        setSuccess("Producto actualizado exitosamente");
        setEditingProduct(null);
      } else {
        await supabaseService.createProduct(productData);
        console.log('ProductManager: Product created in Supabase');
        setSuccess("Producto creado exitosamente");
      }

      // Also save to localStorage as backup
      const localProductData = {
        name: formData.name.trim(),
        price,
        categoryId: formData.categoryId,
        images: validImages,
        description: formData.description.trim(),
        sizes: formData.sizes,
        createdAt: new Date().toISOString()
      };

      if (editingProduct) {
        const updatedProducts = products.map(p => 
          p.id === editingProduct.id 
            ? { ...localProductData, id: editingProduct.id, createdAt: editingProduct.createdAt }
            : p
        );
        localStorage.setItem("products", JSON.stringify(updatedProducts));
        setProducts(updatedProducts);
      } else {
        const newProduct = {
          ...localProductData,
          id: Date.now().toString()
        };
        const updatedProducts = [...products, newProduct];
        localStorage.setItem("products", JSON.stringify(updatedProducts));
        setProducts(updatedProducts);
      }

      // Reset form
      setFormData({
        name: "",
        price: "",
        categoryId: "",
        images: [""],
        description: "",
        sizes: []
      });
      setActiveTab('products');
    } catch (err: any) {
      console.error('ProductManager: Supabase error:', err);
      // Display Supabase error in UI
      setError(`Error de Supabase: ${err.message || err.toString()}`);
      
      // Fallback to localStorage only if Supabase fails
      const productData = {
        name: formData.name.trim(),
        price,
        categoryId: formData.categoryId,
        images: validImages,
        description: formData.description.trim(),
        sizes: formData.sizes,
        createdAt: new Date().toISOString()
      };

      if (editingProduct) {
        const updatedProducts = products.map(p => 
          p.id === editingProduct.id 
            ? { ...productData, id: editingProduct.id, createdAt: editingProduct.createdAt }
            : p
        );
        localStorage.setItem("products", JSON.stringify(updatedProducts));
        setProducts(updatedProducts);
        setSuccess("Producto actualizado exitosamente (localStorage fallback)");
        setEditingProduct(null);
      } else {
        const newProduct = {
          ...productData,
          id: Date.now().toString()
        };
        const updatedProducts = [...products, newProduct];
        localStorage.setItem("products", JSON.stringify(updatedProducts));
        setProducts(updatedProducts);
        setSuccess("Producto creado exitosamente (localStorage fallback)");
      }

      setFormData({
        name: "",
        price: "",
        categoryId: "",
        images: [""],
        description: "",
        sizes: []
      });
      setActiveTab('products');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!categoryName.trim()) {
      setError("El nombre de la categoría es obligatorio");
      setLoading(false);
      return;
    }

    try {
      const categoryData = {
        name: categoryName.trim(),
        createdAt: new Date().toISOString()
      };

      // Save to Supabase
      await supabaseService.createCategory(categoryData);

      // Also save to localStorage as backup
      const newCategory = {
        id: Date.now().toString(),
        name: categoryName.trim(),
        createdAt: new Date().toISOString()
      };

      const updatedCategories = [...categories, newCategory];
      localStorage.setItem("categories", JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
      setSuccess("Categoría creada exitosamente");
      setCategoryName("");
    } catch (err) {
      // Fallback to localStorage only if Supabase fails
      const newCategory = {
        id: Date.now().toString(),
        name: categoryName.trim(),
        createdAt: new Date().toISOString()
      };

      const updatedCategories = [...categories, newCategory];
      localStorage.setItem("categories", JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
      setSuccess("Categoría creada exitosamente");
      setCategoryName("");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("¿Está seguro de eliminar este producto?")) return;

    try {
      // Delete from Supabase
      await supabaseService.deleteProduct(productId);

      // Also delete from localStorage as backup
      const updatedProducts = products.filter(p => p.id !== productId);
      localStorage.setItem("products", JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      setSuccess("Producto eliminado exitosamente");
    } catch (err) {
      // Fallback to localStorage only if Supabase fails
      const updatedProducts = products.filter(p => p.id !== productId);
      localStorage.setItem("products", JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      setSuccess("Producto eliminado exitosamente");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("¿Está seguro de eliminar esta categoría? Los productos asociados serán eliminados.")) return;

    try {
      // Delete from Supabase
      await supabaseService.deleteCategory(categoryId);

      // Also delete from localStorage as backup
      const updatedCategories = categories.filter(c => c.id !== categoryId);
      const updatedProducts = products.filter(p => p.categoryId !== categoryId);
      
      localStorage.setItem("categories", JSON.stringify(updatedCategories));
      localStorage.setItem("products", JSON.stringify(updatedProducts));
      
      setCategories(updatedCategories);
      setProducts(updatedProducts);
      setSuccess("Categoría eliminada exitosamente");
    } catch (err) {
      // Fallback to localStorage only if Supabase fails
      const updatedCategories = categories.filter(c => c.id !== categoryId);
      const updatedProducts = products.filter(p => p.categoryId !== categoryId);
      
      localStorage.setItem("categories", JSON.stringify(updatedCategories));
      localStorage.setItem("products", JSON.stringify(updatedProducts));
      
      setCategories(updatedCategories);
      setProducts(updatedProducts);
      setSuccess("Categoría eliminada exitosamente");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      categoryId: product.categoryId,
      images: product.images,
      description: product.description,
      sizes: product.sizes || []
    });
    setActiveTab('add-product');
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Sin categoría";
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'products' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package className="inline h-4 w-4 mr-2" />
          Productos
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'categories' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Tag className="inline h-4 w-4 mr-2" />
          Categorías
        </button>
        <button
          onClick={() => {
            setActiveTab('add-product');
            setEditingProduct(null);
            setFormData({
              name: "",
              price: "",
              categoryId: "",
              images: [""],
              description: "",
              sizes: []
            });
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'add-product' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Plus className="inline h-4 w-4 mr-2" />
          {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-card border border-card-border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{getCategoryName(product.categoryId)}</p>
                    <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatCLP(product.price)}
                      </span>
                      {product.sizes && product.sizes.length > 0 ? (
                        <span className="flex items-center gap-1">
                          <Box className="h-4 w-4" />
                          {product.sizes.reduce((total, size) => total + size.stock, 0)} unidades
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Sin tallas</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay productos registrados</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <form onSubmit={handleCategorySubmit} className="bg-card border border-card-border rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-4">Nueva Categoría</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={categoryName}
                onChange={(e: any) => setCategoryName(e.target.value)}
                placeholder="Nombre de la categoría"
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="grid gap-3">
            {categories.map((category) => (
              <div key={category.id} className="bg-card border border-card-border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {products.filter(p => p.categoryId === category.id).length} productos
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Product Tab */}
      {activeTab === 'add-product' && (
        <div>
          <form onSubmit={handleProductSubmit} className="bg-card border border-card-border rounded-lg p-6">
            <h3 className="font-semibold mb-6">
              {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h3>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre del Producto *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nombre del producto"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Precio (CLP) *</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="19990"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categoría *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Imágenes del Producto *</label>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => {
                          const newImages = [...formData.images];
                          newImages[index] = e.target.value;
                          setFormData({...formData, images: newImages});
                        }}
                        placeholder={`URL de imagen ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== index);
                            setFormData({...formData, images: newImages});
                          }}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, images: [...formData.images, ""]})}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Agregar otra imagen
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción del producto (opcional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Sizes Management */}
              <div>
                <label className="block text-sm font-medium mb-2">Tallas y Stock</label>
                <div className="space-y-2">
                  {formData.sizes.map((size, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={size.size}
                        onChange={(e) => {
                          const newSizes = [...formData.sizes];
                          newSizes[index] = { ...size, size: e.target.value };
                          setFormData({...formData, sizes: newSizes});
                        }}
                        placeholder="Talla (S, M, L, 40, 41, etc.)"
                        className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="number"
                        min="0"
                        value={size.stock}
                        onChange={(e) => {
                          const newSizes = [...formData.sizes];
                          newSizes[index] = { ...size, stock: parseInt(e.target.value) || 0 };
                          setFormData({...formData, sizes: newSizes});
                        }}
                        placeholder="Stock"
                        className="w-24 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSizes = formData.sizes.filter((_, i) => i !== index);
                          setFormData({...formData, sizes: newSizes});
                        }}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, sizes: [...formData.sizes, { size: "", stock: 0 }]})}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Agregar talla
                  </button>
                  {formData.sizes.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {categories.find(c => c.id === formData.categoryId)?.name.toLowerCase().includes('ropa') || 
                       categories.find(c => c.id === formData.categoryId)?.name.toLowerCase().includes('zapatilla')
                        ? "Las tallas son obligatorias para productos de ropa y zapatillas"
                        : "Las tallas son opcionales para perfumes y otros productos"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Guardando...' : (
                  <>
                    <Save className="inline h-4 w-4 mr-2" />
                    {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                  </>
                )}
              </button>
              {editingProduct && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setFormData({
                      name: "",
                      price: "",
                      categoryId: "",
                      images: [""],
                      description: "",
                      sizes: []
                    });
                    setActiveTab('products');
                  }}
                  className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
                >
                  <X className="inline h-4 w-4 mr-2" />
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
