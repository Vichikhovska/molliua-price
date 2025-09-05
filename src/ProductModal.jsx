import React from "react";

export default function ProductModal({
  product,
  galleryIdx,
  setGalleryIdx,
  prevImage,
  nextImage,
  brand,
  onClose,
}) {
  return (
    <div onClick={onClose}
         style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'grid', placeItems:'center', zIndex:50 }}>
      <div onClick={e=>e.stopPropagation()}
           style={{ width:'min(1100px, 96vw)', maxHeight:'92vh', background:'#0f0f10', borderRadius:12, overflow:'hidden',
                    display:'grid', gridTemplateRows:'auto 1fr auto' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#141414' }}>
          <div style={{ fontWeight:800 }}>{product.name}</div>
          <button onClick={onClose}
            style={{ background:'transparent', color:'#fff', border:'1px solid #333', padding:'4px 10px', borderRadius:8, cursor:'pointer' }}>
            Закрити
          </button>
        </div>

        {/* Body */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:14, padding:14, alignItems:'start' }}>
          {/* велике фото + стрілки */}
          <div style={{ position:'relative' }}>
            <div style={{ background:'#000', borderRadius:10, overflow:'hidden', aspectRatio:'4/3', display:'grid', placeItems:'center' }}>
              { product.photos[galleryIdx] ? (
                <img src={product.photos[galleryIdx]} alt=""
                     style={{ width:'100%', height:'100%', objectFit:'contain' }} />
              ) : (<div style={{ color:'#666' }}>нема фото</div>)}
            </div>

            {product.photos.length > 1 && (
              <>
                <button onClick={prevImage}
                  style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)',
                           background:'rgba(0,0,0,0.5)', border:'1px solid #333', color:'#fff',
                           borderRadius:999, width:36, height:36, cursor:'pointer', fontSize:18 }}
                  aria-label="Попереднє фото">‹</button>
                <button onClick={nextImage}
                  style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)',
                           background:'rgba(0,0,0,0.5)', border:'1px solid #333', color:'#fff',
                           borderRadius:999, width:36, height:36, cursor:'pointer', fontSize:18 }}
                  aria-label="Наступне фото">›</button>
              </>
            )}
          </div>

          {/* опис +мета */}
          <div>
            {product.notes && (
              <div style={{ color:'#ddd', whiteSpace:'pre-wrap' }}>{product.notes}</div>
            )}
            <div style={{ marginTop:12, color:'#bbb', fontSize:13 }}>
              Категорія: {product.category}
            </div>
          </div>
        </div>

        {/* thumbs */}
        <div style={{ padding:'10px 14px', background:'#141414', display:'flex', gap:8, overflowX:'auto' }}>
          {product.photos.map((u, i)=>(
            <img key={i} src={u} onClick={()=>setGalleryIdx(i)}
                 style={{ width:80, height:60, objectFit:'cover', borderRadius:6, cursor:'pointer',
                          outline: galleryIdx===i ? `2px solid ${brand.primary}` : 'none' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
