import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Types exported for convenience:
 * - DropdownMenuProps: React.ComponentProps<typeof DropdownMenuPrimitive.Root>
 * - DropdownMenuItemProps: React.ComponentProps<typeof DropdownMenuPrimitive.Item>
 */
export type DropdownMenuProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Root
>;
export type DropdownMenuItemProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Item
>;

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          // keep classes simple and robust — customise as needed
          "bg-popover text-popover-foreground rounded-md border p-1 shadow-md z-50 min-w-[10rem] overflow-hidden",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm outline-none cursor-pointer select-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuCheckboxItem =
  DropdownMenuPrimitive.CheckboxItem;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuRadioItem =
  DropdownMenuPrimitive.RadioItem;

export const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1 text-sm font-medium", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparator = React.forwardRef<
  HTMLHRElement,
  React.ComponentProps<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("my-1 h-px bg-border -mx-1", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuSubTrigger =
  DropdownMenuPrimitive.SubTrigger;
export const DropdownMenuSubContent =
  DropdownMenuPrimitive.SubContent;

export const DropdownMenuShortcut = ({ className, ...props }: any) => (
  <span className={cn("ml-auto text-xs text-muted-foreground", className)} {...props} />
);
