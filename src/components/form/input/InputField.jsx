import { twMerge } from "tailwind-merge";
const Input = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  //커스텀 영역
  onKeyDown,
  onBlur,
  ...props
}) => {
  const isDateInput = type === "date";

  const baseClass = `
  ${isDateInput ? "appearance-auto bg-white text-black" : "bg-transparent"}
  h-11 rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs 
  placeholder:text-gray-400 focus:outline-hidden focus:ring-3
  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30
  w-full
`;


  const stateClass = disabled
    ? `text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed 
       dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`
    : error
      ? `border-error-500 focus:border-error-300 focus:ring-error-500/20 
       dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`
      : success
        ? `border-success-500 focus:border-success-300 focus:ring-success-500/20 
       dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`
        : `bg-transparent text-gray-800 border-gray-300 focus:border-amber-300 focus:ring-amber-500/20 
       dark:border-gray-700 dark:text-white/90 dark:focus:border-amber-800`;

  const inputClasses = twMerge(`
    ${baseClass}
    ${type === "date" ? "appearance-auto bg-white text-black dark:bg-gray-900 dark:text-white" : "appearance-none bg-transparent text-gray-800 dark:text-white/90"}
    ${stateClass}
    ${className}
  `);
  return (
    <>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={inputClasses}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        {...props}
      />

      {hint && (
        <p
          className={`mt-1.5 text-xs ${error
            ? "text-error-500"
            : success
              ? "text-success-500"
              : "text-gray-500"
            }`}
        >
          {hint}
        </p>
      )}
    </>
  );
};

export default Input;
