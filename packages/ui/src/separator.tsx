"use client";

import * as React from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({ orientation = "horizontal", className, ...props }: SeparatorProps) {
  if (orientation === "vertical") {
    return <div role="separator" aria-orientation="vertical" className={className} {...(props as any)} />;
  }
  return <hr role="separator" className={className} {...props} />;
}
