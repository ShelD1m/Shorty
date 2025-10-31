const API_BASE = "";
const TOKEN_KEY = "shorty_token";
const $ = (id) => document.getElementById(id);
function token(){ return localStorage.getItem(TOKEN_KEY); }
function setToken(t){ t?localStorage.setItem(TOKEN_KEY,t):localStorage.removeItem(TOKEN_KEY); }
function ensureAuth(){ if(!token()) location.href="login.html"; }
function buildShort(slug){ return `${API_BASE||window.location.origin}/r/${slug}`; }
function toast(m){ const t=$("toast"); if(!t){console.log(m);return;} t.textContent=m; t.style.opacity="1"; setTimeout(()=>t.style.opacity="0",1800); }

async function api(path, {method="GET", body, headers={}} = {}){
    const url = `${API_BASE||window.location.origin}${path}`;
    const h = {"Content-Type":"application/json", ...headers};
    if(token()) h.Authorization=`Bearer ${token()}`;
    const res = await fetch(url, {method, headers:h, body: body?JSON.stringify(body):undefined, credentials:"include"});
    const text = await res.text(); let data=null; try{data=text?JSON.parse(text):null;}catch{data=text;}
    if(!res.ok) throw new Error((data&&data.error)||data||`HTTP ${res.status}`);
    return data;
}

(function ensureDetailsModal(){
    if(document.getElementById("details-modal")) return;
    const style = document.createElement("style");
    style.textContent = `
    .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);display:none;z-index:9998}
    .modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:9999}
    .modal.show,.modal-backdrop.show{display:flex}
    .modal-card{background:#111827;color:#e5e7eb;max-width:1000px;width:95%;max-height:85vh;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.35);overflow:hidden}
    .modal-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #1f2937}
    .modal-title{font-weight:600}
    .modal-body{padding:0}
    .modal-actions{display:flex;gap:8px;align-items:center}
    .btn{background:#1f2937;border:1px solid #374151;border-radius:10px;padding:8px 12px;color:#e5e7eb;cursor:pointer}
    .btn:hover{filter:brightness(1.06)}
    .btn-ghost{background:transparent;border:1px solid #374151}
    .table-wrap{overflow:auto;max-height:64vh}
    table{width:100%;border-collapse:collapse}
    th,td{padding:10px 12px;border-bottom:1px solid #1f2937;white-space:nowrap}
    th{text-align:left;background:#0f172a;position:sticky;top:0}
    .muted{color:#94a3b8;font-size:12px}
    .toolbar{display:flex;gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid #1f2937}
  `;
    document.head.appendChild(style);

    const backdrop = document.createElement("div"); backdrop.className="modal-backdrop"; backdrop.id="details-backdrop";
    const modal = document.createElement("div"); modal.className="modal"; modal.id="details-modal";
    modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <div class="modal-title" id="details-title">Статистика</div>
          <div class="muted" id="details-subtitle"></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="details-close">Закрыть</button>
        </div>
      </div>
      <div class="toolbar">
        <button class="btn" id="details-prev">Prev</button>
        <span id="details-page" class="muted">Стр. 1</span>
        <button class="btn" id="details-next">Next</button>
        <span class="muted" id="details-total"></span>
      </div>
      <div class="modal-body">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Когда</th>
                <th>IP</th>
                <th>Страна</th>
                <th>Регион</th>
                <th>Город</th>
                <th>User-Agent</th>
                <th>Referer</th>
              </tr>
            </thead>
            <tbody id="details-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;
    document.body.append(backdrop, modal);

    const close = ()=>{ modal.classList.remove("show"); backdrop.classList.remove("show"); };
    backdrop.addEventListener("click", close);
    modal.querySelector("#details-close").addEventListener("click", close);
})();

function renderDetailsRows(items){
    const tbody = document.getElementById("details-tbody");
    tbody.innerHTML = "";
    items.forEach(ev=>{
        const when   = ev.createdAt || ev.timestamp || ev.time || "";
        const ip     = ev.ip || ev.ipAddress || "";
        const country= ev.country || ev.countryName || "";
        const region = ev.region || ev.regionName || ev.state || "";
        const city   = ev.city || "";
        const ua     = ev.userAgent || ev.ua || "";
        const ref    = ev.referer || ev.referrer || "";
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${when? new Date(when).toLocaleString(): ""}</td>
      <td>${ip}</td>
      <td>${country}</td>
      <td>${region}</td>
      <td>${city}</td>
      <td title="${ua}">${ua.slice(0,42)}${ua.length>42?"…":""}</td>
      <td title="${ref}">${(ref||"").slice(0,42)}${(ref||"").length>42?"…":""}</td>
    `;
        tbody.appendChild(tr);
    });
}

async function openDetails(linkId, linkSlug){
    const modal = document.getElementById("details-modal");
    const backdrop = document.getElementById("details-backdrop");
    const title = document.getElementById("details-title");
    const subtitle = document.getElementById("details-subtitle");
    const pageLbl = document.getElementById("details-page");
    const totalLbl = document.getElementById("details-total");
    const prevBtn = document.getElementById("details-prev");
    const nextBtn = document.getElementById("details-next");

    let page = 0, size = 20, lastPage = 0, total = 0;

    title.textContent = `Переходы по ссылке`;
    subtitle.textContent = `Короткая: ${buildShort(linkSlug)}`;

    async function load(){
        const data = await api(`/api/links/${linkId}/clicks?page=${page}&size=${size}`);
        const items = Array.isArray(data) ? data : (data && Array.isArray(data.content) ? data.content : []);
        total = (data && typeof data.totalElements === "number") ? data.totalElements : items.length;
        const totalPages = (data && typeof data.totalPages === "number") ? data.totalPages : 1;
        lastPage = Math.max(0, totalPages - 1);
        renderDetailsRows(items);
        pageLbl.textContent = `Стр. ${page+1}${totalPages? " / "+totalPages : ""}`;
        totalLbl.textContent = total ? `Всего записей: ${total}` : "Нет данных";
        prevBtn.disabled = page<=0;
        nextBtn.disabled = page>=lastPage;
    }

    prevBtn.onclick = ()=>{ if(page>0){ page--; load(); } };
    nextBtn.onclick = ()=>{ if(page<lastPage){ page++; load(); } };

    modal.classList.add("show"); backdrop.classList.add("show");
    try { await load(); } catch(e){ toast(e.message||"Ошибка загрузки"); }
}

async function loadLinks(){
    try{
        const page = await api("/api/links/me");
        const items = Array.isArray(page) ? page : (page && Array.isArray(page.content) ? page.content : []);
        const total = (page && typeof page.totalElements === "number") ? page.totalElements : items.length;
        renderLinks(items, total);
    }catch(e){
        if(String(e.message||"").includes("401")) location.href="login.html";
        renderLinks([], 0);
    }
}

function renderLinks(items, total){
    const list = $("links-list");
    const empty = $("links-empty");
    const count = $("links-count");

    list.innerHTML="";
    count.textContent = total ?? items.length;
    empty.style.display = items.length? "none":"block";

    items.forEach(it=>{
        const li=document.createElement("li"); li.className="item";

        const colShort=document.createElement("div"); colShort.className="short";
        const a=document.createElement("a"); a.href=buildShort(it.slug); a.target="_blank"; a.rel="noopener"; a.textContent=a.href;
        a.addEventListener("click",()=>setTimeout(()=>loadLinks(),1200));
        colShort.append(a);

        const colTarget=document.createElement("div"); colTarget.className="target";
        colTarget.textContent=it.targetUrl || "";

        const colClicks=document.createElement("div"); colClicks.className="clicks";
        colClicks.textContent = `Переходов: ${typeof it.clicksCount === "number" ? it.clicksCount : 0}`;

        const colActions=document.createElement("div"); colActions.className="copy-right";
        const btnCopy=document.createElement("button"); btnCopy.className="btn"; btnCopy.textContent="Копировать";
        btnCopy.onclick=async()=>{ await navigator.clipboard.writeText(a.href); toast("Скопировано"); };
        const btnMore=document.createElement("button"); btnMore.className="btn"; btnMore.textContent="Подробнее";
        btnMore.onclick=()=> openDetails(it.id, it.slug);
        colActions.append(btnCopy, btnMore);

        li.append(colShort,colTarget,colClicks,colActions);
        list.append(li);
    });
}

(async function init(){
    ensureAuth();
    const logout = $("btn-logout"), createBtn = $("btn-create"), original=$("original-url"), slug=$("custom-slug"), result=$("result"), resultLink=$("result-link"), copy=$("copy-btn");
    if(logout) logout.onclick=()=>{ setToken(null); location.href="login.html"; };
    if(createBtn) createBtn.onclick = async function createLink(){
        const url = (original.value||"").trim();
        const custom = (slug.value||"").trim() || null;
        if(!url){ toast("Укажите URL"); return; }
        try{
            const created = await api("/api/links",{method:"POST", body:{targetUrl: /^https?:\/\//i.test(url)?url:`https://${url}`, customSlug: custom, expiresAt:null, maxClicks:null}});
            const full = buildShort(created.slug);
            result.style.display="block"; resultLink.href=full; resultLink.textContent=full;
            original.value=""; slug.value=""; toast("Ссылка создана"); await loadLinks();
        }catch(e){ toast(e.message); }
    };
    if(copy) copy.onclick=async()=>{ if(!resultLink.href){toast("Нет ссылки");return;} await navigator.clipboard.writeText(resultLink.href); toast("Скопировано"); };
    await loadLinks();
})();
