// ==UserScript==
// @name         utils4.2.7
// @namespace    oxword
// @version      4.3
// @description  Idcmr+time
// @author       oxword
// @match        https://wms.wbwh.tech/shk/status/history?shk=*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Oxword/myscripts/main/utils4.2.7.user.js
// ==/UserScript==

(function () {
    'use strict';

    const CAMERA_MAP = {
        '85': '438369', '86': '438366', '87': '459622', '88': '459626', '89': '438375', '90': '438374', '91': '433600',
        '92': '433594', '93': '433566', '94': '433596', '95': '433567', '96': '433589', '97': '459624', '98': '459620',
        '99': '433590', '100': '433571', '101': '433569', '102': '433586', '103': '433593', '104': '433568', '105': '433595',
        '106': '433572', '107': '433599', '108': '433585', '109': '459621', '110': '459627', '111': '433570', '112': '433592',
        '113': '438368', '114': '438367', '115': '438365', '116': '438364', '117': '459623', '118': '459625', '119': '433583',
        '120': '433581', '121': '433580', '122': '433588', '123': '433579', '124': '433582', '125': '459618', '126': '459616',
        '127': '433591', '128': '433578', '129': '433601', '130': '433577', '131': '433598', '132': '433576', '133': '433597',
        '134': '433575', '135': '433587', '136': '433574', '137': '459619', '138': '459617', '139': '433584', '140': '433573',
        '141': '438134', '142': '438135', '143': '453688', '144': '453684', '145': '438133', '146': '438132', '147': '438128',
        '148': '438129', '149': '438126', '150': '438127', '151': '438131', '152': '438130', '153': '453689', '154': '453685',
        '155': '438120', '156': '438119', '157': '438118', '158': '438121', '159': '438117', '160': '438124', '161': '438125',
        '162': '438114', '163': '453687', '164': '453686', '165': '438115', '166': '438116', '167': '438123', '168': '438122',
        '281': '460217', '282': '460218', '283': '460214', '284': '460216', '285': '460219', '286': '451910', '287': '460215',
        '288': '460213', '289': '444353', '290': '444354', '291': '444351', '292': '444352', '293': '444377', '294': '444378',
        '295': '460212', '296': '451912', '297': '444376', '298': '444375', '299': '444373', '300': '444374', '301': '444363',
        '302': '444364', '303': '444358', '304': '444362', '305': '451911', '306': '451913', '307': '444372', '210': '438109'
    };

    const BASE_URL = 'https://ryazanwhs-video.whs.wb.ru/player/';
    const DEFAULT_CAMERA_ID = '438123';

    function scan() {
        document.querySelectorAll('div.date-wrapper').forEach(wrapper => {
            const text = wrapper.textContent;

            const dateMatch = text.match(/\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}:\d{2}/);
            if (!dateMatch) return;

            const [d, m, y, H, M, S] = dateMatch[0].split(/\.|:|\s/).map(Number);
            const time = new Date(y, m - 1, d, H, M, S).getTime();
            if (isNaN(time)) return;

            const row = wrapper.closest('.history-item') || wrapper.parentElement.parentElement;
            const rowText = row?.textContent || '';

            const matchReceiving = rowText.match(/СтолПриемкиРЗТОБ2-(\d+)/);
            const matchPacking = rowText.match(/СтУпРЗТ2-(\d+)/);

            const tableNum = matchReceiving ? matchReceiving[1] :
                           matchPacking ? matchPacking[1] : null;

            if (!tableNum) return;

            const isPacking = !!matchPacking;
            const cameraId = CAMERA_MAP[tableNum] || DEFAULT_CAMERA_ID;
            const zone = isPacking ? 'упак' : 'приемка';

            const icon = wrapper.querySelector('mat-icon') ||
                         wrapper.querySelector('.mat-icon') ||
                         [...wrapper.children].find(el => el.textContent === 'edit');

            if (!icon) return;
            if (icon.nextSibling?.classList?.contains('video-btn')) return;

            const button = document.createElement('button');
            button.className = 'video-btn';
            button.textContent = '🎥';
            button.title = CAMERA_MAP[tableNum]
                ? `Видео: ${zone} ${tableNum}`
                : `Видео: ${tableNum} → камера по умолчанию`;
            button.style.cssText = 'margin-left:8px;cursor:pointer;background:none;border:none;font-size:18px;opacity:1;transition:opacity 0.2s';

            button.onmouseenter = () => button.style.opacity = '0.7';
            button.onmouseleave = () => button.style.opacity = '1';
            button.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const query = `${zone} ${tableNum}`;
                window.open(`${BASE_URL}${cameraId}?query=${encodeURIComponent(query)}&date=${time}`, 'videoTab');
            };

            icon.parentNode.insertBefore(button, icon.nextSibling);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scan);
    } else {
        setTimeout(scan, 1000);
    }

    new MutationObserver(() => setTimeout(scan, 800))
        .observe(document.body, { childList: true, subtree: true });

})();