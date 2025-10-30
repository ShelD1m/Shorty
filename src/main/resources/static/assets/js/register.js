const API_BASE = ""; // если фронт обслуживает Spring Boot — оставь пусто

const $ = (id) => document.getElementById(id);
const el = {
    email: $("register-email"),
    pass: $("register-password"),
    btn: $("btn-register"),
    toast: $("toast"),
};

function toast(message) {
    if (!el.toast) { console.log(message); return; }
    el.toast.textContent = message;
    el.toast.style.opacity = "1";
    setTimeout(() => (el.toast.style.opacity = "0"), 1800);
}

async function api(path, { method = "GET", body, headers = {} } = {}) {
    const url = `${API_BASE || window.location.origin}${path}`;
    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...headers },
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
    });
    const txt = await res.text();
    let data = null;
    try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }
    if (!res.ok) {
        throw new Error((data && data.error) || data || `HTTP ${res.status}`);
    }
    return data;
}

async function onRegister() {
    const email = (el.email.value || "").trim();
    const password = el.pass.value || "";

    if (!email || !password) {
        toast("Введите email и пароль");
        return;
    }
    if (password.length < 6) {
        toast("Минимум 6 символов в пароле");
        return;
    }

    try {
        await api("/api/auth/register", {
            method: "POST",
            body: { email, password },
        });
        location.href = "verify-email.html?email=" + encodeURIComponent(email);
    } catch (e) {
        toast(String(e.message || "Ошибка регистрации"));
    }
}

function bind() {
    el.btn.addEventListener("click", onRegister);
    el.pass.addEventListener("keydown", (e) => {
        if (e.key === "Enter") onRegister();
    });
}

(function init() { bind(); })();
