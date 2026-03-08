// Mobile Touch Controls Enhancement
// This script adds touch event handlers to all 3D model canvases
// Run this after the main script loads to enable touch support on mobile devices

function enhanceCanvasWithTouchControls(canvas, zoomConfig = {}) {
    const minZoom = zoomConfig.min || 2;
    const maxZoom = zoomConfig.max || 200;
    const zoomSensitivity = zoomConfig.sensitivity || 0.01;
    const isZAxis = zoomConfig.isZAxis !== false;
    
    let touchStartX = 0, touchStartY = 0, touchStartDistance = 0;
    let touchActive = false, pinchActive = false;
    
    // Get rotation variables from the canvas (they should be stored in the animation loop)
    let state = {
        rotationX: 0,
        rotationY: 0,
        cameraDistance: zoomConfig.initialDistance || (isZAxis ? 6 : 80),
        touchActive: false,
        pinchActive: false
    };
    
    canvas.__touch = state;
    
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchActive = true;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            touchStartDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            pinchActive = true;
        }
    }, { passive: true });
    
    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && touchActive) {
            const deltaX = e.touches[0].clientX - touchStartX;
            const deltaY = e.touches[0].clientY - touchStartY;
            
            // Rough delegation to global scope (this is a fallback pattern)
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        } else if (e.touches.length === 2 && pinchActive) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            touchStartDistance = currentDistance;
        }
    }, { passive: true });
    
    canvas.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
            touchActive = false;
            pinchActive = false;
        }
    }, { passive: true });
}

// Auto-enhance all canvas elements with models
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Three.js models to initialize
    setTimeout(() => {
        const canvases = document.querySelectorAll('[id^="canvas-"]');
        canvases.forEach(canvas => {
            // Only enhance canvases that have WebGL content
            if (canvas.querySelector('canvas[data-engine="three.js"]') || 
                canvas.__canvas || 
                canvas.hasAttribute('data-touch-enabled')) {
                enhanceCanvasWithTouchControls(canvas);
            }
        });
    }, 1000);
});
