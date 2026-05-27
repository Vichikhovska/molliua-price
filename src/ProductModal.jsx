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

  const [isNarrow, setIsNarrow] = useState(
    typeof window !== "undefined"
      ? window.innerWidth < 900
      : false
  );

  useEffect(() => {
    const onResize = () =>
      setIsNarrow(window.innerWidth < 900);

    window.addEventListener("resize", onResize);

    return () =>
      window.removeEventListener("resize", onResize);
  }, []);

  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const onKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") prevImage?.();
    if (e.key === "ArrowRight") nextImage?.();
  };

  const imageWrapStyle = {
    background: "#0d0d0d",
    borderRadius: 18,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: isNarrow ? "50vh" : "78vh",
    width: "100%",
  };

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.82)",
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
        padding: 12,
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(1500px, 98vw)",
          height: "92vh",
          background: "#131313",
          borderRadius: 20,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 0 40px rgba(0,0,0,.5)",
        }}
      >

        {/* HEADER */}
        <div
          style={{
            padding: "14px 20px",
            background: brand?.primary || "#E30613",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div
            style={{
              color: "#fff",
              fontWeight: 800,
              fontSize: 20,
              lineHeight: 1.3,
            }}
          >
            {product?.name}
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.3)",
              borderRadius: 10,
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Закрити
          </button>
        </div>

        {/* BODY */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            padding: 18,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isNarrow
                ? "1fr"
                : "1.2fr 460px",
              gap: 22,
              height: "100%",
              alignItems: "start",
            }}
          >

            {/* LEFT */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                paddingRight: 18,
              }}
            >

              {/* IMAGE */}
              <div
                style={{
                  position: "relative",
                  flex: 1,
                }}
              >
                <div style={imageWrapStyle}>
                  {photos[galleryIdx] ? (
                    <img
                      src={photos[galleryIdx]}
                      alt=""
                      style={imageStyle}
                    />
                  ) : (
                    <div style={{ color: "#777" }}>
                      нема фото
                    </div>
                  )}
                </div>

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      style={navBtn("left")}
                    >
                      ‹
                    </button>

                    <button
                      onClick={nextImage}
                      style={navBtn("right")}
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* THUMBS */}
              {photos.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 14,
                    overflowX: "auto",
                    paddingBottom: 4,
                  }}
                >
                  {photos.map((u, i) => (
                    <img
                      key={i}
                      src={u}
                      alt=""
                      onClick={() => setGalleryIdx(i)}
                      style={{
                        width: 90,
                        height: 70,
                        objectFit: "cover",
                        borderRadius: 10,
                        cursor: "pointer",
                        border:
                          galleryIdx === i
                            ? `2px solid ${brand?.primary || "#E30613"}`
                            : "2px solid transparent",
                        opacity:
                          galleryIdx === i ? 1 : 0.7,
                        transition: ".2s",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div
              style={{
                overflowY: "auto",
                paddingRight: 8,
                paddingTop: 4,
              }}
            >
              <div
                style={{
                  color: "#e5e5e5",
                  fontSize: 13,
                  lineHeight: 1.45,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {product?.notes || "Опис відсутній"}
              </div>

              <div
                style={{
                  marginTop: 18,
                  paddingTop: 14,
                  borderTop: "1px solid #2a2a2a",
                  color: "#888",
                  fontSize: 12,
                }}
              >
                Категорія: {product?.category}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function navBtn(side) {
  return {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [side]: 14,
    width: 46,
    height: 46,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.2)",
    background: "rgba(0,0,0,.45)",
    color: "#fff",
    fontSize: 28,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    backdropFilter: "blur(3px)",
  };
}