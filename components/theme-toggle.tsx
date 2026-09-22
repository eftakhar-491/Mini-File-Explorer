"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Safe SSR mounted check without setState in effect
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" className="h-8 w-8 opacity-70">
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle color theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4 transition-transform rotate-0 scale-100" />
            ) : (
              <Moon className="h-4 w-4 transition-transform rotate-0 scale-100" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
      />
      <TooltipContent side="bottom">
        <p className="text-xs">Switch to {isDark ? "light" : "dark"} mode</p>
      </TooltipContent>
    </Tooltip>
  );
}

