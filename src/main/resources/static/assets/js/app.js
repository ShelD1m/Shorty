const API_BASE = "";
const TOKEN_KEY = "shorty_token";

const $ = (id) => document.getElementById(id);
const el = {
    logout: $("btn-logout"),
    createBtn: $("btn-create"),
    original: $("original-url"),
    slug: $("custom-slug"),
    result: $("result"),
    resultLink: $("result-link"),
    copy: $("copy-btn"),
    list: $("links-list"),
    empty: $("links-empty"),
    count: $("links-count"),
    toast: $("toast"),
};

function toast(m){ if(!el.toast){console.log(m);return;}
    el.toast.textContent=m; el.toast.style.opacity="1"; setTimeout(()=>el.toast.style.opacity="0",1800);
}
function token(){ return localStorage.getItem(TOKEN_KEY); }
function setToken(t){ t?localStorage.setItem(TOKEN_KEY,t):localStorage.removeItem(TOKEN_KEY); }
function ensureAuth(){ if(!token()) location.href="login.html"; }
function normalizeUrl(u){ return /^https?:\/\//i.test(u)?u:`https://${u.trim()}`; }
function buildShort(slug){ return `${API_BASE||window.location.origin}/r/${slug}`; }

async function api(path, {method="GET", body, headers={}} = {}){
    const url = `${API_BASE||window.location.origin}${path}`;
    const h = {"Content-Type":"application/json", ...headers};
    if(token()) h.Authorization=`Bearer ${token()}`;
    const res = await fetch(url, {method, headers:h, body: body?JSON.stringify(body):undefined, credentials:"include"});
    const text = await res.text(); let data=null; try{data=text?JSON.parse(text):null;}catch{data=text;}
    if(!res.ok) throw new Error((data&&data.error)||data||`HTTP ${res.status}`);
    return data;
}

async function loadLinks(){
    try{
        const items = await api("/api/links/me");
        render(items||[]);
    }catch(e){
        if(e.message.includes("401")) location.href="login.html";
        render([]);
    }
}
function render(items){
    el.list.innerHTML="";
    el.count.textContent=items.length;
    el.empty.style.display = items.length? "none":"block";
    items.forEach(it=>{
        const li=document.createElement("li"); li.className="item";

        const colShort=document.createElement("div"); colShort.className="short";
        const a=document.createElement("a"); a.href=buildShort(it.slug); a.target="_blank"; a.rel="noopener"; a.textContent=a.href;
        a.addEventListener("click",()=>setTimeout(()=>loadLinks(),1200));
        colShort.append(a);

        const colTarget=document.createElement("div"); colTarget.className="target";
        colTarget.textContent=it.targetUrl;

        const colClicks=document.createElement("div"); colClicks.className="clicks";
        // БЫЛО: it.clicks — НУЖНО: it.clicksCount
        colClicks.textContent = typeof it.clicksCount === "number" ? `Переходов: ${it.clicksCount}` : "";

        const colCopy=document.createElement("div"); colCopy.className="copy-right";
        const btn=document.createElement("button"); btn.className="btn"; btn.textContent="Копировать";
        btn.onclick=async()=>{ await navigator.clipboard.writeText(a.href); toast("Скопировано"); };
        colCopy.append(btn);

        li.append(colShort,colTarget,colClicks,colCopy);
        el.list.append(li);
    });
}

async function createLink(){
    const url = normalizeUrl(el.original.value||"");
    const slug = (el.slug.value||"").trim() || null;
    if(!url){ toast("Укажите URL"); return; }
    try{
        // ИМЕНА ПОЛЕЙ ВАЖНЫ!
        const created = await api("/api/links", {
            method:"POST",
            body: { targetUrl: url, customSlug: slug, expiresAt: null, maxClicks: null }
        });
        const full = buildShort(created.slug);
        el.result.style.display="block";
        el.resultLink.href=full; el.resultLink.textContent=full;
        el.original.value=""; el.slug.value="";
        toast("Ссылка создана");
        await loadLinks();
    }catch(e){ toast(e.message); }
}

function bind(){
    el.logout.onclick=()=>{ setToken(null); location.href="login.html"; };
    el.createBtn.onclick=createLink;
    el.copy.onclick=async()=>{ if(!el.resultLink.href){toast("Нет ссылки");return;}
        await navigator.clipboard.writeText(el.resultLink.href); toast("Скопировано"); };
    document.addEventListener("visibilitychange",()=>{ if(!document.hidden) loadLinks(); });
    setInterval(()=>loadLinks(),15000);
}

(async function init(){
    ensureAuth();
    bind();
    await loadLinks();
})();
