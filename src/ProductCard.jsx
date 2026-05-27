import React from "react";

export default function ProductCard({
  product: p,
  priceMode,
  selectedSize,
  selectedColor,
  selectedClass,
  availColors,
  availClasses,
  variant: v,
  price,
  badge,
  fmt,
  brand,
  onSelectSize,
  onSelectColor,
  onSelectClass,
  onOpen,
}) {

  // fallback якщо fmt не передали
  const formatPrice =
    typeof fmt === "function"
      ? fmt
      : (x) => (x == null ? "" : String(x));

  const chipStyle = {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #333",
    background: "#222",
    color: "#fff",
    cursor: "pointer",
    fontSize: 12,
  };

  const cardStyle = {
    border: "1px solid #1e1d1d",
    borderRadius: 16,
    background: "#181818",
    overflow: "hidden",
    padding: 14,
  };

  const photoWrapStyle = {
    height: "max-content",
    background: "#090909ff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    cursor: "zoom-in",
    display: "grid",
    placeItems: "center",
  };

  const photoScrollStyle = {
    width: "100%",
    height: "max-content",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
  };

  const imgStyle = {
    maxWidth: "100%",
    maxHeight: "100%",
    width: "auto",
    height: "auto",
    objectFit: "contain",
    display: "block",
  };

  const mainPhoto =
    ((v?.photos && v.photos[0]) || (p?.photos && p.photos[0])) || null;

  return (
    <div className="molli-card" style={cardStyle}>

      {/* верх */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 12, color: "#bbb" }}>
          {p.category}
        </div>

        <span
          style={{
            fontSize: 12,
            padding: "2px 8px",
            borderRadius: 999,
            background: badge.color || "#E30613",
            color: "#060606",
            fontWeight: 700,
          }}
        >
          {badge.label}
        </span>
      </div>

      {/* фото */}
      <div
        className="molli-card-photo"
        style={photoWrapStyle}
        onClick={onOpen}
      >
        {mainPhoto ? (
          <div style={photoScrollStyle}>
            <img
              src={mainPhoto}
              alt={p.name}
              loading="lazy"
              style={imgStyle}
            />
          </div>
        ) : (
          <div style={{ color: "#666" }}>нема фото</div>
        )}
      </div>

      {/* назва */}
      <div
        className="molli-card-title"
        style={{
          fontWeight: 700,
          lineHeight: 1.25,
          minHeight: 40,
          cursor: "pointer",
        }}
        onClick={onOpen}
      >
        {p.name}
      </div>

      {v?.sku && (
        <div
          style={{
            fontSize: 12,
            color: "#aaa",
            marginTop: 4,
          }}
        >
          SKU: {v.sku}
        </div>
      )}

      {/* розміри */}
      {!!p.sizes.length && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {p.sizes.map((s) => (
            <button
              key={s || "_"}
              onClick={() => onSelectSize(s)}
              style={{
                ...chipStyle,
                background:
                  selectedSize === s ? "#090909ff" : "#222",
              }}
            >
              {s || "—"}
            </button>
          ))}
        </div>
      )}

      {/* кольори */}
      {!!availColors.length && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {availColors.map((c) => (
            <button
              key={c || "_"}
              onClick={() => onSelectColor(c)}
              style={{
                ...chipStyle,
                background:
                  selectedColor === c ? "#E30613" : "#222",
              }}
            >
              {c || "—"}
            </button>
          ))}
        </div>
      )}

      {/* клас захисту */}
      {!!(availClasses && availClasses.length) && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {availClasses.map((k) => (
            <button
              key={k || "_"}
              onClick={() => onSelectClass(k)}
              style={{
                ...chipStyle,
                background:
                  selectedClass === k ? "#E30613" : "#222",
              }}
            >
              {k || "—"}
            </button>
          ))}
        </div>
      )}

      {/* ціни */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginTop: 10,
        }}
      >

        {/* АКТИВНА ЦІНА */}
        <div
          style={{
            fontWeight: 800,
            fontSize: 18,
            color: "#fff",
          }}
        >
          {formatPrice(price)} ₴
        </div>

        {/* інші ціни */}
        {priceMode !== "retail" &&
          v.priceRetail !== undefined && (
            <div style={{ fontSize: 12, color: "#aaa" }}>
              роздріб: {formatPrice(v.priceRetail)} ₴
            </div>
          )}

        {priceMode !== "drop" &&
          v.priceDrop !== undefined && (
            <div style={{ fontSize: 12, color: "#aaa" }}>
              дроп: {formatPrice(v.priceDrop)} ₴
            </div>
          )}

        {priceMode !== "bulk" &&
          v.priceBulk !== undefined && (
            <div style={{ fontSize: 12, color: "#aaa" }}>
              гурт: {formatPrice(v.priceBulk)} ₴
            </div>
          )}

        {priceMode !== "buyout" &&
          v.priceBuyout !== undefined && (
            <div style={{ fontSize: 12, color: "#aaa" }}>
              викуп: {formatPrice(v.priceBuyout)} ₴
            </div>
          )}
      </div>
    </div>
  );
}