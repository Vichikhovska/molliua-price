import React, { useEffect, useRef, useState } from "react";

export default function ProductModal({
  product,
  galleryIdx,
  setGalleryIdx,
  prevImage,
  nextImage,
  brand,
  onClose,
}) {
  const photos = product?.photos || [];
  const canPrev = photos.length > 1;
  const canNext = photos.length > 1;

  // === Breakpoint
  const [isNarrow, setIsNarrow] = useState(
    typeof window !== "undefined" ? window.innerWidth < 900 : false
  );
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // === Focus + клавіші всередині модалки
  const dialogRef = useRef(null);
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);
  const onKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") prevImage?.();
    if (e.key === "ArrowRight") nextImage?.();
  };

  // === Styles
  const bigImageWrapStyle = {
    background: "#000",
    borderRadius: 10,
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    maxHeight: isNarrow ? "60dvh" : "70dvh",
  };
  const bigImageStyle = {
    maxWidth: "100%",
    maxHeight: "100%",
    width: "auto",
    height: "auto",
    objectFit: "contain",
    display: "block",
  };

  const headerId = "molli-modal-title";

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
        ref={dialogRef}
        className="molli-modal-inner"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headerId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(1100px, 96vw)",
          // стабільно на мобі: 100dvh; старі браузери — 92vh
          height: "min(92vh, 100dvh)",
          background: "#131313",
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            background: brand?.primary ?? "#e43c3c",
            color: "#fff",
          }}
        >
          <div id={headerId} style={{ fontWeight: 800 }}>
            {product?.name}
          </div>
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

        {/* Body (scroll only here) */}
        <div
          className="molli-modal-body"
          style={{ flex: "1 1 auto", overflowY: "auto", padding: 14 }}
        >
          {!isNarrow ? (
            <>
              <div
                className="molli-modal-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 320px",
                  gap: 14,
                  alignItems: "start",
                }}
              >
                {/* Hero image */}
                <div className="molli-modal-hero" style={{ position: "relative" }}>
                  <div style={bigImageWrapStyle}>
                    {photos[galleryIdx] ? (
                      <img src={photos[galleryIdx]} alt="" style={bigImageStyle} />
                    ) : (
                      <div style={{ color: "#666" }}>нема фото</div>
                    )}
                  </div>

                  {/* overlay arrows */}
                  {canPrev && (
                    <button
                      onClick={prevImage}
                      aria-label="Попереднє фото"
                      style={navBtnStyle("left")}
                    >
                      ‹
                    </button>
                  )}
                  {canNext && (
                    <button
                      onClick={nextImage}
                      aria-label="Наступне фото"
                      style={navBtnStyle("right")}
                    >
                      ›
                    </button>
                  )}
                </div>

                {/* Description */}
                <div>
                  {product?.notes && (
                    <div style={{ color: "#ddd", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                      {product.notes}
                    </div>
                  )}
                  <div style={{ marginTop: 12, color: "#bbb", fontSize: 13 }}>
                    Категорія: {product?.category}
                  </div>
                </div>
              </div>

              {/* Thumbs */}
              <Thumbs
                photos={photos}
                activeIndex={galleryIdx}
                setGalleryIdx={setGalleryIdx}
                brand={brand}
              />
            </>
          ) : (
            <>
              {/* Description */}
              <div style={{ marginBottom: 12 }}>
                {product?.notes && (
                  <div style={{ color: "#ddd", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                    {product.notes}
                  </div>
                )}
                <div style={{ marginTop: 12, color: "#bbb", fontSize: 13 }}>
                  Категорія: {product?.category}
                </div>
              </div>

              {/* Hero image */}
              <div className="molli-modal-hero" style={{ position: "relative" }}>
                <div style={bigImageWrapStyle}>
                  {photos[galleryIdx] ? (
                    <img src={photos[galleryIdx]} alt="" style={bigImageStyle} />
                  ) : (
                    <div style={{ color: "#666" }}>нема фото</div>
                  )}
                </div>

                {canPrev && (
                  <button
                    onClick={prevImage}
                    aria-label="Попереднє фото"
                    style={navBtnStyle("left")}
                  >
                    ‹
                  </button>
                )}
                {canNext && (
                  <button
                    onClick={nextImage}
                    aria-label="Наступне фото"
                    style={navBtnStyle("right")}
                  >
                    ›
                  </button>
                )}
              </div>

              {/* Thumbs */}
              <Thumbs
                photos={photos}
                activeIndex={galleryIdx}
                setGalleryIdx={setGalleryIdx}
                brand={brand}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Thumbs({ photos, activeIndex, setGalleryIdx, brand }) {
  return (
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
          alt={`Зображення ${i + 1}`}
          onClick={() => setGalleryIdx(i)}
          aria-current={activeIndex === i ? "true" : undefined}
          style={{
            width: 80,
            height: 60,
            objectFit: "cover",
            borderRadius: 6,
            cursor: "pointer",
            outline:
              activeIndex === i
                ? `2px solid ${brand?.primary || "#fff"}`
                : "none",
          }}
        />
      ))}
    </div>
  );
}

function navBtnStyle(side) {
  return {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [side]: 8,
    background: "rgba(0,0,0,.5)",
    color: "#fff",
    border: "1px solid #333",
    width: 36,
    height: 36,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    userSelect: "none",
  };
}
