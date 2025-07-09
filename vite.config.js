import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()]
  , server: {
    port: 81, // 본인이 사용하는 포트로 설정
    open: true,
    fs: {
      strict: false
    }
    // 👇 이 설정이 핵심입니다!
    , historyApiFallback: true
  }
});
