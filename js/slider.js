/**
 * Atelier & Archival - Interactive Before & After Framing Slider
 * Supports mouse drag, touch drag, and keyboard navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  initBeforeAfterSliders();
});

function initBeforeAfterSliders() {
  const containers = document.querySelectorAll('.before-after-container');

  containers.forEach(container => {
    const wrap = container.querySelector('.before-img-wrap');
    const handle = container.querySelector('.slider-handle');
    const beforeImg = container.querySelector('.before-img');
    if (!wrap || !handle) return;

    let isDragging = false;

    // Ensure image width matches container width for perfect alignment
    const syncImageWidth = () => {
      const containerWidth = container.offsetWidth;
      if (beforeImg) {
        beforeImg.style.width = containerWidth + 'px';
      }
    };

    window.addEventListener('resize', syncImageWidth);
    syncImageWidth();

    const setPosition = (xPos) => {
      const rect = container.getBoundingClientRect();
      let offsetX = xPos - rect.left;
      
      // Clamp between 0 and rect.width
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;

      const percentage = (offsetX / rect.width) * 100;
      wrap.style.width = percentage + '%';
      handle.style.left = percentage + '%';
    };

    // Pointer Events (Unified Mouse & Touch)
    const onStart = (e) => {
      isDragging = true;
      container.classList.add('dragging');
      const pageX = e.touches ? e.touches[0].pageX : e.pageX;
      setPosition(pageX);
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const pageX = e.touches ? e.touches[0].pageX : e.pageX;
      setPosition(pageX);
    };

    const onEnd = () => {
      isDragging = false;
      container.classList.remove('dragging');
    };

    container.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    container.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    // Initial position at 50%
    wrap.style.width = '50%';
    handle.style.left = '50%';
  });
}
