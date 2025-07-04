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
        Leading Tailwind CSS Admin Template with 400+ UI Component and Pages.
      </p>

      <a
        href="https://tailadmin.com/pricing"
        target="_blank"
        rel="nofollow"
        className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600"
      >
        찬영 계획
      </a>
    </div>
  );
}
