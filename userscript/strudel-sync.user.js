// ==UserScript==
// @name         Strudel Sync
// @namespace    local.strudel.sync
// @version      0.1.0
// @description  Apply .strudel files pushed over ws://localhost into strudel.cc's editor.
// @match        https://strudel.cc/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
(function () {
  'use strict';

  const PORT = 3001;
  const WS_URL = `ws://localhost:${PORT}`;

  const badge = document.createElement('div');
  badge.style.cssText =
    'position:fixed;bottom:8px;right:8px;z-index:2147483647;' +
    'font:12px/1.4 monospace;padding:4px 8px;border-radius:4px;' +
    'color:#fff;background:#a33;pointer-events:none;';
  badge.textContent = 'strudel-sync: connecting…';
  function mountBadge() {
    (document.body || document.documentElement).appendChild(badge);
  }
  if (document.body) mountBadge();
  else document.addEventListener('DOMContentLoaded', mountBadge);

  // strudel.cc が公開する StrudelMirror インスタンスを取得する。
  // 実際のグローバル参照名は実機(Task 6)でコンソール確認し、必要なら下記候補を調整する。
  function getMirror() {
    return (
      window.strudelMirror ||
      (window.editor && (window.editor.repl || window.editor)) ||
      null
    );
  }

  function apply(code) {
    const mirror = getMirror();
    if (!mirror || typeof mirror.setCode !== 'function' || typeof mirror.evaluate !== 'function') {
      console.warn('[strudel-sync] StrudelMirror が見つかりません。getMirror() を調整してください。');
      badge.style.background = '#c80';
      badge.textContent = 'strudel-sync: mirror not found';
      return;
    }
    try {
      mirror.setCode(code);
      mirror.evaluate();
    } catch (err) {
      console.error('[strudel-sync] evaluate error', err);
    }
  }

  let ws = null;
  let retry = 0;

  function connect() {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      retry = 0;
      badge.style.background = '#2a7';
      badge.textContent = 'strudel-sync: connected';
    };

    ws.onclose = () => {
      badge.style.background = '#a33';
      badge.textContent = 'strudel-sync: disconnected';
      retry = Math.min(retry + 1, 6);
      setTimeout(connect, 500 * 2 ** (retry - 1));
    };

    ws.onerror = () => {
      try { ws.close(); } catch (_) {}
    };

    ws.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch (_) { return; }
      if (msg && msg.type === 'code' && typeof msg.content === 'string') {
        apply(msg.content);
      }
    };
  }

  connect();
})();
