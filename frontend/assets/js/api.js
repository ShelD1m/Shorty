const API = {
    base: "http://localhost:8080",
    get token(){ return localStorage.getItem("token"); },
    set token(v){ localStorage.setItem("token", v); },
    clear(){ localStorage.removeItem("token"); },
    async json(url, opts={}){
        const headers = Object.assign({}, opts.headers || {}, {"Content-Type":"application/json"});
        if (this.token) headers["Authorization"] = "Bearer " + this.token;
        const r = await fetch(this.base + url, Object.assign({}, opts, {headers}));
        if (!r.ok) throw new Error(await r.text() || (r.status + ""));
        if (r.status === 204) return null;
        return await r.json();
    },
    auth: {
        signup(email, password){ return API.json("/api/auth/signup", {method:"POST", body: JSON.stringify({email, password})}); },
        login(email, password){ return API.json("/api/auth/login", {method:"POST", body: JSON.stringify({email, password})}); },
    },
    links: {
        create(payload){ return API.json("/api/links", {method:"POST", body: JSON.stringify(payload)}); },
        get(id){ return API.json("/api/links/"+id); },
    }
};
window.API = API;