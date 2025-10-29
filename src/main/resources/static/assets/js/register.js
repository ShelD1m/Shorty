const API_BASE = "";
const $=(id)=>document.getElementById(id);
const el={email:$("register-email"), pass:$("register-password"), btn:$("btn-register"), toast:$("toast")};

function toast(m){ if(!el.toast){console.log(m);return;} el.toast.textContent=m; el.toast.style.opacity="1"; setTimeout(()=>el.toast.style.opacity="0",1800); }
async function api(path,{method="GET",body,headers={}}={}){
    const url=`${API_BASE||window.location.origin}${path}`;
    const res=await fetch(url,{method,headers:{"Content-Type":"application/json",...headers},body:body?JSON.stringify(body):undefined,credentials:"include"});
    const txt=await res.text(); let data=null; try{data=txt?JSON.parse(txt):null;}catch{data=txt;}
    if(!res.ok) throw new Error((data&&data.error)||data||`HTTP ${res.status}`); return data;
}

el.btn.onclick=async()=>{
    try{
        await api("/api/auth/register",{method:"POST",body:{email:el.email.value, password:el.pass.value}});
        toast("Регистрация успешна"); setTimeout(()=>location.href="login.html",600);
    }catch(e){ toast(e.message); }
};
