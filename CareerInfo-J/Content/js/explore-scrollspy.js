(function () {
  'use strict';

  const navSelector = '.explore-list-group .list-group-item-action[href^="#guide"]';
  const sectionSelector = '[id^="guide"]';
  const navLinks = Array.from(document.querySelectorAll(navSelector));
  const sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    })
    .filter(Boolean);

  if (!navLinks.length || !sections.length) return;

  let isClickScrolling = false;
  let clickScrollTimer = null;

  /*function getHeaderOffset() {
    const header = document.querySelector('header');
    const headerStyle = header ? window.getComputedStyle(header) : null;
    const hasFixedHeader = header && ['fixed', 'sticky'].includes(headerStyle.position);
    const headerHeight = hasFixedHeader ? header.offsetHeight : 0;

    // 保留一點呼吸空間，避免標題貼齊視窗頂端。
    return headerHeight + 100;
  }*/
	function getHeaderOffset() {
		const stickyHeader = document.querySelector('header .sticky-top');
		const stickyHeight = stickyHeader ? stickyHeader.offsetHeight : 0;

		return stickyHeight;
	}
	
	function setActive(targetId) {
		// 單選式 active：不論是點擊或捲動觸發，先移除全部 active 與 focus，再只啟用目前對應項目。
		navLinks.forEach(function (link) {
			link.classList.remove('active');
			link.removeAttribute('aria-current');
			
			if (document.activeElement === link) {
				link.blur();
			}
		});

		const currentLink = navLinks.find(function (link) {
			return link.getAttribute('href') === '#' + targetId;
		});

		if (currentLink) {
			currentLink.classList.add('active');
			currentLink.setAttribute('aria-current', 'true');
			
			// 保險處理：若目前啟用項目剛好仍持有焦點，也同步移除 focus。
			if (document.activeElement === currentLink) {
				currentLink.blur();
			}
		}
	}

  function scrollToSection(target) {
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth'
    });
  }

  function getCurrentSectionId() {
		const offsetLine = getHeaderOffset() + Math.round(window.innerHeight * 0.25);
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

  // 讓直接以網址 #guide* 進入頁面時，也能避開固定 header。
  sections.forEach(function (section) {
    section.style.scrollMarginTop = getHeaderOffset() + 'px';
  });

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      const targetId = link.getAttribute('href').replace('#', '');
      const target = document.getElementById(targetId);

      if (!target) return;

      event.preventDefault();
      isClickScrolling = true;
      setActive(targetId);
      scrollToSection(target);

      // 更新網址 hash，但不觸發瀏覽器預設跳動。
      if (history.pushState) {
        history.pushState(null, '', '#' + targetId);
      }

      window.clearTimeout(clickScrollTimer);
      clickScrollTimer = window.setTimeout(function () {
        isClickScrolling = false;
        setActive(getCurrentSectionId());
      }, 700);
    });
  });

  // 心智圖 area 也沿用同一套平滑滑動與 active 同步。
  document.querySelectorAll('map area[href^="#guide"]').forEach(function (area) {
    area.addEventListener('click', function (event) {
      const targetId = area.getAttribute('href').replace('#', '');
      const target = document.getElementById(targetId);

      if (!target) return;

      event.preventDefault();
      setActive(targetId);
      scrollToSection(target);

      if (history.pushState) {
        history.pushState(null, '', '#' + targetId);
      }
    });
  });

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;

    window.requestAnimationFrame(function () {
      updateActiveByScroll();
      ticking = false;
    });

    ticking = true;
  }, { passive: true });

  window.addEventListener('resize', function () {
    sections.forEach(function (section) {
      section.style.scrollMarginTop = getHeaderOffset() + 'px';
    });
    updateActiveByScroll();
  });

  // 頁面載入時若已有 hash，平滑校正位置並同步 active。
  window.addEventListener('load', function () {
    const targetId = window.location.hash.replace('#', '');
    const target = targetId ? document.getElementById(targetId) : null;

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