import React, { useEffect, useState } from "react";

export default function ProductModal({
  product,
  galleryIdx,
  setGalleryIdx,
  prevImage,
  nextImage,
  brand,
  onClose,
}) {
  // === Гарячі клавіші: Esc / ← →
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prevImage?.();
      if (e.key === "ArrowRight") nextImage?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prevImage, nextImage]);

  const photos = product?.photos || [];

  // === Breakpoint: коли ширина вікна < 900 → мобільний режим (колонка)
  const [isNarrow, setIsNarrow] = useState(
    typeof window !== "undefined" ? window.innerWidth < 900 : false
  );
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // === Стилі для великого фото (без кропу) — спільні для обох режимів
  const bigImageWrapStyle = {
    background: "#000",
    borderRadius: 10,
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    // висота блоку з фото: трохи менша на мобільному
    // height: isNarrow ? "60vh" : "70vh",
  };
  const bigImageStyle = {
    maxWidth: "100%",
    maxHeight: "100%",
    width: "auto",
    height: "auto",
    objectFit: "contain", // показуємо фото повністю, без обрізання
    display: "block",
  };

  return (
    <div
      className="molli-modal"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(19, 19, 19, 0.8)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
      }}
    >
      <div
        className="molli-modal-inner"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(1100px, 96vw)",
          height: "92vh",              // фіксована висота діалогу
          background: "#131313ff",
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* === Header (назва червона — як було) === */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            background: "#e43c3cff",
          }}
        >
          <div style={{ fontWeight: 800 }}>{product?.name}</div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid #333",
              padding: "4px 10px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Закрити
          </button>
        </div>

        {/* === Тіло модалки: скролимо ТІЛЬКИ цю зону === */}
        <div
          className="molli-modal-body"
          style={{
            flex: "1 1 auto",
            overflowY: "auto", // скрол тут
            padding: 14,
          }}
        >
          {/* ДЕСКТОП (>=900px): дві колонки — фото | опис */}
          {!isNarrow ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 320px",
                  gap: 14,
                  alignItems: "start",
                }}
              >
                {/* велике фото */}
                <div className="molli-modal-hero" style={{ position: "relative" }}>
                  <div style={bigImageWrapStyle}>
                    {photos[galleryIdx] ? (
                      <img src={photos[galleryIdx]} alt="" style={bigImageStyle} />
                    ) : (
                      <div style={{ color: "#666" }}>нема фото</div>
                    )}
                  </div>
                </div>

                {/* опис */}
                <div>
                  {product?.notes && (
                    <div
                      style={{ color: "#ddd", whiteSpace: "pre-wrap", lineHeight: 1.5 }}
                    >
                      {product.notes}
                    </div>
                  )}
                  <div style={{ marginTop: 12, color: "#bbb", fontSize: 13 }}>
                    Категорія: {product?.category}
                  </div>
                </div>
              </div>

              {/* мініатюри знизу (горизонтальний скрол, як було) */}
              <div
                className="molli-modal-thumbs"
                style={{
                  marginTop: 12,
                  padding: "10px 0",
                  background: "#141414",
                  borderRadius: 8,
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                }}
              >
                {photos.map((u, i) => (
                  <img
                    key={i}
                    src={u}
                    onClick={() => setGalleryIdx(i)}
                    style={{
                      width: 80,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 6,
                      cursor: "pointer",
                      outline:
                        galleryIdx === i
                          ? `2px solid ${brand?.primary || "#141414"}`
                          : "none",
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            // МОБІЛЬНИЙ (<900px): все в колонку — ОПИС → ФОТО → ТИЗЕРИ
            <>
              {/* 1) опис */}
              <div style={{ marginBottom: 12 }}>
                {product?.notes && (
                  <div
                    style={{ color: "#ddd", whiteSpace: "pre-wrap", lineHeight: 1.5 }}
                  >
                    {product.notes}
                  </div>
                )}
                <div style={{ marginTop: 12, color: "#bbb", fontSize: 13 }}>
                  Категорія: {product?.category}
                </div>
              </div>

              {/* 2) велике фото */}
              <div className="molli-modal-hero" style={{ position: "relative" }}>
                <div style={bigImageWrapStyle}>
                  {photos[galleryIdx] ? (
                    <img src={photos[galleryIdx]} alt="" style={bigImageStyle} />
                  ) : (
                    <div style={{ color: "#666" }}>нема фото</div>
                  )}
                </div>
              </div>

              {/* 3) мініатюри */}
              <div
                className="molli-modal-thumbs"
                style={{
                  marginTop: 12,
                  padding: "10px 0",
                  background: "#141414",
                  borderRadius: 8,
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                }}
              >
                {photos.map((u, i) => (
                  <img
                    key={i}
                    src={u}
                    onClick={() => setGalleryIdx(i)}
                    style={{
                      width: 80,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 6,
                      cursor: "pointer",
                      outline:
                        galleryIdx === i
                          ? `2px solid ${brand?.primary || "#141414"}`
                          : "none",
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
