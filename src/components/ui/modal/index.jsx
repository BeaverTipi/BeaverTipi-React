import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

export const Modal = ({
  isOpen,
  onClose,
  children,
  className = "",
  showCloseButton = true,
  isFullscreen = false,
  closeOnOverlayClick = true,
}) => {
  const modalRef = useRef(null);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // 스크롤 막기 및 오른쪽 여백 처리
  useEffect(() => {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalClasses = isFullscreen
    ? "w-full h-full"
    : "relative w-full rounded-3xl dark:bg-gray-900 z-[10001]";

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* 콘텐츠 박스 */}
      <div
        ref={modalRef}
        className={`relative z-[9999] max-w-2xl w-[90vw] rounded-2xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 ${modalClasses} ${className}`}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white"
          >
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
