import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import os from 'os';
import path from "path";

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


/*
Vite dev server가 hot reload 시,
 (1) React를 이중으로 로딩하거나,
 (2) HMR(Hot Module Replacement)이 꼬여서,
내부적으로 Invalid hook call 발생할 경우, Provider류의 충돌 발생.
** React 이중 로딩 = React가 "두 번 설치되어 서로 다른 인스턴스로 로딩된 경우"
└───alias 설정이 없으면 가끔 HMR이 헛돌 수 있다고 함. 그러면 리액트를 재로딩한다더라^0^
** HMR = 코드 수정 시 전체 앱 새로고침 없이 바뀐 모듈만 교체해서 리렌더링해주는 기능
**의존성 패키지들이 자체적으로 React를 재설치하려 듦. `npm ls react`, `npm dedupe` 명령어 사용으로 확인 가능
**SSR/CSR이 섞인 상황에서 hook 호출 타이밍이 어긋날 때도 문제 발생 가능.

React 프로젝트 개발 시 유념.
1. alias 사용해서 경로를 고정,
2. React는 단일 버전을 유지,
3. 브라우저 API는 useEffect로 호출을 기억해라 <<--이건 뭔말인지 모르겠음.
*/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr({ svgrOptions: { icon: true, } })],
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
        // target: `https://${localIP}:443`, //^0^
        changeOrigin: true,
        secure: false
      }
    }
  },
  //^0^
  resolve: {
    alias: {
      react: path.resolve("./node_modules/react"),
    }
  },
});
