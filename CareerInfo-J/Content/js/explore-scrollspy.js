(function () {
  'use strict';

  const navSelector = '.explore-list-group .list-group-item-action[href^="#guide"]';
  const sectionSelector = '.page-content .card[id^="guide"]';
  const svgGuideSelector = '.xmind svg [id^="guide"]';

  const navLinks = Array.from(document.querySelectorAll(navSelector));
  const sections = Array.from(document.querySelectorAll(sectionSelector));

  const sectionMap = sections.reduce(function (map, section) {
    map[section.id] = section;
    return map;
  }, {});

  if (!navLinks.length || !sections.length) return;

  let isClickScrolling = false;
  let clickScrollTimer = null;

  function getHeaderOffset() {
    const stickyHeader = document.querySelector('header .sticky-top');
    const stickyHeight = stickyHeader ? stickyHeader.offsetHeight : 0;

    return stickyHeight;
  }

  function clearActive() {
    navLinks.forEach(function (link) {
      link.classList.remove('active');
      link.removeAttribute('aria-current');

      if (document.activeElement === link) {
        link.blur();
      }
    });
  }

  function setActive(targetId) {
    clearActive();

    if (!targetId) return;

    const currentLink = navLinks.find(function (link) {
      return link.getAttribute('href') === '#' + targetId;
    });

    if (currentLink) {
      currentLink.classList.add('active');
      currentLink.setAttribute('aria-current', 'true');

      if (document.activeElement === currentLink) {
        currentLink.blur();
      }
    }
  }

  function scrollToSection(target) {
    const targetTop =
      target.getBoundingClientRect().top +
      window.pageYOffset -
      getHeaderOffset();

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth'
    });
  }

  function getCurrentSectionId() {
    const offsetLine =
      getHeaderOffset() +
      Math.round(window.innerHeight * 0.25);

    let current = null;

    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= offsetLine) {
        current = section;
      }
    });

    // 尚未捲到第一個 guide 區塊前，不預設啟用任何導覽項目。
    return current ? current.id : null;
  }

  function updateActiveByScroll() {
    if (isClickScrolling) return;

    setActive(getCurrentSectionId());
  }

  function updateScrollMarginTop() {
    const offset = getHeaderOffset();

    sections.forEach(function (section) {
      section.style.scrollMarginTop = offset + 'px';
    });
  }

  function goToGuide(targetId) {
    const target = sectionMap[targetId];

    if (!target) return;

    isClickScrolling = true;
    setActive(targetId);
    scrollToSection(target);

    if (history.pushState) {
      history.pushState(null, '', '#' + targetId);
    }

    window.clearTimeout(clickScrollTimer);
    clickScrollTimer = window.setTimeout(function () {
      isClickScrolling = false;
      setActive(getCurrentSectionId());
    }, 700);
  }

  updateScrollMarginTop();

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      const targetId = link.getAttribute('href').replace('#', '');

      event.preventDefault();
      goToGuide(targetId);
    });
  });

  // SVG 心智圖：使用 SVG 內 id="guide*" 的元素作為連結。
  document.querySelectorAll(svgGuideSelector).forEach(function (svgGuide) {
    const targetId = svgGuide.id;

    if (!sectionMap[targetId]) return;

    svgGuide.style.cursor = 'pointer';
    svgGuide.setAttribute('role', 'link');
    svgGuide.setAttribute('tabindex', '0');

    svgGuide.addEventListener('click', function (event) {
      event.preventDefault();
      goToGuide(targetId);
    });

    svgGuide.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;

      event.preventDefault();
      goToGuide(targetId);
    });
  });

  let ticking = false;

  window.addEventListener(
    'scroll',
    function () {
      if (ticking) return;

      window.requestAnimationFrame(function () {
        updateActiveByScroll();
        ticking = false;
      });

      ticking = true;
    },
    { passive: true }
  );

  window.addEventListener('resize', function () {
    updateScrollMarginTop();
    updateActiveByScroll();
  });

  window.addEventListener('load', function () {
    const targetId = window.location.hash.replace('#', '');
    const target = targetId ? sectionMap[targetId] : null;

    clearActive();

    if (target && /^guide\d+$/.test(targetId)) {
      setActive(targetId);

      window.setTimeout(function () {
        scrollToSection(target);
      }, 0);
    } else {
      updateActiveByScroll();
    }
  });
})();