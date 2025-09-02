import MOLLIUAPrice from "./MOLLIUAPrice.jsx";

export default function App() {
  return (
    <MOLLIUAPrice
      feedUrl="https://script.google.com/macros/s/AKfycbwmc-b2M_8m2DSMpFk11H4KIQTPSG0MnztI3WU7e4Rt-uWGj_4ePUO_Bdrq6C-aY8Fe/exec"
      mapFields={{
        category: "категорія",
        name: "назва",
        sku: "артикул",
        photo: "фото",
        color: "колір",
        size: "розмір",
        priceRetail: "роздріб",
        priceDrop: "дроп",
        priceBulk: "гурт (від 30 шт)",
        priceBuyout: "викуп (від 100 шт)",
        minQty: "мінімальна партія",
        stock: "наявність",
        notes: "опис",
      }}
      telegramUser="Mollimanager"
    />
  );
}
