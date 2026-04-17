import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, LogOut, CheckCircle, XCircle, Ban, Package, Tag } from "lucide-react";
import ProductManager from "../components/ProductManager";
import AgendaManager from "../components/AgendaManager";
import OrderManager from "../components/OrderManager";
import { removeSecureItem } from "../utils/encryption";
import { firebaseService } from "../services/firebaseService";

interface TimeSlot {
  id: string;
  time: string;
  status: 'available' | 'booked' | 'blocked';
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'products' | 'categories' | 'add-product' | 'agenda' | 'orders'>('schedule');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Generate time slots for the day (matching BookingSystem structure)
  const generateTimeSlots = useCallback(() => {
    const slots: TimeSlot[] = [];
    const day = new Date(selectedDate).getDay();
    const end = day === 6 ? 18 : 19; // Saturday ends at 6 PM, other days at 7 PM

    for (let h = 10; h <= end; h++) {
      const time = `${h.toString().padStart(2, "0")}:00`;
      slots.push({
        id: `${selectedDate}-${time}`,
        time,
        status: 'available' // Default to available, will be updated from backend
      });
    }
    return slots;
  }, [selectedDate]);

  // Load availability for selected date
  const loadAvailability = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Generate time slots for the selected date
      const slots = generateTimeSlots();

      // Load availability from Firebase
      const storedAvailability = await firebaseService.getAvailability(selectedDate);

      if (storedAvailability.length > 0) {
        // Update slot status based on availability
        const updatedSlots = slots.map(slot => {
          const availSlot = storedAvailability.find((a: any) => a.time === slot.time);
          return availSlot ? { ...slot, status: availSlot.status } : slot;
        });
        setTimeSlots(updatedSlots);
      } else {
        setTimeSlots(slots);
      }
    } catch (err) {
      setError("Error al cargar disponibilidad");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, generateTimeSlots]);

  // Handle slot click
  const handleSlotClick = useCallback(async (slot: TimeSlot) => {
    if (slot.status === 'booked') return; // Can't modify booked slots

    const updatedSlots = timeSlots.map(s =>
      s.id === slot.id
        ? { ...s, status: s.status === 'available' ? 'blocked' as const : 'available' as const }
        : s
    );

    setTimeSlots(updatedSlots);

    // Save to Firebase
    await firebaseService.setAvailability(selectedDate, updatedSlots);
  }, [selectedDate, timeSlots]);

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem("authToken");
    removeSecureItem("user");
    navigate("/login");
  }, [navigate]);

  // Get button styling based on status
  const getButtonStyles = useCallback((status: string) => {
    switch (status) {
      case 'available':
        return "bg-green-500 hover:bg-green-600 text-white";
      case 'booked':
        return "bg-red-500 hover:bg-red-600 text-white cursor-not-allowed";
      case 'blocked':
        return "bg-gray-500 hover:bg-gray-600 text-white";
      default:
        return "bg-gray-200 hover:bg-gray-300 text-gray-700";
    }
  }, []);

  // Get status icon
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'booked':
        return <XCircle className="h-4 w-4" />;
      case 'blocked':
        return <Ban className="h-4 w-4" />;
      default:
        return null;
    }
  }, []);

  // Load availability on mount and date change
  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate, loadAvailability]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-card-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-heading font-bold">Panel de Administración</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-6 mt-4">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Horarios
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Package className="h-4 w-4" />
              Productos
            </button>
            <button
              onClick={() => setActiveTab('agenda')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'agenda' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="inline h-4 w-4 mr-2" />
              Agenda
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'orders' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package className="inline h-4 w-4 mr-2" />
              Pedidos
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'schedule' ? (
          <>
            {/* Date Selector */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">Seleccionar Fecha</label>
              <div className="flex gap-3 items-center">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={loadAvailability}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-sm font-medium transition-colors"
                  title="Refrescar disponibilidad"
                >
                  Refresh
                </button>
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
                <p className="mt-2 text-muted-foreground">Cargando horarios...</p>
              </div>
            )}

            {/* Time Slots Grid */}
            {!loading && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-heading font-bold">Horarios Disponibles</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>Reservado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-500 rounded"></div>
                      <span>Bloqueado</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      disabled={slot.status === 'booked'}
                      className={`p-3 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 flex items-center justify-center gap-1 ${getButtonStyles(slot.status)}`}
                      title={slot.status === 'booked' ? 'No se puede modificar horario reservado' : 'Click para cambiar estado'}
                    >
                      {getStatusIcon(slot.status)}
                      {slot.time}
                    </button>
                  ))}
                </div>

                {/* Instructions */}
                <div className="mt-8 p-4 bg-secondary/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Instrucciones:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Click en horarios <span className="text-green-600 font-semibold">verdes</span> para bloquear</li>
                    <li>Click en horarios <span className="text-gray-600 font-semibold">grises</span> para desbloquear</li>
                    <li>Horarios <span className="text-red-600 font-semibold">rojos</span> están reservados y no se pueden modificar</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'products' ? (
          <ProductManager />
        ) : activeTab === 'agenda' ? (
          <AgendaManager />
        ) : activeTab === 'orders' ? (
          <OrderManager />
        ) : null}
      </div>
    </div>
  );
};

export default Admin;
