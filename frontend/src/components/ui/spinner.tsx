import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/utils/classname";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <IconLoader2
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      role="status"
      {...props}
    />
  );
}

export { Spinner };
