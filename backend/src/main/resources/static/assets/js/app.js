'use strict';

(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    const longUrl      = $('#longUrl');
    const alias        = $('#alias');
    const formShorten  = $('#form-shorten');
    const shortResult  = $('#shortResult');

    const list         = $('#links-list');
    const empty        = $('#links-empty');
    const linksCount   = $('#links-count');

    const btnLogin     = $('#btn-login');
    const btnLogout    = $('#btn-logout');

    const dlgLogin     = $('#dlg-login');
    const dlgRegister  = $('#dlg-register');
    const backdrop     = $('#modal-backdrop');

    const linkOpenRegister = $('#link-open-register');

    const formLogin    = $('#form-login');
    const formRegister = $('#form-register');
    const loginEmail   = $('#login-email');
    const loginPass    = $('#login-pass');
    const regEmail     = $('#reg-email');
    const regPass      = $('#reg-pass');
    const authError    = $('#auth-error');
    const regError     = $('#reg-error');

    const USE_AUTH = !!(window.__CONFIG__ && window.__CONFIG__.USE_AUTH);
    const API_BASE = (window.__CONFIG__ && window.__CONFIG__.API_BASE) || '';

    function setAuthUI() {
        const token = localStorage.getItem('shorty_token');
        if (btnLogin)  btnLogin.classList.toggle('hidden', !!token);
        if (btnLogout) btnLogout.classList.toggle('hidden', !token);
    }

    function openDialog(dlg) {
        if (!dlg) return;
        if (typeof dlg.showModal === 'function') dlg.showModal();
        else { dlg.setAttribute('open', ''); backdrop && backdrop.classList.remove('hidden'); }
    }

    function closeDialog(dlg) {
        if (!dlg) return;
        if (typeof dlg.close === 'function') dlg.close();
        else { dlg.removeAttribute('open'); backdrop && backdrop.classList.add('hidden'); }
    }

    function copyToClipboard(text) {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => shortResult && (shortResult.textContent = 'Скопировано: ' + text))
                .catch(() => shortResult && (shortResult.textContent = 'Не удалось скопировать'));
            return;
        }
        // fallback
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); shortResult && (shortResult.textContent = 'Скопировано: ' + text); }
        catch { shortResult && (shortResult.textContent = 'Не удалось скопировать'); }
        document.body.removeChild(ta);
    }

    function renderLinks(items) {
        if (!list) return;
        list.innerHTML = '';

        const arr = Array.isArray(items) ? items : (items?.items || []);
        if (arr.length === 0) {
            empty && empty.classList.remove('hidden');
            if (linksCount) linksCount.textContent = '(0)';
            return;
        }
        empty && empty.classList.add('hidden');
        if (linksCount) linksCount.textContent = `(${arr.length})`;

        arr.forEach((it) => {
            const li = document.createElement('li');

            const shortUrl = it.shortUrl
                ? (API_BASE.replace(/\/+$/, '') + it.shortUrl)
                : (API_BASE.replace(/\/+$/, '') + '/r/' + (it.slug || it.id));

            li.innerHTML =
                '<div class="row">' +
                '<strong>' + shortUrl + '</strong>' +
                '<button class="copy" data-copy="' + shortUrl + '">копировать</button>' +
                '</div>' +
                '<div class="muted">→ ' + (it.targetUrl || it.longUrl || '') + '</div>';

            list.appendChild(li);
        });

        $$('.copy', list).forEach((b) =>
            b.addEventListener('click', (e) => copyToClipboard(e.currentTarget.getAttribute('data-copy')))
        );
    }

    function applyItems(items) {
        const arr = Array.isArray(items) ? items : (items?.items || []);
        renderLinks(arr);
        if (linksCount) linksCount.textContent = `(${arr.length})`;
    }

    const getDemo = () => JSON.parse(localStorage.getItem('shorty_demo_links') || '[]');
    const setDemo = (arr)=> localStorage.setItem('shorty_demo_links', JSON.stringify(arr || []));
    if (!USE_AUTH && !localStorage.getItem('shorty_demo_links')) setDemo([]);

    function refreshLinks() {
        return new Promise((resolve) => {
            if (USE_AUTH) {
                API.links.mine()
                    .then((data) => { applyItems(data); resolve(); })
                    .catch(()    => { applyItems([]);  resolve(); });
            } else {
                applyItems(getDemo());
                resolve();
            }
        });
    }

    if (formShorten) {
        formShorten.addEventListener('submit', (e) => {
            e.preventDefault();
            const long = (longUrl?.value || '').trim();
            const slug = (alias?.value || '').trim();
            if (!long) return;

            if (USE_AUTH) {
                const payload = { targetUrl: long, customSlug: slug || null, expiresAt: null, maxClicks: null };
                API.links.create(payload).then((created) => {
                    const shortUrl = created.shortUrl
                        ? (API_BASE.replace(/\/+$/, '') + created.shortUrl)
                        : (API_BASE.replace(/\/+$/, '') + '/r/' + (created.slug || created.id));

                    if (shortResult) shortResult.textContent = shortUrl;
                    formShorten.reset();
                    return refreshLinks();
                }).catch((err) => {
                    if (shortResult) shortResult.textContent = 'Ошибка: ' + (err?.message || 'запрос не удался');
                });
            } else {
                const demo = getDemo();
                const id = Math.random().toString(36).slice(2, 8);
                const entry = { id, slug, targetUrl: long };
                demo.unshift(entry); setDemo(demo);

                const shortUrl = API_BASE.replace(/\/+$/, '') + '/' + (slug || id);
                if (shortResult) shortResult.textContent = shortUrl;
                formShorten.reset();
                refreshLinks();
            }
        });
    }

    btnLogin?.addEventListener('click', () => openDialog(dlgLogin));

    btnLogout?.addEventListener('click', () => {
        localStorage.removeItem('shorty_token');
        setAuthUI();
        applyItems([]);
        empty && empty.classList.remove('hidden');
    });

    linkOpenRegister?.addEventListener('click', (e) => {
        e.preventDefault();
        closeDialog(dlgLogin);
        openDialog(dlgRegister);
    });

    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            authError && authError.classList.add('hidden');

            if (USE_AUTH) {
                API.login(loginEmail.value, loginPass.value).then((res) => {
                    const token = res?.token || res?.accessToken || res?.jwt || '';
                    if (token) localStorage.setItem('shorty_token', token);
                    setAuthUI();
                    closeDialog(dlgLogin);
                    return refreshLinks();
                }).catch((err) => {
                    if (authError) {
                        authError.textContent = err?.message || 'Ошибка авторизации';
                        authError.classList.remove('hidden');
                    }
                });
            } else {
                localStorage.setItem('shorty_token', 'demo-token');
                setAuthUI();
                closeDialog(dlgLogin);
                refreshLinks();
            }
        });
    }

    if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            regError && regError.classList.add('hidden');

            if (USE_AUTH) {
                API.register(regEmail.value, regPass.value).then(() => {
                    closeDialog(dlgRegister);
                    openDialog(dlgLogin);
                }).catch((err) => {
                    if (regError) {
                        regError.textContent = err?.message || 'Ошибка регистрации';
                        regError.classList.remove('hidden');
                    }
                });
            } else {
                closeDialog(dlgRegister);
                openDialog(dlgLogin);
            }
        });
    }

    setAuthUI();
    refreshLinks();
    API.health?.().then((h) => console.log('Health:', h)).catch(() => {});

})();
