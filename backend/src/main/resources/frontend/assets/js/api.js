const API = (() => {
    const BASE = window.__CONFIG__.API_BASE;


    const authHeader = () => {
        const token = localStorage.getItem("shorty_token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };


    const j = (res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
    };


    return {

        health: () => fetch(`${BASE}/actuator/health`).then(j),



        login: (email, password) => fetch(`${BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        }).then(j),


        register: (email, password) => fetch(`${BASE}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        }).then(j),


        createLink: (payload) => fetch(`${BASE}/api/links`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeader() },
            body: JSON.stringify(payload)
        }).then(j),


        myLinks: () => fetch(`${BASE}/api/links/me`, { headers: { ...authHeader() } }).then(j)
    };
})();