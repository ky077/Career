// exploreDetail 讚寶小幫手互動
// 1. 進頁面的心智圖提示：不使用右下角 Toast，改顯示在 SVG 內 id="IP" 上方，營造讚寶正在說話的感覺。
// 2. 下方七大導覽提示：延續 explore.html 的 Bootstrap Toasts 寫法，使用右下角 helper-toast-container。
// 3. 使用者關閉 Toast 後，不再自動跳出；各 guide-title 後方才顯示「讚寶提示」按鈕，可手動重新開啟。
document.addEventListener('DOMContentLoaded', function () {
  const helperContainer = document.querySelector('.helper-toast-container');
  const helperToastEl = document.getElementById('exploreDetailHelperToast');
  const exploreListGroup = document.querySelector('.explore-list-group');
  const xmindBlock = document.querySelector('.xmind');
  const xmindFrame = document.querySelector('.xmind .futuristic-frame-digital');

  if (!helperContainer || !helperToastEl || typeof bootstrap === 'undefined') return;

  const helperToast = bootstrap.Toast.getOrCreateInstance(helperToastEl, {
    autohide: false
  });
  const helperText = helperToastEl.querySelector('.helper-text');
  const helperActions = helperToastEl.querySelector('.helper-actions');
  const guideCards = document.querySelectorAll('.guide-card[id^="guide"]');
  const seenGuideIds = new Set();

  let helperVisible = false;
  let helperDismissed = false;
  let userClosedCurrentToast = false;
  let internalToastHide = false;
  let xmindHelperDismissed = false;
  let xmindHelperEl = null;

  // 取得目前職科名稱；未來同版型替換成其他職科時，讚寶文案會自動帶入目前 breadcrumb 的 active 項目。
  const currentMajorNameEl = document.querySelector('.breadcrumb-item.active[aria-current="page"]') || document.querySelector('.breadcrumb-item.active');
  const currentMajorName = currentMajorNameEl ? currentMajorNameEl.textContent.trim() : '此職科';

  // 七大導覽區塊的讚寶提醒文案。
  const guideHelperMessages = {
    guide1: {
      text: `第一站先認識${currentMajorName}！看完這裡，可以先了解它在學什麼、和生活中的產品有什麼關係。`,
      actions: [
        { label: '下一站：知識、技能與能力', scrollTo: 'guide2' }
      ]
    },
    guide2: {
      text: `不用一開始就全部會！這裡整理的是進入${currentMajorName}後會慢慢學到的知識、技能與能力。`,
      actions: [
        { label: '看興趣及特質', scrollTo: 'guide3' }
      ]
    },
    guide3: {
      text: '這裡可以對照自己的興趣和特質，看看哪些地方跟你很像，當作選擇職科的參考線索。',
      actions: [
        { label: '看證照及競賽', scrollTo: 'guide4' }
      ]
    },
    guide4: {
      text: '看到證照先別緊張！它們像是學習路上的挑戰關卡，可以幫你確認自己學會了什麼。',
      actions: [
        { label: '看如何進入', scrollTo: 'guide5' }
      ]
    },
    guide5: {
      text: `想知道哪裡可以讀${currentMajorName}嗎？點選不同就學區，就能查看設有此職科的學校。`,
      actions: [
        { label: '看未來進路', scrollTo: 'guide6' }
      ]
    },
    guide6: {
      text: `這裡像是一張未來地圖！可以看看讀${currentMajorName}之後，升學和就業有哪些可能方向。`,
      actions: [
        { label: '看經驗分享談', scrollTo: 'guide7' }
      ]
    },
    guide7: {
      text: '你已經看到最後一站囉！可以看看經驗分享，也可以回到心智圖重新選想看的導覽。',
      actions: [
        { label: '回到心智圖', scrollTo: 'xmind' }
      ]
    }
  };

  // xmind 小幫手相關 CSS 請寫在原本 CSS 檔，本 JS 只負責建立 DOM、定位與互動。

  // 計算固定 header 高度，讓按鈕捲動定位不被上方導覽列遮住。
  function getHeaderOffset() {
    const stickyHeader = document.querySelector('header .sticky-top');
    const stickyHeight = stickyHeader ? stickyHeader.offsetHeight : 0;

    return stickyHeight;
  }

  // 當頁面接近 footer 時，讓 Toast 往上移，避免擋住 footer。
  function updateDetailHelperPosition() {
    const footer = document.querySelector('footer');
    const footerHeight = footer ? footer.offsetHeight : 0;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    const distanceToBottom = documentHeight - (scrollTop + windowHeight);

    if (distanceToBottom <= footerHeight) {
      helperContainer.classList.add('is-near-footer');
      helperContainer.style.setProperty('--helper-footer-bottom', footerHeight + 'px');
    } else {
      helperContainer.classList.remove('is-near-footer');
      helperContainer.style.removeProperty('--helper-footer-bottom');
    }
  }

  // 控制各區 guide-title 後方「讚寶提示」按鈕顯示狀態。
  function setGuideHelperButtonsVisible(isVisible) {
    document.querySelectorAll('.guide-helper-btn').forEach(function (button) {
      button.hidden = !isVisible;
    });
  }

  // 預設隱藏右方七大導覽；進入最後一站時再顯示，避免一開始資訊過多。
  function showExploreListGroup() {
    if (!exploreListGroup) return;

    exploreListGroup.style.display = '';
    exploreListGroup.classList.add('is-helper-visible');
  }

  // 依目標 ID 平滑捲動。
  function scrollToTarget(targetId) {
    const target = targetId === 'xmind'
      ? xmindBlock
      : document.getElementById(targetId);

    if (!target) return;

    const top = target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset() - 16;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: 'smooth'
    });
  }

  // 重新產生 Toast 內的行動按鈕。
  function renderActions(actions) {
    helperActions.innerHTML = '';

    actions.forEach(function (action) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = action.scrollTo
        ? 'btn btn-primary btn-sm rounded-pill me-2 mb-1'
        : 'btn btn-outline-primary btn-sm rounded-pill me-2 mb-1';
      button.textContent = action.label;

      if (action.scrollTo) {
        button.setAttribute('data-helper-scroll-to', action.scrollTo);
      }

      helperActions.appendChild(button);
    });
  }

  function hideToastWithoutDismiss() {
    if (!helperToastEl.classList.contains('show')) return;

    internalToastHide = true;
    helperToast.hide();
  }

  // 顯示指定 guide 的右下角 Toast。
  // 若 Toast 已經開啟，只更新內文與按鈕，不重新 hide / show，避免切換下一站時閃爍。
  function showDetailHelper(messageKey, options) {
    const message = guideHelperMessages[messageKey];
    const settings = options || {};
    const isManualOpen = settings.manual === true;

    if (!message || !helperText || !helperActions) return;

    // 使用者關閉 Toast 後，不再因捲動、點心智圖或點右方導覽而自動出現；
    // 但保留 guide-title 後方的小幫手按鈕，讓使用者可自行重新開啟提示。
    if (helperDismissed && !isManualOpen && !helperVisible && !helperToastEl.classList.contains('show')) return;
    if (settings.once && seenGuideIds.has(messageKey)) return;

    hideXmindHelper();
    userClosedCurrentToast = false;
    seenGuideIds.add(messageKey);

    if (messageKey === 'guide7') {
      showExploreListGroup();
    }

    helperText.textContent = message.text;
    renderActions(message.actions);
    updateDetailHelperPosition();
    setGuideHelperButtonsVisible(false);

    if (!helperVisible && !helperToastEl.classList.contains('show')) {
      helperToast.show();
    }

    helperVisible = true;
  }

  // 建立心智圖內的小幫手；此提示不放在右下角 Toast 內。
  function createXmindHelper() {
    if (!xmindBlock || !xmindFrame) return null;
    if (xmindHelperEl) return xmindHelperEl;

    xmindHelperEl = document.createElement('div');
    xmindHelperEl.className = 'xmind-ip-helper is-hidden';
    xmindHelperEl.setAttribute('role', 'status');
    xmindHelperEl.setAttribute('aria-live', 'polite');
    xmindHelperEl.innerHTML =
      '<div class="xmind-ip-helper-header">' +
			  '<strong class="me-auto xmind-ip-helper-title">讚寶提醒</strong>' +
        '<button type="button" class="btn-close xmind-ip-helper-close" aria-label="關閉讚寶心智圖提示"></button>' +
      '</div>' +
      '<div class="xmind-ip-helper-body">' +
        '<div class="xmind-ip-helper-text">不知道從哪裡開始？點選心智圖七大核心結點，就能快速連結至下方導覽內容。</div>' +
        '<div class="xmind-ip-helper-actions mt-2">' +
          '<button type="button" class="btn btn-primary btn-sm rounded-pill" data-xmind-helper-scroll-to="guide1">從第一站開始</button>' +
        '</div>' +
      '</div>';

    // 不插入 .futuristic-frame-digital 內，避免被該區塊的 clip-path 裁切。
    // 改插入 .xmind 內、.futuristic-frame-digital 後方，讓提示框可超出心智圖框線。
    xmindFrame.insertAdjacentElement('afterend', xmindHelperEl);

    xmindHelperEl.querySelector('.xmind-ip-helper-close').addEventListener('click', function () {
      xmindHelperDismissed = true;
      hideXmindHelper();
    });

    xmindHelperEl.querySelector('[data-xmind-helper-scroll-to]').addEventListener('click', function () {
      const targetId = this.getAttribute('data-xmind-helper-scroll-to');

      xmindHelperDismissed = true;
      hideXmindHelper();
      scrollToTarget(targetId);
      showDetailHelper(targetId, { manual: true });
    });

    return xmindHelperEl;
  }

  // 將心智圖提示定位到 SVG 內 id="IP" 的上方。
  // 提示框本身是 .xmind 的子層，不在 .futuristic-frame-digital 內，避免被 clip-path 裁切。
  function positionXmindHelper() {
    const speech = createXmindHelper();
    const ipNode = xmindFrame ? xmindFrame.querySelector('svg #IP') : null;

    if (!speech || !ipNode || speech.classList.contains('is-hidden')) return;

    const xmindRect = xmindBlock.getBoundingClientRect();
    const ipRect = ipNode.getBoundingClientRect();

    if (!xmindRect.width || !ipRect.width) return;

    let left = ipRect.left + (ipRect.width / 2) - xmindRect.left;
    const top = ipRect.top - xmindRect.top;

    // 避免對話框在窄版時超出 .xmind 左右邊界。
    const safePadding = 160;
    if (xmindRect.width > safePadding * 2) {
      left = Math.max(safePadding, Math.min(left, xmindRect.width - safePadding));
    } else {
      left = xmindRect.width / 2;
    }

    speech.style.left = left + 'px';
    speech.style.top = Math.max(top, 24) + 'px';
  }

  function showXmindHelper(options) {
    const settings = options || {};
    const force = settings.force === true;
    const speech = createXmindHelper();
    const ipNode = xmindFrame ? xmindFrame.querySelector('svg #IP') : null;

    if (!speech || !ipNode) return;
    if (xmindHelperDismissed && !force) return;

    hideToastWithoutDismiss();
    setGuideHelperButtonsVisible(false);
    speech.classList.remove('is-hidden');

    window.requestAnimationFrame(positionXmindHelper);
  }

  function hideXmindHelper() {
    if (!xmindHelperEl) return;

    xmindHelperEl.classList.add('is-hidden');
  }

  // Toast 內的按鈕：可帶學生跳至下一個導覽區塊。
  // 點選「下一站」時維持 Toast 顯示，只切換提示內容，避免小幫手閃一下。
  helperToastEl.addEventListener('click', function (event) {
    const scrollButton = event.target.closest('[data-helper-scroll-to]');

    if (!scrollButton) return;

    event.preventDefault();

    const targetId = scrollButton.getAttribute('data-helper-scroll-to');
    scrollToTarget(targetId);

    if (targetId === 'xmind') {
      hideToastWithoutDismiss();

      window.setTimeout(function () {
        showXmindHelper({ force: true });
      }, 450);
      return;
    }

    if (guideHelperMessages[targetId]) {
      showDetailHelper(targetId, { manual: true });
    }
  });

  // Toast 顯示時，隱藏各區標題後方的「讚寶提示」按鈕，避免兩種小幫手入口同時出現。
  helperToastEl.addEventListener('shown.bs.toast', function () {
    helperVisible = true;
    setGuideHelperButtonsVisible(false);
  });

  // 使用者主動關閉 Toast 後，本頁不再自動跳出小幫手。
  // 若需要再次查看，可點各 guide-title 後方的「讚寶提示」按鈕手動開啟。
  helperToastEl.addEventListener('hide.bs.toast', function () {
    if (internalToastHide) {
      internalToastHide = false;
      helperVisible = false;
      return;
    }

    helperDismissed = true;
    userClosedCurrentToast = true;
    helperVisible = false;
    setGuideHelperButtonsVisible(true);
  });

  // 在每個七大導覽標題後方加入「讚寶提示」按鈕。
  guideCards.forEach(function (card) {
    const guideTitle = card.querySelector('.guide-title');

    if (!guideTitle) return;

    const guideId = card.id;
    const helperButton = document.createElement('button');
    helperButton.type = 'button';
    helperButton.className = 'guide-helper-btn';
    helperButton.setAttribute('aria-label', '開啟讚寶小幫手：' + guideTitle.textContent.trim());
    helperButton.innerHTML = '讚寶提示';
    // Toast 未被使用者關閉前，標題旁按鈕先隱藏；使用者關閉 Toast 後才顯示。
    helperButton.hidden = true;

    guideTitle.appendChild(helperButton);

    helperButton.addEventListener('click', function () {
      setGuideHelperButtonsVisible(false);
      showDetailHelper(guideId, { manual: true });
    });
  });

  // 點選右方浮動導覽時，顯示對應讚寶提醒。
  document.querySelectorAll('.explore-list-group a[href^="#guide"]').forEach(function (link) {
    link.addEventListener('click', function () {
      const guideId = this.getAttribute('href').replace('#', '');

      window.setTimeout(function () {
        showDetailHelper(guideId);
      }, 450);
    });
  });

  // 從 SVG 節點 ID 判斷要對應到哪一個 guide。
  // 支援 id="guide1"、id="g1"、id="content1" 三種命名方式。
  function getGuideIdFromSvgNode(svgNode) {
    if (!svgNode || !svgNode.id) return null;

    const guideMatch = svgNode.id.match(/^guide(\d+)/);
    const gMatch = svgNode.id.match(/^g(\d+)/);
    const contentMatch = svgNode.id.match(/^content(\d+)/);
    const matchedNumber = guideMatch && guideMatch[1] || gMatch && gMatch[1] || contentMatch && contentMatch[1];

    return matchedNumber ? 'guide' + matchedNumber : null;
  }

  // 點選 SVG 心智圖 guide 節點時，顯示對應讚寶提醒。
  // xmind-loader.js 會非同步載入 SVG，因此用事件委派處理。
  document.addEventListener('click', function (event) {
    const svgGuide = event.target.closest('.xmind svg [id^="guide"], .xmind svg [id^="g"], .xmind svg [id^="content"]');

    if (!svgGuide) return;

    const guideId = getGuideIdFromSvgNode(svgGuide);
    if (!guideId) return;

    xmindHelperDismissed = true;
    hideXmindHelper();

    window.setTimeout(function () {
      showDetailHelper(guideId);
    }, 450);
  });

  // 切換就學區時，補充操作提示。
  document.querySelectorAll('#school-region-tab [data-bs-toggle="pill"]').forEach(function (tabButton) {
    tabButton.addEventListener('shown.bs.tab', function () {
      showDetailHelper('guide5');
    });
  });

  // 捲動進入七大導覽區塊時，首次顯示該區提示。
  if ('IntersectionObserver' in window) {
    const guideObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (userClosedCurrentToast && helperVisible) return;

        showDetailHelper(entry.target.id, { once: true });
      });
    }, {
      threshold: 0.35,
      rootMargin: '0px 0px -20% 0px'
    });

    guideCards.forEach(function (card) {
      guideObserver.observe(card);
    });
  }

  // xmind-loader.js 載入 SVG 後，再把第一則提示定位到 SVG 內的 id="IP" 上方。
  document.addEventListener('xmind:loaded', function () {
    showXmindHelper();
  });

  // 若 SVG 載入速度較快，或其他程式沒有派發 xmind:loaded，也嘗試補一次定位。
  window.setTimeout(function () {
    showXmindHelper();
  }, 900);

  // 捲動與縮放時更新 Toast 與心智圖小幫手位置。
  let helperTicking = false;
  window.addEventListener('scroll', function () {
    if (helperTicking) return;

    helperTicking = true;
    window.requestAnimationFrame(function () {
      updateDetailHelperPosition();
      positionXmindHelper();
      helperTicking = false;
    });
  }, { passive: true });

  window.addEventListener('resize', function () {
    updateDetailHelperPosition();
    positionXmindHelper();
  });

  updateDetailHelperPosition();
});
