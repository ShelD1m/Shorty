const API_BASE = "";
const $ = (id)=>document.getElementById(id);
const el = { p1:$("rp-pass1"), p2:$("rp-pass2"), btn:$("rp-apply"), msg:$("rp-msg"), toast:$("toast") };

function toast(m){ if(!el.toast){console.log(m);return;} el.toast.textContent=m; el.toast.style.opacity="1"; setTimeout(()=>el.toast.style.opacity="0",1800); }

async function api(path,{method="GET",body,headers={}}={}){
    const url=`${API_BASE||window.location.origin}${path}`;
    const res=await fetch(url,{
        method,
        headers:{ "Content-Type":"application/json", ...headers },
        body: body ? JSON.stringify(body) : undefined,
        credentials:"include"
    });
    const t=await res.text(); let d=null; try{d=t?JSON.parse(t):null;}catch{d=t;}
    if(!res.ok) throw new Error((d&&d.error)||d||`HTTP ${res.status}`);
    return d;
}

const token = new URLSearchParams(location.search).get("token");

async function apply(){
    const a=el.p1.value||"", b=el.p2.value||"";
    if(!token){ el.msg.textContent="Токен не найден. Откройте ссылку из письма."; return; }
    if(a.length<6 || b.length<6){ toast("Минимум 6 символов"); return; }
    if(a!==b){ toast("Пароли не совпадают"); return; }
    el.btn.disabled=true;
    try{
        await api("/api/auth/password/reset?token="+encodeURIComponent(token), { method:"POST", body:{ password:a }});
        el.msg.textContent="Пароль обновлён. Теперь можно войти.";
    }catch(e){
        el.msg.textContent="Ошибка. Возможно, токен просрочен.";
    }finally{ el.btn.disabled=false; }
}

(function(){ el.btn.addEventListener("click", apply); })();
