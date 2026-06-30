$(document).ready(function () {
	// nav當前頁active
	navActive('explore');
	
	// 高職設有此職科 Tooltips
  const vsElements = document.querySelectorAll('.explore-badge.VS');
  vsElements.forEach(el => {
    new bootstrap.Tooltip(el, {
      title: "高職設有此職科",
      placement: "top" 
    });
  });

  // 五專設有此職科 Tooltips
  const jcElements = document.querySelectorAll('.explore-badge.JC');
  jcElements.forEach(el => {
    new bootstrap.Tooltip(el, {
      title: "五專設有此職科",
      placement: "top"
    });
  });
});	

//////////////////////////////////////////////////////////////////
//collapse >992px 改成 tooltips
var dictionaryBreakpoint = window.matchMedia('(min-width: 993px)');

var dictionaryLinks = Array.from(
  document.querySelectorAll('[data-bs-toggle="collapse"][href^="#"], [data-bs-toggle="collapse"][data-bs-target^="#"]')
).filter(function (link) {
  var targetSelector = link.getAttribute('href') || link.getAttribute('data-bs-target');
  var target = targetSelector ? document.querySelector(targetSelector) : null;

  return target && target.querySelector('.guide-dictionary');
});

function getDictionaryTooltipHtml(target) {
  var titleEl = target.querySelector('.dictionary-title');
  var subtitleEl = target.querySelector('.dictionary-subtitle');
  var bodyEl = target.querySelector('.dictionary-body p');

  var title = titleEl ? titleEl.textContent.trim() : '名詞小辭典';
  var subtitle = subtitleEl ? subtitleEl.textContent.trim() : '';
  var body = bodyEl ? bodyEl.textContent.trim() : '';

	return (
    '<div class="guide-dictionary">' +
      '<div class="dictionary-title">' + title + '</div>' +
      (subtitle ? '<div class="dictionary-subtitle">' + subtitle + '</div>' : '') +
      (body ? '<div class="dictionary-body">' + body + '</div>' : '') +
    '</div>'
  );
}

function disposeDictionaryTooltip(link) {
  var tooltip = bootstrap.Tooltip.getInstance(link);

  if (tooltip) {
    tooltip.dispose();
  }
}

function initDictionaryTooltip(link, target) {
  disposeDictionaryTooltip(link);

  var tooltip = new bootstrap.Tooltip(link, {
    title: getDictionaryTooltipHtml(target),
    html: true,
    placement: 'right',
    trigger: 'click',
    customClass: 'dictionary-tooltip-wrap',
    container: 'body'
  });

  return tooltip;
}

function setDictionaryMode() {
  var isDesktop = dictionaryBreakpoint.matches;

  dictionaryLinks.forEach(function (link) {
    var targetSelector = link.getAttribute('href') || link.getAttribute('data-bs-target');
    var target = targetSelector ? document.querySelector(targetSelector) : null;

    if (!target) return;

    if (isDesktop) {
      var collapse = bootstrap.Collapse.getInstance(target);

      if (collapse) {
        collapse.hide();
      }

      target.classList.remove('show');

      link.setAttribute('data-bs-toggle', 'tooltip');
      link.setAttribute('aria-expanded', 'false');

      initDictionaryTooltip(link, target);
    } else {
      disposeDictionaryTooltip(link);

      link.setAttribute('data-bs-toggle', 'collapse');
      link.removeAttribute('data-bs-original-title');
      link.removeAttribute('aria-describedby');
      link.setAttribute('aria-expanded', 'false');
    }
  });
}

dictionaryLinks.forEach(function (link) {
  link.addEventListener('click', function (event) {
    if (!dictionaryBreakpoint.matches) return;

    event.preventDefault();
    event.stopPropagation();
  });
});

setDictionaryMode();

dictionaryBreakpoint.addEventListener('change', function () {
  setDictionaryMode();
});	
