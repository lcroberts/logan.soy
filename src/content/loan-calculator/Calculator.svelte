<script module lang="ts">
  import { Chart } from "chart.js/auto";
</script>

<script lang="ts">
  import NumberInput from "../../components/svelte/NumberInput.svelte";
  import type { Attachment } from "svelte/attachments";
  import { bankersRound, totalMontlyPayment, formatCurrency } from "../../assets/js/financial-utils";
  import { getCssVar } from "../../assets/js/css-utils";

  let redValue = $state(getCssVar("--color-red"));
  let greenValue = $state(getCssVar("--color-green"));
  let blueValue = $state(getCssVar("--color-blue"));
  let catText = $state(getCssVar("--color-cat-text"));
  let surface2 = $state(getCssVar("--color-surface-2"));
  document.addEventListener("theme-change", () => {
    redValue = getCssVar("--color-red");
    greenValue = getCssVar("--color-green");
    blueValue = getCssVar("--color-blue");
    catText = getCssVar("--color-cat-text");
    surface2 = getCssVar("--color-surface-2");
  });

  let amount: number = $state(1000);
  let term: number = $state(1);
  let interestPercentage: number = $state(5);
  let termMultiplier = $state(12);
  const interest = $derived((interestPercentage || 0) / 100);
  const montlyPayment = $derived.by(() => {
    if (amount && term && interestPercentage) {
      return totalMontlyPayment(amount, interest / 12, term * termMultiplier);
    }
    return 0;
  });
  const predictedTotalPayment = $derived(montlyPayment * term * termMultiplier);
  const calculated = $derived.by(() => {
    if (!amount || !term || !interestPercentage) return [];

    let calc = [];
    let month = 0;
    let remainingBalance = amount;
    let monthCount = 1;
    let totalPayed = 0;
    while (remainingBalance > 1e-6 && monthCount < (200 * 12)) {
      const interestPayment = remainingBalance * (interest / 12);
      let principalPayment = montlyPayment - interestPayment;
      if (principalPayment > remainingBalance) {
        principalPayment = remainingBalance;
      }
      remainingBalance -= principalPayment;
      totalPayed += interestPayment + principalPayment;
      calc.push({
        totalPayed: bankersRound(totalPayed),
        remainingBalance: bankersRound(remainingBalance),
        principalPayment: bankersRound(principalPayment),
        interestPayment: bankersRound(interestPayment),
        label: monthCount,
      });
      monthCount++;
    }
    return calc;
  });

  const chartJsAttachment: Attachment = (element) => {
    const labelUnit = termMultiplier === 12 ? "Year" : "Month";
    let remainingPrincipal = structuredClone(amount);
    const chart = new Chart(element as HTMLCanvasElement, {
      type: "line",
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              title(tooltipItems) {
                return "Month " + tooltipItems[0].label;
              },
              footer(tooltipItems) {
                const item = tooltipItems[0];
                const index = item.dataIndex;
                const data = calculated[index];
                return `Total Payed: ${formatCurrency(data.totalPayed)}\nRemaining Principle: ${formatCurrency(data.remainingBalance)}`;
              },
            },
          },
        },
        color: catText,
        scales: {
          y: {
            ticks: {
              color: catText,
              format: {
                style: "currency",
                currency: "USD",
              },
            },
            grid: {
              color: surface2,
            },
            border: {
              color: surface2,
            },
          },
          x: {
            ticks: {
              color: catText,
              callback: function (tickValue, index, ticks) {
                if (index % termMultiplier === termMultiplier - 1) {
                  return labelUnit + " " + (index + 1) / termMultiplier;
                }
              },
            },
            grid: {
              color: surface2,
            },
            border: {
              color: surface2,
            },
          },
        },
      },
      data: {
        labels: calculated.map((e) => e.label),
        datasets: [
          {
            label: "Principal Payment",
            data: calculated.map((e) => e.principalPayment),
            borderColor: greenValue,
            backgroundColor: greenValue,
          },
          {
            label: "Interest Payment",
            data: calculated.map((e) => e.interestPayment),
            borderColor: redValue,
            backgroundColor: redValue,
          },
        ],
      },
    });
    return () => {
      chart.destroy();
    };
  };
</script>

<div class="flex w-full flex-col gap-4 px-4 md:flex-row md:px-0">
  <div class="flex flex-col gap-2">
    <div>
      <label for="loan-amount">Loan Amount:</label>
      <div class="input flex w-full">
        $ <NumberInput id="loan-amount" bind:value={amount} class="no-style" min="1" allowNegative={false} />
      </div>
    </div>
    <div>
      <label for="loan-term">Loan Term:</label>
      <div class="flex w-full gap-2">
        <input id="loan-term" class="grow" bind:value={term} type="number" />
        <select
          id="term-multiplier"
          bind:value={
            () => termMultiplier,
            (v) => {
              if (v === 1 && term < 12) {
                term = termMultiplier;
              }
              termMultiplier = v;
            }
          }
        >
          <option value={12}>Years</option>
          <option value={1}>Months</option>
        </select>
      </div>
    </div>
    <div class="flex items-center justify-between gap-2">
      <label for="loan-interest">Interest Rate:</label>
      <div class="input">
        <NumberInput id="loan-interest" bind:value={interestPercentage} maxDecimal={5} allowNegative={false} class="no-style" /> %
      </div>
    </div>
    <div>Monthly Payment: {formatCurrency(bankersRound(montlyPayment))}</div>
    <div>Total Payment: {formatCurrency(predictedTotalPayment)}</div>
  </div>
  <div class="grow">
    <canvas {@attach chartJsAttachment}></canvas>
  </div>
</div>
