// ==============================
// Tekent de prijs chart van een crypto
// ==============================
function renderPriceChart({ id, name, containerSelector }) {
  const chartContainer = $(containerSelector);

  // Laadindicator
  chartContainer.append(
    '<div id="chart-loading" class="mt-2 text-sm text-gray-300">Laden...</div>'
  );

  // Haal historische data op
  cryptoAPI
    .getCryptoHistory(id)
    .then((res) => {
      let history = res?.data || res;
      if (!Array.isArray(history)) history = [];

      const last7 = history.slice(-7); // laatste 7 dagen
      if (!last7.length) {
        $("#chart-loading").text("Geen historische data gevonden.");
        return;
      }

      // Labels (datums)
      const labels = last7.map((d) => {
        const t = d.time || d.date || d.timestamp || d.timePeriodStart;
        if (!t) return "";
        let dt = new Date(t);
        if (isNaN(dt)) {
          const num = Number(t);
          dt = new Date(num * (String(t).length <= 10 ? 1000 : 1)); // fix voor seconden/ms
        }
        return dt.toLocaleDateString();
      });

      // Prijzen
      const prices = last7.map((d) =>
        Number(
          parseFloat(d.priceUsd ?? d.price ?? d.close ?? d.value ?? 0).toFixed(
            2
          )
        )
      );

      // Verwijder laadmelding
      $("#chart-loading").remove();

      // Voeg canvas toe als die er nog niet is
      if (!document.getElementById("priceChart")) {
        chartContainer.append(
          '<canvas id="priceChart" class="w-full h-56"></canvas>'
        );
      }

      const ctx = document.getElementById("priceChart").getContext("2d");

      // Oude chart verwijderen
      if (cryptoAPI.priceChartInstance) cryptoAPI.priceChartInstance.destroy();

      // Nieuwe Chart.js grafiek maken
      cryptoAPI.setPriceChartInstance(
        new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: `${name} Price (USD)`,
                data: prices,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                pointHoverRadius: 5,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: "white" } },
              tooltip: { mode: "index", intersect: false },
            },
            scales: {
              x: {
                ticks: { color: "white" },
                grid: { color: "rgba(255,255,255,0.05)" },
              },
              y: {
                ticks: { color: "white" },
                grid: { color: "rgba(255,255,255,0.05)" },
              },
            },
          },
        })
      );
    })
    .catch(() => {
      $("#chart-loading").text("Kon historie niet ophalen (fout).");
    });
}
