let currentUser = null; // Houdt bij wie ingelogd is
let templates = {}; // Slaat geladen Mustache-templates op

// ==============================
// Zorg dat modal-containers aanwezig zijn
// ==============================
(function ensureModalContainers() {
  if (!$("#crypto-info-modal").length) {
    $("body").append(
      '<div id="crypto-info-modal" class="hidden fixed inset-0 z-50 items-center justify-center"></div>'
    );
  }
  if (!$("#crypto-buy-modal").length) {
    $("body").append(
      '<div id="crypto-buy-modal" class="hidden fixed inset-0 z-50 items-center justify-center"></div>'
    );
  }
})();

// ==============================
// Templates laden
// ==============================
function loadTemplate(name, path) {
  return $.get(path, function (template) {
    templates[name] = template; // Sla template op
  }).fail(function () {
    console.error("Kon template niet laden:", name, path);
  });
}

function loadTemplates() {
  return $.when(
    loadTemplate("table", "templates/crypto-table-row.mustache"),
    loadTemplate("card", "templates/crypto-card.mustache"),
    loadTemplate("wallet", "templates/crypto-wallet-row.mustache"),
    loadTemplate("modal", "templates/crypto-info-modal.mustache"),
    loadTemplate("modal-buy", "templates/crypto-buy-modal.mustache"),
    loadTemplate("navbar", "templates/crypto-navbar.mustache"),
    loadTemplate("exchange", "templates/crypto-exchange.mustache"),
    loadTemplate("news", "templates/crypto-news.mustache")
  );
}

// ==============================
// Render cryptos in tabel en cards
// ==============================
function renderCryptos(cryptos) {
  const tableBody = $("#crypto-body");
  const cardBody = $("#crypto-cards");
  tableBody.empty();
  cardBody.empty();

  cryptos.forEach((crypto) => {
    const price = crypto.priceUsd
      ? parseFloat(crypto.priceUsd).toFixed(2)
      : "0.00";
    const marketCap = crypto.marketCapUsd
      ? parseFloat(crypto.marketCapUsd).toLocaleString()
      : "0";
    const change = crypto.changePercent24Hr
      ? parseFloat(crypto.changePercent24Hr).toFixed(2)
      : "0.00";
    const color = parseFloat(change) >= 0 ? "text-green-400" : "text-red-400";

    let priceEur = eurConversionRate
      ? (price * eurConversionRate).toFixed(2)
      : "…"; // fallback als nog niet geladen

    const view = {
      id: crypto.id,
      rank: crypto.rank,
      name: crypto.name,
      symbol: crypto.symbol,
      symbolLower: crypto.symbol.toLowerCase(),
      price,
      priceEur,
      marketCap,
      change,
      color,
      canBuy: !!currentUser, // Alleen kopen mogelijk als ingelogd
    };

    tableBody.append(Mustache.render(templates.table, view));
    cardBody.append(Mustache.render(templates.card, view));
  });
}

// ==============================
// Render wallet holdings
// ==============================
function renderWallet(holdings) {
  const body = $("#wallet-body");
  body.empty();

  holdings.forEach((h) => {
    const priceUsd = parseFloat(h.priceUsd);
    const price = priceUsd.toFixed(2);
    const change = parseFloat(h.changePercent24Hr).toFixed(2);
    const color = parseFloat(change) >= 0 ? "text-green-400" : "text-red-400";

    const view = {
      id: h.id,
      rank: h.rank,
      name: h.name,
      symbol: h.symbol,
      symbolLower: h.symbol.toLowerCase(),
      price,
      marketCap: parseFloat(h.marketCapUsd).toLocaleString(),
      change,
      color,
      amount: h.amount,
      canSell: !!currentUser,
    };

    body.append(Mustache.render(templates.wallet, view));
  });
}
// ==============================
// Render crypto exchanges
// ==============================
function renderExchange(exchanges) {
  const container = $("#exchange-list");
  container.empty();

  exchanges.forEach((exchange) => {
    const view = {
      rank: exchange.rank,
      name: exchange.name,
      volumeUsd: parseFloat(exchange.volumeUsd).toLocaleString(),
      url: exchange.exchangeUrl,
      hasUrl: !!exchange.exchangeUrl,
    };

    container.append(Mustache.render(templates.exchange, view));
  });
}
// ==============================
// Render crypto nieuws
// ==============================
function renderNews(articles) {
  const container = $("#news-container");
  container.empty();

  articles.forEach((article) => {
    const view = {
      title: article.title || "Geen titel",
      description: article.description || "",
      url: article.url || "#",
      hasUrl: !!article.url,
      image: article.urlToImage || "",
      source: article.source.name || "Onbekend",
      publishedAt: article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString()
        : "",
    };

    container.append(Mustache.render(templates.news, view));
  });
}
// ==============================
// Sell-modal tonen
// ==============================
$(document).on("click", ".show-sell-btn", function () {
  const name = $(this).data("name");
  const symbol = $(this).data("symbol");
  const price = parseFloat($(this).data("price"));
  const amountOwned = parseFloat($(this).data("amount"));

  const renderedModal = Mustache.render(templates["modal-sell"], {
    name,
    symbol,
    price: price.toFixed(2),
    maxAmount: amountOwned,
  });

  $("#crypto-sell-modal")
    .html(renderedModal)
    .removeClass("hidden")
    .addClass("flex");
  $("#crypto-sell-modal > div")
    .removeClass("scale-95 opacity-0")
    .addClass("scale-100 opacity-100");
});

// ==============================
// Info-modal tonen en chart renderen
// ==============================
$(document).on("click", ".show-info-btn", function () {
  const name = $(this).data("name") || "";
  const symbol = $(this).data("symbol") || "";
  const price = $(this).data("price") || "";
  const marketCap = $(this).data("marketcap") || "";
  const change = $(this).data("change") || 0;
  const color = parseFloat(change) >= 0 ? "text-green-400" : "text-red-400";

  const id = $(this).data("id") || cryptoAPI.getCryptoId(name, symbol);

  if (!templates.modal) {
    console.error("Info-template niet geladen: templates.modal ontbreekt");
    return;
  }

  const renderedModal = Mustache.render(templates.modal, {
    name,
    symbol,
    price,
    marketCap,
    change,
    color,
  });
  $("#crypto-info-modal")
    .html(renderedModal)
    .removeClass("hidden")
    .addClass("flex");
  $("#crypto-info-modal > div")
    .removeClass("scale-95 opacity-0")
    .addClass("scale-100 opacity-100");

  if (!id) {
    $("#crypto-info-modal")
      .find(".mt-6")
      .append(
        "<div class='mt-4 text-sm text-red-400'>Geen asset-id gevonden voor deze coin.</div>"
      );
    return;
  }

  renderPriceChart({ id, name, containerSelector: "#crypto-info-modal .mt-6" });
});

// ==============================
// Info-modal sluiten
// ==============================
$(document).on("click", "#close-modal", function () {
  $("#crypto-info-modal > div")
    .removeClass("scale-100 opacity-100")
    .addClass("scale-95 opacity-0");
  setTimeout(
    () => $("#crypto-info-modal").removeClass("flex").addClass("hidden"),
    300
  );
});
$("#crypto-info-modal").on("click", function (e) {
  if (e.target.id === "crypto-info-modal") {
    $("#crypto-info-modal > div")
      .removeClass("scale-100 opacity-100")
      .addClass("scale-95 opacity-0");
    setTimeout(
      () => $("#crypto-info-modal").removeClass("flex").addClass("hidden"),
      300
    );
  }
});

// ==============================
// Buy-modal
// ==============================
$(document).on("click", ".show-buy-btn", function () {
  const $tr = $(this).closest("tr");
  const name =
    $tr.find(".show-info-btn").data("name") ||
    $tr.data("name") ||
    $(this).data("name") ||
    "";
  const symbol =
    $tr.find(".show-info-btn").data("symbol") ||
    $tr.data("symbol") ||
    $(this).data("symbol") ||
    "";
  let priceRaw =
    $tr.find(".show-info-btn").data("price") ||
    $tr.data("price") ||
    $(this).data("price") ||
    "";
  const price = parseFloat(String(priceRaw).replace(/[^\d\.-]/g, "")) || 0;

  if (!templates["modal-buy"]) {
    console.error(
      "Buy-template niet geladen: templates['modal-buy'] ontbreekt"
    );
    return;
  }

  const renderedModal = Mustache.render(templates["modal-buy"], {
    name,
    symbol,
    price: price.toFixed(2),
  });
  $("#crypto-buy-modal")
    .html(renderedModal)
    .removeClass("hidden")
    .addClass("flex");
  $("#crypto-buy-modal > div")
    .removeClass("scale-95 opacity-0")
    .addClass("scale-100 opacity-100");

  // Realtime totaal berekenen bij invoer
  $("#crypto-buy-modal")
    .off("input.buyModal", "#buy-amount")
    .on("input.buyModal", "#buy-amount", function () {
      const amount = parseFloat($(this).val());
      if (!isNaN(amount) && amount > 0) {
        const total = (amount * price).toFixed(2);
        $("#buy-total").text(`Totaal: $${total}`);
      } else {
        $("#buy-total").text("");
      }
    });

  // Koop-knop
  $("#crypto-buy-modal")
    .off("click.buyModal", "#buy-coin")
    .on("click.buyModal", "#buy-coin", function () {
      const amount = parseFloat($("#buy-amount").val());
      if (isNaN(amount) || amount <= 0) {
        alert("Voer een geldig aantal in om te kopen.");
        return;
      }
      const total = (amount * price).toFixed(2);
      alert(`Je hebt ${amount} ${symbol} gekocht voor $${total}!`);
      $("#crypto-buy-modal > div")
        .removeClass("scale-100 opacity-100")
        .addClass("scale-95 opacity-0");
      setTimeout(
        () => $("#crypto-buy-modal").removeClass("flex").addClass("hidden"),
        300
      );
    });
});

// Sluit buy-modal via button of buiten click
$(document).on("click", "#close-buy-modal", function () {
  $("#crypto-buy-modal > div")
    .removeClass("scale-100 opacity-100")
    .addClass("scale-95 opacity-0");
  setTimeout(
    () => $("#crypto-buy-modal").removeClass("flex").addClass("hidden"),
    300
  );
});
$("#crypto-buy-modal").on("click", function (e) {
  if (e.target.id === "crypto-buy-modal") {
    $("#crypto-buy-modal > div")
      .removeClass("scale-100 opacity-100")
      .addClass("scale-95 opacity-0");
    setTimeout(
      () => $("#crypto-buy-modal").removeClass("flex").addClass("hidden"),
      300
    );
  }
});

// ==============================
// Scroll naar crypto-table
// ==============================
$(document).on("click", "#scrollTo", function () {
  const target = document.getElementById("crypto-table");
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
});

// ==============================
// Profiel dropdown menu
// ==============================
$(document).on("click", "#profileBtn", function (e) {
  e.stopPropagation();
  $("#dropdownMenu").toggleClass("hidden");
});
$(document).on("click", function (e) {
  if (!$(e.target).closest("#dropdownMenu, #profileBtn").length) {
    $("#dropdownMenu").addClass("hidden");
  }
});

// ==============================
// Init & templates laden
// ==============================
$(document).ready(function () {
  loadTemplates().then(() => {
    if ($("#exchange-list").length) {
      getCryptoExchanges();
    }

    if ($("#news-container").length) {
      getCryptoNews(); // Nieuws ophalen en renderen
    }
    getAllCoinsPortfolio();

    $.getJSON("database/getUser.php", function (data) {
      currentUser = data.user || null;
      const userContext = { user: currentUser };
      if (templates.navbar) {
        $("#crypto-navbar").html(
          Mustache.render(templates.navbar, userContext)
        );
      }
    });
    // Eerst de eurokoers ophalen, daarna pas cryptos laden
    getEuroConversionRate(function () {
      cryptoAPI.getAllCryptos(function (cryptos) {
        renderCryptos(cryptos.slice(0, 20));
      });

      // Herlaad cryptos elke 30 sec met europrijs
      setInterval(() => {
        cryptoAPI.getAllCryptos(function (cryptos) {
          renderCryptos(cryptos.slice(0, 20));
        });
      }, 30000);
    });
  });
});
