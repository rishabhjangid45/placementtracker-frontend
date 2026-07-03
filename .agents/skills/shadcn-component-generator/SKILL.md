---
name: ShadCN Component Generator
description: Forces the agent to generate React components using strictly Tailwind utility classes and a pre-configured ShadCN architecture. Ensures design-system consistency across the entire frontend.
---

# ShadCN Component Generator

## Purpose

This skill ensures that every React component generated follows a strict ShadCN + Tailwind design system. It eliminates guesswork and enforces visual consistency across the entire application.

## Activation

This skill activates whenever the agent is asked to:
- Create a new React component
- Modify an existing UI component
- Build a page layout or section
- Generate any JSX/TSX that involves styling

## Rules

### Styling Rules

1. **ALWAYS** use Tailwind CSS utility classes for styling. **NEVER** use inline CSS (`style={{}}` attributes) under any circumstances.
2. **NEVER** create separate `.css` or `.module.css` files for component-specific styles. All styling must be done via Tailwind utilities.
3. **NEVER** use `!important` overrides in any form.

### Color Palette

Use the following color tokens consistently:

| Purpose              | Class                     |
|----------------------|---------------------------|
| Primary text         | `text-slate-900`          |
| Secondary text       | `text-slate-600`          |
| Muted/placeholder    | `text-slate-400`          |
| Primary background   | `bg-white` / `bg-slate-50`|
| Card background      | `bg-white`                |
| Primary accent       | `bg-primary` / `text-primary` (ShadCN theme token) |
| Destructive actions  | `bg-destructive` / `text-destructive` |
| Borders              | `border-slate-200`        |
| Hover backgrounds    | `hover:bg-slate-100`      |

### Typography

- Headings: Use `font-semibold` or `font-bold`. Never use `font-normal` for headings.
- Body text: Use `text-sm` (14px) as the default body size.
- Small/caption text: Use `text-xs` (12px).
- Page titles: Use `text-2xl font-bold text-slate-900`.
- Section headings: Use `text-lg font-semibold text-slate-900`.

### Button Rules

- Always import buttons from `@/components/ui/button`.
- Use the `sm` variant on mobile breakpoints (`<md`).
- Default to `variant="default"` for primary actions, `variant="outline"` for secondary, `variant="destructive"` for destructive, and `variant="ghost"` for tertiary/icon-only buttons.
- Always include an accessible label — use `aria-label` for icon-only buttons.

### Component Structure

- Always use ShadCN components from `@/components/ui/` when a matching primitive exists (e.g., `Card`, `Dialog`, `Input`, `Select`, `Table`, `Badge`, `Tooltip`).
- Import the `cn()` utility from `@/lib/utils` for conditional class merging.
- Use `React.forwardRef` for components that wrap native elements or ShadCN primitives.
- Always export components as named exports, not default exports.
- File naming: Use kebab-case for file names (e.g., `job-tracker-card.tsx`).
- Component naming: Use PascalCase for component names (e.g., `JobTrackerCard`).

### Layout Rules

- Use `flex` and `grid` for all layouts. Never use floats or absolute positioning for layout purposes.
- Default spacing between elements: `gap-4` for cards/sections, `gap-2` for inline items.
- Container max-width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Always add responsive breakpoints: design mobile-first, then use `sm:`, `md:`, `lg:` prefixes.

### Responsive Design

- Mobile-first approach is mandatory.
- Ensure all buttons use the `sm` size variant at base, and scale up at `md:` breakpoint if needed.
- Stack layouts vertically on mobile (`flex-col`), switch to horizontal on desktop (`md:flex-row`).
- Hide non-essential elements on mobile with `hidden md:block`.

### Accessibility

- All interactive elements must be keyboard-accessible.
- Use semantic HTML elements (`<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`).
- Include `aria-label` on icon-only buttons and links.
- Ensure sufficient color contrast (WCAG AA minimum).

## Example Component Template

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ExampleCardProps {
  title: string;
  status: "active" | "inactive";
  onAction: () => void;
  className?: string;
}

export function ExampleCard({ title, status, onAction, className }: ExampleCardProps) {
  return (
    <Card className={cn("border-slate-200", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-lg font-semibold text-slate-900">
          {title}
        </CardTitle>
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      </CardHeader>
      <CardContent>
        <Button
          size="sm"
          variant="default"
          onClick={onAction}
          className="w-full md:w-auto"
        >
          Take Action
        </Button>
      </CardContent>
    </Card>
  );
}
```
