import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.jsx";
import { AppWrapper } from "./components/common/PageMeta";
import { ThemeProvider } from "./context/ThemeContext";
import { DomainProvider } from "./context/DomainProvider";
createRoot(document.getElementById("root")).render(
  <DomainProvider>
    <ThemeProvider>
      <AppWrapper>
        <App />
      </AppWrapper>
    </ThemeProvider>
  </DomainProvider>
);
