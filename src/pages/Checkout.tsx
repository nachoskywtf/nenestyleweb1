import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, ShoppingBag, Truck, Shield, Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { validateInput, isValidChileanPhone, isValidEmail } from "../utils/sanitization";

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    phone: ""
  });

  useEffect(() => {
    loadCart();
  }, []);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      loadCart();
    };
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  const loadCart = () => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    } else {
      setCartItems([]);
    }
  };

  const removeItem = (productId: string, selectedSize?: string) => {
    const updatedCart = cartItems.filter(
      item => !(item.productId === productId && item.selectedSize === selectedSize)
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const changeQuantity = (productId: string, selectedSize: string | undefined, change: number) => {
    // Load products to check stock
    const storedProducts = localStorage.getItem("products");
    if (!storedProducts) {
      return;
    }

    const products = JSON.parse(storedProducts);
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

      const cartItem = cartItems.find(item =>
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

      const updatedCart = cartItems.map(item =>
        item.productId === productId && item.selectedSize === selectedSize
          ? { ...item, quantity: newQuantity }
          : item
      );
      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } else {
      // For products without sizes, just change quantity
      const updatedCart = cartItems.map(item => {
        if (item.productId === productId && item.selectedSize === selectedSize) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) {
            return null;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item !== null);

      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new CustomEvent('cart-updated'));
    }
  };

  const createOrder = (paymentMethod: "mercadopago" | "whatsapp") => {
    // Validate phone number
    if (shippingInfo.phone && !isValidChileanPhone(shippingInfo.phone)) {
      alert("Por favor, ingresa un número de teléfono válido (formato chileno)");
      return null;
    }

    // Validate address
    if (!shippingInfo.address || shippingInfo.address.trim().length < 5) {
      alert("Por favor, ingresa una dirección válida");
      return null;
    }

    // Validate city
    if (!shippingInfo.city || shippingInfo.city.trim().length < 3) {
      alert("Por favor, ingresa una ciudad válida");
      return null;
    }

    // Validate cart has items
    if (cartItems.length === 0) {
      alert("Tu carrito está vacío");
      return null;
    }

    // Validate stock availability before creating order
    const storedProducts = localStorage.getItem("products");
    if (!storedProducts) {
      alert("Error: no se pueden cargar los productos");
      return null;
    }

    const products = JSON.parse(storedProducts);

    // Check stock for all cart items
    for (const cartItem of cartItems) {
      const product = products.find((p: any) => p.id === cartItem.productId);
      if (!product) {
        alert(`Producto ${cartItem.name} no encontrado`);
        return null;
      }

      if (product.sizes && product.sizes.length > 0 && cartItem.selectedSize) {
        const sizeData = product.sizes.find((s: any) => s.size === cartItem.selectedSize);
        if (!sizeData || sizeData.stock < cartItem.quantity) {
          alert(`No hay suficiente stock para ${cartItem.name} talla ${cartItem.selectedSize}. Solo hay ${sizeData?.stock || 0} unidades disponibles.`);
          return null;
        }
      }
    }

    // Sanitize inputs
    const sanitizedAddress = validateInput(shippingInfo.address, "string").sanitized;
    const sanitizedCity = validateInput(shippingInfo.city, "string").sanitized;
    const sanitizedPhone = validateInput(shippingInfo.phone || "", "phone").sanitized;

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 5000; // $5.000 de envío
    const total = subtotal + shipping;

    const order = {
      id: orderId,
      customerName: "Cliente Web",
      customerPhone: sanitizedPhone || "+56 9 XXXX XXXX",
      customerAddress: sanitizedAddress || "Dirección no especificada",
      customerCity: sanitizedCity || "Ciudad no especificada",
      items: cartItems.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
        selectedSize: item.selectedSize
      })),
      subtotal,
      shipping,
      total,
      status: "pending" as const,
      paymentMethod: paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save order to localStorage
    const existingOrders = localStorage.getItem("orders");
    const orders = existingOrders ? JSON.parse(existingOrders) : [];
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    // Decrement stock for each item in the order
    for (const cartItem of cartItems) {
      const productIndex = products.findIndex((p: any) => p.id === cartItem.productId);
      if (productIndex >= 0) {
        const product = products[productIndex];

        if (product.sizes && product.sizes.length > 0 && cartItem.selectedSize) {
          // Decrement stock for specific size
          const sizeIndex = product.sizes.findIndex((s: any) => s.size === cartItem.selectedSize);
          if (sizeIndex >= 0) {
            products[productIndex].sizes[sizeIndex].stock -= cartItem.quantity;
          }
        }
      }
    }

    // Save updated products to localStorage
    localStorage.setItem("products", JSON.stringify(products));

    // Clear cart
    localStorage.removeItem("cart");

    return order;
  };

  const handleMercadoPago = () => {
    const order = createOrder("mercadopago");
    
    if (!order) {
      return; // Validation failed, error already shown
    }
    
    // Aquí irá tu link de Mercado Pago cuando lo tengas
    const mercadoPagoLink = `https://mercadopago.com.ar/checkout/v1/redirect?pref_id=TU_PREFERENCE_ID&order_id=${order.id}`;
    window.open(mercadoPagoLink, '_blank');
    
    // Redirect to orders confirmation
    setTimeout(() => {
      navigate("/admin");
    }, 2000);
  };

  const handleWhatsApp = () => {
    const order = createOrder("whatsapp");
    
    if (!order) {
      return; // Validation failed, error already shown
    }
    
    const message = encodeURIComponent(`Hola! He realizado el pedido #${order.id.slice(-8)} y me gustaría coordinar el pago y envío.\n\nTotal: $${order.total.toLocaleString('es-CL')}`);
    const whatsappLink = `https://wa.me/569XXXXXXXXX?text=${message}`;
    window.open(whatsappLink, '_blank');
    
    // Redirect to orders confirmation
    setTimeout(() => {
      navigate("/admin");
    }, 2000);
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
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Pasarela de Compra</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Completa tu compra de forma segura y rápida.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="font-heading font-bold text-xl mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Resumen del Pedido
              </h2>
              
              <div className="space-y-4">
                <div className="pb-4 border-b">
                  <h3 className="font-semibold mb-3">Productos ({cartItems.length})</h3>
                  {cartItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Tu carrito está vacío</p>
                  ) : (
                    <div className="space-y-3">
                      {cartItems.map((item, index) => (
                        <div key={`${item.productId}-${item.selectedSize || index}`} className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{item.name}</h4>
                            {item.selectedSize && (
                              <p className="text-xs text-muted-foreground">Talla: {item.selectedSize}</p>
                            )}
                            <p className="text-sm font-bold text-primary">${item.price.toLocaleString('es-CL')}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => changeQuantity(item.productId, item.selectedSize, -1)}
                                className="p-1 hover:bg-secondary rounded transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
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
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold">
                    ${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('es-CL')}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Envío</span>
                    <span>$5.000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Impuestos</span>
                    <span>$0</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">
                    ${(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 5000).toLocaleString('es-CL')}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="font-heading font-bold text-xl mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Información de Envío
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Dirección</label>
                  <input 
                    type="text" 
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    placeholder="Ingresa tu dirección completa"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ciudad</label>
                  <input 
                    type="text" 
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                    placeholder="Concepción"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <input 
                    type="tel" 
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                    placeholder="+56 9 XXXX XXXX"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <div className="bg-card border border-card-border rounded-xl p-6">
              <h2 className="font-heading font-bold text-xl mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Métodos de Pago
              </h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">MP</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">Mercado Pago</h3>
                      <p className="text-sm text-muted-foreground">Paga de forma segura con Mercado Pago</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Al hacer clic en "Pagar con Mercado Pago", serás redirigido a la plataforma de pago segura de Mercado Pago para completar tu compra.
                  </p>
                  <button 
                    onClick={handleMercadoPago}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Pagar con Mercado Pago
                  </button>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">💬</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">Coordina el pago por WhatsApp</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contáctanos por WhatsApp para coordinar el pago y envío de tus productos.
                  </p>
                  <button 
                    onClick={handleWhatsApp}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Contactar por WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-card border border-card-border rounded-xl p-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Pago seguro con encriptación SSL</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Procesar Pago
              </button>
              <button 
                onClick={() => navigate("/#tienda")}
                className="w-full border border-border py-3 rounded-lg font-semibold hover:bg-secondary transition-colors"
              >
                Seguir Comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
