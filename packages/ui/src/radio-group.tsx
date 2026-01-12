"use client";

import * as React from "react";

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function RadioGroup({ name, value, onValueChange, className, children, ...rest }: RadioGroupProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onValueChange?.(e.target.value);
  }

  const mappedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && (child.type as any).displayName === "RadioItem") {
      return React.cloneElement(child as any, {
        name,
        checked: (child.props as any).value === value,
        onChange: handleChange,
      });
    }
    return child;
  });

  return (
    <div role="radiogroup" className={className} {...rest}>
      {mappedChildren}
    </div>
  );
}

export interface RadioItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: string;
  label?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function RadioItem({ value, label, onChange, ...props }: RadioItemProps) {
  return (
    <label className="inline-flex items-center gap-2">
      <input type="radio" value={value} onChange={onChange} {...props} />
      {label && <span>{label}</span>}
    </label>
  );
}

(RadioItem as any).displayName = "RadioItem";
