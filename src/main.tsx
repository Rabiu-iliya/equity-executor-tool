import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { CurrencyProvider } from "./context/currencyContext.jsx";

<CurrencyProvider>
  <App />
</CurrencyProvider>
createRoot(document.getElementById("root")!).render(<App />);
