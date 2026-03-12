# AI ASSISTANT INSTRUCTIONS - VISUAL & ARCHITECTURAL INTEGRITY

## 1. GLOBAL MANDATE: PRESERVE VISUAL CONSISTENCY
**CRITICAL:** The current "Look and Feel" of the application is considered the "Golden Master." Your primary directive is to maintain the exact visual layout, spacing, typography, colors, and responsive behavior across all changes.

* **Zero Visual Regression:** Do not alter the appearance of existing components unless explicitly instructed to "redesign" or "restyle."
* **Immutable Layouts:** Do not reorder DOM elements, change flex/grid containers, or modify global CSS/Tailwind classes for existing features during logic updates.

## 2. STYLING RULES
* **Existing Styles:** Treat existing CSS classes, styled-components, or inline styles as read-only.
* **New Components:** If you create a new component, it must strictly inherit the design tokens (colors, border-radius, shadows, fonts) of the existing application. Do not introduce new design patterns.
* **Spacing:** Pay extreme attention to whitespace (padding/margin). Do not "optimize" or "clean up" whitespace if it results in a visual shift.

## 3. REFACTORING CONSTRAINTS
* **Logic vs. View:** When asked to refactor code, you may optimize logic, state management, and performance. You must NOT refactor the structure of the JSX/HTML or CSS unless it is required to fix a specific bug.
* **Class Names:** Do not rename or remove CSS classes used for styling unless you have verified they are unused.

## 4. IMPLEMENTATION WORKFLOW
Before generating code for a task, perform the following checks:
1.  **Analyze Context:** Look at the surrounding code to understand the current layout strategy (Flexbox vs. Grid, absolute vs. relative positioning).
2.  **Mimic:** If adding a button, find an existing button and copy its classes/props exactly before modifying the label/action.
3.  **Verify:** Ask yourself, "Will this change move any pixel on the screen for unrelated elements?" If the answer is yes, revise your approach.

## 5. UI LIBRARIES & DEPENDENCIES
* Do not upgrade UI libraries (e.g., Bootstrap, Tailwind, Material UI) to versions that introduce breaking visual changes without explicit user permission.
* Do not switch underlying icon sets.

---
**Summary:** If it looks different after your code change, the code is wrong.