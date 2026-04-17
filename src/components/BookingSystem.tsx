import { useState, useEffect, useMemo } from "react";
import { Check, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { validateInput, isValidChileanPhone, isValidEmail } from "../utils/sanitization";
import { supabaseService } from "../services/supabaseService";

// Types
interface FormData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const SERVICES = [
  { id: "corte", name: "Corte de pelo", duration: "45 min" },
  { id: "afeitado", name: "Afeitado Tradicional", duration: "30 min" },
  { id: "combo", name: "Corte + Barba", duration: "60 min" },
];

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getSlots(date: Date): string[] {
  const day = date.getDay();
  const end = day === 6 ? 18 : 19;
  const slots: string[] = [];
  for (let h = 10; h <= end; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getStorageKey(date: Date): string {
  return `nicoke_reservas_${formatDateKey(date)}`;
}

function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

const BookingSystem = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({});
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({ name: "", phone: "", email: "", notes: "" });

  // Load booked slots from Supabase
  useEffect(() => {
    const loadSlots = async () => {
      const days = getWeekDays(currentWeekStart);
      const loaded: Record<string, string[]> = {};
      
      for (const d of days) {
        const dateKey = formatDateKey(d);
        try {
          const availability = await supabaseService.getAvailability(dateKey);
          if (availability.length > 0) {
            loaded[dateKey] = availability
              .filter((slot: any) => slot.status === 'booked')
              .map((slot: any) => slot.time);
          }
        } catch {
          // Fallback to localStorage if Supabase fails
          const key = getStorageKey(d);
          const stored = localStorage.getItem(key);
          if (stored) {
            loaded[dateKey] = JSON.parse(stored);
          }
        }
      }
      setBookedSlots(loaded);
    };
    loadSlots();
  }, [currentWeekStart]);

  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);

  const allSlots = useMemo(() => (selectedDay ? getSlots(selectedDay) : []), [selectedDay]);

  const dayBooked = selectedDay ? bookedSlots[formatDateKey(selectedDay)] || [] : [];
  const dayBlocked = selectedDay ? (() => {
    const blockedKey = `nicoke_blocked_${formatDateKey(selectedDay)}`;
    const storedBlocked = localStorage.getItem(blockedKey);
    return storedBlocked ? JSON.parse(storedBlocked) : [];
  })() : [];

  // Filter out blocked and booked slots
  const slots = useMemo(() => {
    if (!selectedDay) return [];
    return allSlots.filter(slot => 
      !dayBooked.includes(slot) && !dayBlocked.includes(slot)
    );
  }, [allSlots, dayBooked, dayBlocked, selectedDay]);

  const availableCount = slots.length;

  const weekLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[5];
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}–${end.getDate()} de ${MONTH_NAMES[start.getMonth()]}`;
    }
    return `${start.getDate()} ${MONTH_NAMES[start.getMonth()].slice(0, 3)} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()].slice(0, 3)}`;
  }, [weekDays]);

  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
    setSelectedDay(null);
    setSelectedHour(null);
  };

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
    setSelectedDay(null);
    setSelectedHour(null);
  };

  const selectService = (id: string) => {
    setSelectedService(id);
    setStep(2);
  };

  const selectDay = (day: Date) => {
    setSelectedDay(day);
    setSelectedHour(null);
    setStep(3);
  };

  const selectHour = (hour: string) => {
    setSelectedHour(hour);
    setStep(4);
  };

  const handleConfirm = async () => {
    if (!selectedDay || !selectedHour || !selectedService) return;
    
    // Validate phone number
    if (formData.phone && !isValidChileanPhone(formData.phone)) {
      alert("Por favor, ingresa un número de teléfono válido (formato chileno)");
      return;
    }
    
    // Validate email
    if (formData.email && !isValidEmail(formData.email)) {
      alert("Por favor, ingresa un email válido");
      return;
    }
    
    // Sanitize inputs
    const sanitizedNotes = formData.notes ? validateInput(formData.notes, "string").sanitized : "";
    const sanitizedPhone = formData.phone ? validateInput(formData.phone, "phone").sanitized : "";
    const sanitizedEmail = formData.email ? validateInput(formData.email, "email").sanitized : "";
    
    const dateKey = formatDateKey(selectedDay);
    
    try {
      // Save to Supabase
      await supabaseService.createBooking({
        client_name: validateInput(formData.name, "name").sanitized,
        client_phone: sanitizedPhone,
        client_email: sanitizedEmail,
        service: selectedService,
        date: dateKey,
        time: selectedHour,
        notes: sanitizedNotes,
        status: 'confirmed'
      });

      // Update availability in Supabase
      await supabaseService.updateAvailabilitySlot(dateKey, selectedHour, 'booked');
      
      // Update local state
      const existing = bookedSlots[dateKey] || [];
      const updated = [...existing, selectedHour];
      setBookedSlots((prev) => ({ ...prev, [dateKey]: updated }));
      
      // Also save to localStorage as fallback
      const booking = {
        id: crypto.randomUUID(),
        name: validateInput(formData.name, "name").sanitized,
        phone: sanitizedPhone,
        service: selectedService,
        date: dateKey,
        time: selectedHour,
        notes: sanitizedNotes,
        status: "confirmed" as const,
        createdAt: new Date().toISOString()
      };
      
      const existingBookings = localStorage.getItem("bookings");
      const bookings = existingBookings ? JSON.parse(existingBookings) : [];
      bookings.push(booking);
      localStorage.setItem("bookings", JSON.stringify(bookings));

      const storageKey = getStorageKey(selectedDay);
      localStorage.setItem(storageKey, JSON.stringify(updated));

      const adminAvailabilityKey = `nicoke_disponibilidad_${dateKey}`;
      const existingAdminAvailability = localStorage.getItem(adminAvailabilityKey);
      let adminAvailability = existingAdminAvailability ? JSON.parse(existingAdminAvailability) : [];

      const slotIndex = adminAvailability.findIndex((slot: any) => slot.time === selectedHour);
      if (slotIndex >= 0) {
        adminAvailability[slotIndex].status = 'booked';
      } else {
        adminAvailability.push({
          id: `${dateKey}-${selectedHour}`,
          time: selectedHour,
          status: 'booked'
        });
      }
      localStorage.setItem(adminAvailabilityKey, JSON.stringify(adminAvailability));
      
      setStep(5);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error al crear la reserva. Por favor, intenta de nuevo.');
    }
  };

  const resetForm = () => {
    setSelectedService(null);
    setSelectedDay(null);
    setSelectedHour(null);
    setFormData({ name: "", phone: "", email: "", notes: "" });
    setStep(1);
  };

  const serviceName = SERVICES.find((s) => s.id === selectedService)?.name || "";

  const whatsappMsg = encodeURIComponent(
    `¡Hola! Reservé en Nicoke.Barber:\n📋 ${serviceName}\n📅 ${selectedDay ? `${DAY_NAMES[selectedDay.getDay()]} ${selectedDay.getDate()} de ${MONTH_NAMES[selectedDay.getMonth()]}` : ""}\n🕐 ${selectedHour}\n👤 ${formData.name}\n📱 ${formData.phone}`
  );

  // Step indicator
  const steps = ["Servicio", "Día", "Hora", "Datos", "Listo"];

  return (
    <section id="agendar" className="py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-2">Reserva tu hora</h2>
        <p className="text-muted-foreground text-center mb-8">Elige el día y la hora que más te acomode.</p>

        {/* Step indicator */}
        {step < 5 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.slice(0, 4).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 3 && <div className={`w-8 h-px ${i + 1 < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Service */}
        {step >= 1 && step < 5 && (
          <div className={step === 1 ? "" : "mb-6"}>
            {step === 1 && <h3 className="font-heading font-semibold mb-4">1. Elige tu servicio</h3>}
            {step === 1 ? (
              <div className="grid grid-cols-2 gap-3">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectService(s.id)}
                    className="bg-card border border-card-border rounded-xl p-4 text-left hover:border-primary/50 transition-colors"
                  >
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-primary mt-1">{s.duration}</p>
                  </button>
                ))}
              </div>
            ) : (
              <button onClick={() => setStep(1)} className="text-sm text-primary hover:underline">
                ✂️ {serviceName} — cambiar
              </button>
            )}
          </div>
        )}

        {/* STEP 2: Calendar */}
        {step >= 2 && step < 5 && (
          <div className={step === 2 ? "" : "mb-6"}>
            {step === 2 && <h3 className="font-heading font-semibold mb-4">2. Elige el día</h3>}
            {step === 2 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevWeek} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
                    <ChevronLeft className="h-4 w-4" /> Anterior
                  </button>
                  <span className="font-heading font-semibold text-sm">{weekLabel}</span>
                  <button onClick={nextWeek} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
                    Siguiente <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {weekDays.map((day) => {
                    const isSunday = day.getDay() === 0;
                    const past = isPast(day);
                    const disabled = isSunday || past;
                    return (
                      <button
                        key={day.toISOString()}
                        disabled={disabled}
                        onClick={() => selectDay(day)}
                        className={`rounded-xl py-3 text-center transition-colors ${
                          disabled
                            ? "bg-secondary/50 text-muted-foreground/40 cursor-not-allowed"
                            : "bg-card border border-card-border hover:border-primary"
                        }`}
                      >
                        <p className="text-xs font-medium">{DAY_NAMES[day.getDay()]}</p>
                        <p className="text-lg font-bold">{day.getDate()}</p>
                        {isSunday && <p className="text-[10px] text-destructive">Cerrado</p>}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <button onClick={() => { setStep(2); setSelectedHour(null); }} className="text-sm text-primary hover:underline">
                📅 {selectedDay && `${DAY_NAMES[selectedDay.getDay()]} ${selectedDay.getDate()} de ${MONTH_NAMES[selectedDay.getMonth()]}`} — cambiar
              </button>
            )}
          </div>
        )}

        {/* STEP 3: Time slots */}
        {step >= 3 && step < 5 && (
          <div className={step === 3 ? "" : "mb-6"}>
            {step === 3 && <h3 className="font-heading font-semibold mb-4">3. Elige la hora</h3>}
            {step === 3 ? (
              <>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {slots.map((slot) => {
                    const selected = selectedHour === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => selectHour(slot)}
                        className={`rounded-lg py-2.5 text-sm font-medium transition-all ${
                          selected
                            ? "bg-primary text-primary-foreground font-bold"
                            : "bg-card border border-card-border hover:border-primary"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{availableCount} turnos disponibles</p>
              </>
            ) : (
              <button onClick={() => setStep(3)} className="text-sm text-primary hover:underline">
                🕐 {selectedHour} — cambiar
              </button>
            )}
          </div>
        )}

        {/* STEP 4: Form */}
        {step === 4 && (
          <div>
            <h3 className="font-heading font-semibold mb-4">4. Tus datos</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo *"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-card border border-card-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                required
              />
              <input
                type="tel"
                placeholder="Teléfono (+56...) *"
                value={formData.phone}
                onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                className="w-full bg-card border border-card-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
                required
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                className="w-full bg-card border border-card-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
              />
              <textarea
                placeholder="Notas adicionales (opcional)"
                value={formData.notes}
                onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                className="w-full bg-card border border-card-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none h-20"
              />
              <button
                onClick={handleConfirm}
                disabled={!formData.name || !formData.phone}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Confirmation */}
        {step === 5 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-heading font-bold text-2xl mb-2">¡Reserva confirmada!</h3>
            <p className="text-muted-foreground mb-6">Te esperamos en Nicoke.Barber.</p>

            <div className="bg-card border border-card-border rounded-xl p-4 text-left text-sm space-y-1 mb-6 max-w-xs mx-auto">
              <p><span className="text-muted-foreground">Nombre:</span> {formData.name}</p>
              <p><span className="text-muted-foreground">Servicio:</span> {serviceName}</p>
              <p>
                <span className="text-muted-foreground">Día:</span>{" "}
                {selectedDay && `${DAY_NAMES[selectedDay.getDay()]} ${selectedDay.getDate()} de ${MONTH_NAMES[selectedDay.getMonth()]}`}
              </p>
              <p><span className="text-muted-foreground">Hora:</span> {selectedHour}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={resetForm} className="border border-border px-6 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors">
                Hacer otra reserva
              </button>
              <a
                href={`https://wa.me/56900000000?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-success text-success-foreground px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> Compartir por WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookingSystem;
