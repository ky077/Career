(function () {
  'use strict';

  const xmindFrameSelector = '.xmind .futuristic-frame-digital';

  function getExploreIdFromUrl() {
    const fileName = window.location.pathname.split('/').pop() || '';
    const match = fileName.match(/^exploreDetail-(\d+)\.html$/i);

    return match ? match[1] : null;
  }

  function isSvgMarkup(text) {
    return /^\s*<svg[\s>]/i.test(text || '');
  }

  function fetchText(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (response) {
      if (!response.ok) {
        throw new Error('Cannot load ' + url);
      }

      return response.text();
    });
  }

  function loadXmindMarkup(exploreId) {
    const basePath = 'Content/img/senior/' + exploreId + '/';
    const svgPath = basePath + 'xmind.svg';
    const txtPath = basePath + 'xmind.txt';

    return fetchText(svgPath)
      .then(function (svgText) {
        if (!isSvgMarkup(svgText)) {
          throw new Error(svgPath + ' is not SVG markup.');
        }

        return {
          source: svgPath,
          markup: svgText
        };
      })
      .catch(function () {
        return fetchText(txtPath).then(function (txtText) {
          if (!isSvgMarkup(txtText)) {
            throw new Error(txtPath + ' is not SVG markup.');
          }

          return {
            source: txtPath,
            markup: txtText
          };
        });
      });
  }

  function dispatchLoaded(detail) {
    document.dispatchEvent(
      new CustomEvent('xmind:loaded', {
        detail: detail
      })
    );
  }

  function showLoadError(frame, exploreId) {
    frame.innerHTML =
      '<div class="xmind-load-error" role="status">' +
      '目前找不到此職科的心智圖 SVG 程式碼。請確認 ' +
      'Content/img/senior/' + exploreId + '/xmind.svg 或 xmind.txt 是否存在。' +
      '</div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    const frame = document.querySelector(xmindFrameSelector);
    const exploreId = getExploreIdFromUrl();

    if (!frame || !exploreId) return;

    frame.setAttribute('data-xmind-id', exploreId);
    frame.innerHTML = '<div class="xmind-loading" role="status">心智圖載入中...</div>';

    loadXmindMarkup(exploreId)
      .then(function (result) {
        frame.innerHTML = result.markup;
        frame.setAttribute('data-xmind-source', result.source);

        dispatchLoaded({
          exploreId: exploreId,
          source: result.source,
          frame: frame
        });
      })
      .catch(function () {
        showLoadError(frame, exploreId);
      });
  });
})();
