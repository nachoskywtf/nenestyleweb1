import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scissors, Lock, User } from "lucide-react";
import { setSecureItem } from "../utils/encryption";

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Clear any existing lockout data
      localStorage.removeItem("loginLockout");
      localStorage.removeItem("loginAttempts");

      // Validación con credenciales de variables de entorno
      const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || "ADMIN";
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "n.984623E";
      
      if (credentials.username === adminUsername && credentials.password === adminPassword) {
        // Generar token más seguro con timestamp y random
        const token = `admin-token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

        // Guardar sesión usando almacenamiento seguro
        localStorage.setItem("authToken", token);
        setSecureItem("user", { username: adminUsername, role: "admin", loginTime: Date.now() });
        navigate("/admin");
      } else {
        setError("Credenciales incorrectas. Usuario: ADMIN, Contraseña: n.984623E");
      }
    } catch (err) {
      setError("Error de autenticación. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Clear any existing lockout data on mount
  useEffect(() => {
    localStorage.removeItem("loginLockout");
    localStorage.removeItem("loginAttempts");
    setAttemptsRemaining(5);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center p-4">
      <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scissors className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-heading font-bold">Panel Admin</h1>
          </div>
          <p className="text-muted-foreground">NeneStyle - Gestión de Horarios</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2">Usuario</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Acceso restringido al personal autorizado
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
