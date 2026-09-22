"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden select-none">
      {/* Top Header Skeleton */}
      <div className="h-12 border-b border-border/70 flex items-center justify-between px-4 bg-card/60 shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-4 w-36 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-44 rounded-md hidden sm:block" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Main Split Layout Skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Skeleton */}
        <div className="w-64 border-r border-sidebar-border bg-sidebar p-3 space-y-4 shrink-0 hidden md:block">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>

          <div className="space-y-2 pt-1">
            <Skeleton className="h-7 w-full rounded" />
            <div className="pl-4 space-y-2">
              <Skeleton className="h-6 w-4/5 rounded" />
              <div className="pl-4 space-y-2">
                <Skeleton className="h-6 w-3/4 rounded" />
                <Skeleton className="h-6 w-2/3 rounded" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded" />
            </div>
            <Skeleton className="h-7 w-5/6 rounded" />
            <Skeleton className="h-7 w-2/3 rounded" />
          </div>
        </div>

        {/* Main Panel Skeleton */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Breadcrumb Skeleton */}
          <div className="h-10 border-b border-border/40 px-4 flex items-center">
            <Skeleton className="h-4 w-52 rounded" />
          </div>

          {/* Toolbar Skeleton */}
          <div className="h-11 border-b border-border/60 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-20 rounded" />
              <Skeleton className="h-7 w-24 rounded" />
            </div>
            <Skeleton className="h-7 w-28 rounded" />
          </div>

          {/* Item Rows Skeleton */}
          <div className="p-4 space-y-2 flex-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between h-9 px-3 rounded border border-border/20"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton
                    className="h-3 rounded"
                    style={{ width: `${100 + (i % 3) * 40}px` }}
                  />
                </div>
                <div className="flex items-center gap-6">
                  <Skeleton className="h-3 w-12 rounded hidden sm:block" />
                  <Skeleton className="h-3 w-20 rounded hidden md:block" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

