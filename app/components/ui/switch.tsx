import * as React from "react";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
  }
>(({ className, label, ...props }, ref) => {
  const id = React.useId();

  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={id}
        className="sr-only"
        ref={ref}
        {...props}
      />
      <label
        htmlFor={id}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2",
          props.checked
            ? "bg-primary focus:ring-primary"
            : "bg-gray-200 focus:ring-gray-500",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <span
          className={cn(
            "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            props.checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </label>
      {label && (
        <span className="text-sm font-medium text-gray-900">{label}</span>
      )}
    </div>
  );
});
Switch.displayName = "Switch";

export { Switch };
