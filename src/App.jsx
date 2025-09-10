import MOLLIUAPrice from "./MOLLIUAPrice.jsx";

export default function App() {
  return (
    <MOLLIUAPrice
      feedUrl="https://script.google.com/macros/s/AKfycbwmc-b2M_8m2DSMpFk11H4KIQTPSG0MnztI3WU7e4Rt-uWGj_4ePUO_Bdrq6C-aY8Fe/exec"
      mapFields={{
        category: "Категорія",
        name: "Назва",
        sku: "Артикул",
        photo: "Фото",
        color: "Колір",
        size: "Розмір",
        protectionClass: "Клас захисту",
        priceRetail: "Роздріб",
        priceDrop: "Дроп",
        priceBulk: "Гурт 30+",
        priceBuyout: "Викуп 100+",
        stock: "Наявність",
        notes: "Опис",
      }}
    />
  );
}
