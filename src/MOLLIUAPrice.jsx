import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import logoUrl from "./assets/molli-logo.svg";
import ProductCard from "./ProductCard.jsx";
import ProductModal from "./ProductModal.jsx";

/* ========= helpers ========= */
const normalizeStockText = (v) => {
  if (v == null) return "";
  if (typeof v === "object" && v.value) v = v.value; // dropdown chip
  return String(v).replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
};
const stockBadge = (raw) => {
  const s = normalizeStockText(raw);
  if (s === "так" || s === "yes" || s === "in stock" || s === "instock" || s === "available")
    return { label: "В наявності", color: "#2ea043" };
  if (s === "ні" || s === "no" || s === "out of stock")
    return { label: "Немає", color: "#6b7280" };
  if (s.includes("відшив") || s.includes("sew"))
    return { label: "Відшиваємо", color: "#d29922" };
  if (s.includes("під замов") || s.includes("preorder") || s.includes("made to order"))
    return { label: "Під замовлення", color: "#d29922" };
  return { label: "Немає", color: "#6b7280" };
};
const fmt = (n) => (n==null || n==="") ? "" : new Intl.NumberFormat("uk-UA").format(Number(n));
const toNum = (v) => { if (v==null || v==="") return undefined; const n = Number(String(v).replace(/[ \t,]/g,".")); return Number.isFinite(n) ? n : undefined; };
const makeId = (t) => String(t||"").toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9_-]+/g,"");
const splitList = (v) => String(v||"").replace(/\u00A0/g," ").split(/[;,]/).map(s=>s.trim()).filter(Boolean);
const normKey = (v) => String(v ?? "").replace(/\u00A0/g," ").trim().toLowerCase();
const cleanTitle = (v) => String(v ?? "").replace(/\u00A0/g," ").trim();

// перетворює google drive “/file/d/<id>/view?…” → “https://drive.google.com/uc?id=<id>”
const normalizePhotoUrl = (u) => {
  const s = String(u || "").trim();
  // file/d/<id>/view
  let m = s.match(/drive\.google\.com\/file\/d\/([^/]+)\//i);
  if (m) return `https://drive.google.com/uc?id=${m[1]}`;
  // open?id=<id>
  m = s.match(/drive\.google\.com\/open\?id=([^&]+)/i);
  if (m) return `https://drive.google.com/uc?id=${m[1]}`;
  // uc?id=<id> — вже ок
  return s;
};


/* ========= fetch ========= */
async function fetchAny(url){
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (ct.includes("application/json") || text.trim().startsWith("[") || text.trim().startsWith("{")) {
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json)) return json;
      if (json && Array.isArray(json.data)) return json.data;
    } catch {}
  }
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, transformHeader: (h)=>h.trim() });
  return Array.isArray(parsed.data) ? parsed.data : [];
}

/* ========= normalize & automap ========= */
function normalizeKeys(row){ const out={}; for (const k of Object.keys(row||{})) out[String(k).trim().toLowerCase()] = row[k]; return out; }
function buildAutoMap(headers=[]){
  const H = headers.map(h => String(h).trim().toLowerCase());
  const pick = (...alts) => { for (const a of alts){ const rx = a instanceof RegExp ? a : new RegExp(`^\\s*${a}\\s*$`,`i`); const i=H.findIndex(h=>rx.test(h)); if(i>=0) return headers[i]; } };
  return {
    category:    pick(/катег/i, /^category$/i),
    name:        pick(/^назва$/i, /^name$/i, /^товар$/i, /title/i),
    sku:         pick(/артикул/i, /^sku$/i, /^код$/i, /article/i, /vendor/i),
    photo:       pick(/^фото$/i, /^image$/i, /picture/i, /img/i),
    color:       pick(/колір/i, /color/i),
    size:        pick(/розмір/i, /size/i),
    protectionClass: pick(/клас захисту/i, /protection.*class/i),
    priceRetail: pick(/роздріб/i, /rrc/i, /^price$/i, /цiна|цена/i, /retail/i),
    priceDrop:   pick(/дроп/i, /drop/i, /wholesale/i),
    priceBulk:   pick(/гурт.*30/i, /30\+/i, /bulk/i),
    priceBuyout: pick(/викуп.*100/i, /100\+/i, /buyout/i),
    stock:       pick(/наяв/i, /^stock$/i, /in_?stock/i),
    notes:       pick(/^опис$/i, /description/i, /notes/i),
    photo2: pick(/фото *2|image *2|img *2/i),
    photo3: pick(/фото *3|image *3|img *3/i),
    photo4: pick(/фото *4|image *4|img *4/i),
    photo5: pick(/фото *5|image *5|img *5/i),
    photo6: pick(/фото *6|image *6|img *6/i),
    photo7: pick(/фото *7|image *7|img *7/i),
    photo8: pick(/фото *8|image *8|img *8/i),
    photo9: pick(/фото *9|image *9|img *9/i),
    photo10: pick(/фото *10|image *10|img *10/i),
  };
}

/* ========= row mapping ========= */
function mapRow(r, map){
  const get = (key, fb=[])=>{
    const desired = (map?.[key] ?? "").toString().trim().toLowerCase();
    if (desired && r[desired] !== undefined) return r[desired];
    for (const f of fb){ const k = f.toString().trim().toLowerCase(); if (r[k] !== undefined) return r[k]; }
  };
  const photoList = splitList(get("photo",["фото","image","img","фото 1"]));
  const extra = [get("photo2"),get("photo3"),get("photo4"),get("photo5"),get("photo6"),get("photo7"),get("photo8"),get("photo9"),get("photo10")]
    .filter(Boolean);
  const photos = [...photoList, ...extra].filter(Boolean).map(normalizePhotoUrl);


  const row = {
    category:    get("category", ["категорія","category"]),
    name:        get("name", ["назва","name","товар","title"]),
    sku:         get("sku", ["артикул","sku","код"]),
    photos,
    color:       get("color", ["колір","color"]),
    size:        get("size", ["розмір","size"]),
    protectionClass: get("protectionClass", ["клас захисту","protection class"]),
    priceRetail: toNum(get("priceRetail", ["роздріб","price","цiна","цена","rrc","retail"])),
    priceDrop:   toNum(get("priceDrop",   ["дроп","wholesale","drop"])),
    priceBulk:   toNum(get("priceBulk",   ["гурт 30+","гурт (від 30 шт)","bulk"])),
    priceBuyout: toNum(get("priceBuyout", ["викуп 100+","викуп (від 100 шт)","buyout"])),
    stock:       get("stock", ["наявність","in_stock","stock"]),
    notes:       get("notes", ["опис","description","notes"]),
  };

  row.category        = cleanTitle(row.category);
  row.name            = cleanTitle(row.name);
  row.color           = cleanTitle(row.color);
  row.size            = cleanTitle(row.size);
  row.protectionClass = cleanTitle(row.protectionClass);

  return row;
}

/* ========= explode & group ========= */
function explodeVariants(row){
  const sizes  = splitList(row.size);
  const colors = splitList(row.color);
  const classes = splitList(row.protectionClass);
  if (!sizes.length && !colors.length && !classes.length) return [row];
  const S = sizes.length  ? sizes  : [""];
  const C = colors.length ? colors : [""];
  const K = classes.length? classes: [""];
  const out=[]; for (const s of S) for (const c of C) for (const k of K) out.push({ ...row, size:s, color:c, protectionClass:k });
  return out;
}

function buildProducts(rows){
  let seq = 0;
  const map = new Map();
  for (const r of rows){
    const catKey  = normKey(r.category || "без категорії");
    const nameKey = normKey(r.name || r.sku || "без назви");
    const groupKey = `${catKey}::${nameKey}`;

    if (!map.has(groupKey)){
      const id = `${makeId(groupKey)}::${++seq}`;
      map.set(groupKey, {
        id,
        name: cleanTitle(r.name || r.sku || "Без назви"),
        category: cleanTitle(r.category || "Без категорії"),
        categoryKey: catKey,
        notes: r.notes,
        basePhotos: r.photos || [],
        variants: [],
      });
    }

    const vSize  = cleanTitle(r.size || "");
    const vColor = cleanTitle(r.color || "");
    const vKlass = cleanTitle(r.protectionClass || "");
    const vKey   = `${vSize}::${vColor}::${vKlass}`;

    const product = map.get(groupKey);
    const idx = product.variants.findIndex(v => `${v.size}::${v.color}::${v.klass}` === vKey);

    const variant = {
      size:  vSize, color: vColor, klass: vKlass,
      sku: r.sku, stock: r.stock, photos: r.photos || [],
      priceRetail: r.priceRetail, priceDrop: r.priceDrop, priceBulk: r.priceBulk, priceBuyout: r.priceBuyout,
    };

    if (idx >= 0) {
      const ex = product.variants[idx];
      product.variants[idx] = {
        ...ex,
        sku:   ex.sku   || variant.sku,
        stock: ex.stock || variant.stock,
        photos: Array.from(new Set([...(ex.photos||[]), ...(variant.photos||[])])),
        priceRetail: ex.priceRetail ?? variant.priceRetail,
        priceDrop:   ex.priceDrop   ?? variant.priceDrop,
        priceBulk:   ex.priceBulk   ?? variant.priceBulk,
        priceBuyout: ex.priceBuyout ?? variant.priceBuyout,
      };
    } else {
      product.variants.push(variant);
    }
  }

  return Array.from(map.values()).map(p=>{
    const sizeSet  = new Set(p.variants.map(v=>v.size).filter(Boolean));
    const colorSet = new Set(p.variants.map(v=>v.color).filter(Boolean));
    const classSet = new Set(p.variants.map(v=>v.klass).filter(Boolean));

    const colorsBySize = {};
    const classesBySizeColor = {};
    for (const v of p.variants){
      const s = v.size  || "_";
      const c = v.color || "_";
      if (!colorsBySize[s]) colorsBySize[s] = new Set();
      if (v.color) colorsBySize[s].add(v.color);
      const keySC = `${s}::${c}`;
      if (!classesBySizeColor[keySC]) classesBySizeColor[keySC] = new Set();
      if (v.klass) classesBySizeColor[keySC].add(v.klass);
    }

    const allPhotos = Array.from(new Set([...(p.basePhotos||[]), ...p.variants.flatMap(v=>v.photos||[])]));
    return {
      ...p,
      photos: allPhotos,
      sizes:   Array.from(sizeSet),
      colors:  Array.from(colorSet),
      classes: Array.from(classSet),
      colorsBySize: Object.fromEntries(Object.entries(colorsBySize).map(([k,set])=>[k, Array.from(set)])),
      classesBySizeColor: Object.fromEntries(Object.entries(classesBySizeColor).map(([k,set])=>[k, Array.from(set)])),
    };
  });
}

/* ========= компонент ========= */
export default function MOLLIUAPrice({
  feedUrl,
  mapFields,
  brand = { primary: "#E30613" },
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [catKey, setCatKey] = useState("all");
  const [query, setQuery]   = useState("");
  const [priceMode, setPriceMode] = useState("retail");

  const [selectedSize, setSelectedSize]     = useState({});
  const [selectedColor, setSelectedColor]   = useState({});
  const [selectedClass, setSelectedClass]   = useState({});

  // modal
  const [openProduct, setOpenProduct] = useState(null);
  const [galleryIdx, setGalleryIdx]   = useState(0);

  useEffect(()=>{ (async()=>{
    try{
      setLoading(true); setError(null);
      const raw = await fetchAny(feedUrl);
      const norm = raw.map(normalizeKeys);
      const auto = buildAutoMap(Object.keys(norm[0]||{}));
      const user = Object.fromEntries(Object.entries(mapFields||{}).map(([k,v])=>[k, String(v||"").toLowerCase()]));
      const eff  = { ...auto, ...user };
      const rows = norm.map(r => mapRow(r, eff));
      const exploded = rows.flatMap(explodeVariants);
      const prods = buildProducts(exploded);
      setProducts(prods);
    }catch(e){ console.error(e); setError(String(e)); setProducts([]); }
    finally{ setLoading(false); }
  })(); }, [feedUrl, JSON.stringify(mapFields)]);

  // lock body scroll when modal is open
  useEffect(()=>{
    if (openProduct) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return ()=>{ document.body.style.overflow = prev; };
    }
  }, [openProduct]);

  const categories = useMemo(()=>{
    if (!products.length) return [{ key:"all", title:"Всі" }];
    const set = new Map();
    for (const p of products){ if (!set.has(p.categoryKey)) set.set(p.categoryKey, p.category); }
    return [{ key:"all", title:"Всі" }, ...Array.from(set, ([key, title]) => ({ key, title }))];
  }, [products]);

  const filtered = useMemo(()=>{
    let list = products;
    if (catKey !== "all") list = list.filter(p => p.categoryKey === catKey);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter(p =>
      p.name.toLowerCase().includes(q) || p.variants.some(v => (v.sku||"").toLowerCase().includes(q))
    );
    return list;
  }, [products, catKey, query]);

  const findVariant = (p, s, c, k) => {
    let pool = p.variants;
    if (s) pool = pool.filter(v => (v.size||"")  === s);
    if (c) pool = pool.filter(v => (v.color||"") === c);
    if (k) pool = pool.filter(v => (v.klass||"") === k);
    return pool[0] || p.variants[0];
  };
  const priceFor = (v) => {
    if (priceMode === "retail") return v.priceRetail ?? v.priceDrop ?? v.priceBulk ?? v.priceBuyout;
    if (priceMode === "drop")   return v.priceDrop   ?? v.priceRetail ?? v.priceBulk ?? v.priceBuyout;
    if (priceMode === "bulk")   return v.priceBulk   ?? v.priceDrop   ?? v.priceRetail ?? v.priceBuyout;
    if (priceMode === "buyout") return v.priceBuyout ?? v.priceBulk   ?? v.priceDrop ?? v.priceRetail;
    return v.priceRetail ?? v.priceDrop ?? v.priceBulk ?? v.priceBuyout;
  };

  const topLink = { color:'#fff', textDecoration:'none', opacity:.9 };

  return (
    <div style={{ padding: 20, color:'#fbf7f7ff', background:'#111', minHeight:'100vh', fontFamily:"system-ui, -apple-system, Segoe UI, Roboto" }}>
   {/* TOP BAR */}
<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
    <img src={logoUrl} alt="MOLLI" style={{ height:50, display:'block' }} />
  </div>

  <div style={{display:'flex', gap:20, alignItems:'center', fontSize:14}}>
    {/* Номер 1 */}
    <div style={{display:'flex', alignItems:'center', gap:6}}>
      <a href="tel:+380962019665" style={topLink}>+380 96 201 96 65</a>
      <a href="https://t.me/Mollimanager" target="_blank" rel="noreferrer" style={{ color:'#229ED9' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.04 15.314l-.376 5.305c.538 0 .771-.23 1.05-.503l2.521-2.414 5.224 3.82c.958.528 1.642.251 1.912-.886l3.463-16.177.001-.001c.308-1.436-.519-2.002-1.45-1.65L1.13 9.58c-1.402.545-1.381 1.329-.239 1.681l5.748 1.794L19.343 6.27c.67-.44 1.28-.196.777.245"/>
        </svg>
      </a>
      <a href="viber://chat?number=%2B380962019665" style={{ color:'#7360F2' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.207 2H5.793C3.15 2 1 4.15 1 6.793v10.414C1 19.85 3.15 22 5.793 22h7.657l3.793 2 .486-2h.478C20.85 22 23 19.85 23 17.207V6.793C23 4.15 20.85 2 18.207 2zm-1.728 14.743c-.236.629-1.365 1.157-1.865 1.157-.5 0-1.079-.236-2.007-.7-1.167-.579-2.383-1.424-3.471-2.511-1.09-1.088-1.934-2.303-2.512-3.471-.464-.928-.7-1.507-.7-2.007 0-.5.529-1.63 1.157-1.865.203-.076.436-.048.592.108l1.317 1.317c.149.149.193.375.112.572-.09.217-.338.77-.46 1.02-.1.205-.081.446.058.635.289.395.708.914 1.241 1.447.533.533 1.052.952 1.447 1.241.189.139.43.158.635.058.25-.122.804-.37 1.02-.46.197-.081.423-.037.572.112l1.317 1.317c.156.156.184.389.108.592z"/>
        </svg>
      </a>
    </div>

    {/* Номер 2 */}
    <div style={{display:'flex', alignItems:'center', gap:6}}>
      <a href="tel:+380997327413" style={topLink}>+380 99 732 74 13</a>
      <a href="https://t.me/MolliOpt" target="_blank" rel="noreferrer" style={{ color:'#229ED9' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.04 15.314l-.376 5.305c.538 0 .771-.23 1.05-.503l2.521-2.414 5.224 3.82c.958.528 1.642.251 1.912-.886l3.463-16.177.001-.001c.308-1.436-.519-2.002-1.45-1.65L1.13 9.58c-1.402.545-1.381 1.329-.239 1.681l5.748 1.794L19.343 6.27c.67-.44 1.28-.196.777.245"/>
        </svg>
      </a>
      <a href="viber://chat?number=%2B380997327413" style={{ color:'#7360F2' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.207 2H5.793C3.15 2 1 4.15 1 6.793v10.414C1 19.85 3.15 22 5.793 22h7.657l3.793 2 .486-2h.478C20.85 22 23 19.85 23 17.207V6.793C23 4.15 20.85 2 18.207 2zm-1.728 14.743c-.236.629-1.365 1.157-1.865 1.157-.5 0-1.079-.236-2.007-.7-1.167-.579-2.383-1.424-3.471-2.511-1.09-1.088-1.934-2.303-2.512-3.471-.464-.928-.7-1.507-.7-2.007 0-.5.529-1.63 1.157-1.865.203-.076.436-.048.592.108l1.317 1.317c.149.149.193.375.112.572-.09.217-.338.77-.46 1.02-.1.205-.081.446.058.635.289.395.708.914 1.241 1.447.533.533 1.052.952 1.447 1.241.189.139.43.158.635.058.25-.122.804-.37 1.02-.46.197-.081.423-.037.572.112l1.317 1.317c.156.156.184.389.108.592z"/>
        </svg>
      </a>
    </div>

    <span style={{opacity:.35}}>·</span>
    <a href="https://molliua.com" target="_blank" rel="noreferrer" style={topLink}>molliua.com</a>
  </div>
</div>


      {/* панель фільтрів */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', margin:'14px 0 16px', alignItems:'center' }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', flex:'1 1 auto' }}>
          {categories.map(c => (
            <button
              key={c.key}
              onClick={()=>setCatKey(c.key)}
              style={{
                padding:'6px 10px', borderRadius:999, border:'1px solid #333',
                background: catKey===c.key ? brand.primary : '#222',
                color:'#fff', cursor:'pointer', fontSize:12
              }}
            >
              {c.title}
            </button>
          ))}
        </div>

        <input
          value={query} onChange={(e)=>setQuery(e.target.value)}
          placeholder="Пошук: назва / артикул"
          style={{ padding:'8px 10px', borderRadius:8, border:'1px solid #333', background:'#1a1a1a', color:'#fff', minWidth:260 }}
        />

        <div style={{ display:'flex', gap:6, background:'#1a1a1a', border:'1px solid #333', borderRadius:999, padding:4, fontSize:12 }}>
          {[
            {key:'retail', label:'Роздріб'},
            {key:'drop',   label:'Дроп'},
            {key:'bulk',   label:'Гурт 30+'},
            {key:'buyout', label:'Викуп 100+'},
          ].map(p => (
            <button
              key={p.key}
              onClick={()=>setPriceMode(p.key)}
              style={{
                padding:'6px 10px', borderRadius:999, border:'none',
                background: priceMode===p.key ? brand.primary : 'transparent',
                color:'#fff', cursor:'pointer'
              }}
            >{p.label}</button>
          ))}
        </div>
      </div>

      {loading && <div style={{ color:'#aaa' }}>Завантаження…</div>}
      {error && <div style={{ color:'#f66' }}>Помилка фіду: {String(error)}</div>}

      {/* сітка карток */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
        {filtered.map((p)=>{
          const sizeSel  = selectedSize[p.id]  ?? (p.sizes[0]  || "");
          const availColors = p.colorsBySize[sizeSel || "_"] || p.colors;
          const colorSel = (selectedColor[p.id] && availColors.includes(selectedColor[p.id]))
            ? selectedColor[p.id] : (availColors[0] || "");
          const keySC = `${sizeSel || "_"}::${colorSel || "_"}`;
          const availClasses = p.classesBySizeColor[keySC] || p.classes;
          const classSel = (selectedClass[p.id] && availClasses.includes(selectedClass[p.id]))
            ? selectedClass[p.id] : (availClasses[0] || "");

          const v = findVariant(p, sizeSel, colorSel, classSel);
          const price = priceFor(v);
          const badge = stockBadge(v.stock);

          return (
            <ProductCard
              key={p.id}
              product={p}
              priceMode={priceMode}
              selectedSize={sizeSel}
              selectedColor={colorSel}
              selectedClass={classSel}          // ← ДОДАНО
              availColors={availColors}
              availClasses={availClasses}       // ← ДОДАНО
              variant={v}
              price={price}
              badge={badge}
              fmt={fmt}
              brand={brand}
              onSelectSize={(s)=>{
                setSelectedSize(prev=>({ ...prev, [p.id]: s }));
                const cols = p.colorsBySize[s || "_"] || p.colors;
                setSelectedColor(prev=>({ ...prev, [p.id]: cols[0] || "" }));
                const key2 = `${s || "_"}::${(cols[0]||"") || "_"}`;
                const klasses = p.classesBySizeColor[key2] || p.classes;
                setSelectedClass(prev=>({ ...prev, [p.id]: klasses[0] || "" }));
              }}
              onSelectColor={(c)=>{
                setSelectedColor(prev=>({ ...prev, [p.id]: c }));
                const key2 = `${sizeSel || "_"}::${c || "_"}`;
                const klasses = p.classesBySizeColor[key2] || p.classes;
                setSelectedClass(prev=>({ ...prev, [p.id]: klasses[0] || "" }));
              }}
              onSelectClass={(k)=>{                      // ← ДОДАНО
                setSelectedClass(prev=>({ ...prev, [p.id]: k }));
              }}
              onOpen={()=>{
                setOpenProduct(p);
                setGalleryIdx(0);
              }}
            /> 
          );
        })}
      </div>

      {!loading && filtered.length===0 && (
        <div style={{ color:'#aaa', marginTop:20 }}>Нічого не знайдено. Зміни фільтри або пошук.</div>
      )}

      {openProduct && (
        <ProductModal
          product={openProduct}
          galleryIdx={galleryIdx}
          setGalleryIdx={setGalleryIdx}
          prevImage={()=> setGalleryIdx(i => (i-1 + (openProduct.photos?.length||1)) % (openProduct.photos?.length||1))}
          nextImage={()=> setGalleryIdx(i => (i+1) % (openProduct.photos?.length||1))}
          brand={brand}
          onClose={()=> setOpenProduct(null)}
        />
      )}
    </div>
  );
}
