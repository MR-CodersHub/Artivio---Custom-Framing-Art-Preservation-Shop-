/* ==========================================================================
   ARTIVIO - Blog Article Detail Interactions
   - Reading progress bar
   - Table of contents scroll-spy
   - Social share links + copy link
   ========================================================================== */
(function () {
  'use strict';

  var body = document.getElementById('articleBody');
  var bar = document.getElementById('readingProgressBar');

  /* Reading progress */
  function updateProgress() {
    if (!body || !bar) return;
    var rect = body.getBoundingClientRect();
    var total = body.offsetHeight - window.innerHeight * 0.6;
    var read = Math.min(Math.max(-rect.top + window.innerHeight * 0.2, 0), total);
    bar.style.transform = 'scaleX(' + (total > 0 ? read / total : 0) + ')';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* TOC scroll-spy */
  var tocLinks = document.querySelectorAll('.toc-link');
  if ('IntersectionObserver' in window && tocLinks.length) {
    var map = {};
    tocLinks.forEach(function (link) { map[link.getAttribute('href').slice(1)] = link; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tocLinks.forEach(function (l) { l.classList.remove('active'); });
          var active = map[entry.target.id];
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) {
      var heading = document.getElementById(id);
      if (heading) observer.observe(heading);
    });
  }

  /* Close mobile TOC after choosing a section */
  var mobileToc = document.getElementById('articleTocMobile');
  if (mobileToc) {
    mobileToc.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mobileToc.removeAttribute('open'); });
    });
  }

  /* Share links */
  var url = encodeURIComponent(window.location.href);
  var title = encodeURIComponent(document.title);
  var shareUrls = {
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
    x: 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title,
    pinterest: 'https://pinterest.com/pin/create/button/?url=' + url + '&description=' + title,
    linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + url
  };
  document.querySelectorAll('[data-share]').forEach(function (el) {
    var target = shareUrls[el.getAttribute('data-share')];
    if (target) el.setAttribute('href', target);
  });

  var copyBtn = document.getElementById('shareCopyLink');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var done = function () {
        copyBtn.classList.add('copied');
        copyBtn.textContent = '✓';
        setTimeout(function () {
          copyBtn.classList.remove('copied');
          copyBtn.textContent = '🔗';
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href).then(done, done);
      } else {
        done();
      }
    });
  }
})();
