import React from "react";

export default function ProductCard({
  product: p,
  priceMode,
  selectedSize,
  selectedColor,
  availColors,
  variant: v,
  price,
  badge,
  fmt,
  brand,
  onSelectSize,
  onSelectColor,
  onOpen,
}) {
  return (
    <div style={{ border:'1px solid #2a2a2a', borderRadius:12, padding:14, background:'#181818' }}>
      {/* верхній рядок */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ fontSize:12, color:'#bbb' }}>{p.category}</div>
        <span style={{ fontSize:12, padding:'2px 8px', borderRadius:999, background:badge.color, color:'#111', fontWeight:700 }}>
          {badge.label}
        </span>
      </div>

      {/* фото — фіксована висота, картка кликабельна */}
      <div onClick={onOpen}
           style={{ aspectRatio:'4/3', background:'#0f0f10', borderRadius:10, overflow:'hidden', marginBottom:10, cursor:'zoom-in' }}>
        { ((v.photos&&v.photos[0]) || (p.photos&&p.photos[0])) ? (
          <img src={(v.photos&&v.photos[0]) || p.photos[0]} alt={p.name}
               style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        ) : (
          <div style={{display:'grid', placeItems:'center', height:'100%', color:'#666'}}>нема фото</div>
        )}
      </div>

      {/* назва */}
      <div style={{ fontWeight:700, lineHeight:1.25, minHeight:40 }}>{p.name}</div>
      {v.sku && <div style={{ fontSize:12, color:'#aaa', marginTop:4 }}>SKU: {v.sku}</div>}

      {/* розміри */}
      {!!p.sizes.length && (
        <div style={{ marginTop:10, display:'flex', gap:6, flexWrap:'wrap' }}>
          {p.sizes.map(s=>(
            <button key={s||"_"} onClick={()=>{
                onSelectSize(s);
              }}
              style={{ padding:'6px 10px', borderRadius:999, border:'1px solid #333',
                       background: (selectedSize===s) ? '#E30613' : '#222', color:'#fff', cursor:'pointer', fontSize:12 }}>
              {s || "—"}
            </button>
          ))}
        </div>
      )}

      {/* кольори */}
      {!!availColors.length && (
        <div style={{ marginTop:8, display:'flex', gap:6, flexWrap:'wrap' }}>
          {availColors.map(c=>(
            <button key={c||"_"} onClick={()=>onSelectColor(c)}
              style={{ padding:'6px 10px', borderRadius:999, border:'1px solid #333',
                       background: (selectedColor===c) ? '#E30613' : '#222', color:'#fff', cursor:'pointer', fontSize:12 }}>
              {c || "—"}
            </button>
          ))}
        </div>
      )}

      {/* Ціни (вертикально) */}
      <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:10 }}>
        <div style={{ fontWeight:800, fontSize:18 }}>{fmt(price)} ₴</div>

        {priceMode!=="retail" && v.priceRetail  !== undefined && (
          <div style={{ fontSize:12, color:'#aaa' }}>роздріб: {fmt(v.priceRetail)} ₴</div>
        )}
        {priceMode!=="drop"   && v.priceDrop    !== undefined && (
          <div style={{ fontSize:12, color:'#aaa' }}>дроп: {fmt(v.priceDrop)} ₴</div>
        )}
        {priceMode!=="bulk"   && v.priceBulk    !== undefined && (
          <div style={{ fontSize:12, color:'#aaa' }}>гурт 30+: {fmt(v.priceBulk)} ₴</div>
        )}
        {priceMode!=="buyout" && v.priceBuyout  !== undefined && (
          <div style={{ fontSize:12, color:'#aaa' }}>викуп 100+: {fmt(v.priceBuyout)} ₴</div>
        )}
      </div>
    </div>
  );
}
