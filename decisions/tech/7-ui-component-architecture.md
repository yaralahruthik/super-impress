# UI Component Architecture

## Overview

Super Impress uses **shadcn/ui** for its component library, providing a collection of accessible, customizable components built on Radix UI primitives and styled with Tailwind CSS.

## shadcn/ui Approach

shadcn/ui is not a traditional component library installed via npm. Instead, it's a collection of reusable components that you copy into your project:

1. **Copy-paste components**: Components live in your codebase, giving you full ownership
2. **Radix primitives**: Built on Radix UI for accessibility and unstyled behavior
3. **Tailwind styling**: Uses Tailwind CSS for styling with full customization
4. **No vendor lock-in**: You own the code and can modify it freely

### Benefits

- **Full control**: Modify any component to fit your needs
- **Accessibility**: Radix primitives handle ARIA, keyboard navigation, and focus management
- **Consistency**: Shared design tokens and patterns across components
- **Type safety**: Full TypeScript support

## Component Location

Components are located in `frontend/src/components/ui/`:

```
frontend/src/components/ui/
├── button.tsx
├── input.tsx
├── label.tsx
├── card.tsx
├── dialog.tsx
└── ... (more as needed)
```

## Styling

### Tailwind CSS v4

We use Tailwind CSS v4 for utility-first styling:

- Modern `@import 'tailwindcss'` syntax
- Fast builds with native Vite plugin
- CSS-first configuration approach

### Utility Function

The `cn()` utility merges Tailwind classes safely:

```tsx
import { cn } from "@/lib/utils";

<Button className={cn("mt-4", isActive && "bg-primary")} />
```

## Usage Example

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  return (
    <form>
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" />
        </div>
        <Button type="submit">Log in</Button>
      </div>
    </form>
  );
}
```

## References

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
