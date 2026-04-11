import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Vercel build fix - forcing file registration");

createRoot(document.getElementById("root")!).render(<App />);
