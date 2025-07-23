import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import os from 'os';

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr({ svgrOptions: { icon: true, } })],
  server: {
    host: true, // 👈 현재 PC IP로 바인딩
    port: 81,
    open: true,
    fs: { strict: false },
    historyApiFallback: true,
    proxy: {
      '/rest': {
        target: `http://${localIP}:80`,
        changeOrigin: true,
        secure: false
      }
    }
  }
});
