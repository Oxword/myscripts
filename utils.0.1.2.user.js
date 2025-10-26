// ==UserScript==
// @name         utils.0.1.2
// @match        https://docs.google.com/spreadsheets/*
// @description  for analyzV3
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Oxword/myscripts/main/utils.0.1.2.user.js
// ==/UserScript==

(function () {
    'use strict';

    const btn = document.createElement('div');
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        width: 140px;
        height: 27px;
        border-radius: 14px;
        z-index: 10000;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        user-select: none;
        transition: transform 0.1s ease;
        cursor: pointer;
    `;

    const pos = JSON.parse(localStorage.getItem('analyz_wms_pos') || '{}');
    if (pos.left && pos.top) {
        btn.style.left = pos.left + 'px';
        btn.style.top = pos.top + 'px';
        btn.style.bottom = '';
        btn.style.right = '';
    }

    function createPart(text, color) {
        const part = document.createElement('div');
        part.textContent = text;
        part.style.cssText = `
            flex: 1;
            background: ${color};
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
        `;
        if (text === 'WMS') part.style.borderRadius = '14px 0 0 14px';
        if (text === 'TAR') part.style.borderRadius = '0 14px 14px 0';
        return part;
    }

    const wms = createPart('WMS', '#cd00cd');
    const prf = createPart('PRF', '#5c5c8a');
    const tar = createPart('TAR', '#29b6b0');

    btn.appendChild(wms);
    btn.appendChild(prf);
    btn.appendChild(tar);
    document.body.appendChild(btn);

    let drag = false;
    let offsetX, offsetY;
    let startX, startY;
    let activePart = null;

    btn.onmousedown = e => {
        drag = false;
        startX = e.clientX;
        startY = e.clientY;
        offsetX = e.clientX - btn.offsetLeft;
        offsetY = e.clientY - btn.offsetTop;
        activePart = e.target;
        btn.style.transform = 'scale(0.96)';
        document.onmousemove = move;
        document.onmouseup = up;
        e.preventDefault();
    };

    function move(e) {
        if (!drag && (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3)) {
            drag = true;
        }
        if (drag) {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            btn.style.left = x + 'px';
            btn.style.top = y + 'px';
            btn.style.bottom = '';
            btn.style.right = '';
            localStorage.setItem('analyz_wms_pos', JSON.stringify({ left: x, top: y }));
        }
    }

    function up() {
        document.onmousemove = null;
        document.onmouseup = null;
        btn.style.transform = '';
        if (!drag) {
            if (activePart === wms) openWMS();
            if (activePart === prf) openPRF();
            if (activePart === tar) openTAR();
        }
        drag = false;
    }

    function getNum() {
        const cell = document.querySelector('.cell-input');
        const text = cell?.textContent.trim();
        return text?.replace(/\D/g, '') || null;
    }

    function openWMS() {
        const num = getNum();
        if (num) window.open(`https://wms.wbwh.tech/shk/status/history?shk=${num}`, 'VideoTab');
        else alert('❌ В ячейке нет шк или стикера');
    }

    function openPRF() {
        window.open('https://wms.wbwh.tech/hr/employee-card', 'PRFTab');
    }

    function openTAR() {
        const num = getNum();
        if (num) window.open(`https://wms.wbwh.tech/acceptance/card-tara?tare_type=CON&tare_id=${num}&office_id=301760`, 'TARTab');
        else alert('❌ В ячейке нет тары');
    }
})();