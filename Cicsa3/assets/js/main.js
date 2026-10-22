// Mobile nav toggle
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    toggle.classList.toggle('is-open');
    nav.classList.toggle('is-open');
  });
  document.querySelectorAll('.main-nav__item--has-sub > .main-nav__link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (window.innerWidth > 960) return;
      e.preventDefault();
      link.parentElement.classList.toggle('is-expanded');
    });
  });
})();

// Hero slideshow + rotating tag row
(function () {
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var slides = hero.querySelectorAll('.hero__slide');
  if (slides.length) {
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }, 5000);
  }
})();

// Scroll reveal
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(function (el) { io.observe(el); });
})();

// Proyectos filters
(function () {
  var grid = document.querySelector('[data-proyectos-list]');
  if (!grid) return;
  var tags = document.querySelectorAll('.filter-tag');
  var items = grid.querySelectorAll('[data-solucion]');
  var active = { solucion: null, sector: null };

  tags.forEach(function (tag) {
    tag.addEventListener('click', function () {
      var group = tag.getAttribute('data-group');
      var value = tag.getAttribute('data-value');
      var isActive = tag.classList.contains('is-active');
      document.querySelectorAll('.filter-tag[data-group="' + group + '"]').forEach(function (t) {
        t.classList.remove('is-active');
      });
      active[group] = isActive ? null : value;
      if (!isActive) tag.classList.add('is-active');
      applyFilters();
    });
  });

  function applyFilters() {
    items.forEach(function (item) {
      var solucionValues = (item.getAttribute('data-solucion') || '').split('|');
      var sectorValues = (item.getAttribute('data-sector') || '').split('|');
      var matchSolucion = !active.solucion || solucionValues.indexOf(active.solucion) !== -1;
      var matchSector = !active.sector || sectorValues.indexOf(active.sector) !== -1;
      item.style.display = (matchSolucion && matchSector) ? '' : 'none';
    });
  }
})();
