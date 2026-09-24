export const siteConfig = {
  name: "Skyrise Engineering",
  title: "Skyrise Engineering — Лифтовое оборудование под ключ",
  description:
    "Полный спектр услуг в сфере лифтового оборудования: проектирование, поставка, монтаж, сервис и модернизация. Пассажирские, грузовые, панорамные лифты, эскалаторы и траволаторы.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, ""),
  phones: [
    { display: "+7 701 187 77 76", href: "tel:+77011877776" },
    { display: "+7 708 242 87 19", href: "tel:+77082428719" },
  ],
  email: "khantrade.biz@gmail.com",
  address: "г. Астана, ул. Бейбитшилик 25, БЦ Оркен",
}
