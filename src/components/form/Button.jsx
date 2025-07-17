import { twMerge } from "tailwind-merge";

const Button = ({ children, className = "", ...props }) => {
  const baseClasses =
    "h-11 px-5 py-2.5 bg-amber-500 text-white rounded-lg font-medium transition-all hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400";
  return (
    <button className={twMerge(`${baseClasses} ${className}`)} {...props}>
      {children}
    </button>
  );
};

export default Button;
