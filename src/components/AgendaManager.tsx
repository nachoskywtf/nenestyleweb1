import { useState, useEffect } from "react";
import { Calendar, Clock, Phone, MessageCircle, X, CheckCircle, XCircle, Users } from "lucide-react";
import { formatCLP } from "../utils/currency";
import { supabaseService } from "../services/supabaseService";

interface Booking {
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
}

const AgendaManager = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBookings();
    // Set up real-time subscription
    const unsubscribe = supabaseService.subscribeToBookings((updatedBookings) => {
      const parsedBookings = updatedBookings.map((booking: any) => ({
        id: booking.id,
        name: booking.client_name,
        phone: booking.client_phone,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        notes: booking.notes || '',
        status: booking.status === "confirmed" || booking.status === "cancelled" ? booking.status : "confirmed" as const,
        createdAt: booking.created_at
      }));
      setBookings(parsedBookings);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const filtered = bookings.filter(booking => 
        booking.date === selectedDate
      );
      setFilteredBookings(filtered);
    } else {
      setFilteredBookings(bookings);
    }
  }, [selectedDate, bookings]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      
      const storedBookings = await supabaseService.getBookings();
      const parsedBookings = storedBookings.map((booking: any) => ({
        id: booking.id,
        name: booking.client_name,
        phone: booking.client_phone,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        notes: booking.notes || '',
        status: booking.status === "confirmed" || booking.status === "cancelled" ? booking.status : "confirmed" as const,
        createdAt: booking.created_at
      }));
      setBookings(parsedBookings);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await supabaseService.updateBookingStatus(bookingId, 'cancelled');
      
      const cancelledBooking = bookings.find(b => b.id === bookingId);
      if (cancelledBooking) {
        await supabaseService.updateAvailabilitySlot(cancelledBooking.date, cancelledBooking.time, 'available');
      }
      
      const updatedBookings = bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: "cancelled" as const }
          : booking
      );
      
      setBookings(updatedBookings);
    } catch (err) {
      setError("Error al cancelar la reserva");
      console.error('Error cancelling booking:', err);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await supabaseService.deleteBooking(bookingId);
      
      const deletedBooking = bookings.find(b => b.id === bookingId);
      
      const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
      setBookings(updatedBookings);
    } catch (err) {
      setError("Error al eliminar la reserva");
      console.error('Error deleting booking:', err);
    }
  };

  const formatServiceName = (service: string) => {
    const serviceMap: { [key: string]: string } = {
      "corte": "Corte de pelo",
      "afeitado": "Afeitado Tradicional",
      "combo": "Corte + Barba",
      "corte_barba": "Corte + Barba",
      "corte_solo": "Corte Solo",
      "diseno_barba": "Diseño de Barba"
    };
    return serviceMap[service] || service;
  };

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const timeA = a.time.replace(':', '');
    const timeB = b.time.replace(':', '');
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-card-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-heading font-bold">Agenda de Reservas</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Date Filter */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Filtrar por Fecha</label>
          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e: any) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => setSelectedDate("")}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-sm font-medium transition-colors"
            >
              Limpiar Filtro
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
            <p className="mt-2 text-muted-foreground">Cargando reservas...</p>
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && (
          <div>
            {sortedBookings.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay reservas para la fecha seleccionada</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-heading font-bold mb-6">
                  Reservas {selectedDate ? `para ${new Date(selectedDate).toLocaleDateString('es-CL')}` : ''}
                </h2>
                
                {sortedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`bg-card border border-card-border rounded-xl p-6 ${
                      booking.status === 'cancelled' ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(booking.date).toLocaleDateString('es-CL')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{booking.time}</span>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600 line-through'
                      }`}>
                        {booking.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Nombre:</span>
                        </div>
                        <p className="font-medium">{booking.name}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Teléfono:</span>
                        </div>
                        <p className="font-medium">{booking.phone}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Servicio:</span>
                        </div>
                        <p className="font-medium">{formatServiceName(booking.service)}</p>
                      </div>
                      
                      {booking.notes && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Notas:</span>
                          </div>
                          <p className="font-medium text-muted-foreground">{booking.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancelar
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-destructive hover:bg-destructive/80 text-destructive-foreground rounded-lg font-medium transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Eliminar
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

export default AgendaManager;
