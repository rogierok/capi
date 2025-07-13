const l = 1024 * 1024;
const d = 'capi';
const s = 'cache';

function b(x) {
    return new Blob([x]).size;
}

function n(a, b) {
    return a ? `${a}::${b}` : b;
}

const capi = {
    p: null,
    _ci: null,
    g() {
        return this.p || (this.p = new Promise((r, j) => {
            const q = indexedDB.open(d, 1);
            q.onupgradeneeded = () => q.result.createObjectStore(s);
            q.onsuccess = () => r(q.result);
            q.onerror = () => j(q.error);
        }));
    },
    async _cl() {
        Object.keys(localStorage).forEach(k => {
            const v = localStorage.getItem(k);
            if (!v) return;
            try {
                const x = JSON.parse(v);
                if (x.expires && Date.now() > x.expires) localStorage.removeItem(k);
            } catch { localStorage.removeItem(k); }
        });
    },
    async _cd() {
        const db = await this.g();
        return new Promise(r => {
            const t = db.transaction(s, 'readwrite'), o = t.objectStore(s), q = o.getAllKeys();
            q.onsuccess = () => {
                const ks = q.result, g = o.getAll(ks);
                g.onsuccess = () => {
                    const vs = g.result;
                    ks.forEach((k, i) => {
                        const x = vs[i];
                        if (x && x.expires && Date.now() > x.expires) o.delete(k);
                    });
                    r();
                };
                g.onerror = () => r();
            };
            q.onerror = () => r();
        });
    },
    sC() {
        if (this._ci) return;
        this._ci = setInterval(() => {
            this._cl();
            this._cd();
        }, 60000);
    },
    async iS(k, v, o, a) {
        const db = await this.g();
        return new Promise((r, j) => {
            const t = db.transaction(s, 'readwrite');
            t.objectStore(s).put({
                value: v,
                expires: o && o.ttl ? Date.now() + o.ttl * 1e3 : null
            }, n(a, k));
            t.oncomplete = () => r();
            t.onerror = () => j();
        });
    },
    async iG(k, a) {
        const db = await this.g();
        return new Promise((r, j) => {
            const t = db.transaction(s, 'readonly'), q = t.objectStore(s).get(n(a, k));
            q.onsuccess = () => {
                const e = q.result;
                if (!e) return r(null);
                if (e.expires && Date.now() > e.expires) {
                    t.objectStore(s).delete(n(a, k));
                    return r(null);
                }
                r(e.value);
            };
            q.onerror = () => j();
        });
    },
    async iD(k, a) {
        const db = await this.g();
        return new Promise((r, j) => {
            const t = db.transaction(s, 'readwrite');
            t.objectStore(s).delete(n(a, k));
            t.oncomplete = () => r();
            t.onerror = () => j();
        });
    },
    async iC(a) {
        const db = await this.g();
        if (a) {
            const keys = await new Promise((r, j) => {
                const q = db.transaction(s, 'readonly').objectStore(s).getAllKeys();
                q.onsuccess = () => r(q.result.filter(k => k.startsWith(a + '::')).map(k => k.slice(a.length + 2)));
                q.onerror = () => j();
            });
            await Promise.all(keys.map(k => this.iD(k, a)));
        } else {
            return new Promise((r, j) => {
                const t = db.transaction(s, 'readwrite');
                t.objectStore(s).clear();
                t.oncomplete = () => r();
                t.onerror = () => j();
            });
        }
    },
    async iK(a) {
        const db = await this.g();
        return new Promise((r, j) => {
            const q = db.transaction(s, 'readonly').objectStore(s).getAllKeys();
            q.onsuccess = () => r(q.result.filter(k => !a || k.startsWith(a + '::')).map(k => a ? k.slice(a.length + 2) : k));
            q.onerror = () => j();
        });
    },
    async iH(k, a) {
        return (await this.iG(k, a)) !== null;
    },
    lS(k, v, o, a) {
        try {
            localStorage.setItem(n(a, k), JSON.stringify({
                value: v,
                expires: o && o.ttl ? Date.now() + o.ttl * 1e3 : null
            }));
        } catch (e) {
            throw e;
        }
    },
    lG(k, a) {
        const e = localStorage.getItem(n(a, k));
        if (!e) return null;
        try {
            const d = JSON.parse(e);
            if (d.expires && Date.now() > d.expires) {
                localStorage.removeItem(n(a, k));
                return null;
            }
            return d.value;
        } catch {
            localStorage.removeItem(n(a, k));
            return null;
        }
    },
    lD(k, a) {
        localStorage.removeItem(n(a, k));
    },
    lC(a) {
        if (a) {
            Object.keys(localStorage).forEach(k => k.startsWith(a + '::') && localStorage.removeItem(k));
        } else localStorage.clear();
    },
    lK(a) {
        return Object.keys(localStorage)
            .filter(k => !a || k.startsWith(a + '::'))
            .map(k => a ? k.slice(a.length + 2) : k);
    },
    lH(k, a) {
        return this.lG(k, a) !== null;
    },
    async set(k, v, o = {}, a) {
        let x;
        try {
            x = JSON.stringify(v);
        } catch {
            return await this.iS(k, v, o, a);
        }
        const enc = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
        const bytes = enc ? enc.encode(x) : Array.from(unescape(encodeURIComponent(x))).map(c => c.charCodeAt(0));
        const z = bytes.length;
        const T = 20 * 1024 * 1024;
        let chunkOpt = o && typeof o.chunk !== 'undefined' ? o.chunk : true;
        let chunkSize = 512 * 1024;
        if (chunkOpt === false) chunkSize = 0;
        else if (typeof chunkOpt === 'number') chunkSize = chunkOpt * 1024;
        const shouldChunk = chunkSize > 0 && (chunkOpt === true || typeof chunkOpt === 'number' || z > T);
        if (shouldChunk) {
            const chunks = [];
            for (let i = 0; i < bytes.length; i += chunkSize) {
                const chunkBytes = bytes.slice(i, i + chunkSize);
                const chunkStr = btoa(String.fromCharCode.apply(null, chunkBytes));
                chunks.push(chunkStr);
            }
            await this.iS(k + '::cc', chunks.length, o, a);
            await Promise.all(chunks.map((chunk, idx) => this.iS(`${k}::c${idx}`, chunk, o, a)));
        } else if (z > l) {
            await this.iS(k, v, o, a);
        } else {
            try {
                this.lS(k, v, o, a);
            } catch {
                await this.iS(k, v, o, a);
            }
        }
    },
    async get(k, a) {
        const cc = await this.iG(k + '::cc', a);
        if (cc && typeof cc === 'number' && cc > 0) {
            const chunks = [];
            let m = false;
            for (let i = 0; i < cc; i++) {
                const chunk = await this.iG(`${k}::c${i}`, a);
                if (chunk === null) {
                    m = true;
                    break;
                }
                chunks.push(chunk);
            }
            if (m) {
                await this.iD(k + '::cc', a);
                for (let i = 0; i < cc; i++) {
                    await this.iD(`${k}::c${i}`, a);
                }
                return null;
            }
            try {
                let byteArr = [];
                chunks.forEach(chunkStr => {
                    const bin = atob(chunkStr);
                    for (let i = 0; i < bin.length; i++) byteArr.push(bin.charCodeAt(i));
                });
                let str;
                if (typeof TextDecoder !== 'undefined') {
                    str = new TextDecoder().decode(new Uint8Array(byteArr));
                } else {
                    str = decodeURIComponent(escape(String.fromCharCode.apply(null, byteArr)));
                }
                return JSON.parse(str);
            } catch {
                return null;
            }
        }
        const idb = await this.iG(k, a);
        if (idb !== null) return idb;
        return this.lG(k, a);
    },
    async delete(k, a) {
        this.lD(k, a);
        const cc = await this.iG(k + '::cc', a);
        if (cc && typeof cc === 'number' && cc > 0) {
            await this.iD(k + '::cc', a);
            for (let i = 0; i < cc; i++) {
                await this.iD(`${k}::c${i}`, a);
            }
        }
        await this.iD(k, a);
    },
    async clear(a) {
        this.lC(a);
        await this.iC(a);
    },
    async keys(a) {
        return [...this.lK(a), ...await this.iK(a)];
    },
    async has(k, a) {
        return this.lH(k, a) || (await this.iH(k, a));
    }
};

export default capi;
capi.sC();