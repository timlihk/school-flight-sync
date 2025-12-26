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
  const [isTouchOpen, setIsTouchOpen] = React.useState(false);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const controlled = open !== undefined;
  const actualOpen = controlled ? open : isOpen;

  const doClose = React.useCallback(() => {
    setIsTouchOpen(false);
    setIsOverContent(false);
    setIsOverTrigger(false);
    if (controlled && onOpenChange) {
      onOpenChange(false);
    } else {
      setIsOpen(false);
    }
  }, [controlled, onOpenChange]);

  const scheduleClose = React.useCallback(() => {
    if (isTouchOpen) return;
    // Cancel any existing timeout before scheduling a new one
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      if (!isOverContent && !isOverTrigger) {
        doClose();
      }
    }, 100);
  }, [isOverContent, isOverTrigger, doClose, isTouchOpen]);

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

  const openOnTouch = React.useCallback(() => {
    cancelClose();
    setIsTouchOpen(true);
    setIsOverTrigger(true);
    if (controlled && onOpenChange) {
      onOpenChange(true);
    } else {
      setIsOpen(true);
    }
  }, [controlled, onOpenChange, cancelClose]);

  return (
    <InteractiveHoverCardContext.Provider
      value={{
        isOverContent,
        setIsOverContent,
        isOverTrigger,
        setIsOverTrigger,
        cancelClose,
        scheduleClose,
        openOnTouch,
        isOpen: actualOpen,
      }}
    >
      <HoverCardPrimitive.Root
        open={actualOpen}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            cancelClose();
            setIsTouchOpen(false);
            if (controlled && onOpenChange) {
              onOpenChange(true);
            } else {
              setIsOpen(true);
            }
          } else {
            // ESC, click-outside, focus loss, or hover-leave
            // Touch interactions should close immediately; hover closes with a short delay
            setIsTouchOpen(false);
            setIsOverContent(false);
            setIsOverTrigger(false);
            if (controlled && onOpenChange) {
              onOpenChange(false);
            } else if (isTouchOpen) {
              setIsOpen(false);
            } else {
              scheduleClose();
            }
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
  openOnTouch: () => void;
  isOpen: boolean;
}

const InteractiveHoverCardContext = React.createContext<InteractiveHoverCardContextValue | null>(null);

function useInteractiveHoverCard() {
  const context = React.useContext(InteractiveHoverCardContext);
  if (!context) {
    throw new Error("InteractiveHoverCard components must be used within InteractiveHoverCard");
  }
  return context;
}

interface InteractiveHoverCardTriggerProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger> {
  /** Callback when clicked on touch device - receives whether popup is now open */
  onTouchOpen?: () => void;
}

export const InteractiveHoverCardTrigger = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Trigger>,
  InteractiveHoverCardTriggerProps
>(({ children, onTouchOpen, ...props }, ref) => {
  const { setIsOverTrigger, cancelClose, openOnTouch, isOpen } = useInteractiveHoverCard();

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
      onTouchEnd={(e) => {
        // On touch devices, open the popup on tap
        if (!isOpen) {
          e.preventDefault();
          openOnTouch();
          onTouchOpen?.();
        }
        props.onTouchEnd?.(e);
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
        "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none pointer-events-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
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
