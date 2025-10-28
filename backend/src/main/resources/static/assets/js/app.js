'use strict';

(function () {
    const $ = (s) => document.querySelector(s);

    const longUrl = $('#longUrl');
    const alias = $('#alias');
    const formShorten = $('#form-shorten');
    const shortResult = $('#shortResult');
    const list = $('#links-list');
    const empty = $('#links-empty');

    const btnLogin = $('#btn-login');
    const btnLogout = $('#btn-logout');
    const dlgLogin = $('#dlg-login');
    const dlgRegister = $('#dlg-register');

    const linkOpenRegister = $('#link-open-register');
    const formLogin = $('#form-login');
    const formRegister = $('#form-register');
    const loginEmail = $('#login-email');
    const loginPass = $('#login-pass');
    const regEmail = $('#reg-email');
    const regPass = $('#reg-pass');
    const authError = $('#auth-error');
    const regError = $('#reg-error');

    const USE_AUTH = !!(window.__CONFIG__ && window.__CONFIG__.USE_AUTH);
    const API_BASE = (window.__CONFIG__ && window.__CONFIG__.API_BASE) || '';

    function setAuthUI() {
        const token = localStorage.getItem('shorty_token');
        btnLogin.classList.toggle('hidden', !!token);
        btnLogout.classList.toggle('hidden', !token);
    }

    function copyToClipboard(text) {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text).then(
                ()=> shortResult.textContent = 'Скопировано: ' + text,
                ()=> shortResult.textContent = 'Не удалось скопировать'
            );
        } else {
            const ta = document.createElement('textarea');
            ta.value = text; document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); shortResult.textContent = 'Скопировано: ' + text; }
            catch { shortResult.textContent = 'Не удалось скопировать'; }
            document.body.removeChild(ta);
        }
    }

    function renderLinks(items) {
        list.innerHTML = '';
        if (!items || items.length === 0) { empty.classList.remove('hidden'); return; }
        empty.classList.add('hidden');

        items.forEach((it) => {
            const li = document.createElement('li');
            const shortUrl = (it.shortUrl ? (API_BASE.replace(/\/+$/,'') + it.shortUrl)
                : (API_BASE.replace(/\/+$/,'') + '/r/' + (it.slug || it.id)));
            li.innerHTML =
                '<div class="row">' +
                '<strong>' + shortUrl + '</strong>' +
                '<button class="copy" data-copy="' + shortUrl + '">копировать</button>' +
                '</div>' +
                '<div class="muted">→ ' + (it.targetUrl || it.longUrl) + '</div>';
            list.appendChild(li);
        });

        list.querySelectorAll('.copy').forEach((b) => {
            b.addEventListener('click', (e) => copyToClipboard(e.currentTarget.getAttribute('data-copy')));
        });
    }

    // демо-хранилище
    const getDemo = () => JSON.parse(localStorage.getItem('shorty_demo_links') || '[]');
    const setDemo = (arr)=> localStorage.setItem('shorty_demo_links', JSON.stringify(arr||[]));
    if (!USE_AUTH && !localStorage.getItem('shorty_demo_links')) setDemo([]);

    function refreshLinks() {
        return new Promise((resolve) => {
            if (USE_AUTH) {
                API.links.mine().then((data)=>{ renderLinks(data); resolve(); }).catch(()=> resolve());
            } else { renderLinks(getDemo()); resolve(); }
        });
    }

    formShorten.addEventListener('submit', (e) => {
        e.preventDefault();
        const long = (longUrl.value || '').trim();
        const slug = (alias.value || '').trim();
        if (!long) return;

        if (USE_AUTH) {
            const payload = { targetUrl: long, customSlug: slug || null, expiresAt: null, maxClicks: null };
            API.links.create(payload).then((created) => {
                const shortUrl = (created.shortUrl ? (API_BASE.replace(/\/+$/,'') + created.shortUrl)
                    : (API_BASE.replace(/\/+$/,'') + '/r/' + (created.slug || created.id)));
                shortResult.textContent = shortUrl;
                formShorten.reset();
                return refreshLinks();
            }).catch((err)=>{
                shortResult.textContent = 'Ошибка: ' + (err?.message || 'запрос не удался');
            });
        } else {
            const demo = getDemo();
            const id = Math.random().toString(36).slice(2,8);
            const entry = { id, slug, targetUrl: long };
            demo.unshift(entry); setDemo(demo);
            const shortUrl = API_BASE.replace(/\/+$/,'') + '/' + (slug || id);
            shortResult.textContent = shortUrl;
            formShorten.reset();
            refreshLinks();
        }
    });

    btnLogin.addEventListener('click', () => dlgLogin?.showModal?.() ?? alert('Диалог не поддерживается браузером.'));
    btnLogout.addEventListener('click', () => { localStorage.removeItem('shorty_token'); setAuthUI(); });

    linkOpenRegister.addEventListener('click', (e) => {
        e.preventDefault(); dlgLogin?.close?.(); dlgRegister?.showModal?.();
    });

    formLogin.addEventListener('submit', (e)=>{
        e.preventDefault(); authError.classList.add('hidden');
        if (USE_AUTH) {
            API.login(loginEmail.value, loginPass.value).then((res)=>{
                const token = res?.token || res?.accessToken || res?.jwt || '';
                if (token) localStorage.setItem('shorty_token', token);
                setAuthUI(); dlgLogin?.close?.(); return refreshLinks();
            }).catch((err)=>{
                authError.textContent = err?.message || 'Ошибка авторизации';
                authError.classList.remove('hidden');
            });
        } else {
            localStorage.setItem('shorty_token', 'demo-token');
            setAuthUI(); dlgLogin?.close?.(); refreshLinks();
        }
    });

    formRegister.addEventListener('submit', (e)=>{
        e.preventDefault(); regError.classList.add('hidden');
        if (USE_AUTH) {
            API.register(regEmail.value, regPass.value).then(()=>{
                dlgRegister?.close?.(); dlgLogin?.showModal?.();
            }).catch((err)=>{
                regError.textContent = err?.message || 'Ошибка регистрации';
                regError.classList.remove('hidden');
            });
        } else {
            dlgRegister?.close?.(); dlgLogin?.showModal?.();
        }
    });

    setAuthUI();
    refreshLinks();

    API.health?.().then(h=>console.log('Health:', h)).catch(()=>{});
})();
