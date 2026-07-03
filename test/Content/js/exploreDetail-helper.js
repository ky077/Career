// exploreDetail 讚寶小幫手 Toast
// 以 explore.html 的 Bootstrap Toasts 寫法為基礎，加入職科介紹頁七大導覽互動提醒。
document.addEventListener('DOMContentLoaded', function () {
  const helperContainer = document.querySelector('.helper-toast-container');
  const helperToastEl = document.getElementById('exploreDetailHelperToast');
  const exploreListGroup = document.querySelector('.explore-list-group');

  if (!helperContainer || !helperToastEl || typeof bootstrap === 'undefined') return;

  const helperToast = bootstrap.Toast.getOrCreateInstance(helperToastEl, {
    autohide: false
  });
  const helperText = helperToastEl.querySelector('.helper-text');
  const helperActions = helperToastEl.querySelector('.helper-actions');
  const guideCards = document.querySelectorAll('.guide-card[id^="guide"]');
  const seenGuideIds = new Set();
  let helperVisible = false;
  // 使用者按下 Toast 右上角關閉後，本頁不再自動跳出小幫手；仍可由各區標題旁的按鈕手動開啟。
  let helperDismissed = false;
  let userClosedCurrentToast = false;

  // 取得目前職科名稱；未來同版型替換成其他職科時，讚寶文案會自動帶入目前 breadcrumb 的 active 項目。
  const currentMajorNameEl = document.querySelector('.breadcrumb-item.active[aria-current="page"]') || document.querySelector('.breadcrumb-item.active');
  const currentMajorName = currentMajorNameEl ? currentMajorNameEl.textContent.trim() : '此職科';

  // 七大導覽區塊的讚寶提醒文案。
  // scrollTo 可控制按鈕要帶學生往下一站，或回到心智圖。
  const guideHelperMessages = {
    xmind: {
      text: '不知道從哪裡開始？點選心智圖七大核心結點，就能快速連結至下方導覽內容。',
      actions: [
        { label: '從第一站開始', scrollTo: 'guide1' }
      ]
    },
    guide1: {
      text: `第一站先認識${currentMajorName}！看完這裡，可以先了解它在學什麼、和生活中的產品有什麼關係。`,
      actions: [
        { label: '下一站：知識技能能力', scrollTo: 'guide2' }
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

  // 計算固定 header 高度，讓按鈕捲動定位不被上方導覽列遮住。
  function getHeaderOffset() {
    const header = document.querySelector('header');
    const headerStyle = header ? window.getComputedStyle(header) : null;
    const hasFixedHeader = header && ['fixed', 'sticky'].includes(headerStyle.position);
    return hasFixedHeader ? header.offsetHeight : 0;
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
  // 原則：Toast 顯示時隱藏提示按鈕；使用者關閉 Toast 後，才顯示提示按鈕。
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
      ? document.querySelector('.xmind')
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

      if (action.dismiss) {
        button.setAttribute('data-bs-dismiss', 'toast');
      }

      if (action.scrollTo) {
        button.setAttribute('data-helper-scroll-to', action.scrollTo);
      }

      helperActions.appendChild(button);
    });
  }

  // 顯示指定情境的 Toast。
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

  // Toast 內的按鈕：可關閉，也可帶學生跳至下一個導覽區塊。
  // 點選「下一站」時維持 Toast 顯示，只切換提示內容，避免小幫手閃一下。
  helperToastEl.addEventListener('click', function (event) {
    const scrollButton = event.target.closest('[data-helper-scroll-to]');

    if (scrollButton) {
      event.preventDefault();

      const targetId = scrollButton.getAttribute('data-helper-scroll-to');
      scrollToTarget(targetId);

      if (guideHelperMessages[targetId]) {
        showDetailHelper(targetId, { manual: true });
      }
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
    helperDismissed = true;
    userClosedCurrentToast = true;
    helperVisible = false;
    setGuideHelperButtonsVisible(true);
  });

  // 在每個七大導覽標題後方加入「讚寶提示」按鈕。
  // 使用者關閉 Toast 後，仍可透過此按鈕手動開啟該區小幫手提示。
  guideCards.forEach(function (card) {
    const guideTitle = card.querySelector('.guide-title');

    if (!guideTitle) return;

    const guideId = card.id;
    const helperButton = document.createElement('button');
    helperButton.type = 'button';
    helperButton.className = 'guide-helper-btn';
    helperButton.setAttribute('aria-label', '開啟讚寶小幫手：' + guideTitle.textContent.trim());
    helperButton.innerHTML = '讚寶提示';
    // Toast 預設會自動出現，因此標題旁按鈕先隱藏；使用者關閉 Toast 後才顯示。
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

  // 點選 SVG 心智圖 guide 節點時，顯示對應讚寶提醒。
  // xmind-loader.js 可能是非同步載入 SVG，因此用事件委派處理。
  document.addEventListener('click', function (event) {
    const svgGuide = event.target.closest('.xmind svg [id^="guide"]');

    if (!svgGuide) return;

    const guideIdMatch = svgGuide.id.match(/guide\d+/);
    if (!guideIdMatch) return;

    window.setTimeout(function () {
      showDetailHelper(guideIdMatch[0]);
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

  // 進入頁面後先提示心智圖操作。
  window.setTimeout(function () {
    showDetailHelper('xmind', { once: true });
  }, 900);

  // 捲動與縮放時更新 Toast 位置。
  let helperTicking = false;
  window.addEventListener('scroll', function () {
    if (helperTicking) return;

    helperTicking = true;
    window.requestAnimationFrame(function () {
      updateDetailHelperPosition();
      helperTicking = false;
    });
  });

  window.addEventListener('resize', updateDetailHelperPosition);
  updateDetailHelperPosition();
});