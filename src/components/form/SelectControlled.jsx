/*
import SelectControlled from "../form/SelectControlled";

<SelectControlled
  value={lsrYnTypeCdInput}
  onChange={(val) => setLsrYnTypeCdInput(val)}
  options={lesserTypeList}
/>
*/
const SelectControlled = ({
  id,
  name,
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  value = "",
  ...props
}) => {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      className={`h-11 appearance-none rounded-lg border border-gray-300 bg-transparent px-2 py-2 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-amber-300 focus:outline-hidden focus:ring-3 focus:ring-amber-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-amber-800 ${
        value
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      {...props}
    >
      <option
        value=""
        disabled
        className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
      >
        {placeholder}
      </option>
      {options?.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default SelectControlled;
