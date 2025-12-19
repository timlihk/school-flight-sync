import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"
import { cn } from "@/lib/utils"

interface InteractiveHoverCardProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A HoverCard that stays open when hovering over its content,
 * allowing users to click on interactive elements inside.
 */
export function InteractiveHoverCard({ children, open, onOpenChange }: InteractiveHoverCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isOverContent, setIsOverContent] = React.useState(false);
  const [isOverTrigger, setIsOverTrigger] = React.useState(false);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const controlled = open !== undefined;
  const actualOpen = controlled ? open : isOpen;

  const doClose = React.useCallback(() => {
    if (controlled && onOpenChange) {
      onOpenChange(false);
    } else {
      setIsOpen(false);
    }
  }, [controlled, onOpenChange]);

  const scheduleClose = React.useCallback(() => {
    // Cancel any existing timeout before scheduling a new one
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      if (!isOverContent && !isOverTrigger) {
        doClose();
      }
    }, 100);
  }, [isOverContent, isOverTrigger, doClose]);

  const cancelClose = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Re-evaluate close when hover states change
  React.useEffect(() => {
    if (!isOverContent && !isOverTrigger && actualOpen) {
      scheduleClose();
    }
  }, [isOverContent, isOverTrigger, actualOpen, scheduleClose]);

  return (
    <InteractiveHoverCardContext.Provider
      value={{
        isOverContent,
        setIsOverContent,
        isOverTrigger,
        setIsOverTrigger,
        cancelClose,
        scheduleClose,
      }}
    >
      <HoverCardPrimitive.Root
        open={actualOpen}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            cancelClose();
            if (controlled && onOpenChange) {
              onOpenChange(true);
            } else {
              setIsOpen(true);
            }
          } else {
            // ESC, click-outside, focus loss, or hover-leave
            // Schedule close with short delay - if mouse reaches content, it'll cancel
            scheduleClose();
          }
        }}
        openDelay={200}
        closeDelay={300}
      >
        {children}
      </HoverCardPrimitive.Root>
    </InteractiveHoverCardContext.Provider>
  );
}

interface InteractiveHoverCardContextValue {
  isOverContent: boolean;
  setIsOverContent: (value: boolean) => void;
  isOverTrigger: boolean;
  setIsOverTrigger: (value: boolean) => void;
  cancelClose: () => void;
  scheduleClose: () => void;
}

const InteractiveHoverCardContext = React.createContext<InteractiveHoverCardContextValue | null>(null);

function useInteractiveHoverCard() {
  const context = React.useContext(InteractiveHoverCardContext);
  if (!context) {
    throw new Error("InteractiveHoverCard components must be used within InteractiveHoverCard");
  }
  return context;
}

export const InteractiveHoverCardTrigger = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger>
>(({ children, ...props }, ref) => {
  const { setIsOverTrigger, cancelClose } = useInteractiveHoverCard();

  return (
    <HoverCardPrimitive.Trigger
      ref={ref}
      {...props}
      onMouseEnter={(e) => {
        setIsOverTrigger(true);
        cancelClose();
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsOverTrigger(false);
        props.onMouseLeave?.(e);
      }}
    >
      {children}
    </HoverCardPrimitive.Trigger>
  );
});
InteractiveHoverCardTrigger.displayName = "InteractiveHoverCardTrigger";

export const InteractiveHoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, children, ...props }, ref) => {
  const { setIsOverContent, cancelClose } = useInteractiveHoverCard();

  return (
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      onMouseEnter={(e) => {
        setIsOverContent(true);
        cancelClose();
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsOverContent(false);
        props.onMouseLeave?.(e);
      }}
      {...props}
    >
      {children}
    </HoverCardPrimitive.Content>
  );
});
InteractiveHoverCardContent.displayName = "InteractiveHoverCardContent";
