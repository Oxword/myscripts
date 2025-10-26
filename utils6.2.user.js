// ==UserScript==
// @name         utils6.2
// @namespace    http://tampermonkey.net/
// @version      2.1
// @author       oxword
// @match        https://band.wb.ru/*
// @icon         image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @updateURL    https://raw.githubusercontent.com/Oxword/myscripts/main/utils6.2.user.js
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let observer; // Переменная для хранения экземпляра
    let currentUrl = window.location.href; 

    
    function insertTextIntoTextarea(text) {
        const textbox = document.getElementById('post_textbox');
        if (textbox) {
            const start = textbox.selectionStart;
            const end = textbox.selectionEnd;
            const scrollTop = textbox.scrollTop;

            textbox.value = textbox.value.substring(0, start) + text + textbox.value.substring(end);
            textbox.selectionStart = textbox.selectionEnd = start + text.length;
            textbox.focus();
            textbox.scrollTop = scrollTop;

            // Триггер для React
            const event = new Event('input', { bubbles: true });
            textbox.dispatchEvent(event);
             console.log('[Band Шаблон] Текст вставлен.');
        } else {
            console.warn('[Band Шаблон] Поле ввода (#post_textbox) не найдено');
        }
    }

    function addEmojiButton() {
        if (document.getElementById('customEmojiTemplateButton')) {
            return true; // всё ок
        }

        // Ищем контейнер с значком информации (i)
        const infoContainer = document.querySelector('.flex-child');
        if (!infoContainer) {
            console.log('[Band Шаблон] Контейнер с значком (i) не найден.');
            return false;
        }

        const customContainer = document.createElement('div');
        customContainer.style.cssText = `
            display: inline-flex !important;
            align-items: center !important;
            margin-left: 8px !important; /* Отступ слева */
            border-radius: 4px !important; /* Скругление */
            transition: all 0.2s ease !important; /* Анимация */
        `;
        customContainer.id = 'customEmojiContainer'; // Для отслеживания

        // Создаем кнопку
        const button = document.createElement('button');
        button.id = 'customEmojiTemplateButton';
        button.style.cssText = `
            background: none !important;
            border: none !important;
            padding: 0 !important;
            font-size: 18px !important;
            cursor: pointer !important;
            color: inherit !important;
            flex-shrink: 0 !important;
            transition: all 0.2s ease !important;
        `;
        button.type = 'button';
        button.title = 'Вставить шаблон обращения 💬';
        button.textContent = '💬'; // Эмодзи сообщение

        // Обработчик клика
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Band Шаблон] Кнопка 💬 нажата.');
            // Всегда используем "Рязань Тюшевское"
            const templateText = `Обращение от Рязань Тюшевское
Просьба проверить корректность обработки и вложения
Если всё верно, предоставьте, пожалуйста, скриншот вида товара для дальнейшего поиска с нашей стороны

ШК

тара
пример `; // Обратите внимание на пробел после "тара"
            insertTextIntoTextarea(templateText);
        });

        // Вставляем кнопку в свой контейнер
        customContainer.appendChild(button);

        // Вставляем новый контейнер после существующего контейнера с i
        infoContainer.parentNode.insertBefore(customContainer, infoContainer.nextSibling);

        console.log(`[Band Шаблон] Контейнер с кнопкой 💬 успешно добавлен.`);
        return true; // Кнопка успешно добавлена
    }

    // Функция для запуска или перезапуска наблюдателя
    function startOrRestartObserving() {
        // Останавливаем предыдущий наблюдатель, если он был
        if (observer) {
            observer.disconnect();
             console.log('[Band Шаблон] Предыдущий MutationObserver отключен.');
        }

        // Выбираем самый общий контейнер для наблюдения - body
        const targetNode = document.body;
        if (!targetNode) {
            console.error('[Band Шаблон] document.body не найден для наблюдения.');
            return;
        }

        console.log('[Band Шаблон] Запуск MutationObserver на document.body');

        // Создаем новый экземпляр MutationObserver
        observer = new MutationObserver(function(mutationsList) {
            // Оптимизация: проверяем только основные типы изменений
            for(let mutation of mutationsList) {
                if (mutation.type === 'childList' && (mutation.addedNodes.length > 0)) {
                    // Если добавились новые элементы, есть шанс, что появился заголовок канала
                    // Пытаемся добавить кнопку
                    if (addEmojiButton()) {
                        break; // Выходим из цикла после первой успешной попытки
                    }
                }
            }
        });

        // Начинаем наблюдение за изменениями
        try {
            observer.observe(targetNode, {
                childList: true,      // Наблюдаем за добавлением/удалением дочерних элементов
                subtree: true,        // Наблюдаем за всем поддеревом элемента
            });
            console.log('[Band Шаблон] MutationObserver успешно запущен.');
        } catch (e) {
            console.error('[Band Шаблон] Ошибка при запуске MutationObserver:', e);
        }
    }

    // Функция для проверки изменения URL и перезапуска наблюдателя при необходимости
    function checkForUrlChange() {
        const newUrl = window.location.href;
        if (currentUrl !== newUrl) {
            console.log(`[Band Шаблон] URL изменился с "${currentUrl}" на "${newUrl}". Перезапуск наблюдателя.`);
            currentUrl = newUrl;
            // Небольшая задержка для того, чтобы DOM успел частично обновиться
            setTimeout(startOrRestartObserving, 500);
            // И дополнительный запуск через 1.5 секунды на случай медленной загрузки
            setTimeout(addEmojiButton, 1500);
            setTimeout(addEmojiButton, 3000);
        }
    }

    // --- Основная логика запуска ---
    console.log('[Band Шаблон] Скрипт запущен.');

    // 1. Запускаем наблюдатель при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startOrRestartObserving);
    } else {
        startOrRestartObserving();
    }

    // 2. Запускаем наблюдатель при полной загрузке страницы
    window.addEventListener('load', () => {
        console.log('[Band Шаблон] Window load event.');
        setTimeout(startOrRestartObserving, 500);
        setTimeout(addEmojiButton, 1500);
        setTimeout(addEmojiButton, 3000);
    });

    // 3. Отслеживаем изменение URL (для SPA навигации)
    setInterval(checkForUrlChange, 1000); // Проверяем каждую секунду

    // Также можно попробовать отследить pushState/replaceState, если они используются
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function() {
        originalPushState.apply(this, arguments);
        console.log('[Band Шаблон] history.pushState вызван.');
        setTimeout(startOrRestartObserving, 500);
        setTimeout(addEmojiButton, 1500);
    };

    history.replaceState = function() {
        originalReplaceState.apply(this, arguments);
        console.log('[Band Шаблон] history.replaceState вызван.');
        setTimeout(startOrRestartObserving, 500);
        setTimeout(addEmojiButton, 1500);
    };

})();