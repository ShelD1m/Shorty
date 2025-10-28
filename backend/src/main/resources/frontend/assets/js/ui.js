function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
function toast(msg){
    const t = document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t);
    setTimeout(()=>{ t.remove(); }, 2200);
}
function copy(text){ navigator.clipboard?.writeText(text).then(()=>toast('Скопировано')); }
window.qs = qs; window.qsa = qsa; window.toast = toast; window.copy = copy;