// Get DOM elements
const initialDepositInput = document.getElementById("initial-deposit");
const regularDepositInput = document.getElementById("regular-deposit");
const yearsInput = document.getElementById("years");
const interestRateInput = document.getElementById("interest-rate");
const depositFrequencySelect = document.getElementById("deposit-frequency");
const compoundFrequencySelect = document.getElementById("compound-frequency");
const resultsDiv = document.getElementById("results");

let chart;

// Add event listeners to inputs
[
  initialDepositInput,
  regularDepositInput,
  yearsInput,
  interestRateInput,
  depositFrequencySelect,
  compoundFrequencySelect,
].forEach((element) => {
  element.addEventListener("input", calculateCompoundInterest);
});

function calculateCompoundInterest() {
  const initialDeposit = parseFloat(initialDepositInput.value);
  const regularDeposit = parseFloat(regularDepositInput.value);
  const years = parseInt(yearsInput.value);
  const annualInterestRate = parseFloat(interestRateInput.value) / 100;
  const depositFrequency = getFrequencyValue(depositFrequencySelect.value);
  const compoundFrequency = getFrequencyValue(compoundFrequencySelect.value);

  let totalAmount = initialDeposit;
  const periodsPerYear = depositFrequency;
  const totalPeriods = years * periodsPerYear;
  const interestRatePerPeriod = annualInterestRate / compoundFrequency;

  let data = [{ x: 0, y: initialDeposit }];

  for (let i = 0; i < totalPeriods; i++) {
    for (let j = 0; j < compoundFrequency / depositFrequency; j++) {
      totalAmount *= 1 + interestRatePerPeriod;
    }
    totalAmount += regularDeposit;
    data.push({ x: (i + 1) / periodsPerYear, y: totalAmount });
  }

  const totalInterest =
    totalAmount - initialDeposit - regularDeposit * years * depositFrequency;
  const totalDeposits =
    initialDeposit + regularDeposit * years * depositFrequency;

  displayResults(totalAmount, totalInterest, totalDeposits);
  updateChart(data, totalDeposits, totalInterest);
}

function getFrequencyValue(frequency) {
  switch (frequency) {
    case "annually":
      return 1;
    case "semi-annually":
      return 2;
    case "quarterly":
      return 4;
    case "monthly":
      return 12;
    case "weekly":
      return 52;
    case "daily":
      return 365;
    default:
      return 12; // Default to monthly
  }
}

function displayResults(totalAmount, totalInterest, totalDeposits) {
  resultsDiv.innerHTML = `
        <p>Total savings: $${totalAmount.toFixed(2)}</p>
        <p>Total deposits: $${totalDeposits.toFixed(2)}</p>
        <p>Total interest: $${totalInterest.toFixed(2)}</p>
    `;
}

function updateChart(data, totalDeposits, totalInterest) {
  const ctx = document.getElementById("chart");
  if (!ctx) {
    console.error("Canvas element not found");
    return;
  }

  if (!Chart) {
    console.error("Chart.js not loaded");
    return;
  }

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      datasets: [
        {
          label: "Total Savings",
          data: data,
          backgroundColor: "rgba(0, 123, 255, 0.5)",
          borderColor: "rgba(0, 123, 255, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "Years",
          },
          ticks: {
            callback: function (value, index, values) {
              return value.toFixed(2);
            },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Amount ($)",
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(context.parsed.y);
              }
              return label;
            },
          },
        },
      },
    },
  });
}

// Initial calculation
calculateCompoundInterest();
