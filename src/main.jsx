import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.jsx";
import { AppWrapper } from "./components/common/PageMeta";
import AppProviders from "./context/AppProviders.jsx";
createRoot(document.getElementById("root")).render(
  <AppProviders>
    <AppWrapper>
      <App />
    </AppWrapper>
  </AppProviders>
);
