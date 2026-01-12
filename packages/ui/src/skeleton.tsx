"use client";

import * as React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={className ? `${className} animate-pulse bg-gray-200` : "animate-pulse bg-gray-200"} {...props} />;
}
