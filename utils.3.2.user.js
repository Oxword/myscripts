// ==UserScript==
// @name         utils.3.2
// @namespace    http://tampermonkey.net/
// @version      3.2
// @author       oxword
// @description  mx+vin
// @match        *://*/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Oxword/myscripts/main/utils.3.2.user.js
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const mxPattern = /[А-Я0-9]{2,}\.\d{2}\.\d{2}\.\d{1,3}\.\d{2}\.\d{2}/;

    const fixMX = code => code.replace(/^Р3Т/, 'РЗТ').replace(/^П3Т/, 'ПЗТ').replace(/^К3Г/, 'КЗГ');

    function processRow(tr) {
        const mxCell = tr.querySelector('td.cdk-column-place_name');
        if (!mxCell || mxCell.dataset.mxEnhanced) return;

        const text = mxCell.textContent.trim().replace(/\s+/g, '');
        const match = text.match(mxPattern);
        if (!match) return;

        const code = fixMX(match[0]);

        makeClickable(mxCell, code, '#a8e6cf');

        const idCell = tr.querySelector('td.cdk-column-state_employee_id');
        if (idCell && !idCell.dataset.idButton && /^\d+$/.test(idCell.textContent.trim())) {
            addCopyButton(idCell, idCell.textContent.trim(), '💾');
        }
    }

    function makeClickable(el, text, bgColor) {
        el.style.cursor = 'pointer';
        el.style.userSelect = 'none';
        el.style.transition = 'transform .1s ease, background-color .2s ease';

        el.addEventListener('mousedown', e => {
            e.preventDefault();
            el.style.transform = 'scale(0.95)';
            el.style.cursor = 'grabbing';
        });

        ['mouseup', 'mouseleave'].forEach(evt => {
            el.addEventListener(evt, () => {
                el.style.transform = 'scale(1)';
                el.style.cursor = 'pointer';
            });
        });

        el.addEventListener('click', () => {
            navigator.clipboard.writeText(text).then(() => {
                const originalBg = el.style.backgroundColor;
                el.style.backgroundColor = bgColor;
                setTimeout(() => el.style.backgroundColor = originalBg, 200);
            }).catch(console.warn);

            el.dataset.mxEnhanced = 'true';
        });
    }

    function addCopyButton(parent, text, icon) {
    const btn = document.createElement('button');
    btn.textContent = icon;
    Object.assign(btn.style, {
        marginLeft: '5px',
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
        padding: '2px 5px',
        borderRadius: '3px',
        fontSize: '13px',
        outline: 'none',
        transition: 'transform 0.1s ease, background-color 0.2s ease'
    });

    let isCopying = false;

    btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (isCopying) return;
        isCopying = true;

        btn.style.transform = 'scale(0.85)';
        btn.style.backgroundColor = '#a8e6cf';

        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.warn('Копирование не удалось:', err);
        }

        setTimeout(() => {
            btn.style.transform = 'scale(1)';
            btn.style.backgroundColor = 'transparent';
            isCopying = false;
        }, 200);
    });

    parent.appendChild(btn);
    parent.dataset.idButton = 'true';
}
    // === НОВОЕ ===
    function processDateRow(tr) {
    const dateCell = tr.querySelector('td.mat-mdc-cell[colspan="9"]');
    if (!dateCell || dateCell.dataset.dateButton) return;

    const dateText = dateCell.textContent.trim();
    if (!/\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}/.test(dateText)) return;

    const btn = document.createElement('button');
    btn.textContent = '💾';
    Object.assign(btn.style, {
        marginLeft: '5px',
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
        padding: '2px 5px',
        borderRadius: '3px',
        fontSize: '13px',
        outline: 'none',
        transition: 'transform 0.1s ease, background-color 0.2s ease'
    });

    let isCopying = false;

    btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (isCopying) return;
        isCopying = true;

        btn.style.transform = 'scale(0.85)';
        btn.style.backgroundColor = '#a8e6cf';

        try {
            await navigator.clipboard.writeText(dateText);
        } catch (err) {
            console.warn('Не удалось скопировать дату:', err);
        }

        setTimeout(() => {
            btn.style.transform = 'scale(1)';
            btn.style.backgroundColor = 'transparent';
            isCopying = false;
        }, 200);
    });

    dateCell.appendChild(btn);
    dateCell.dataset.dateButton = 'true';
}

    function scan() {
        document.querySelectorAll('tr.mat-mdc-row').forEach(processRow);

        document.querySelectorAll('tr.mat-mdc-row.detail-row').forEach(processDateRow);
    }

    const container = document.querySelector('div.scroll-box') || document.body;
    new MutationObserver(scan).observe(container, { childList: true, subtree: true });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scan);
    } else {
        scan();
    }

})();