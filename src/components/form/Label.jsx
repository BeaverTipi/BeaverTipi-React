import { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

const Label = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        twMerge(
          "h-11 inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-400",
          className
        )
      )}
    >
      {children}
    </label>
  );
};

export default Label;
