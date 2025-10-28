
'use strict';

(function () {

    var $ = function (s) { return document.querySelector(s); };

    var longUrl = $('#longUrl');
    var alias = $('#alias');
    var formShorten = $('#form-shorten');
    var shortResult = $('#shortResult');
    var list = $('#links-list');
    var empty = $('#links-empty');

    var btnLogin = $('#btn-login');
    var btnLogout = $('#btn-logout');
    var dlgLogin = $('#dlg-login');
    var dlgRegister = $('#dlg-register');

    var linkOpenRegister = $('#link-open-register');
    var formLogin = $('#form-login');
    var formRegister = $('#form-register');
    var loginEmail = $('#login-email');
    var loginPass = $('#login-pass');
    var regEmail = $('#reg-email');
    var regPass = $('#reg-pass');
    var authError = $('#auth-error');
    var regError = $('#reg-error');

    var USE_AUTH = (window.__CONFIG__ && window.__CONFIG__.USE_AUTH) ? window.__CONFIG__.USE_AUTH : false;
    var API_BASE = (window.__CONFIG__ && window.__CONFIG__.API_BASE) ? window.__CONFIG__.API_BASE : '';

    function setAuthUI() {
        var token = localStorage.getItem('shorty_token');
        btnLogin.classList.toggle('hidden', !!token);
        btnLogout.classList.toggle('hidden', !token);
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                shortResult.textContent = 'Скопировано: ' + text;
            }).catch(function () {
                shortResult.textContent = 'Не удалось скопировать';
            });
        } else {
            var ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                shortResult.textContent = 'Скопировано: ' + text;
            } catch (e) {
                shortResult.textContent = 'Не удалось скопировать';
            }
            document.body.removeChild(ta);
        }
    }

    function renderLinks(items) {
        list.innerHTML = '';
        if (!items || items.length === 0) {
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        items.forEach(function (it) {
            var li = document.createElement('li');
            var shortUrl = API_BASE.replace(/\/+$/, '') + '/' + (it.alias || it.id);
            li.innerHTML =
                '<div class="row">' +
                '<strong>' + shortUrl + '</strong>' +
                '<button class="copy" data-copy="' + shortUrl + '">копировать</button>' +
                '</div>' +
                '<div class="muted">→ ' + it.longUrl + '</div>';
            list.appendChild(li);
        });

        Array.prototype.forEach.call(list.querySelectorAll('.copy'), function (b) {
            b.addEventListener('click', function (e) {
                var v = e.currentTarget.getAttribute('data-copy');
                copyToClipboard(v);
            });
        });
    }

    function getDemoLinks() {
        var raw = localStorage.getItem('shorty_demo_links');
        if (!raw) return [];
        try { return JSON.parse(raw) || []; } catch (e) { return []; }
    }

    function setDemoLinks(arr) {
        localStorage.setItem('shorty_demo_links', JSON.stringify(arr || []));
    }

    function ensureDemoStore() {
        if (!USE_AUTH && !localStorage.getItem('shorty_demo_links')) {
            setDemoLinks([]);
        }
    }

    function refreshLinks() {
        return new Promise(function (resolve) {
            if (USE_AUTH) {
                API.myLinks()
                    .then(function (data) { renderLinks(data); resolve(); })
                    .catch(function () { resolve(); });
            } else {
                var demo = getDemoLinks();
                renderLinks(demo);
                resolve();
            }
        });
    }


    formShorten.addEventListener('submit', function (e) {
        e.preventDefault();
        var payload = {
            longUrl: (longUrl.value || '').trim(),
            alias: (alias.value || '').trim() || undefined
        };
        if (!payload.longUrl) return;

        if (USE_AUTH) {
            API.createLink(payload)
                .then(function (created) {
                    var shortUrl = API_BASE.replace(/\/+$/, '') + '/' + (created.alias || created.id);
                    shortResult.textContent = shortUrl;
                    formShorten.reset();
                    return refreshLinks();
                })
                .catch(function (err) {
                    shortResult.textContent = 'Ошибка: ' + (err && err.message ? err.message : 'запрос не удался');
                });
        } else {
            var demo = getDemoLinks();
            var id = Math.random().toString(36).slice(2, 8);
            var entry = { id: id, alias: payload.alias, longUrl: payload.longUrl };
            demo.unshift(entry);
            setDemoLinks(demo);
            var shortUrl2 = API_BASE.replace(/\/+$/, '') + '/' + (entry.alias || entry.id);
            shortResult.textContent = shortUrl2;
            formShorten.reset();
            refreshLinks();
        }
    });

    btnLogin.addEventListener('click', function () {
        if (dlgLogin && typeof dlgLogin.showModal === 'function') {
            dlgLogin.showModal();
        } else {
            alert('Диалог не поддерживается этим браузером. Включите USE_AUTH=false или обновите браузер.');
        }
    });

    btnLogout.addEventListener('click', function () {
        localStorage.removeItem('shorty_token');
        setAuthUI();
    });

    linkOpenRegister.addEventListener('click', function (e) {
        e.preventDefault();
        if (dlgLogin) dlgLogin.close();
        if (dlgRegister && typeof dlgRegister.showModal === 'function') {
            dlgRegister.showModal();
        }
    });

    formLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        authError.classList.add('hidden');

        if (USE_AUTH) {
            API.login(loginEmail.value, loginPass.value)
                .then(function (res) {
                    var token = (res && (res.token || res.accessToken || res.jwt)) ? (res.token || res.accessToken || res.jwt) : '';
                    if (token) localStorage.setItem('shorty_token', token);
                    setAuthUI();
                    if (dlgLogin) dlgLogin.close();
                    return refreshLinks();
                })
                .catch(function (err) {
                    authError.textContent = (err && err.message) ? err.message : 'Ошибка авторизации';
                    authError.classList.remove('hidden');
                });
        } else {
            localStorage.setItem('shorty_token', 'demo-token');
            setAuthUI();
            if (dlgLogin) dlgLogin.close();
            refreshLinks();
        }
    });

    formRegister.addEventListener('submit', function (e) {
        e.preventDefault();
        regError.classList.add('hidden');

        if (USE_AUTH) {
            API.register(regEmail.value, regPass.value)
                .then(function () {
                    if (dlgRegister) dlgRegister.close();
                    if (dlgLogin && typeof dlgLogin.showModal === 'function') dlgLogin.showModal();
                })
                .catch(function (err) {
                    regError.textContent = (err && err.message) ? err.message : 'Ошибка регистрации';
                    regError.classList.remove('hidden');
                });
        } else {
            // В демо-режиме просто закрываем
            if (dlgRegister) dlgRegister.close();
            if (dlgLogin && typeof dlgLogin.showModal === 'function') dlgLogin.showModal();
        }
    });

    ensureDemoStore();
    setAuthUI();
    refreshLinks();


    if (typeof API !== 'undefined' && API.health) {
        API.health().then(function (h) {
            console.log('Health:', h);
        }).catch(function () { /* ignore */ });
    }
})();
