let cryptoIdByName = {}; // Lookup map: naam -> id
let cryptoIdBySymbol = {}; // Lookup map: symbool -> id
let priceChartInstance = null; // Houdt Chart.js instance bij
let eurConversionRate = null; // globale variabele

// ==============================
// Haal alle cryptos op en vul lookup maps
// ==============================
function getAllCryptos(callback) {
  $.ajax({
    type: "GET",
    url: "https://rest.coincap.io/v3/assets",
    dataType: "json",
    headers: {
      Authorization:
        "Bearer 685e77b0c1f2bc20b3c4c874026c2903fb82e359c419d9ea8e62a58d1bed8e9c",
    },
    success: function (response) {
      const cryptos = response.data || [];

      cryptoIdByName = {};
      cryptoIdBySymbol = {};

      cryptos.forEach((crypto) => {
        if (crypto.name) cryptoIdByName[crypto.name.toLowerCase()] = crypto.id;
        if (crypto.symbol)
          cryptoIdBySymbol[crypto.symbol.toLowerCase()] = crypto.id;
      });

      if (callback) callback(cryptos);
    },
    error: function (err) {
      console.error("Fout bij ophalen cryptos:", err);
      if (callback) callback([]);
    },
  });
}

// ==============================
// Haal historische data voor 1 crypto op
// ==============================
function getCryptoHistory(id) {
  const url = `https://rest.coincap.io/v3/assets/${encodeURIComponent(
    id
  )}/history?interval=d1&limit=30`;

  return $.ajax({
    type: "GET",
    url: url,
    dataType: "json",
    headers: {
      Authorization:
        "Bearer 685e77b0c1f2bc20b3c4c874026c2903fb82e359c419d9ea8e62a58d1bed8e9c",
    },
  }).fail(function () {
    // fallback naar v2 endpoint bij fout
    const fallback = `https://api.coincap.io/v2/assets/${encodeURIComponent(
      id
    )}/history?interval=d1`;
    return $.ajax({ type: "GET", url: fallback, dataType: "json" });
  });
}
// ==============================
// Haal crypto exchanges op
// ==============================
function getCryptoExchanges() {
  $.ajax({
    type: "GET",
    url: "https://rest.coincap.io/v3/exchanges",
    dataType: "json",
    headers: {
      Authorization:
        "Bearer 685e77b0c1f2bc20b3c4c874026c2903fb82e359c419d9ea8e62a58d1bed8e9c",
    },
    success: function (response) {
      const exchanges = response.data;
      renderExchange(exchanges);
    },
    error: function (xhr, status, error) {
      console.error("Fout bij ophalen van exchanges:", error);
      $("#exchange-list").html(
        `<p class="text-red-500 text-center mt-4">Kon exchanges niet laden. Probeer later opnieuw.</p>`
      );
    },
  });
}
// ==============================
// Haal crypto nieuws op
// ==============================
function getCryptoNews() {
  $.ajax({
    type: "GET",
    url: "https://newsapi.org/v2/everything?q=crypto&apiKey=2734f73feb724ee490ac72f13d7d6129",
    dataType: "json",
    success: function (response) {
      const articles = response.articles; // ✅ correct
      renderNews(articles);
    },
    error: function (xhr, status, error) {
      console.error("Fout bij ophalen van crypto nieuws:", error);
      $("#news-container").html(
        `<p class="text-red-500 text-center mt-4">Kon nieuws niet laden. Probeer later opnieuw.</p>`
      );
    },
  });
}

// ==============================
// Haal euro conversion rate op
// ==============================

function getEuroConversionRate(callback) {
  $.ajax({
    type: "GET",
    url: "https://rest.coincap.io/v3/rates/euro",
    dataType: "json",
    headers: {
      Authorization:
        "Bearer 685e77b0c1f2bc20b3c4c874026c2903fb82e359c419d9ea8e62a58d1bed8e9c",
    },
    success: function (response) {
      if (!response || !response.data || !response.data.rateUsd) {
        console.error("Onverwacht antwoord:", response);
        if (callback) callback(null);
        return;
      }

      const rateUsd = parseFloat(response.data.rateUsd);
      eurConversionRate = 1 / rateUsd; // 1 USD = X EUR

      if (callback) callback(eurConversionRate);
    },
    error: function (xhr, status, error) {
      console.error("Fout bij ophalen van euro koers:", status, error);
      console.log("Volledige respons:", xhr);
      if (callback) callback(null);
    },
  });
}

// ==============================
// Voeg coin toe aan database (koop)
// ==============================
function addCoin() {
  var coinName = $("#coin-name").text().replace("Koop", "").trim();
  var coinPrice = $("#coin-price")
    .text()
    .replace("Prijs:", "")
    .replace("$", "")
    .trim();
  var coinAmount = $("#buy-amount").val();
  var coinTotal = $("#coin-total")
    .text()
    .replace("Totaal:", "")
    .replace("$", "")
    .trim();

  $.ajax({
    type: "POST",
    url: "database/add_coins.php",
    data: {
      coin_name: coinName,
      coin_price: coinPrice,
      amount_coins: coinAmount,
      total_value: coinTotal,
    },
  });
}

// Event: koop-knop
$(document).on("click", "#buy-coin", function () {
  addCoin();
});

// Realtime berekening totaal bij invoer amount
$(document).on("input", "#buy-amount", function () {
  const price = parseFloat(
    $("#coin-price").text().replace("Prijs:", "").replace("$", "").trim()
  );
  const amount = parseFloat($(this).val());
  const total = (price * amount).toFixed(2);

  $("#coin-total").text(!isNaN(total) ? "Totaal: $" + total : "");
});

// ==============================
// Haal portfolio op en render wallet
// ==============================
function getAllCoinsPortfolio() {
  $.ajax({
    type: "GET",
    url: "database/get_coins.php",
    dataType: "json",
    success: function (data) {
      if (!templates.wallet) {
        console.error("Template wallet is nog niet geladen!");
        return;
      }

      let rendered = "";

      data.forEach(function (coin, index) {
        coin.rank = index + 1;
        coin.symbolLower = coin.symbol ? coin.symbol.toLowerCase() : "btc"; // fallback
        coin.canSell = parseFloat(coin.amount) > 0;

        rendered += Mustache.render(templates.wallet, coin);
      });

      $("#wallet-body").html(rendered);
    },
    error: function (xhr, status, error) {
      console.error("Error fetching portfolio:", error);
    },
  });
}

// ==============================
// Placeholder functie voor save
// ==============================
function saveCoin(getSaveButton) {
  coinId = $(getSaveButton).attr("value");
}

// ==============================
// Helper: verkrijg asset-id op basis van naam of symbool
// ==============================
function getCryptoId(name, symbol) {
  if (name && cryptoIdByName[name.toLowerCase()])
    return cryptoIdByName[name.toLowerCase()];
  if (symbol && cryptoIdBySymbol[symbol.toLowerCase()])
    return cryptoIdBySymbol[symbol.toLowerCase()];
  return null;
}

// ==============================
// Exporteer functies voor gebruik in main.js
// ==============================
window.cryptoAPI = {
  getAllCryptos,
  getCryptoHistory,
  getCryptoId,
  priceChartInstance,
  setPriceChartInstance: (instance) => (priceChartInstance = instance),
};
