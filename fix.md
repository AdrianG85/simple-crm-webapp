# Mobile Drag-and-Drop Issue Report (Pipeline View)

## Current Status: ✅ FULLY RESOLVED

The mobile drag-and-drop issue has been completely fixed by removing the `SortableContext` wrapper that was interfering with collision detection.

## Final Resolution

### Root Cause
The `SortableContext` wrapper around mobile cards was intercepting collision detection before it could reach the stage buttons. This caused drops to only work when dragging from "Möjlighet" (the default view) upward, but not from other stages.

### Solution
Removed `SortableContext` from the mobile view. Cards are still draggable via `useSortable`, but without the context wrapper, collision detection now properly detects all stage buttons as drop targets.

### Changes Made
- **File**: `src/pages/Pipeline.tsx`
- **Change**: Removed `SortableContext` wrapper from mobile card list (lines 242-261)
- **Impact**: Mobile users can now drag cards from any stage to any stage button
- **Desktop**: Unaffected - desktop Kanban columns still use `SortableContext` for within-column sorting

## Technical Details
- **Collision Strategy**: `rectIntersection` (primary) → `pointerWithin` → `closestCenter` (fallback)
- **Sensors**: `TouchSensor` with `delay: 200ms` and `tolerance: 20px`
- **Mobile Behavior**: Cards can be moved between stages but not reordered within a stage
- **Desktop Behavior**: Full drag-and-drop with within-column sorting preserved
