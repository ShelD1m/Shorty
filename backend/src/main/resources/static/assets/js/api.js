const API = (()=>{
    const BASE = window.__CONFIG__.API_BASE;

    const authHeader = () => {
        const t = localStorage.getItem('shorty_token');
        return t ? { Authorization: `Bearer ${t}` } : {};
    };

    const j = async (res) => {
        if (!res.ok) {
            let msg = `${res.status} ${res.statusText}`;
            try { const txt = await res.text(); if (txt) msg = txt; } catch {}
            throw new Error(msg);
        }
        // на health может прийти не-JSON — попробуем
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : res.text();
    };

    return {
        base: () => BASE,
        token: () => localStorage.getItem('shorty_token'),
        clear: () => localStorage.removeItem('shorty_token'),

        health: () => fetch(`${BASE}/actuator/health`).then(j),

        login: (email, password) => fetch(`${BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        }).then(j),

        register: (email, password) => fetch(`${BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        }).then(j),

        links: {
            create: (payload) => fetch(`${BASE}/api/links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader() },
                body: JSON.stringify(payload)
            }).then(j),
            get: (id) => fetch(`${BASE}/api/links/${id}`, { headers: { ...authHeader() } }).then(j),
            mine: () => fetch(`${BASE}/api/links/me`, { headers: { ...authHeader() } }).then(j)
        }
    };
})();
