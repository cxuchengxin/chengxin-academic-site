/* =====================================================
   Research page: tab counts, linkable tabs, sticky offset
   ===================================================== */
(function(){
  var tabset = document.querySelector('.panel-tabset');
  if (!tabset) return;
  tabset.classList.add('research-tabs');

  var links = Array.prototype.slice.call(tabset.querySelectorAll('.nav-tabs .nav-link'));

  function slug(text){
    return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  links.forEach(function(link){
    var pane = document.querySelector(link.getAttribute('data-bs-target'));
    var label = link.textContent;
    link.setAttribute('data-slug', slug(label));

    // Item count on each tab
    if (pane){
      var count = pane.querySelectorAll('.pub-item').length;
      var badge = document.createElement('span');
      badge.className = 'tab-count';
      badge.textContent = count;
      badge.setAttribute('aria-label', count + ' items');
      link.appendChild(badge);

      // Item count next to "Working Projects" / "Publications"
      pane.querySelectorAll('section.level3').forEach(function(section){
        var h = section.querySelector('h3');
        if (!h) return;
        var n = section.querySelectorAll('.pub-item').length;
        var c = document.createElement('span');
        c.className = 'section-count';
        c.textContent = n;
        h.appendChild(c);
      });
    }

    // Keep the URL in sync so a topic can be linked and survives reload
    link.addEventListener('shown.bs.tab', function(){
      history.replaceState(null, '', '#' + link.getAttribute('data-slug'));
      var top = tabset.getBoundingClientRect().top + window.scrollY - headerBottom() - 8;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  function openFromHash(){
    var h = decodeURIComponent(location.hash.slice(1));
    if (!h) return;
    var match = links.filter(function(l){ return l.getAttribute('data-slug') === h; })[0];
    if (match && window.bootstrap) bootstrap.Tab.getOrCreateInstance(match).show();
  }

  // Sit just below the site header, which hides/shows as you scroll
  var header = document.getElementById('quarto-header');
  function headerBottom(){
    return header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
  }
  function updateOffset(){
    tabset.style.setProperty('--tabs-top', headerBottom() + 'px');
  }

  window.addEventListener('scroll', updateOffset, { passive: true });
  window.addEventListener('resize', updateOffset);
  window.addEventListener('hashchange', openFromHash);
  setInterval(updateOffset, 250);  // catches the header's slide animation
  updateOffset();
  openFromHash();
  // Quarto's own tab setup can run after this script; apply the link again once loaded
  window.addEventListener('load', openFromHash);
})();
