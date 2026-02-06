import { useRef, useCallback } from 'react';

export function useDragging() {
    const dragStateRef = useRef({
        isDragging: false,
        hasMoved: false,
        windowX: 0,
        windowY: 0
    });

    const handleMouseDown = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const state = dragStateRef.current;

        // Get initial window position
        // We do this once at start to establish the baseline
        let initialWindowX = 0;
        let initialWindowY = 0;

        if (window.electronAPI?.getWindowPosition) {
            const pos = await window.electronAPI.getWindowPosition();
            initialWindowX = pos.x;
            initialWindowY = pos.y;
        }

        // Initialize state
        state.isDragging = false;
        state.hasMoved = false;
        state.windowX = initialWindowX;
        state.windowY = initialWindowY;

        const handleMove = (moveEvent) => {
            // Use movementX/Y for logical deltas (handles DPI automatically)
            const deltaX = moveEvent.movementX;
            const deltaY = moveEvent.movementY;

            // Skip if no movement
            if (deltaX === 0 && deltaY === 0) return;

            // Check threshold to start dragging
            if (!state.isDragging) {
                // We use a simple composite threshold here
                state.isDragging = true;
                state.hasMoved = true;
            }

            // Update local tracker
            state.windowX += deltaX;
            state.windowY += deltaY;

            // Send update to Electron (Fire and forget, no await to prevent lag)
            if (window.electronAPI?.setWindowPosition) {
                window.electronAPI.setWindowPosition(state.windowX, state.windowY);
            }
        };

        const handleUp = () => {
            // Remove listeners
            document.removeEventListener('mousemove', handleMove, true);
            document.removeEventListener('mouseup', handleUp, true);

            // Finalize drag to ensure window size is correct
            if (window.electronAPI?.finalizeDrag) {
                window.electronAPI.finalizeDrag();
            }

            // Reset dragging state after delay
            setTimeout(() => {
                state.isDragging = false;
            }, 100);
        };

        // Add listeners with capture
        document.addEventListener('mousemove', handleMove, true);
        document.addEventListener('mouseup', handleUp, true);
    }, []);

    const shouldBlockClick = useCallback(() => {
        const blocked = dragStateRef.current.hasMoved;
        if (blocked) {
            // Reset after checking
            setTimeout(() => {
                dragStateRef.current.hasMoved = false;
            }, 100);
        }
        return blocked;
    }, []);

    return {
        handleMouseDown,
        shouldBlockClick
    };
}
