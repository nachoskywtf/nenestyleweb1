import { useState, useEffect } from "react";
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock, User, Phone, MapPin, CreditCard, MessageCircle, Download, FileText } from "lucide-react";
import { formatCLP } from "../utils/currency";
import { firebaseService } from "../services/firebaseService";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "mercadopago" | "whatsapp";
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const OrderManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (selectedStatus === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === selectedStatus));
    }
  }, [selectedStatus, orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      
      const storedOrders = await firebaseService.getOrders();
      if (storedOrders.length > 0) {
        const parsedOrders = storedOrders.map((order: any) => ({
          ...order,
          status: (order.status === "pending" || order.status === "confirmed" || order.status === "shipped" || order.status === "delivered" || order.status === "cancelled") ? order.status : "pending"
        }));
        setOrders(parsedOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError("Error al cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const updatedOrders = orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      );
      
      setOrders(updatedOrders);
      await firebaseService.setOrders(updatedOrders);
    } catch (err) {
      setError("Error al actualizar el estado del pedido");
    }
  };

  const generateInvoice = (order: Order) => {
    const invoiceDate = new Date().toLocaleDateString('es-CL');
    const orderDate = new Date(order.createdAt).toLocaleDateString('es-CL');
    
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Boleta #${order.id.slice(-8)}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #333; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 5px 0 0 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .info-section { background: #f9f9f9; padding: 15px; border-radius: 5px; }
        .info-section h3 { margin: 0 0 10px 0; color: #333; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background: #333; color: white; padding: 12px; text-align: left; }
        .items-table td { border: 1px solid #ddd; padding: 12px; }
        .items-table tr:nth-child(even) { background: #f9f9f9; }
        .totals { text-align: right; margin-top: 20px; }
        .totals div { margin: 5px 0; font-size: 16px; }
        .totals .total { font-weight: bold; font-size: 20px; color: #333; border-top: 2px solid #333; padding-top: 10px; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BOLETA ELECTRÓNICA</h1>
            <p>N° ${order.id.slice(-8)}</p>
            <p>Fecha de emisión: ${invoiceDate}</p>
        </div>
        
        <div class="info-grid">
            <div class="info-section">
                <h3>DATOS DEL CLIENTE</h3>
                <p><strong>Nombre:</strong> ${order.customerName}</p>
                <p><strong>Teléfono:</strong> ${order.customerPhone}</p>
                <p><strong>Dirección:</strong> ${order.customerAddress}</p>
                <p><strong>Ciudad:</strong> ${order.customerCity}</p>
            </div>
            <div class="info-section">
                <h3>DATOS DEL PEDIDO</h3>
                <p><strong>N° Pedido:</strong> ${order.id.slice(-8)}</p>
                <p><strong>Fecha:</strong> ${orderDate}</p>
                <p><strong>Método de Pago:</strong> ${getPaymentMethodText(order.paymentMethod)}</p>
                <p><strong>Estado:</strong> ${getStatusText(order.status)}</p>
            </div>
        </div>
        
        <h3>DETALLE DE PRODUCTOS</h3>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCLP(item.price)}</td>
                    <td>${formatCLP(item.price * item.quantity)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="totals">
            <div><strong>Subtotal:</strong> ${formatCLP(order.subtotal)}</div>
            <div><strong>Envío:</strong> ${formatCLP(order.shipping)}</div>
            <div class="total"><strong>TOTAL:</strong> ${formatCLP(order.total)}</div>
        </div>
        
        <div class="footer">
            <p>Esta boleta es un documento válido emitido por Nicoke Barber</p>
            <p>Gracias por tu compra</p>
        </div>
    </div>
</body>
</html>`;

    // Create and download the invoice
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `boleta_${order.id.slice(-8)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "confirmed":
        return "Confirmado";
      case "shipped":
        return "Enviado";
      case "delivered":
        return "Entregado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    return method === "mercadopago" ? "Mercado Pago" : "WhatsApp";
  };

  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-card-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-heading font-bold">Gestión de Pedidos</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filter */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Filtrar por Estado</label>
          <div className="flex gap-3 items-center flex-wrap">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos los pedidos</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmados</option>
              <option value="shipped">Enviados</option>
              <option value="delivered">Entregados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Cargando pedidos...</p>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && (
          <div>
            {sortedOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay pedidos para mostrar</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card border border-card-border rounded-xl p-6"
                  >
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Pedido #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('es-CL', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold mb-2 ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getPaymentMethodText(order.paymentMethod)}
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Datos del Cliente
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Nombre:</span>
                            <span>{order.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{order.customerPhone}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Dirección de Envío
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Dirección:</span>
                            <span>{order.customerAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Ciudad:</span>
                            <span>{order.customerCity}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                      <h4 className="font-semibold flex items-center gap-2 mb-3">
                        <Package className="h-4 w-4" />
                        Productos
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCLP(item.price * item.quantity)}</p>
                              <p className="text-sm text-muted-foreground">{formatCLP(item.price)} c/u</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4 mb-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCLP(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Envío:</span>
                          <span>{formatCLP(order.shipping)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span className="text-primary">{formatCLP(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, "confirmed")}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Confirmar Pedido
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancelar
                          </button>
                        </>
                      )}
                      
                      {order.status === "confirmed" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "shipped")}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                        >
                          <Truck className="h-4 w-4" />
                          Marcar como Enviado
                        </button>
                      )}
                      
                      {order.status === "shipped" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "delivered")}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Marcar como Entregado
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          const message = encodeURIComponent(`Hola! Sobre tu pedido #${order.id.slice(-8)}...`);
                          window.open(`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${message}`, '_blank');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Contactar Cliente
                      </button>
                      
                      <button
                        onClick={() => generateInvoice(order)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Generar Boleta
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManager;
