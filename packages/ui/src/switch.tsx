"use client";

import * as React from "react";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  className?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ className, ...props }, ref) => {
  return <input ref={ref} role="switch" type="checkbox" className={className} {...props} />;
});

Switch.displayName = "Switch";
