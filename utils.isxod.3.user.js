// ==UserScript==
// @name         utils.isxod.3
// @namespace    http://tampermonkey.net/
// @version      3
// @description  sborka
// @author       Oxword
// @match        https://wms.wbwh.tech/shk/status/history?shk=*
// @grant        GM_setClipboard
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/Oxword/myscripts/main/utils.isxod.3.user.js
// ==/UserScript==

(function () {
    'use strict';

    let btn;
    let shown = false;

    const phrases = ['собран на потоковой сборке', 'сборка упакованного товара'];
    const statuses = new Set(['WMI', 'UDG', 'SAS', 'SAP', 'SPS']);

    function notify() {
        if (shown) return;

        const el = document.createElement('div');
        el.textContent = '✅ ЕСТЬ ДВИЖ!';
        el.style.cssText = `
            position: fixed;
            top: 100px;
            right: 300px;
            background: #4CAF50;
            color: white;
            padding: 30px 40px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 17px;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(el);
        shown = true;

        setTimeout(() => {
            if (el.parentNode) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(-10px)';
                setTimeout(() => el.remove(), 300);
            }
        }, 2000);
    }

    function check() {
        if (shown) return;

        const rows = Array.from(document.querySelectorAll('tr.mat-mdc-row'));
        if (!rows.length) return;

        let lastMatch = -1;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const descr = row.querySelector('.cdk-column-state_descr');
            if (!descr) continue;

            const text = descr.textContent.trim().toLowerCase();
            const hasPhrase = phrases.some(p => text.includes(p));
            if (!hasPhrase) continue;

            const icon = row.querySelector('mat-icon');
            if (!icon || icon.textContent.trim() !== 'edit') continue;

            lastMatch = i;
        }

        if (lastMatch === -1) return;

        let found = false;
        for (let i = lastMatch + 1; i < rows.length; i++) {
            const cell = rows[i].querySelector('.cdk-column-state_id');
            if (!cell) continue;
            const status = cell.textContent.trim().replace(/\s+/g, '');
            if (statuses.has(status)) {
                found = true;
                break;
            }
        }

        if (found) notify();
    }

    let tries = 0;
    const maxTries = 30;
    const tryCheck = () => {
        if (shown) return;
        if (document.querySelectorAll('tr.mat-mdc-row').length > 0) {
            check();
        } else if (tries < maxTries) {
            tries++;
            setTimeout(tryCheck, 100);
        }
    };
    setTimeout(tryCheck, 300);

    const mxPattern = /[А-Я0-9]{2,}\.\d{2}\.\d{2}\.\d{1,3}\.\d{2}\.\d{2}/;
    const fixMX = code => code
        .replace(/^Р3Т/, 'РЗТ')
        .replace(/^П3Т/, 'ПЗТ')
        .replace(/^К3Г/, 'КЗГ');

    function spin() {
        if (btn) {
            btn.textContent = '🔄';
            setTimeout(() => {
                if (btn) btn.textContent = '📋';
            }, 1000);
        }
    }

    function grabLast() {
        spin();

        let rows = document.querySelectorAll('tr.mat-mdc-row');
        let result = null;

        for (let row of rows) {
            let place = row.querySelector('.cdk-column-place_name');
            let id = row.querySelector('.cdk-column-wbsticker_id');

            if (place && id) {
                let idText = id.textContent.trim();
                if (!/^\d+$/.test(idText)) continue;

                let text = place.textContent.trim().replace(/\s+/g, '');
                let match = text.match(mxPattern);
                if (!match) continue;

                let fixedCode = fixMX(match[0]);
                result = `${idText}\t${fixedCode}`;
            }
        }

        if (!result) return;

        if (typeof GM_setClipboard === 'function') {
            GM_setClipboard(result, 'text');
        } else {
            navigator.clipboard.writeText(result).catch(() => {});
        }
    }

    function makeBtn() {
        btn = document.createElement('button');
        btn.textContent = '📋';
        btn.style.cssText = `
            position: fixed;
            top: 100px;
            right: 10px;
            z-index: 9999;
            padding: 10px 14px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 18px;
            font-family: sans-serif;
        `;

        btn.addEventListener('click', grabLast);
        document.body.appendChild(btn);
    }

    document.addEventListener('mousedown', e => {
        if (e.button === 3) {
            e.preventDefault();
            grabLast();
        }
    });

    document.addEventListener('keydown', e => {
        if (e.code === 'Numpad2') {
            e.preventDefault();
            grabLast();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', makeBtn);
    } else {
        makeBtn();
    }
})();