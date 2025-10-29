const API_BASE = "";
const TOKEN_KEY = "shorty_token";
const $ = (id)=>document.getElementById(id);
const el={email:$("login-email"), pass:$("login-password"), btn:$("btn-login"), toast:$("toast")};

function toast(m){ if(!el.toast){console.log(m);return;} el.toast.textContent=m; el.toast.style.opacity="1"; setTimeout(()=>el.toast.style.opacity="0",1800); }
function setToken(t){ t?localStorage.setItem(TOKEN_KEY,t):localStorage.removeItem(TOKEN_KEY); }
async function api(path,{method="GET",body,headers={}}={}){
    const url=`${API_BASE||window.location.origin}${path}`;
    const res=await fetch(url,{method,headers:{"Content-Type":"application/json",...headers},body:body?JSON.stringify(body):undefined,credentials:"include"});
    const txt=await res.text(); let data=null; try{data=txt?JSON.parse(txt):null;}catch{data=txt;}
    if(!res.ok) throw new Error((data&&data.error)||data||`HTTP ${res.status}`); return data;
}

el.btn.onclick=async()=>{
    try{
        const res=await api("/api/auth/login",{method:"POST",body:{email:el.email.value, password:el.pass.value}});
        if(!res || !res.accessToken) throw new Error("Токен не получен");
        setToken(res.accessToken); location.href="index.html";
    }catch(e){ toast(e.message); }
};
