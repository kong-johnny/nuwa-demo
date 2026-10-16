/* 桌面端交互增强层（仅 web 版加载，不影响微信小程序原生逻辑）
   1. 轻提示 / 确认弹窗：替代阻塞式的 alert 与 confirm
   2. 键盘操作：← → 翻页，数字键选项，Enter 继续，Esc 关闭弹层
   3. 古籍轮播：滚轮横滑、鼠标拖拽翻页、可键盘聚焦
   4. 重绘后保持键盘焦点位置 */
(function () {
  'use strict';

  var POINTER = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var app = document.getElementById('app');

  /* ========== 1. 轻提示 / 确认弹窗 ========== */
  var toastEl = null, toastTimer = null;

  function toast(title) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'dsk-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = title;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  function modal(opts) {
    var o = opts || {};
    var mask = document.createElement('div');
    mask.className = 'dsk-modal-mask';

    var box = document.createElement('div');
    box.className = 'dsk-modal';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');

    if (o.title) {
      var h = document.createElement('div');
      h.className = 'dsk-modal-title';
      h.textContent = o.title;
      box.appendChild(h);
    }
    if (o.content) {
      var p = document.createElement('div');
      p.className = 'dsk-modal-body';
      p.textContent = o.content;
      box.appendChild(p);
    }

    var actions = document.createElement('div');
    actions.className = 'dsk-modal-actions';

    function done(confirm) {
      document.removeEventListener('keydown', onKey, true);
      mask.remove();
      if (o.success) o.success({ confirm: confirm });
      if (o.complete) o.complete({ confirm: confirm });
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(false); }
      else if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); done(true); }
    }

    if (o.showCancel !== false) {
      var c = document.createElement('button');
      c.type = 'button';
      c.className = 'dsk-btn dsk-btn-ghost';
      c.textContent = o.cancelText || '取消';
      c.addEventListener('click', function () { done(false); });
      actions.appendChild(c);
    }
    var k = document.createElement('button');
    k.type = 'button';
    k.className = 'dsk-btn dsk-btn-solid';
    k.textContent = o.confirmText || '确定';
    k.addEventListener('click', function () { done(true); });
    actions.appendChild(k);

    box.appendChild(actions);
    mask.appendChild(box);
    mask.addEventListener('click', function (e) { if (e.target === mask) done(false); });
    document.body.appendChild(mask);
    document.addEventListener('keydown', onKey, true);
    k.focus();
  }

  window.wx = Object.assign({}, window.wx || {}, {
    showToast: function (o) {
      toast((o && o.title) || '');
      if (o && o.success) o.success({});
      if (o && o.complete) o.complete({});
    },
    hideToast: function () { if (toastEl) toastEl.classList.remove('show'); },
    showModal: modal
  });

  /* ========== 2. 键盘提示条 ========== */
  if (POINTER) {
    var hints = document.createElement('div');
    hints.className = 'key-hints';
    hints.innerHTML =
      '<span><kbd>←</kbd><kbd>→</kbd>翻页</span>' +
      '<span><kbd>1</kbd>-<kbd>4</kbd>选项</span>' +
      '<span><kbd>Enter</kbd>继续</span>' +
      '<span><kbd>Esc</kbd>关闭</span>';
    document.body.appendChild(hints);
  }

  /* ========== 3. 全局快捷键 ========== */
  function q(sel) { return document.querySelector(sel); }
  function enabled(el) { return !!el && !el.disabled && el.offsetParent !== null; }
  function clickIf(el) { if (enabled(el)) { el.click(); return true; } return false; }
  function isTyping(el) {
    return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (q('.dsk-modal-mask')) return;   // 弹窗打开时交给弹窗自己处理

    if (e.key === 'Escape') {
      if (q('.overlay')) {
        e.preventDefault();
        if (!clickIf(q('.chat-panel .icon-button'))) { var ov = q('.overlay'); if (ov) ov.click(); }
      }
      return;
    }
    if (isTyping(e.target)) return;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      var books = q('.books');
      if (books && books.contains(document.activeElement)) {
        e.preventDefault();
        books.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * books.clientWidth, behavior: 'smooth' });
        return;
      }
      e.preventDefault();
      if (e.key === 'ArrowLeft') clickIf(q('.topbar .icon-button'));
      else clickIf(q('.bottom .primary'));
      return;
    }

    if (e.key === 'Enter') {
      var t = e.target;
      if (t === document.body || t === document.documentElement ||
        (t.classList && t.classList.contains('screen'))) {
        e.preventDefault();
        clickIf(q('.bottom .primary'));
      }
      return;
    }

    if (/^[1-9]$/.test(e.key)) {
      var list = [].slice.call(document.querySelectorAll('.choices .choice'));
      if (!list.length) list = [].slice.call(document.querySelectorAll('.task-bank .task:not([disabled])'));
      var target = list[Number(e.key) - 1];
      if (enabled(target)) { e.preventDefault(); target.click(); }
    }
  });

  /* ========== 4. 古籍轮播：滚轮横滑 + 拖拽 ========== */
  document.addEventListener('wheel', function (e) {
    var books = e.target.closest ? e.target.closest('.books') : null;
    if (!books || !e.deltaY) return;
    books.scrollLeft += e.deltaY;
    e.preventDefault();
  }, { passive: false });

  var drag = null, justDragged = false;

  document.addEventListener('pointerdown', function (e) {
    var books = e.target.closest ? e.target.closest('.books') : null;
    if (!books || e.pointerType === 'touch' || e.button !== 0) return;
    drag = { el: books, id: e.pointerId, x: e.clientX, left: books.scrollLeft, moved: false };
  });

  document.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) <= 4) return;
      drag.moved = true;
      drag.el.classList.add('dragging');
      try { drag.el.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
    }
    drag.el.scrollLeft = drag.left - dx;
    e.preventDefault();
  });

  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    var d = drag;
    drag = null;
    d.el.classList.remove('dragging');
    if (!d.moved) return;
    justDragged = true;
    setTimeout(function () { justDragged = false; }, 80);
    var page = d.el.clientWidth;
    var idx = Math.max(0, Math.min(2, Math.round(d.el.scrollLeft / page)));
    d.el.scrollTo({ left: idx * page, behavior: 'smooth' });
  }
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);

  // 拖拽结束时吞掉误触发的点击
  document.addEventListener('click', function (e) {
    if (justDragged && e.target.closest && e.target.closest('.books')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  /* ========== 5. 重绘后保持键盘焦点 ========== */
  var keyboardUser = false, lastFocus = null;

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab' || e.key.indexOf('Arrow') === 0 || e.key === 'Enter' || /^[1-9]$/.test(e.key)) {
      keyboardUser = true;
    }
  });
  document.addEventListener('pointerdown', function () { keyboardUser = false; });

  function describe(el) {
    if (!el || el === document.body || !el.parentNode) return null;
    return {
      tag: el.tagName,
      cls: el.className,
      text: (el.textContent || '').trim().slice(0, 40),
      nth: [].indexOf.call(el.parentNode.children, el)
    };
  }
  function findMatch(d) {
    if (!d) return null;
    var list = app.querySelectorAll(d.tag);
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el.className !== d.cls) continue;
      if ((el.textContent || '').trim().slice(0, 40) !== d.text) continue;
      if ([].indexOf.call(el.parentNode.children, el) === d.nth) return el;
    }
    return null;
  }
  document.addEventListener('focusin', function () { lastFocus = describe(document.activeElement); });

  if (app) {
    new MutationObserver(function () {
      var books = app.querySelector('.books');
      if (books && !books.hasAttribute('tabindex')) {
        books.setAttribute('tabindex', '0');
        books.setAttribute('role', 'group');
        books.setAttribute('aria-label', '古籍摘读，使用左右方向键翻阅');
      }
      if (!keyboardUser) return;
      var active = document.activeElement;
      if (active && active !== document.body && app.contains(active)) return;
      var next = findMatch(lastFocus);
      if (next) { try { next.focus({ preventScroll: true }); } catch (e) { next.focus(); } return; }
      var primary = app.querySelector('.bottom .primary:not([disabled])') || app.querySelector('.choices .choice');
      if (primary) { try { primary.focus({ preventScroll: true }); } catch (e2) { primary.focus(); } }
    }).observe(app, { childList: true, subtree: true });
  }
})();
