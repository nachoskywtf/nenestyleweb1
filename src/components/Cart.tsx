import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { formatCLP } from "../utils/currency";
import { firebaseService } from "../services/firebaseService";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedSize?: string;
}

const Cart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // Load cart from Firebase on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Listen for open-cart event
  useEffect(() => {
    const handleOpenCart = () => setIsOpen(true);
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, []);

  // Update cart when it changes
  useEffect(() => {
    updateCartDisplay();
  }, [cart]);

  const loadCart = async () => {
    try {
      const storedCart = await firebaseService.getCart();
      if (storedCart && storedCart.length > 0) {
        setCart(storedCart);
      }
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  };

  const saveCart = async () => {
    try {
      await firebaseService.setCart(cart);
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (err) {
      console.error('Error saving cart:', err);
    }
  };

  const updateCartDisplay = () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setTotal(total);
    setItemCount(count);
  };

  const addToCart = (product: {
    productId: string;
    name: string;
    price: number;
    image: string;
    selectedSize?: string;
  }) => {
    const existingItem = cart.find(
      item => item.productId === product.productId && item.selectedSize === product.selectedSize
    );

    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.productId === product.productId && item.selectedSize === product.selectedSize
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    saveCart();
    setIsOpen(true);
  };

  const changeQuantity = async (productId: string, selectedSize: string | undefined, change: number) => {
    // Load products to check stock
    const storedProducts = await firebaseService.getProducts();
    if (!storedProducts || storedProducts.length === 0) {
      return;
    }

    const products = storedProducts;
    const product = products.find((p: any) => p.id === productId);

    if (!product) {
      return;
    }

    // Check stock for products with sizes
    if (product.sizes && product.sizes.length > 0 && selectedSize) {
      const sizeData = product.sizes.find((s: any) => s.size === selectedSize);
      if (!sizeData) {
        return;
      }

      const cartItem = cart.find(item =>
        item.productId === productId && item.selectedSize === selectedSize
      );

      if (!cartItem) {
        return;
      }

      const newQuantity = cartItem.quantity + change;

      if (newQuantity > sizeData.stock) {
        alert(`Solo hay ${sizeData.stock} unidades disponibles para esta talla`);
        return;
      }

      if (newQuantity <= 0) {
        removeItem(productId, selectedSize);
        return;
      }

      const updatedCart = cart.map(item =>
        item.productId === productId && item.selectedSize === selectedSize
          ? { ...item, quantity: newQuantity }
          : item
      );
      setCart(updatedCart);
      saveCart();
    } else {
      // For products without sizes, just change quantity
      const updatedCart = cart.map(item => {
        if (item.productId === productId && item.selectedSize === selectedSize) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) {
            return null;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item !== null) as CartItem[];

      setCart(updatedCart);
      saveCart();
    }
  };

  const removeItem = (productId: string, selectedSize: string | undefined) => {
    const updatedCart = cart.filter(
      item => !(item.productId === productId && item.selectedSize === selectedSize)
    );
    setCart(updatedCart);
    saveCart();
  };

  const handleCheckout = () => {
    setIsOpen(false);
    window.location.href = "/checkout";
  };

  return (
    <>
      {/* Cart Button with Counter - rendered in Header */}
      {isOpen && createPortal(
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            style={{ zIndex: 2147483647 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <div
            className={`fixed top-0 right-0 h-full w-full md:max-w-md bg-card border-l border-card-border shadow-2xl transform transition-transform duration-300 ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ zIndex: 2147483647 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-card-border">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Cerrar carrito"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.selectedSize || ''}`}
                    className="flex gap-4 p-4 bg-secondary/30 rounded-lg"
                  >
                    {/* Product Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.name}</h3>
                      {item.selectedSize && (
                        <p className="text-sm text-muted-foreground mb-1">Talla: {item.selectedSize}</p>
                      )}
                      <p className="text-primary font-bold">{formatCLP(item.price)}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => changeQuantity(item.productId, item.selectedSize, -1)}
                          className="p-1 hover:bg-secondary rounded transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => changeQuantity(item.productId, item.selectedSize, 1)}
                          className="p-1 hover:bg-secondary rounded transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.productId, item.selectedSize)}
                          className="ml-auto p-1 hover:bg-destructive hover:text-destructive-foreground rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-card-border space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">{formatCLP(total)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Continuar compra
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
        </>,
        document.body
      )}
    </>
  );
};

export default Cart;
