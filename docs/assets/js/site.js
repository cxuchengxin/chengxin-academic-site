/* =====================================================
   Site-wide motion: abstract expand, back-to-top, menu underline
   All motion is skipped when the visitor prefers reduced motion.
   ===================================================== */
(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Smooth expand/collapse for <details> (abstracts) ---------- */
  document.querySelectorAll('details').forEach(function(details){
    var summary = details.querySelector('summary');
    if (!summary) return;
    var animating = null;

    summary.addEventListener('click', function(e){
      if (reduceMotion.matches || !details.animate) return;  // native toggle
      e.preventDefault();
      if (animating && details.classList.contains('is-closing')){
        animating.cancel();  // clicked again mid-close: stay open
        cleanup();
        return;
      }
      if (animating) animating.cancel();

      var closedHeight = summary.offsetHeight + 'px';
      if (!details.open){
        details.style.overflow = 'hidden';
        details.open = true;
        var openHeight = details.offsetHeight + 'px';
        animating = details.animate({ height: [closedHeight, openHeight] }, { duration: 220, easing: 'ease-out' });
      } else {
        details.style.overflow = 'hidden';
        details.classList.add('is-closing');
        var startHeight = details.offsetHeight + 'px';
        animating = details.animate({ height: [startHeight, closedHeight] }, { duration: 180, easing: 'ease-in' });
        var closing = animating;
        var finishClose = function(){
          if (animating !== closing) return;  // superseded by a newer click
          closing.cancel();
          details.open = false;
          cleanup();
        };
        closing.addEventListener('finish', finishClose);
        setTimeout(finishClose, 260);  // fallback if the finish event is delayed
        return;
      }
      animating.addEventListener('finish', cleanup);
      animating.addEventListener('cancel', cleanup);
    });

    function cleanup(){
      details.style.overflow = '';
      details.classList.remove('is-closing');
      animating = null;
    }
  });

  /* ---------- Back-to-top button ---------- */
  var toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'back-to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(toTop);

  toTop.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });

  function updateToTop(){
    toTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 1.2);
  }
  window.addEventListener('scroll', updateToTop, { passive: true });
  updateToTop();

  /* ---------- Sliding underline in the top menu ---------- */
  var menu = document.querySelector('#navbarCollapse .navbar-nav.me-auto');
  if (menu){
    var bar = document.createElement('span');
    bar.className = 'nav-indicator';
    bar.setAttribute('aria-hidden', 'true');
    menu.appendChild(bar);
    var current = menu.querySelector('.nav-link.active');

    function moveTo(link){
      if (!link){ bar.style.opacity = '0'; return; }
      var m = menu.getBoundingClientRect();
      var r = link.getBoundingClientRect();
      var pad = parseFloat(getComputedStyle(link).paddingLeft) || 0;
      bar.style.width = Math.max(0, r.width - pad * 2) + 'px';
      bar.style.transform = 'translateX(' + (r.left - m.left + pad) + 'px)';
      bar.style.opacity = '1';
    }

    menu.querySelectorAll('.nav-link').forEach(function(link){
      link.addEventListener('mouseenter', function(){ moveTo(link); });
      link.addEventListener('focus', function(){ moveTo(link); });
    });
    menu.addEventListener('mouseleave', function(){ moveTo(current); });
    menu.addEventListener('focusout', function(){ moveTo(current); });
    window.addEventListener('resize', function(){ moveTo(current); });

    // Place it without animating on first paint
    bar.style.transition = 'none';
    moveTo(current);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ bar.style.transition = ''; }); });
  }
})();
