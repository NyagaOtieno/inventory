import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeAuth } from "./lib/auth";

// Initialize auth on app load
initializeAuth();

createRoot(document.getElementById("root")!).render(<App />);
