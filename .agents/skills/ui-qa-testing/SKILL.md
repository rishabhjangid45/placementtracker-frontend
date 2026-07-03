---
name: UI QA and Testing
description: Instructs the agent to automatically verify responsive design by launching a browser, navigating to newly created components, and capturing screenshots at mobile and desktop breakpoints before finalizing any code diff.
---

# UI QA and Testing

## Purpose

This skill ensures that every UI change is visually verified at critical responsive breakpoints before being finalized. It leverages the built-in browser agent to automatically navigate to the component, capture screenshots, and check for layout issues like horizontal scrolling.

## Activation

This skill activates whenever the agent:
- Creates a new page or component with visual output
- Modifies an existing UI component's layout or styling
- Completes a code diff that affects the visual appearance of the application
- Is asked to verify, QA, or test a UI component

## Rules

### Pre-Verification Checklist

Before launching the browser for verification, ensure:

1. The development server is running (typically on `http://localhost:3000`).
2. All file changes have been saved.
3. There are no TypeScript compilation errors.
4. The route/path to the component is known.

### Browser Verification Steps

After every UI-affecting code change, perform the following verification steps **automatically**:

#### Step 1: Launch Browser at Mobile Breakpoint (375px)

1. Launch the browser agent.
2. Resize the viewport to **375px × 812px** (iPhone SE / standard mobile).
3. Navigate to the page or route where the new/modified component is rendered.
4. Wait for the page to fully load (no spinners, no skeleton screens).
5. Capture a screenshot.
6. **Verify**: Check that there is **no horizontal scrolling** — the page content must fit entirely within 375px width.
7. **Verify**: Check that text is readable and not clipped or overflowing.
8. **Verify**: Check that buttons are tappable size (minimum 44px × 44px touch target).

#### Step 2: Launch Browser at Desktop Breakpoint (1024px)

1. Resize the viewport to **1024px × 768px** (standard desktop/laptop).
2. Navigate to the same page/route.
3. Wait for the page to fully load.
4. Capture a screenshot.
5. **Verify**: Check that there is **no horizontal scrolling**.
6. **Verify**: Check that the layout properly utilizes the wider viewport (no excessively narrow content).
7. **Verify**: Check that grid/flex layouts are rendering correctly at this width.

#### Step 3: (Optional) Tablet Breakpoint (768px)

If the component has a distinct tablet layout, also verify at:
- **768px × 1024px** (iPad portrait)

### Failure Criteria

Flag the verification as **FAILED** if any of the following are detected:

- ❌ Horizontal scrollbar appears at any breakpoint
- ❌ Text is truncated or overlapping other elements
- ❌ Buttons or interactive elements are smaller than 44px touch targets on mobile
- ❌ Images overflow their container
- ❌ Content is cut off or hidden unintentionally
- ❌ Layout appears broken (overlapping elements, misaligned grids)
- ❌ Blank/empty sections that should have content

### On Failure

If verification fails:

1. **Do NOT finalize the diff.** 
2. Document the issue with a screenshot.
3. Fix the CSS/layout issue.
4. Re-run the verification from Step 1.
5. Repeat until all breakpoints pass.

### On Success

If all breakpoints pass:

1. Report the results with embedded screenshots showing both mobile and desktop views.
2. Confirm: "✅ UI verification passed at 375px (mobile) and 1024px (desktop). No horizontal scrolling detected."
3. Proceed with finalizing the code changes.

### Screenshot Naming Convention

Save screenshots with descriptive names:
- `<component-name>_mobile_375.png`
- `<component-name>_desktop_1024.png`
- `<component-name>_tablet_768.png`

### Reporting Format

After verification, include a summary in this format:

```markdown
## UI QA Results

| Breakpoint | Width  | Horizontal Scroll | Layout | Status |
|------------|--------|-------------------|--------|--------|
| Mobile     | 375px  | None              | OK     | ✅     |
| Desktop    | 1024px | None              | OK     | ✅     |

Screenshots attached below.
```
