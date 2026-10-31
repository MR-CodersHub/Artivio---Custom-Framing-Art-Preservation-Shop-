/**
 * Atelier & Archival - Gallery Filtering & Lightbox Modal
 * Category filters and full-featured lightbox with navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  initGalleryFiltering();
  initLightbox();
});

function initGalleryFiltering() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item');

  if (!filterBtns.length || !items.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      items.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 20);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(15px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

function initLightbox() {
  const modal = document.querySelector('.lightbox-modal');
  if (!modal) return;

  const lightboxImg = modal.querySelector('.lightbox-img');
  const lightboxTitle = modal.querySelector('.lightbox-title');
  const lightboxSpecs = modal.querySelector('.lightbox-specs');
  const closeBtn = modal.querySelector('.lightbox-close');
  const prevBtn = modal.querySelector('.lightbox-prev');
  const nextBtn = modal.querySelector('.lightbox-next');

  let currentItems = [];
  let currentIndex = 0;

  const getVisibleItems = () => {
    return Array.from(document.querySelectorAll('.gallery-item')).filter(
      item => item.style.display !== 'none'
    );
  };

  const updateLightboxContent = (index) => {
    if (!currentItems[index]) return;
    const item = currentItems[index];
    const img = item.querySelector('.gallery-img');
    const title = item.querySelector('h4') ? item.querySelector('h4').textContent : 'Custom Framing Work';
    const specs = item.querySelector('.gallery-specs') ? item.querySelector('.gallery-specs').textContent : '';

    if (lightboxImg && img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || title;
    }
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxSpecs) lightboxSpecs.textContent = specs;
  };

  const openLightbox = (index) => {
    currentItems = getVisibleItems();
    currentIndex = index;
    updateLightboxContent(currentIndex);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  const showNext = () => {
    if (!currentItems.length) return;
    currentIndex = (currentIndex + 1) % currentItems.length;
    updateLightboxContent(currentIndex);
  };

  const showPrev = () => {
    if (!currentItems.length) return;
    currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
    updateLightboxContent(currentIndex);
  };

  // Attach click to items
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;

    currentItems = getVisibleItems();
    const index = currentItems.indexOf(item);
    if (index !== -1) {
      openLightbox(index);
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}
