// Description: This file contains all the constants used in the extension.

// total domains supported by the extension (including amazon.com) - 21
const validDomains = {
  "www.amazon.com": "english", //  1
  "www.amazon.co.uk": "english", //  2
  "www.amazon.com.au": "english", //  3
  "www.amazon.ca": "canadian", //  4
  "www.amazon.es": "estonia", //  5
  "www.amazon.de": "germani", //  6
  "www.amazon.fr": "french", //  7
  "www.amazon.com.mx": "spanish", //  8
  "www.amazon.com.br": "portuguese", //  9
  "www.amazon.com.tr": "turkish", //  10
  "www.amazon.nl": "dutch", //  11
  "www.amazon.it": "italian", //  12
  "www.amazon.in": "english", //  13
  "www.amazon.sa": "arabic", //  14
  "www.amazon.ae": "english", //  15
  "www.amazon.co.jp": "english", //  16
  "www.amazon.au": "english", //  17
  "www.amazon.sg": "english", //  18
  "www.amazon.pl": "polish", //  19
  "www.amazon.se": "swedish", //  20
};

const currencyDelimiter = {
  "www.amazon.com": ".", //  1
  "www.amazon.co.uk": ".", //  2
  "www.amazon.com.au": ".", //  3
  "www.amazon.ca": ".", //  4
  "www.amazon.es": ",", //  5
  "www.amazon.de": ",", //  6
  "www.amazon.fr": ",", //  7
  "www.amazon.com.mx": ".", //  8
  "www.amazon.com.br": ",", //  9
  "www.amazon.com.tr": ",", //  10
  "www.amazon.nl": ".", //  11
  "www.amazon.it": ",", //  12
  "www.amazon.in": ".", //  13
  "www.amazon.sa": ".", //  14
  "www.amazon.ae": ".", //  15
  "www.amazon.co.jp": ".", //  16
  "www.amazon.au": ".", //  17
  "www.amazon.sg": ".", //  18
  "www.amazon.pl": ",", //  19
  "www.amazon.se": ",", //  20
};

const MID_BY_HOST = {
  "amazon.com": "ATVPDKIKX0DER",
  "amazon.com.au": "A39IBJ37TRP1C6",
  "amazon.com.mx": "A1AM78C64UM0Y8",
  "amazon.com.br": "A2Q3Y263D00KWC",
  "amazon.com.tr": "A33AVAJ2PDY3EV",
  "amazon.co.uk": "A1F83G8C2ARO7P",
  "amazon.de": "A1PA6795UKMFR9",
  "amazon.fr": "A13V1IB3VIYZZH",
  "amazon.it": "APJ6JRA9NG5V4",
  "amazon.es": "A1RKKUPIHCS9HS",
  "amazon.co.jp": "A1VC38T7YXB528",
  "amazon.ca": "A2EUQ1WTGCTBG2",
  "amazon.cn": "AAHKV2X7AFYLW",
  "amazon.in": "A21TJRUUN4KGV",
  "amazon.nl": "A1805IZSGTT6HS",
  "amazon.ae": "A2VIGQ35RCS4UG",
  "amazon.sg": "A19VAU5U5O7RUS",
  "amazon.sa": "A17E79C6D8DWNP",
  "amazon.se": "A2NODRKZP88ZB9",
  "amazon.pl": "A1C3SOZRARQ6R3",
};

const selectors = {
  title: {
    english: "#productTitle",
    canadian: "#productTitle",
    estonia: "#productTitle",
    italian: "#productTitle",
    germani: "#productTitle",
    french: "#productTitle",
    spanish: "#productTitle",
    portuguese: "#productTitle",
    turkish: "#productTitle",
    dutch: "#productTitle",
    arabic: "#productTitle",
    polish: "#productTitle",
  },
  itemWeight: {
    english: {
      list: "#detailBulletsWrapper_feature_div span:contains('Item Weight')",
      table: "#productDetails_feature_div th:contains('Item Weight')",
    },
    canadian: {
      list: "#detailBulletsWrapper_feature_div span:contains('Item Weight')",
      table: "#productDetails_feature_div th:contains('Item Weight')",
    },
    estonia: {
      list: "#detailBulletsWrapper_feature_div span:contains('Peso del producto')",
      table: "#productDetails_feature_div th:contains('Peso del producto')",
    },
    italian: {
      list: "#detailBulletsWrapper_feature_div span:contains('Peso articolo')",
      table: "#productDetails_feature_div th:contains('Peso articolo')",
    },
    germani: {
      list: "#detailBulletsWrapper_feature_div span:contains('Artikelgewicht')",
      table: "#productDetails_feature_div th:contains('Artikelgewicht')",
    },
    french: {
      list: "#detailBulletsWrapper_feature_div span:contains('Poids de l'article')",
      table: "#productDetails_feature_div th:contains('Poids de l'article')",
    },
    spanish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Peso del artículo')",
      table: "#productDetails_feature_div th:contains('Peso del artículo')",
    },
    portuguese: {
      list: "#detailBulletsWrapper_feature_div span:contains('Peso do Item')",
      table: "#productDetails_feature_div th:contains('Peso do Item')",
    },
    turkish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Ürün Ağırlığı')",
      table: "#productDetails_feature_div th:contains('Ürün Ağırlığı')",
    },
    dutch: {
      list: "#detailBulletsWrapper_feature_div span:contains('product gewicht')",
      table: "#productDetails_feature_div th:contains('product gewicht')",
    },
    arabic: {
      list: "#detailBulletsWrapper_feature_div span:contains('وزن السلعة')",
      table: "#productDetails_feature_div th:contains('وزن السلعة')",
    },
    polish: {
      list: "#detailBulletsWrapper_feature_div span:contains('waga przedmiotu')",
      table: "#productDetails_feature_div th:contains('waga przedmiotu')",
    },
  },
  bsr: {
    english: {
      list: [
        "#detailBulletsWrapper_feature_div span:contains('Best-sellers rank')",
        "#detailBulletsWrapper_feature_div span:contains('Amazon Bestseller')",
        "#detailBulletsWrapper_feature_div span:contains('Best Sellers Rank')",
        "#SalesRank",
      ],
      table: ["#productDetails_feature_div th:contains('Best-sellers rank')", "#productDetails_feature_div th:contains('Best Sellers Rank')", "#prodDetails th:contains('Best Sellers Rank')"],
    },
    canadian: {
      list: ["#detailBulletsWrapper_feature_div span:contains('Bestsellers rank')", "#detailBulletsWrapper_feature_div span:contains('Best Sellers Rank')"],
      table: ["#productDetails_feature_div th:contains('Bestsellers rank')", "#productDetails_feature_div th:contains('Best Sellers Rank')", "#prodDetails th:contains('Best Sellers Rank')"],
    },
    estonia: {
      list: ["#detailBulletsWrapper_feature_div span:contains('éxitos de ventas')", "#detailBulletsWrapper_feature_div span:contains('Clasificación en los más vendidos')"],
      table: [
        "#productDetails_feature_div th:contains('éxitos de ventas')",
        "#productDetails_feature_div th:contains('Clasificación en los más vendidos')",
        "#prodDetails th:contains('Clasificación en los más vendidos')",
      ],
    },
    italian: {
      list: ["#detailBulletsWrapper_feature_div span:contains('best-seller')", "#detailBulletsWrapper_feature_div span:contains('classifica Bestseller')"],
      table: [
        "#productDetails_feature_div th:contains('classifica Bestseller')",
        "#productDetails_feature_div th:contains('classifica Bestseller')",
        "#prodDetails th:contains('classifica Bestseller')",
      ],
    },
    germani: {
      list: ["#detailBulletsWrapper_feature_div span:contains('Best Sellers Rank')", "#detailBulletsWrapper_feature_div span:contains('Bestseller-Rang')"],
      table: [
        "#productDetails_feature_div th:contains('Best Sellers Rank')",
        "#prodDetails th:contains('Best Sellers Rank')",
        "#productDetails_feature_div th:contains('Bestseller-Rang')",
        "#prodDetails th:contains('Bestseller-Rang')",
      ],
    },
    french: {
      list: ["#detailBulletsWrapper_feature_div span:contains('Classement des meilleures')"],
      table: ["#productDetails_feature_div th:contains('Classement des meilleures')", "#prodDetails th:contains('Classement des meilleures')"],
    },
    spanish: {
      list: ["#detailBulletsWrapper_feature_div span:contains('Clasificación en los más vendidos de Amazon')"],
      table: ["#productDetails_feature_div th:contains('Clasificación en los más vendidos de Amazon')", "#prodDetails th:contains('Clasificación en los más vendidos de Amazon')"],
    },
    portuguese: {
      list: ["#detailBulletsWrapper_feature_div span:contains('Ranking dos mais vendidos')"],
      table: ["#productDetails_feature_div th:contains('Ranking dos mais vendidos')", "#prodDetails th:contains('Ranking dos mais vendidos')"],
    },
    turkish: {
      list: ["#detailBulletsWrapper_feature_div span:contains('En Çok Satanlar Sıralaması')", "#detailBulletsWrapper_feature_div span:contains('En Çok Satanlar Sıralaması')", "#SalesRank"],
      table: [
        "#productDetails_feature_div th:contains('En Çok Satanlar Sıralaması')",
        "#productDetails_feature_div th:contains('En Çok Satanlar Sıralaması')",
        "#prodDetails th:contains('En Çok Satanlar Sıralaması')",
      ],
    },
    dutch: {
      list: ["#detailBulletsWrapper_feature_div span:contains('Best Sellers Rank')", "#detailBulletsWrapper_feature_div span:contains('Plaats in bestsellerlijst')", "#SalesRank"],
      table: [
        "#productDetails_feature_div th:contains('Plaats in bestsellerlijst')",
        "#productDetails_feature_div th:contains('Plaats in bestsellerlijst')",
        "#prodDetails th:contains('Plaats in bestsellerlijst')",
      ],
    },
    arabic: {
      list: ["#detailBulletsWrapper_feature_div span:contains(' تصنيف الأفضل مبيعاً')", "#detailBulletsWrapper_feature_div span:contains(' تصنيف الأفضل مبيعاً')", "#SalesRank"],
      table: ["#productDetails_feature_div th:contains(' تصنيف الأفضل مبيعاً')", "#productDetails_feature_div th:contains(' تصنيف الأفضل مبيعاً')", "#prodDetails th:contains(' تصنيف الأفضل مبيعاً')"],
    },
    polish: {
      list: [
        "#detailBulletsWrapper_feature_div span:contains('Ranking najlepiej sprzedających się produktów')",
        "#detailBulletsWrapper_feature_div span:contains('Ranking najlepiej sprzedających się produktów')",
        "#SalesRank",
      ],
      table: [
        "#productDetails_feature_div th:contains('Ranking najlepiej sprzedających się produktów')",
        "#productDetails_feature_div th:contains('Ranking najlepiej sprzedających się produktów')",
        "#prodDetails th:contains('Ranking najlepiej sprzedających się produktów')",
      ],
    },
  },
  bsrHTML: {
    english: {
      list: ["#detailBulletsWrapper_feature_div span:contains('Best-sellers rank') ul li", "#detailBulletsWrapper_feature_div span:contains('Best Sellers Rank') ul li"],
      table: ["#productDetails_feature_div th:contains('Best-sellers rank') ul li", "#productDetails_feature_div th:contains('Best Sellers Rank')"],
    },
    canadian: {
      list: ["#detailBulletsWrapper_feature_div span:contains('Bestsellers rank') ul li", "#detailBulletsWrapper_feature_div span:contains('Best Sellers Rank')"],
      table: ["#productDetails_feature_div th:contains('Bestsellers rank') ul li", "#productDetails_feature_div th:contains('Best Sellers Rank')"],
    },
    estonia: {
      list: ["#detailBulletsWrapper_feature_div span:contains('éxitos de ventas') ul li"],
      table: ["#productDetails_feature_div th:contains('éxitos de ventas')"],
    },
    italian: {
      list: ["#detailBulletsWrapper_feature_div span:contains('best-seller') ul li", "#detailBulletsWrapper_feature_div span:contains('classifica Bestseller') ul li"],
      table: ["#productDetails_feature_div th:contains('classifica Bestseller')"],
    },
    germani: {
      list: ["#detailBulletsWrapper_feature_div span:contains('Bestseller-Rang') ul li"],
      table: ["#productDetails_feature_div th:contains('Bestseller-Rang')"],
    },
    french: {
      list: ["#detailBulletsWrapper_feature_div span:contains('Classement des meilleures') ul li"],
      table: ["#productDetails_feature_div th:contains('Classement des meilleures')"],
    },
    spanish: {
      list: ["#detailBulletsWrapper_feature_div span:contains('Clasificación de los más vendidos') ul li"],
      table: ["#productDetails_feature_div th:contains('Clasificación de los más vendidos')"],
    },
    portuguese: {
      list: ["#detailBulletsWrapper_feature_div span:contains('Classificação dos mais vendidos') ul li"],
      table: ["#productDetails_feature_div th:contains('Classificação dos mais vendidos')"],
    },
    turkish: {
      list: ["#detailBulletsWrapper_feature_div span:contains('En çok satanlar sıralaması') ul li", "#detailBulletsWrapper_feature_div span:contains('En çok satanlar sıralaması') ul li"],
      table: ["#productDetails_feature_div th:contains('En çok satanlar sıralaması') ul li", "#productDetails_feature_div th:contains('En çok satanlar sıralaması')"],
    },
    dutch: {
      list: ["#detailBulletsWrapper_feature_div span:contains('Bestsellers gerangschikt') ul li", "#detailBulletsWrapper_feature_div span:contains('Bestsellers gerangschikt') ul li"],
      table: ["#productDetails_feature_div th:contains('Bestsellers gerangschikt') ul li", "#productDetails_feature_div th:contains('Bestsellers gerangschikt')"],
    },
    arabic: {
      list: ["#detailBulletsWrapper_feature_div span:contains('المرتبة الأكثر مبيعًا') ul li", "#detailBulletsWrapper_feature_div span:contains('المرتبة الأكثر مبيعًا') ul li"],
      table: ["#productDetails_feature_div th:contains('المرتبة الأكثر مبيعًا') ul li", "#productDetails_feature_div th:contains('المرتبة الأكثر مبيعًا')"],
    },
    polish: {
      list: ["#detailBulletsWrapper_feature_div span:contains('Ranking bestsellerów') ul li", "#detailBulletsWrapper_feature_div span:contains('Ranking bestsellerów') ul li"],
      table: ["#productDetails_feature_div th:contains('Ranking bestsellerów') ul li", "#productDetails_feature_div th:contains('Ranking bestsellerów')"],
    },
  },
  paperback: {
    english: {
      list: "#detailBulletsWrapper_feature_div span:contains('Paperback')",
      table: "#productDetails_feature_div th:contains('Paperback')",
    },
    canadian: {
      list: "#detailBulletsWrapper_feature_div span:contains('Paperback')",
      table: "#productDetails_feature_div th:contains('Paperback')",
    },
    estonia: {
      list: "#detailBulletsWrapper_feature_div span:contains('Tapa blanda')",
      table: "#productDetails_feature_div th:contains('Tapa blanda')",
    },
    italian: {
      list: "#detailBulletsWrapper_feature_div span:contains('Copertina flessibile')",
      table: "#productDetails_feature_div th:contains('Copertina flessibile')",
    },
    germani: {
      list: "#detailBulletsWrapper_feature_div span:contains('Paperback')",
      table: "#productDetails_feature_div th:contains('Paperback')",
    },
    french: {
      list: "#detailBulletsWrapper_feature_div span:contains('Broché')",
      table: "#productDetails_feature_div th:contains('Broché')",
    },
    spanish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Pasta dura')",
      table: "#productDetails_feature_div th:contains('Pasta dura')",
    },
    portuguese: {
      list: "#detailBulletsWrapper_feature_div span:contains('Livro cartonado')",
      table: "#productDetails_feature_div th:contains('Livro cartonado')",
    },
    turkish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Karton Kitap')",
      table: "#productDetails_feature_div th:contains('Karton Kitap')",
    },
    dutch: {
      list: "#detailBulletsWrapper_feature_div span:contains('Board book')",
      table: "#productDetails_feature_div th:contains('Board book')",
    },
    arabic: {
      list: "#detailBulletsWrapper_feature_div span:contains('غلاف ورقي')",
      table: "#productDetails_feature_div th:contains('غلاف ورقي')",
    },
    polish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Miękka oprawa')",
      table: "#productDetails_feature_div th:contains('Miękka oprawa')",
    },
  },
  isbn10: {
    english: {
      list: "#detailBulletsWrapper_feature_div span:contains('ISBN-10')",
      table: "#productDetails_feature_div th:contains('ISBN-10')",
    },
    canadian: {
      list: "#detailBulletsWrapper_feature_div span:contains('ISBN-10')",
      table: "#productDetails_feature_div th:contains('ISBN-10')",
    },
    estonia: {
      list: "#detailBulletsWrapper_feature_div span:contains('ISBN-10')",
      table: "#productDetails_feature_div th:contains('ISBN-10')",
    },
    italian: {
      list: "#detailBulletsWrapper_feature_div span:contains('ISBN-10')",
      table: "#productDetails_feature_div th:contains('ISBN-10')",
    },
    germani: {
      list: "#detailBulletsWrapper_feature_div span:contains('ISBN-10')",
      table: "#productDetails_feature_div th:contains('ISBN-10')",
    },
    french: {
      list: "#detailBulletsWrapper_feature_div span:contains('ISBN-10')",
      table: "#productDetails_feature_div th:contains('ISBN-10')",
    },
    spanish: {
      list: "#detailBulletsWrapper_feature_div span:contains('ISBN-10')",
      table: "#productDetails_feature_div th:contains('ISBN-10')",
    },
    portuguese: {
      list: "#detailBulletsWrapper_feature_div span:contains('ISBN-10')",
      table: "#productDetails_feature_div th:contains('ISBN-10')",
    },
    turkish: {
      list: "#detailBulletsWrapper_feature_div span:contains('ISBN-10')",
      table: "#productDetails_feature_div th:contains('ISBN-10')",
    },
    dutch: {
      list: "#detailBulletsWrapper_feature_div span:contains('ISBN-10')",
      table: "#productDetails_feature_div th:contains('ISBN-10')",
    },
    arabic: {
      list: "#detailBulletsWrapper_feature_div span:contains('ISBN-10')",
      table: "#productDetails_feature_div th:contains('ISBN-10')",
    },
    polish: {
      list: "#detailBulletsWrapper_feature_div span:contains('ISBN-10')",
      table: "#productDetails_feature_div th:contains('ISBN-10')",
    },
  },
  asin: {
    english: {
      list: "#detailBulletsWrapper_feature_div span:contains('ASIN')",
      table: ["#productDetails_feature_div th:contains('ASIN')", "#prodDetails th:contains('ASIN')"],
    },
    canadian: {
      list: "#detailBulletsWrapper_feature_div span:contains('ASIN')",
      table: ["#productDetails_feature_div th:contains('ASIN')", "#prodDetails th:contains('ASIN')"],
    },
    estonia: {
      list: "#detailBulletsWrapper_feature_div span:contains('ASIN')",
      table: ["#productDetails_feature_div th:contains('ASIN')", "#prodDetails th:contains('ASIN')"],
    },
    italian: {
      list: "#detailBulletsWrapper_feature_div span:contains('ASIN')",
      table: ["#productDetails_feature_div th:contains('ASIN')", "#prodDetails th:contains('ASIN')"],
    },
    germani: {
      list: "#detailBulletsWrapper_feature_div span:contains('ASIN')",
      table: ["#productDetails_feature_div th:contains('ASIN')", "#prodDetails th:contains('ASIN')"],
    },
    french: {
      list: "#detailBulletsWrapper_feature_div span:contains('ASIN')",
      table: ["#productDetails_feature_div th:contains('ASIN')", "#prodDetails th:contains('ASIN')"],
    },
    spanish: {
      list: "#detailBulletsWrapper_feature_div span:contains('ASIN')",
      table: ["#productDetails_feature_div th:contains('ASIN')", "#prodDetails th:contains('ASIN')"],
    },
    portuguese: {
      list: "#detailBulletsWrapper_feature_div span:contains('ASIN')",
      table: ["#productDetails_feature_div th:contains('ASIN')", "#prodDetails th:contains('ASIN')"],
    },
    turkish: {
      list: "#detailBulletsWrapper_feature_div span:contains('ASIN')",
      table: ["#productDetails_feature_div th:contains('ASIN')", "#prodDetails th:contains('ASIN')"],
    },
    dutch: {
      list: "#detailBulletsWrapper_feature_div span:contains('ASIN')",
      table: ["#productDetails_feature_div th:contains('ASIN')", "#prodDetails th:contains('ASIN')"],
    },
    arabic: {
      list: "#detailBulletsWrapper_feature_div span:contains('ASIN')",
      table: ["#productDetails_feature_div th:contains('ASIN')", "#prodDetails th:contains('ASIN')"],
    },
    polish: {
      list: "#detailBulletsWrapper_feature_div span:contains('ASIN')",
      table: ["#productDetails_feature_div th:contains('ASIN')", "#prodDetails th:contains('ASIN')"],
    },
  },
  publisher: {
    english: {
      list: "#detailBulletsWrapper_feature_div span:contains('Publisher')",
      table: "#productDetails_feature_div th:contains('Publisher')",
    },
    canadian: {
      list: "#detailBulletsWrapper_feature_div span:contains('Publisher')",
      table: "#productDetails_feature_div th:contains('Publisher')",
    },
    estonia: {
      list: "#detailBulletsWrapper_feature_div span:contains('Editorial')",
      table: "#productDetails_feature_div th:contains('Editorial')",
    },
    italian: {
      list: "#detailBulletsWrapper_feature_div span:contains('Editore')",
      table: "#productDetails_feature_div th:contains('Editore')",
    },
    germani: {
      list: "#detailBulletsWrapper_feature_div span:contains('Herausgeber')",
      table: "#productDetails_feature_div th:contains('Herausgeber')",
    },
    french: {
      list: "#detailBulletsWrapper_feature_div span:contains('Éditeur')",
      table: "#productDetails_feature_div th:contains('Éditeur')",
    },
    spanish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Editor')",
      table: "#productDetails_feature_div th:contains('Editor')",
    },
    portuguese: {
      list: "#detailBulletsWrapper_feature_div span:contains('Editor')",
      table: "#productDetails_feature_div th:contains('Editor')",
    },
    turkish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Yayıncı')",
      table: "#productDetails_feature_div th:contains('Yayıncı')",
    },
    dutch: {
      list: "#detailBulletsWrapper_feature_div span:contains('Uitgever')",
      table: "#productDetails_feature_div th:contains('Uitgever')",
    },
    arabic: {
      list: "#detailBulletsWrapper_feature_div span:contains('الناشر')",
      table: "#productDetails_feature_div th:contains('الناشر')",
    },
    polish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Wydawca')",
      table: "#productDetails_feature_div th:contains('Wydawca')",
    },
  },
  manufacturer: {
    english: {
      list: "#detailBulletsWrapper_feature_div span:contains('Manufacturer')",
      table: ["#productDetails_feature_div th:contains('Manufacturer')", "#prodDetails th:contains('Manufacturer')"],
    },
    canadian: {
      list: "#detailBulletsWrapper_feature_div span:contains('Manufacturer')",
      table: ["#productDetails_feature_div th:contains('Manufacturer')", "#prodDetails th:contains('Manufacturer')"],
    },
    estonia: {
      list: "#detailBulletsWrapper_feature_div span:contains('Fabricante')",
      table: ["#productDetails_feature_div th:contains('Fabricante')", "#prodDetails th:contains('Fabricante')"],
    },
    italian: {
      list: "#detailBulletsWrapper_feature_div span:contains('Produttore')",
      table: ["#productDetails_feature_div th:contains('Produttore')", "#prodDetails th:contains('Produttore')"],
    },
    germani: {
      list: "#detailBulletsWrapper_feature_div span:contains('Hersteller')",
      table: ["#productDetails_feature_div th:contains('Hersteller')", "#prodDetails th:contains('Hersteller')"],
    },
    french: {
      list: "#detailBulletsWrapper_feature_div span:contains('Fabricant')",
      table: ["#productDetails_feature_div th:contains('Fabricant')", "#prodDetails th:contains('Fabricant')"],
    },
    spanish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Fabricante')",
      table: ["#productDetails_feature_div th:contains('Fabricante')", "#prodDetails th:contains('Fabricante')"],
    },
    portuguese: {
      list: "#detailBulletsWrapper_feature_div span:contains('Fabricante')",
      table: ["#productDetails_feature_div th:contains('Fabricante')", "#prodDetails th:contains('Fabricante')"],
    },
    turkish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Üretici firma')",
      table: ["#productDetails_feature_div th:contains('Üretici firma')", "#prodDetails th:contains('Üretici firma')"],
    },
    dutch: {
      list: "#detailBulletsWrapper_feature_div span:contains('Fabrikant')",
      table: ["#productDetails_feature_div th:contains('Fabrikant')", "#prodDetails th:contains('Fabrikant')"],
    },
    arabic: {
      list: "#detailBulletsWrapper_feature_div span:contains('الصانع')",
      table: ["#productDetails_feature_div th:contains('الصانع')", "#prodDetails th:contains('الصانع')"],
    },
    polish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Producent')",
      table: ["#productDetails_feature_div th:contains('Producent')", "#prodDetails th:contains('Producent')"],
    },
  },
  ratings: {
    english: {
      list: "#acrCustomerReviewText",
      table: "#acrCustomerReviewText",
    },
    canadian: {
      list: "#acrCustomerReviewText",
      table: "#acrCustomerReviewText",
    },
    estonia: {
      list: "#acrCustomerReviewText",
      table: "#acrCustomerReviewText",
    },
    italian: {
      list: "#acrCustomerReviewText",
      table: "#acrCustomerReviewText",
    },
    germani: {
      list: "#acrCustomerReviewText",
      table: "#acrCustomerReviewText",
    },
    french: {
      list: "#acrCustomerReviewText",
      table: "#acrCustomerReviewText",
    },
    spanish: {
      list: "#acrCustomerReviewText",
      table: "#acrCustomerReviewText",
    },
    portuguese: {
      list: "#acrCustomerReviewText",
      table: "#acrCustomerReviewText",
    },
    turkish: {
      list: "#acrCustomerReviewText",
      table: "#acrCustomerReviewText",
    },
    dutch: {
      list: "#acrCustomerReviewText",
      table: "#acrCustomerReviewText",
    },
    arabic: {
      list: "#acrCustomerReviewText",
      table: "#acrCustomerReviewText",
    },
    polish: {
      list: "#acrCustomerReviewText",
      table: "#acrCustomerReviewText",
    },
  },
  productDimensions: {
    english: {
      list: "#detailBulletsWrapper_feature_div span:contains('Product Dimensions')",
      table: "#productDetails_feature_div th:contains('Product Dimensions')",
    },
    canadian: {
      list: "#detailBulletsWrapper_feature_div span:contains('Product Dimensions')",
      table: "#productDetails_feature_div th:contains('Product Dimensions')",
    },
    estonia: {
      list: "#detailBulletsWrapper_feature_div span:contains('Dimensiones del producto')",
      table: "#productDetails_feature_div th:contains('Dimensiones del producto')",
    },
    italian: {
      list: "#detailBulletsWrapper_feature_div span:contains('Dimensioni')",
      table: "#productDetails_feature_div th:contains('Dimensioni')",
    },
    germani: {
      list: "#detailBulletsWrapper_feature_div span:contains('Verpackungsabmessungen')",
      table: "#productDetails_feature_div th:contains('Verpackungsabmessungen')",
    },
    french: {
      list: "#detailBulletsWrapper_feature_div span:contains('Dimensions du produit')",
      table: "#productDetails_feature_div th:contains('Dimensions du colis')",
    },
    spanish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Dimensiones del producto')",
      table: "#productDetails_feature_div th:contains('Dimensiones del producto')",
    },
    portuguese: {
      list: "#detailBulletsWrapper_feature_div span:contains('Dimensões do produto')",
      table: "#productDetails_feature_div th:contains('Dimensões do produto')",
    },
    turkish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Ürün Boyutları')",
      table: "#productDetails_feature_div th:contains('Ürün Boyutları')",
    },
    dutch: {
      list: "#detailBulletsWrapper_feature_div span:contains('Productafmetingen')",
      table: "#productDetails_feature_div th:contains('Productafmetingen')",
    },
    arabic: {
      list: "#detailBulletsWrapper_feature_div span:contains('ابعاد المنتج')",
      table: "#productDetails_feature_div th:contains('ابعاد المنتج')",
    },
    polish: {
      list: "#detailBulletsWrapper_feature_div span:contains('wymiary produktu')",
      table: "#productDetails_feature_div th:contains('wymiary produktu')",
    },
  },
  size: {
    english: {
      list: "#detailBulletsWrapper_feature_div span:contains('Dimensions')",
      table: "#productDetails_feature_div th:contains('Dimensions')",
    },
    canadian: {
      list: "#detailBulletsWrapper_feature_div span:contains('Dimensions')",
      table: "#productDetails_feature_div th:contains('Dimensions')",
    },
    estonia: {
      list: "#detailBulletsWrapper_feature_div span:contains('Dimensions')",
      table: "#productDetails_feature_div th:contains('Dimensions')",
    },
    italian: {
      list: "#detailBulletsWrapper_feature_div span:contains('Dimensions')",
      table: "#productDetails_feature_div th:contains('Dimensions')",
    },
    germani: {
      list: "#detailBulletsWrapper_feature_div span:contains('Abmessungen')",
      table: "#productDetails_feature_div th:contains('Abmessungen')",
    },
    french: {
      list: "#detailBulletsWrapper_feature_div span:contains('Dimensions')",
      table: "#productDetails_feature_div th:contains('Dimensions')",
    },
    spanish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Dimensions')",
      table: "#productDetails_feature_div th:contains('Dimensions')",
    },
    portuguese: {
      list: "#detailBulletsWrapper_feature_div span:contains('Dimensões')",
      table: "#productDetails_feature_div th:contains('Dimensões')",
    },
    turkish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Boyutlar')",
      table: "#productDetails_feature_div th:contains('Boyutlar')",
    },
    dutch: {
      list: "#detailBulletsWrapper_feature_div span:contains('Afmetingen')",
      table: "#productDetails_feature_div th:contains('Afmetingen')",
    },
    arabic: {
      list: "#detailBulletsWrapper_feature_div span:contains('الأبعاد')",
      table: "#productDetails_feature_div th:contains('الأبعاد')",
    },
    polish: {
      list: "#detailBulletsWrapper_feature_div span:contains('Wymiary')",
      table: "#productDetails_feature_div th:contains('Wymiary')",
    },
  },
  authorsNode: {
    english: {
      list: "#bylineInfo_feature_div span.author",
      table: "#bylineInfo_feature_div span.author",
    },
    canadian: {
      list: "#bylineInfo_feature_div span.author",
      table: "#bylineInfo_feature_div span.author",
    },
    estonia: {
      list: "#bylineInfo_feature_div span.author",
      table: "#bylineInfo_feature_div span.author",
    },
    italian: {
      list: "#bylineInfo_feature_div span.author",
      table: "#bylineInfo_feature_div span.author",
    },
    germani: {
      list: "#bylineInfo_feature_div span.author",
      table: "#bylineInfo_feature_div span.author",
    },
    french: {
      list: "#bylineInfo_feature_div span.author",
      table: "#bylineInfo_feature_div span.author",
    },
    spanish: {
      list: "#bylineInfo_feature_div span.author",
      table: "#bylineInfo_feature_div span.author",
    },
    portuguese: {
      list: "#bylineInfo_feature_div span.author",
      table: "#bylineInfo_feature_div span.author",
    },
    turkish: {
      list: "#bylineInfo_feature_div span.author",
      table: "#bylineInfo_feature_div span.author",
    },
    dutch: {
      list: "#bylineInfo_feature_div span.author",
      table: "#bylineInfo_feature_div span.author",
    },
    arabic: {
      list: "#bylineInfo_feature_div span.author",
      table: "#bylineInfo_feature_div span.author",
    },
    polish: {
      list: "#bylineInfo_feature_div span.author",
      table: "#bylineInfo_feature_div span.author",
    },
  },
  paperbackPrice: {
    english: "#tmmSwatches a:contains('Paperback')",
    canadian: "#tmmSwatches a:contains('Paperback')",
    estonia: "#tmmSwatches a:contains('Tapa blanda')",
    italian: "#tmmSwatches a:contains('Copertina flessibile')",
    germani: "#tmmSwatches a:contains('Taschenbuch')",
    french: "#tmmSwatches a:contains('Broché')",
    spanish: "#tmmSwatches a:contains('Libro de bolsillo')",
    portuguese: "#tmmSwatches a:contains('Livro cartonado')",
    turkish: "#tmmSwatches a:contains('ciltsiz')",
    dutch: "#tmmSwatches a:contains('Paperback')",
    arabic: "#tmmSwatches a:contains('غلاف ورقي')",
    polish: "#tmmSwatches a:contains('Oprawa miękka')",
  },
  kindlePrice: {
    english: "#tmmSwatches a:contains('Kindle')",
    canadian: "#tmmSwatches a:contains('Kindle')",
    estonia: "#tmmSwatches a:contains('Versión Kindle')",
    italian: "#tmmSwatches a:contains('Formato Kindle')",
    germani: "#tmmSwatches a:contains('Kindle')",
    french: "#tmmSwatches a:contains('Format Kindle')",
    spanish: "#tmmSwatches a:contains('Encender')",
    portuguese: "#tmmSwatches a:contains('Acender')",
    turkish: "#tmmSwatches a:contains('Tutuşmak')",
    dutch: "#tmmSwatches a:contains('Kindle')",
    arabic: "#tmmSwatches a:contains('كيندل')",
    polish: "#tmmSwatches a:contains('Rozpalać')",
  },
  spiralBoundPrice: {
    english: "#tmmSwatches a:contains('Spiral-bound')",
    canadian: "#tmmSwatches a:contains('Spiral-bound')",
    estonia: "#tmmSwatches a:contains('Encuadernación en espiral')",
    italian: "#tmmSwatches a:contains('Spiral-bound')",
    germani: "#tmmSwatches a:contains('Spiral-bound')",
    french: "#tmmSwatches a:contains('Spiral-bound')",
    spanish: "#tmmSwatches a:contains('Ligado en espiral')",
    portuguese: "#tmmSwatches a:contains('Em espiral')",
    turkish: "#tmmSwatches a:contains('sarmal bağlı')",
    dutch: "#tmmSwatches a:contains('Spiraal gebonden')",
    arabic: "#tmmSwatches a:contains('دوامة ملزمة')",
    polish: "#tmmSwatches a:contains('Oprawa spiralna')",
  },
  hardcoverPrice: {
    english: "#tmmSwatches a:contains('Hardcover')",
    canadian: "#tmmSwatches a:contains('Hardcover')",
    estonia: "#tmmSwatches a:contains('Tapa dura')",
    italian: "#tmmSwatches a:contains('Copertina rigida')",
    germani: "#tmmSwatches a:contains('Gebundenes Buch')",
    french: "#tmmSwatches a:contains('Relié')",
    spanish: "#tmmSwatches a:contains('De tapa dura')",
    portuguese: "#tmmSwatches a:contains('capa dura')",
    turkish: "#tmmSwatches a:contains('Ciltli')",
    dutch: "#tmmSwatches a:contains('Gebonden')",
    arabic: "#tmmSwatches a:contains('غلاف')",
    polish: "#tmmSwatches a:contains('Twarda okładka')",
  },
  mp3Price: {
    english: "#tmmSwatches a:contains('MP3 CD') .a-size-base.a-color-secondary",
    canadian: "#tmmSwatches a:contains('MP3 CD') .a-size-base.a-color-secondary",
    estonia: "#tmmSwatches a:contains('MP3 CD') .a-size-base.a-color-secondary",
    italian: "#tmmSwatches a:contains('MP3 CD') .a-size-base.a-color-secondary",
    germani: "#tmmSwatches a:contains('MP3 CD') .a-size-base.a-color-secondary",
    french: "#tmmSwatches a:contains('MP3 CD') .a-size-base.a-color-secondary",
    spanish: "#tmmSwatches a:contains('MP3 CD') .a-size-base.a-color-secondary",
    portuguese: "#tmmSwatches a:contains('MP3 CD') .a-size-base.a-color-secondary",
    turkish: "#tmmSwatches a:contains('MP3 CD') .a-size-base.a-color-secondary",
    dutch: "#tmmSwatches a:contains('MP3 CD') .a-size-base.a-color-secondary",
    arabic: "#tmmSwatches a:contains('MP3 CD') .a-size-base.a-color-secondary",
    polish: "#tmmSwatches a:contains('MP3 CD') .a-size-base.a-color-secondary",
  },
  audiobookPrice: {
    english: "#tmmSwatches a:contains('Audiobook') .a-size-base.a-color-secondary",
    canadian: "#tmmSwatches a:contains('Audiobook') .a-size-base.a-color-secondary",
    estonia: "#tmmSwatches a:contains('CD de audio') .a-size-base.a-color-secondary",
    italian: "#tmmSwatches a:contains('Audiolibro') .a-size-base.a-color-secondary",
    germani: "#tmmSwatches a:contains('Hörbuch') .a-size-base.a-color-secondary",
    french: "#tmmSwatches a:contains('Téléchargement audio') .a-size-base.a-color-secondary",
    spanish: "#tmmSwatches a:contains('Audio libro') .a-size-base.a-color-secondary",
    portuguese: "#tmmSwatches a:contains('Áudio-livro') .a-size-base.a-color-secondary",
    turkish: "#tmmSwatches a:contains('Sesli kitap') .a-size-base.a-color-secondary",
    dutch: "#tmmSwatches a:contains('Audioboek') .a-size-base.a-color-secondary",
    arabic: "#tmmSwatches a:contains('أوديوبوك') .a-size-base.a-color-secondary",
    polish: "#tmmSwatches a:contains('Książka audio') .a-size-base.a-color-secondary",
  },
  insideBoxPrice: {
    english: "#price_inside_buybox",
    canadian: "#price_inside_buybox",
    estonia: "#price_inside_buybox",
    italian: "#price_inside_buybox",
    germani: "#price_inside_buybox",
    french: "#price_inside_buybox",
    spanish: "#price_inside_buybox",
    portuguese: "#price_inside_buybox",
    turkish: "#price_inside_buybox",
    dutch: "#price_inside_buybox",
    arabic: "#price_inside_buybox",
    polish: "#price_inside_buybox",
  },
  otherPrice: {
    english: ".apexPriceToPay span",
    canadian: ".apexPriceToPay span",
    estonia: ".apexPriceToPay span",
    italian: ".apexPriceToPay span",
    germani: ".apexPriceToPay span",
    french: ".apexPriceToPay span",
    spanish: ".apexPriceToPay span",
    portuguese: ".apexPriceToPay span",
    turkish: ".apexPriceToPay span",
    dutch: ".apexPriceToPay span",
    arabic: ".apexPriceToPay span",
    polish: ".apexPriceToPay span",
  },
};

// html content
var login_div = `<div
      class="container1"
      style=" width: 440px; position: fixed;
      background-color: white;
      height: fit-content;
      //display: none;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      box-shadow: 0px 0px 62.7411px rgb(0 0 0 / 6%);
      border-radius: 10.9137px;
      padding: 5px; "
      >
      <div
        class="beforelogin"
        style="
      display: flex;
      align-items: center;
      flex-direction: column;
      width: 100%;
      gap: 2rem;
      padding: 12px;
      margin-top: 20px:"
      >
        <div>
          <img
            src="chrome-extension://${chrome.runtime.id}/images/newpic.png" 
            alt="KDP"
            style="    height: 89px;
      width: 120px;"
          />
        </div>
        <button class="toggle-round" id="extension_status" style="border-radius: 5px;
        background-color: #dec36f75;
        width: 110px;
        height: 29px;
        font-size: 17px;
        color: #e8449c;
        border: none;">Disable</button>
       <div>
        <P style="font-size: 23px;
        color: #ea3b96;">Please Login / Create New Account </p>
        </div>
              <div
         class="logdiv"
         style=" width: 100%;
         margin-top: 17px;
         display: flex;
         align-items: center;
         justify-content: center;
         flex-direction: column;"
         >
         <a
            class="login"
            style=" height: 35px;
            color: white;
            font-size: medium;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            width: 88%;
            border: none;
            background: linear-gradient(270.09deg, #6b49fc -13.64%, #de85ff 86.14%, #e26ff1 106.56%);
            border-radius: 10.4569px;
            cursor: pointer;"
            class="login"
            href="https://www.selfpublishingtitans.com/auth/login"
            target="_blank"
            ><p class="logtext">Log in</p>
          </a>
      </div>
      
        <div
          class="account"
          style=" width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-top: 13px;
      margin-bottom: 5px;"
        >
          <div>
            <p
              class="wrongpass"
              style=" display: none;
          color: rgb(215, 71, 71);
          font-style: normal;
          font-weight: 600;
          font-size: 100%;
          line-height: 33px;
          margin: 0%;"
            >
              Incorrect email or password
            </p>
          </div>
          <div class="loader" style=" border: 8px solid #f3f3f3;
          border-top: 8px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 2s linear infinite;
          display: none; @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }"></div>
      
          <a href="https://www.selfpublishingtitans.com/auth/forgot" target="_blank">
            <p
              class="ftext"
              style="font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 0px;
        color: #6b49fc;
        display: inline-block;"
            >
              Forgot Password?
            </p>
          </a>
      
          <hr
            class="line"
            style="width: 90%;
        height: 0px;
        opacity: 0.5;"
          />
          <p
            class="actext"
            style="display: flex;
        font-style: normal;
        font-weight: 600;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.4);
        justify-content: center;"
          >
            Don't have an account?
          </p>
      
          <div
            class="logdiv"
            style="  width: 100%;
        margin-top: 17px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      "
          >
            <button
              class="login"
              style="  height: 35px;
          color: white;
          font-size: medium;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          width: 88%;
          border: none;
          background: linear-gradient(270.09deg, #6b49fc -13.64%, #de85ff 86.14%, #e26ff1 106.56%);
          border-radius: 10.4569px;
          cursor: pointer;"
            >
              <a href="https://www.selfpublishingtitans.com/auth/register" target="_blank" style="text-decoration: none; color: white">
                Create New Account
              </a>
            </button>
      
            <hr class="line" />
            <p
              class="actext"
              style=" display: flex;
          font-style: normal;
          font-weight: 600;
          font-size: 13px;
          color: rgba(0, 0, 0, 0.4);
          justify-content: center;"
            >
              Need Help/Support? Email me or Facebook DM
            </p>
          </div>
        </div>
      </div>
      </div>;`;

var tableOld = `<table id="amazon-analysis-${chrome.runtime.id}" style="border-collapse: collapse; border: 2px solid white; color: white; text-align: center; font-size: 16px">
  <tbody>
    <tr style="border: 2px solid black; line-height: 30px">
      <td rowspan="2" style="border: 2px solid black; vertical-align: middle; background-color: black">
        <div style="display: flex; align-items: center; justify-content: center">
          <img src="chrome-extension://${chrome.runtime.id}/images/newpic.png" width="200px" />
        </div>
      </td>
      <td style="border: 2px solid black; background-color: black; text-align: left">
    

        <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; margin-left: 32px; width: 230px; text-align: center; display: flex; align-items: center; margin-top: 10px;">
          <span style="margin: 5px; margin-left: 40px">Loading...</span>
          </div>
      </td>
      <td style="text-align: left; border: 2px solid black; background-color: black">
        <span style="font-weight: bold; margin-left: 5px">Number of Results</span>

        <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">Loading...</div>
      </td>
      <td style="text-align: left; border: 2px solid black; background-color: black">
        <span style="font-weight: bold; margin-left: 5px">Average Price</span>

        <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">Loading...</div>
      </td>
      <td style="text-align: left; border: 2px solid black; background-color: black">
        <span style="font-weight: bold; margin-left: 5px">Help</span>

        <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">
          <a href="https://www.facebook.com/groups/2690865597847008" target="_blank" style="color: white; display: block">
            <span>Join Facebook Group</span>
          </a>
        </div>
      </td>
      <td style="text-align: left; border: 2px solid black; background-color: black">
        <span style="font-weight: bold; margin-left: 5px">Self Publishing Titans</span>

        <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">
          <a href="https://selfpublishingtitans.com/" target="_blank" style="color: white; display: block">
            <span>More Free Tools</span>
          </a>
        </div>
      </td>
    </tr>
    <tr style="border: 2px solid white; line-height: 30px">
      <td style="border: 2px solid black; text-align: left; vertical-align: middle; background-color: black">
        <span> <span style="font-weight: bold; font-size: 30px;padding-left: 10px;" class="${stylePrefix}-kdplogoword">Titans Quick View</span> </span>
      </td>

      <td style="text-align: left; border: 2px solid black; background-color: black">
        <span style="font-weight: bold; margin-left: 5px">Average BSR</span>

        <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">Loading...</div>
      </td>

      <td style="text-align: left; border: 2px solid black; background-color: black">
        <span style="font-weight: bold; margin-left: 5px">Average Reviews</span>

        <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">Loading...</div>
      </td>
      <td style="text-align: left; border: 2px solid black; background-color: black">
        <span style="font-weight: bold; margin-left: 5px">Download</span>

        <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">
          <a href="javascript: void(0)" id="download_excel_file_${chrome.runtime.id}" style="color: white; display: block"> All 1st Page Data </a>
        </div>
      </td>
      <td style="text-align: left; border: 2px solid black; background-color: black">
        <span style="font-weight: bold; margin-left: 5px">How To</span>

        <div style="background-color: red; border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">
          <a href="https://www.youtube.com/channel/UCkOTYGNYxS6jq7JT3Fk5NEQ" target="_blank" style="color: white"> New Tutorial Video! </a>
        </div>
      </td>
    </tr>
  </tbody>
  </table>
  `;

var table = `
  <table id="amazon-analysis-${chrome.runtime.id}" style="height: 170px; width: 100%; border-collapse: collapse; border: 2px solid white; color: white; text-align: center; font-size: 16px">
  <tbody>
    <tr style="border: 2px solid black; line-height: 30px">
      <td style="border: 2px solid black; text-align: center; vertical-align: middle; background-color: black">
        <span> <span style="font-weight: bold; font-size: 30px;padding-left: 10px;" class="${stylePrefix}-kdplogoword">Titans Quick View</span> </span>
      </td>

      <td rowspan="2" class="${stylePrefix}-bsr-td">
        <span style="font-weight: bold; margin-left: 5px">Results</span>

        <div class="${stylePrefix}-top-box">
          <div class="${stylePrefix}-left-box" style="width:120px;">Total Results</div>
          <div>Loading...</div>
        </div>
        <div class="${stylePrefix}-inner-box">
          <div class="${stylePrefix}-left-box" style="width:120px;">Exact Match</div>
          <div>Loading...</div>
        </div>
        <div class="${stylePrefix}-bottom-box">
          <div class="${stylePrefix}-left-box" style="width:120px;">Ind. Published</div>
          <div>Loading...</div>
        </div>
      </td>
      <td rowspan="2" class="${stylePrefix}-bsr-td">
        <span style="font-weight: bold; margin-left: 5px">Best Seller Rank</span>

        <div class="${stylePrefix}-top-box">
          <div class="${stylePrefix}-left-box">Average</div>
          <div>Loading...</div>
        </div>
        <div class="${stylePrefix}-inner-box">
          <div class="${stylePrefix}-left-box">Low</div>
          <div>Loading...</div>
        </div>
        <div class="${stylePrefix}-bottom-box">
          <div class="${stylePrefix}-left-box">High</div>
          <div>Loading...</div>
        </div>
      </td>
      <td rowspan="2"  class="${stylePrefix}-bsr-td">
        <span style="font-weight: bold; margin-left: 5px">Reviews</span>

        <div
         class="${stylePrefix}-top-box"
        >
          <div  class="${stylePrefix}-left-box">Average</div>
          <div>Loading...</div>
        </div>
        <div  class="${stylePrefix}-inner-box">
          <div class="${stylePrefix}-left-box">Low</div>
          <div>Loading...</div>
        </div>
        <div class="${stylePrefix}-bottom-box">
          <div class="${stylePrefix}-left-box">High</div>
          <div>Loading...</div>
        </div>
      </td>
      <td rowspan="2" class="${stylePrefix}-bsr-td">
        <span style="font-weight: bold; margin-left: 5px">Price</span>

        <div  class="${stylePrefix}-top-box">
          <div class="${stylePrefix}-left-box">Average</div>
          <div>Loading...</div>
        </div>
        <div class="${stylePrefix}-inner-box">
          <div class="${stylePrefix}-left-box">Low</div>
          <div>Loading...</div>
        </div>
        <div class="${stylePrefix}-bottom-box">
          <div class="${stylePrefix}-left-box">High</div>
          <div>Loading...</div>
        </div>
      </td>
      <td rowspan="2" class="${stylePrefix}-bsr-td">
        <span style="font-weight: bold; margin-left: 5px">Links</span>

        <div class="${stylePrefix}-top-box">
          <a href="https://www.selfpublishingtitans.com/shop" target="_blank" style="color: white; margin-left: 4px;"> More Tools </a>
        </div>

        <div class="${stylePrefix}-inner-box">
          <a href="https://www.facebook.com/groups/2690865597847008" target="_blank" style="color: white; margin-left: 4px;">
            <span>Join Facebook Group</span>
          </a>
        </div>

        <div class="${stylePrefix}-bottom-box">
          <a href="javascript: void(0)" id="download_excel_file_${chrome.runtime.id}" style="color: white; margin-left: 4px;"> Download 1st Page Data </a>
        </div>
      </td>

      <td rowspan="2" style="padding-left: 10px; border: 2px solid black; vertical-align: middle; background-color: black">
        <div style="min-width: 200px; display: flex; align-items: center; justify-content: center">
          <img src="chrome-extension://${chrome.runtime.id}/images/newpic.png" width="200px" />
        </div>
      </td>
    </tr>
    <tr style="text-align: -webkit-center; border: 2px solid white; line-height: 30px">
      <td style="border: 2px solid black; background-color: black; vertical-align:top;">
        

        <div style=" border: 2px solid rgb(222,133,255); border-radius: 10px; width: 230px; margin-top: 10px; text-align: center; display: flex; align-items: center">
          <span style="margin: 5px; margin-left: 40px">Loading...</span>
          
                   </div>
      </td>
    </tr>
  </tbody>
  </table>`;
