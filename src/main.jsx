import React from "react";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.jsx";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { AppWrapper } from "./components/common/PageMeta";
import AppProviders from "./context/AppProviders";

createRoot(document.getElementById("root")).render(
  <>
    <BrowserRouter>
      <AppProviders>
        <AppWrapper>
          <App />
        </AppWrapper>
      </AppProviders>
    </BrowserRouter>
  </>
);
