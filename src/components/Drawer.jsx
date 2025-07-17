export default function Drawer({ isOpen, onClose, children }) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed left-0 right-0 top-[78px] bottom-0
          bg-white/10 dark:bg-black/20 backdrop-blur-sm
          transition-opacity duration-300 z-40 
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className={`fixed right-0 top-[78px] h-[calc(100vh-4rem)] w-full sm:w-[1000px] 
          bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 
          shadow-xl z-50 transform transition-transform duration-300 
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
    🏷️ 매물 상세정보
  </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
          >
            ← 돌아가기
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-full">
          {children}
        </div>
      </div>
    </>
  );
}
