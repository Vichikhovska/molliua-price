import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import ProductCard from "./ProductCard.jsx";
import ProductModal from "./ProductModal.jsx";

/* ===== helpers ==================================================== */
const normalizeStockText = (v) => {
  if (v == null) return "";
  if (typeof v === "object" && v.value) v = v.value; // dropdown chip -> value
  return String(v).replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
};

const stockBadge = (raw) => {
  const s = normalizeStockText(raw);

  if (s === "так")
    return { label: "В наявності", color: "#2ea043" };
  if (s === "ні")
    return { label: "Немає", color: "#6b7280" };
  if (s.includes("відшив"))
    return { label: "Відшиваємо", color: "#d29922" };
  if (s.includes("під замовлення"))
    return { label: "Під замовлення", color: "#d29922" };
  // дефолт
  return { label: "Немає", color: "#6b7280" };
};

const fmt = (n) => (n==null || n==="") ? "" : new Intl.NumberFormat("uk-UA").format(Number(n));
const toNum = (v) => {
  if (v==null || v==="") return undefined;
  const n = Number(String(v).replace(/[ \t,]/g,"."));
  return Number.isFinite(n) ? n : undefined;
};
const makeId = (t) => String(t||"").toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9_-]+/g,"");
const splitList = (v) => String(v||"").replace(/\u00A0/g," ").split(/[;,]/).map(s=>s.trim()).filter(Boolean);

const normalizeCategoryTitle = (v) =>
  String(v ?? "—")
    .replace(/\u00A0/g, " ")   // NBSP -> звичайний пробіл
    .replace(/\s+/g, " ")      // багато пробілів -> один
    .trim();

const categoryKeyOf = (title) => normalizeCategoryTitle(title).toLowerCase();

const normalizeCategory = (c) => {
  if (!c) return "—";
  const clean = String(c).replace(/\u00A0/g, " ").trim().toLowerCase();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

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
function normalizeKeys(row){ const out={}; for (const k of Object.keys(row||{})) out[String(k).trim().toLowerCase()] = row[k]; return out; }
function buildAutoMap(headers = []) {
  const H = headers.map(h => String(h).trim().toLowerCase());
  const pick = (...alts) => {
    for (const a of alts) {
      const rx = a instanceof RegExp ? a : new RegExp(`^\\s*${a}\\s*$`, "i");
      const i = H.findIndex(h => rx.test(h));
      if (i >= 0) return headers[i];
    }
    return undefined;
  };

  return {
    category:    pick(/катег/i, /^category$/i),
    name:        pick(/^назва$/i, /^name$/i, /^товар$/i, /title/i),
    sku:         pick(/артикул/i, /^sku$/i, /^код$/i, /vendor/i, /article/i),

    // головне фото (назва колонки може бути будь-яка з цих)
    photo:       pick(/^фото$/i, /^photo$/i, /^image$/i, /picture/i, /img/i, /images?/i),

    color:       pick(/колір/i, /color/i),
    size:        pick(/розмір/i, /size/i),

    priceRetail: pick(/роздріб/i, /rrc/i, /^price$/i, /(ціна|цiна)/i),
    priceDrop:   pick(/дроп/i, /drop/i, /wholesale/i),
    priceBulk:   pick(/гурт.*30/i, /\bbulk\b/i, /30/),
    priceBuyout: pick(/викуп.*100/i, /100/),

    minQty:      pick(/мін.?парт/i, /min.*qty/i, /мінімальна/i),
    stock:       pick(/наяв/i, /^stock$/i, /in_?stock/i, /\bqty\b/i),
    notes:       pick(/^опис$/i, /description/i, /notes?/i),

    // опційні додаткові фотоколонки (укр+англ, але без рос.)
    photo2:  pick(/(фото|photo|image)\s*2/i),
    photo3:  pick(/(фото|photo|image)\s*3/i),
    photo4:  pick(/(фото|photo|image)\s*4/i),
    photo5:  pick(/(фото|photo|image)\s*5/i),
    photo6:  pick(/(фото|photo|image)\s*6/i),
    photo7:  pick(/(фото|photo|image)\s*7/i),
    photo8:  pick(/(фото|photo|image)\s*8/i),
    photo9:  pick(/(фото|photo|image)\s*9/i),
    photo10: pick(/(фото|photo|image)\s*10/i),
  };
}

function mapRow(r, map) {
  const get = (key, fb = []) => {
    const desired = (map?.[key] ?? "").toString().trim().toLowerCase();
    if (desired && r[desired] !== undefined) return r[desired];
    for (const f of fb) {
      const k = f.toString().trim().toLowerCase();
      if (r[k] !== undefined) return r[k];
    }
    return undefined;
  };

  // ✅ підтримка "кілька URL в одній клітинці" (через кому/крапку з комою)
  const photos = [
    ...splitList(get("photo", ["фото","photo","image","img","picture","images"])),
    ...splitList(get("photo2")),
    ...splitList(get("photo3")),
    ...splitList(get("photo4")),
    ...splitList(get("photo5")),
    ...splitList(get("photo6")),
    ...splitList(get("photo7")),
    ...splitList(get("photo8")),
    ...splitList(get("photo9")),
    ...splitList(get("photo10")),
  ].filter(Boolean);

  return {
    category:    get("category", ["категорія","category"]),
    name:        get("name", ["назва","name","товар","title"]),
    sku:         get("sku", ["артикул","sku","код"]),
    photos, // масив посилань

    color:       get("color", ["колір","color"]),
    size:        get("size", ["розмір","size"]),

    priceRetail: toNum(get("priceRetail", ["роздріб","price","ціна","цiна","rrc"])),
    priceDrop:   toNum(get("priceDrop",   ["дроп","wholesale","drop"])),
    priceBulk:   toNum(get("priceBulk",   ["гурт 30+","гурт (від 30 шт)","bulk"])),
    priceBuyout: toNum(get("priceBuyout", ["викуп 100+","викуп (від 100 шт)","buyout"])),

    minQty:      get("minQty", ["мінімальна партія","мінпартія","min_qty"]),
    stock:       get("stock", ["наявність","in_stock","stock","qty"]),
    notes:       get("notes", ["опис","description","notes"]),
  };
}

function explodeVariants(row){
  const sizes = splitList(row.size);
  const colors = splitList(row.color);
  if (!sizes.length && !colors.length) return [row];
  const S = sizes.length? sizes : [""];
  const C = colors.length? colors : [""];
  const out=[]; for (const s of S) for (const c of C) out.push({...row, size:s, color:c});
  return out;
}
function buildProducts(rows){
  const map = new Map();
  for (const r of rows){
    const key = `${r.category||""}::${r.name||r.sku||""}`.toLowerCase();
    if (!map.has(key)){
      const catTitle = normalizeCategoryTitle(r.category || "—");
map.set(key, {
  id: makeId(key),
  name: r.name || r.sku || "Без назви",
  categoryTitle: catTitle,          // для відображення
  categoryKey: categoryKeyOf(catTitle), // для фільтрації
  notes: r.notes,
  minQty: r.minQty,
  basePhotos: r.photos || [],
  variants: [],
});

    }
    map.get(key).variants.push({
      size: r.size || "",
      color: r.color || "",
      sku: r.sku,
      stock: r.stock,
      photos: r.photos || [],
      priceRetail: r.priceRetail,
      priceDrop: r.priceDrop,
      priceBulk: r.priceBulk,
      priceBuyout: r.priceBuyout,
    });
  }
  return Array.from(map.values()).map(p=>{
    const sizeSet = new Set(p.variants.map(v=>v.size).filter(Boolean));
    const colorSet = new Set(p.variants.map(v=>v.color).filter(Boolean));
    const colorsBySize={};
    for (const v of p.variants){
      const s = v.size || "_";
      if (!colorsBySize[s]) colorsBySize[s]=new Set();
      if (v.color) colorsBySize[s].add(v.color);
    }
    const allPhotos = Array.from(new Set([...(p.basePhotos||[]), ...p.variants.flatMap(v=>v.photos||[])]));
    return {
      ...p,
      photos: allPhotos,
      sizes: Array.from(sizeSet),
      colors: Array.from(colorSet),
      colorsBySize: Object.fromEntries(Object.entries(colorsBySize).map(([k,set])=>[k,Array.from(set)])),
    };
  });
}

/* ===== component =================================================== */
export default function MOLLIUAPrice({
  feedUrl,
  mapFields,
  brand = { primary: "#E30613" },
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [catKey, setCatKey] = useState("all");
  const [query, setQuery] = useState("");
  const [priceMode, setPriceMode] = useState("retail"); // retail | drop | bulk | buyout

  // вибір per-product
  const [selectedSize, setSelectedSize]   = useState({});
  const [selectedColor, setSelectedColor] = useState({});

  // модалка
  const [openProduct, setOpenProduct] = useState(null);
  const [galleryIdx, setGalleryIdx] = useState(0);

  useEffect(()=>{ (async()=>{
    try{
      setLoading(true); setError(null);
      const raw = await fetchAny(feedUrl);
      const norm = raw.map(normalizeKeys);
      const auto = buildAutoMap(Object.keys(norm[0]||{}));
      const user = Object.fromEntries(Object.entries(mapFields||{}).map(([k,v])=>[k, String(v||"").toLowerCase()]));
      const eff = { ...auto, ...user };
      const rows = norm.map(r => mapRow(r, eff));
      const exploded = rows.flatMap(explodeVariants);
      const prods = buildProducts(exploded);
      setProducts(prods);
    }catch(e){ console.error(e); setError(String(e)); setProducts([]); }
    finally{ setLoading(false); }
  })(); }, [feedUrl, JSON.stringify(mapFields)]);

const categories = useMemo(() => {
  if (!products.length) return [{ key: "all", title: "Всі" }];
  const map = new Map(); // key -> title
  for (const p of products) {
    if (!map.has(p.categoryKey)) map.set(p.categoryKey, p.categoryTitle);
  }
  return [{ key: "all", title: "Всі" }, ...Array.from(map, ([key, title]) => ({ key, title }))];
}, [products]);


  const filtered = useMemo(()=>{
    let list = products;
    if (catKey !== "all") list = list.filter(p => p.categoryKey === catKey);
    const q = query.trim().toLowerCase();
    if (q){
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.variants.some(v => (v.sku||"").toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, catKey, query]);

  const findVariant = (p, size, color) => {
    let pool = p.variants;
    if (size)  pool = pool.filter(v => (v.size||"")  === size);
    if (color) pool = pool.filter(v => (v.color||"") === color);
    return pool[0] || p.variants[0];
  };
  const priceFor = (v) => {
    if (priceMode === "retail") return v.priceRetail ?? v.priceDrop ?? v.priceBulk ?? v.priceBuyout;
    if (priceMode === "drop")   return v.priceDrop   ?? v.priceRetail ?? v.priceBulk ?? v.priceBuyout;
    if (priceMode === "bulk")   return v.priceBulk   ?? v.priceDrop   ?? v.priceRetail ?? v.priceBuyout;
    if (priceMode === "buyout") return v.priceBuyout ?? v.priceBulk   ?? v.priceDrop ?? v.priceRetail;
    return v.priceRetail ?? v.priceDrop ?? v.priceBulk ?? v.priceBuyout;
  };

  const prevImage = () => {
    if (!openProduct?.photos?.length) return;
    setGalleryIdx(i => (i - 1 + openProduct.photos.length) % openProduct.photos.length);
  };
  const nextImage = () => {
    if (!openProduct?.photos?.length) return;
    setGalleryIdx(i => (i + 1) % openProduct.photos.length);
  };

  return (
    <div style={{ padding: 20, color:'#fff', background:'#111', minHeight:'100vh', fontFamily:"system-ui, -apple-system, Segoe UI, Roboto" }}>
      {/* Top bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <h1 style={{ color: brand.primary, margin: 0, lineHeight:1 }}>Прайс MOLLI</h1>
        <div style={{display:'flex', gap:14, alignItems:'center', fontSize:14}}>
          <a href="tel:+38 096 201 96 65" style={{color:'#fff', textDecoration:'none'}}>+38 096 201 96 65</a>
          <span style={{opacity:.35}}>·</span>
          <a href="tel:+38 099 732 74 13" style={{color:'#fff', textDecoration:'none'}}>+38 099 732 74 13</a>
          <span style={{opacity:.35}}>·</span>
          <a href="https://molliua.com" target="_blank" rel="noreferrer" style={{color:'#fff', textDecoration:'none', opacity:.9}}>
            molliua.com
          </a>
        </div>
      </div>

      {/* Панель фільтрів */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', margin:'14px 0 16px', alignItems:'center' }}>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', flex:'1 1 auto' }}>
      {categories.map(c => (
        <button
          key={c.key}
          onClick={() => setCatKey(c.key)}
          style={{
            padding:'6px 10px',
            borderRadius:999,
            border:'1px solid #333',
            background: catKey === c.key ? brand.primary : '#222',
            color:'#fff',
            cursor:'pointer'
          }}
        >
          {c.title}
        </button>
      ))}
    </div>
        <input
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          placeholder="Пошук: назва / артикул"
          style={{ padding:'8px 10px', borderRadius:8, border:'1px solid #333', background:'#1a1a1a', color:'#fff', minWidth:260 }}
        />

        {/* перемикачі цін — менший шрифт */}
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

      {/* Сітка карток */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
        {filtered.map((p)=>{
          const sizeSel = selectedSize[p.id] ?? (p.sizes[0] || "");
          const availColors = p.colorsBySize[sizeSel || "_"] || p.colors;
          const colorSel = selectedColor[p.id] && availColors.includes(selectedColor[p.id])
            ? selectedColor[p.id] : (availColors[0] || "");
          const v = (() => {
            let pool = p.variants;
            if (sizeSel)  pool = pool.filter(v => (v.size||"")  === sizeSel);
            if (colorSel) pool = pool.filter(v => (v.color||"") === colorSel);
            return pool[0] || p.variants[0];
          })();
          const price = (()=>{
            if (priceMode === "retail") return v.priceRetail ?? v.priceDrop ?? v.priceBulk ?? v.priceBuyout;
            if (priceMode === "drop")   return v.priceDrop   ?? v.priceRetail ?? v.priceBulk ?? v.priceBuyout;
            if (priceMode === "bulk")   return v.priceBulk   ?? v.priceDrop   ?? v.priceRetail ?? v.priceBuyout;
            if (priceMode === "buyout") return v.priceBuyout ?? v.priceBulk   ?? v.priceDrop ?? v.priceRetail;
            return v.priceRetail ?? v.priceDrop ?? v.priceBulk ?? v.priceBuyout;
          })();
          const badge = stockBadge(v.stock);

          return (
            <ProductCard
              key={p.id}
              product={p}
              priceMode={priceMode}
              selectedSize={sizeSel}
              selectedColor={colorSel}
              availColors={availColors}
              variant={v}
              price={price}
              badge={badge}
              fmt={fmt}
              brand={brand}
              onSelectSize={(s)=>{
                setSelectedSize(prev=>({ ...prev, [p.id]: s }));
                const cols = p.colorsBySize[s || "_"] || p.colors;
                setSelectedColor(prev=>({ ...prev, [p.id]: cols[0] || "" }));
              }}
              onSelectColor={(c)=> setSelectedColor(prev=>({ ...prev, [p.id]: c }))}
              onOpen={()=>{ setOpenProduct(p); setGalleryIdx(0); }}
            />
          );
        })}
      </div>

      {/* Модалка продукту з галереєю */}
      {openProduct && (
        <ProductModal
          product={openProduct}
          galleryIdx={galleryIdx}
          setGalleryIdx={setGalleryIdx}
          prevImage={prevImage}
          nextImage={nextImage}
          brand={brand}
          onClose={()=>setOpenProduct(null)}
        />
      )}
    </div>
  );
}
