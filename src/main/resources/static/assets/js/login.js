const TOKEN_KEY = "shorty_token";
const $ = (id) => document.getElementById(id);
const el = {
    form: $("login-form"),
    email: $("login-email"),
    pass: $("login-password"),
    btn: $("btn-login"),
    toast: $("toast"),
};

function toast(msg){
    if(!el.toast){ console.log(msg); return; }
    el.toast.textContent = msg;
    el.toast.style.opacity = "1";
    setTimeout(()=> el.toast.style.opacity = "0", 2000);
}

async function apiLogin(email, password){
    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email, password })
    });
    const txt = await res.text();
    let data = null;
    try{ data = txt ? JSON.parse(txt) : null; }catch{ data = txt; }
    return { status: res.status, ok: res.ok, data };
}

async function onLogin(e){
    e.preventDefault();
    const email = (el.email.value || "").trim();
    const password = el.pass.value || "";

    if(!email || !password){ toast("Введите e-mail и пароль"); return; }

    el.btn.disabled = true;
    try{
        const { ok, status, data } = await apiLogin(email, password);

        if(ok){
            // ✅ успешный логин
            const token = data?.accessToken || data?.token;
            if(token) localStorage.setItem(TOKEN_KEY, token);
            location.href = "index.html";
            return;
        }

        if(status === 403){
            const err = (data && data.error) || "";
            if(String(err).toLowerCase().includes("email not verified")){
                toast("Подтвердите e-mail. Отправим ссылку снова…");
                setTimeout(()=> location.href="verify-email.html?email="+encodeURIComponent(email),800);
                return;
            }
            toast("Доступ запрещён (403)");
            return;
        }

        if(status === 401){ toast("Неверный e-mail или пароль"); return; }

        toast((data && data.error) || "Ошибка входа");
    }catch(err){
        toast(String(err.message || "Ошибка сети"));
    }finally{
        el.btn.disabled = false;
    }
}

el.form.addEventListener("submit", onLogin);
