const API_BASE = "";
const $ = (id)=>document.getElementById(id);
const el = { email: $("fp-email"), btn: $("fp-send"), msg: $("fp-msg"), toast: $("toast") };

function toast(m){ if(!el.toast){console.log(m);return;} el.toast.textContent=m; el.toast.style.opacity="1"; setTimeout(()=>el.toast.style.opacity="0",1800); }
async function api(path,{method="GET",body,headers={}}={}){
    const url=`${API_BASE||window.location.origin}${path}`;
    const res=await fetch(url,{method,headers:{"Content-Type":"application/json",...headers},body:body?JSON.stringify(body):undefined,credentials:"include"});
    const t=await res.text(); let d=null; try{d=t?JSON.parse(t):null;}catch{d=t;}
    if(!res.ok) throw new Error((d&&d.error)||d||`HTTP ${res.status}`); return d;
}

async function sendLink(){
    const email=(el.email.value||"").trim();
    if(!email){ toast("Введите e-mail"); return; }
    el.btn.disabled=true;
    try{
        await api("/api/auth/password/forgot",{method:"POST",body:{email}});
        el.msg.textContent="Если e-mail существует — мы отправили ссылку на сброс пароля.";
        toast("Письмо отправлено");
    }catch(e){
        el.msg.textContent="Ошибка отправки. Попробуйте позже.";
        toast(String(e.message||"Ошибка"));
    }finally{ el.btn.disabled=false; }
}

(function init(){
    el.btn.addEventListener("click", sendLink);
    el.email.addEventListener("keydown", (e)=>{ if(e.key==="Enter") sendLink(); });
})();
