"use client";

import { EllipsisVertical } from "lucide-react";
import { type CSSProperties, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type RowActionPopoverProps = {
  children: (api: { close: () => void }) => ReactNode;
  panelClassName?: string;
  triggerClassName?: string;
};

type Position = {
  left: number;
  top: number;
};

const VIEWPORT_MARGIN = 16;
const MENU_OFFSET = 8;

export function RowActionPopover({
  children,
  panelClassName,
  triggerClassName,
}: RowActionPopoverProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    function updatePosition() {
      const trigger = triggerRef.current;
      const panel = panelRef.current;

      if (!trigger || !panel) {
        return;
      }

      const triggerRect = trigger.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const width = panelRect.width;
      const height = panelRect.height;

      const openUpward =
        viewportHeight - triggerRect.bottom - VIEWPORT_MARGIN < height + MENU_OFFSET &&
        triggerRect.top - VIEWPORT_MARGIN > viewportHeight - triggerRect.bottom;

      const top = openUpward
        ? Math.max(VIEWPORT_MARGIN, triggerRect.top - height - MENU_OFFSET)
        : Math.min(
            viewportHeight - VIEWPORT_MARGIN - height,
            triggerRect.bottom + MENU_OFFSET,
          );

      const left = Math.min(
        viewportWidth - VIEWPORT_MARGIN - width,
        Math.max(VIEWPORT_MARGIN, triggerRect.right - width),
      );

      setPosition({ left, top });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const panel = open
    ? createPortal(
        <div
          ref={panelRef}
          className={cn(
            "fixed z-[80] w-56 rounded-2xl border border-border bg-surface-elevated p-2 shadow-[0_18px_48px_rgba(12,16,20,0.16)]",
            !position && "opacity-0",
            panelClassName,
          )}
          style={position as CSSProperties}
        >
          {children({ close: () => setOpen(false) })}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface text-muted",
          triggerClassName,
        )}
      >
        <EllipsisVertical size={16} />
      </button>
      {panel}
    </>
  );
}
