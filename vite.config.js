import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import os from 'os';

function getBackendHost() {
  const currentHost = os.hostname().toLowerCase();

  // Cloudflare 터널 또는 실제 운영 도메인일 경우
  if (currentHost.startsWith("react")) {
    return "beavertipi.com"; // 운영 Spring 서버 도메인
  }
      if (currentHost.startsWith("hbdev")) {
    return "hbdev1.beavertipi.com";
  }
      if (currentHost.startsWith("dev")) {
    return "dev1.beavertipi.com";
  }

  // 개발 중일 경우 — 윈도우 PC의 local IP 반환
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }

  return "localhost"; // fallback
}


const localIP = getBackendHost();

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  server: {
    host: true, // 👈 현재 PC IP로 바인딩
    port: 81,
    open: true,
    fs: { strict: false },
    historyApiFallback: true,
    allowedHosts: ['.beavertipi.com'],
    proxy: {
      '/rest': {
        target: `http://${localIP}:80`,
        changeOrigin: true,
        secure: false
      }
    }
  }
});
