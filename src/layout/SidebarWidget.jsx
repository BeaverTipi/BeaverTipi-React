export default function SidebarWidget() {
  return (
   <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]">
      <div className="flex items-center justify-center gap-2 mb-2">
        <img src="/favicon.png" alt="logo" className="w-6 h-6" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          beaverTipi
        </h3>
      </div>

      <p className="mb-4 text-gray-500 inline-block text-theme-sm dark:text-gray-400">
        소규모 임대 사업자를 위한 <br/>건물 관리 <br/>부동산 중개 플랫폼
      </p>

      <a
        href="https://www.beaver.com"
        target="_blank"
        rel="nofollow"
        className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600"
      >
        Main
      </a>
    </div>
  );
}
