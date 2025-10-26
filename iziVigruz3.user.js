// ==UserScript==
// @name         iziVigruz3
// @match        https://wms.wbwh.tech/layout/tasks-by-layout-goods-cancellation-report
// @grant        GM_setClipboard
// @author       Oxword
// @updateURL    https://raw.githubusercontent.com/Oxword/myscripts/main/iziVigruz3.user.js
// ==/UserScript==

(function () {
  'use strict';

  let btn = document.createElement('button');
  btn.textContent = '📋';
  btn.style.position = 'fixed';
  btn.style.top = '150px';
  btn.style.right = '10px';
  btn.style.zIndex = '10000';
  btn.style.padding = '10px 16px';
  btn.style.fontSize = '14px';
  btn.style.backgroundColor = '#4CAF50';
  btn.style.color = 'white';
  btn.style.border = 'none';
  btn.style.borderRadius = '6px';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';

  btn.onmouseenter = function () {
    btn.style.backgroundColor = '#45a049';
  };

  btn.onmouseleave = function () {
    btn.style.backgroundColor = '#4CAF50';
  };

  document.body.appendChild(btn);

  btn.onclick = async function () {
    let originalText = btn.textContent;

    let mainRows = Array.from(document.querySelectorAll('mat-row.mat-mdc-row[role="row"]:not(.detail-row)'));
    let closedRows = mainRows.filter(function (row) {
      let next = row.nextElementSibling;
      while (next && next.nodeType !== 1) {
        next = next.nextElementSibling;
      }
      return !next || !next.matches('app-items-template');
    });

    if (closedRows.length > 0) {
      btn.textContent = '⏳ Открываем...';
      btn.style.backgroundColor = '#FF9800';

      closedRows.forEach(function (row) {
        row.scrollIntoView({ block: 'center', behavior: 'instant' });
        row.click();
      });

      await new Promise(function (resolve) {
        setTimeout(resolve, 500);
      });
    }

    let lines = [];
    let allRows = Array.from(document.querySelectorAll('mat-row.mat-mdc-row[role="row"]:not(.detail-row)'));

    for (let mainRow of allRows) {
      let tareId = '';
      let dtClean = '';
      let qty = 1;

      let cells = mainRow.querySelectorAll('mat-cell, .cdk-cell');
      for (let cell of cells) {
        let cls = cell.className;
        if (cls.includes('cdk-column-tare_id')) {
          tareId = cell.innerText.trim().split(/\s+/)[0] || '';
        } else if (cls.includes('cdk-column-dt_clean')) {
          dtClean = cell.innerText.trim();
        } else if (cls.includes('cdk-column-qty_shk')) {
          qty = parseInt(cell.innerText) || 1;
        }
      }

      if (!tareId) continue;

      let next = mainRow.nextElementSibling;
      while (next && next.nodeType !== 1) {
        next = next.nextElementSibling;
      }

      let items = [];
      let price = '';

      if (next && next.matches('app-items-template')) {
        let itemRows = next.querySelectorAll('mat-row[role="row"]');
        for (let itemRow of itemRows) {
          let shk = '';
          let sticker = '';

          let itemCells = itemRow.querySelectorAll('mat-cell, .cdk-cell');
          for (let cell of itemCells) {
            let cls = cell.className;
            if (cls.includes('cdk-column-shk_id')) {
              shk = cell.innerText.trim().split(/\s+/)[0] || '';
            } else if (cls.includes('cdk-column-wbsticker_id')) {
              sticker = cell.innerText.trim().split(/\s+/)[0] || '';
            } else if (cls.includes('cdk-column-price')) {
              let cleanPrice = cell.innerText.replace(/[^\d,]/g, '').replace(',', '.');
              if (cleanPrice) price = cleanPrice;
            }
          }
          items.push({ shk: shk, sticker: sticker });
        }
      }

      if (items.length === 0) {
        items.push({ shk: '', sticker: '' });
      }

      for (let item of items) {
        lines.push('\t\t' + tareId + '\t' + dtClean + '\t' + item.shk + '\t' + item.sticker + '\t' + price);
      }
    }

    GM_setClipboard(lines.join('\n'), 'text/plain');

    btn.textContent = '✅ Скопировано';
    btn.style.backgroundColor = '#2E7D32';

    setTimeout(function () {
      btn.textContent = originalText;
      btn.style.backgroundColor = '#4CAF50';
    }, 500);
  };
})();