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

  let startingAmount: number = $state(0);
  let monthlyContributions: number = $state(500);
  let term: number = $state(10);
  let termMultiplier: number = $state(12);
  let annualGrowth: number = $state(8);
  let yearlyInflation: number = $state(3);

  const calculated = $derived.by(() => {
    const monthlyInflation = yearlyInflation / 12 / 100;
    const monthlyGrowth = annualGrowth / 12 / 100;
    let amount = startingAmount;

    let inflationRatio = 1;
    let calc = [];
    for (let i = 0; i < termMultiplier * term; i++) {
      calc.push({
        label: i + 1,
        amount: bankersRound(amount),
        amountAdjusted: bankersRound(amount / inflationRatio),
      });
      amount *= 1 + monthlyGrowth;
      amount += monthlyContributions;
      inflationRatio *= 1 + monthlyInflation;
    }
    return calc;
  });

  const chartJsAttachment: Attachment = (element) => {
    const labelUnit = termMultiplier === 12 ? "Year" : "Month";
    let remainingPrincipal = structuredClone(startingAmount);
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
                return `Inflation Adjusted: ${formatCurrency(data.amountAdjusted)}`;
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
            label: "Balance",
            data: calculated.map((e) => e.amount),
            borderColor: greenValue,
            backgroundColor: greenValue,
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
      <label for="loan-amount">Starting Amount:</label>
      <div class="input flex! w-full gap-1">
        <div>$</div>
        <NumberInput id="starting-amount" bind:value={startingAmount} class="no-style grow" min="1" allowNegative={false} />
      </div>
    </div>
    <div>
      <label for="loan-amount">Monthly Contributions:</label>
      <div class="input flex! w-full gap-1">
        <div>$</div>
        <NumberInput id="monthly-contributions" bind:value={monthlyContributions} class="no-style grow" min="0" allowNegative={false} />
      </div>
    </div>
    <div>
      <label for="loan-term">Growth Term:</label>
      <div class="flex w-full gap-2">
        <input id="loan-term" class="grow" bind:value={term} type="number" min="1" max={(200 * 12) / termMultiplier} />
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
    <div>
      <label for="loan-interest">Yearly Growth:</label>
      <div class="input flex! w-full gap-1">
        <NumberInput id="percentage-growth" bind:value={annualGrowth} maxDecimal={5} allowNegative={false} class="no-style w-full" />
        <div>%</div>
      </div>
    </div>
  </div>
  <div class="grow">
    <canvas {@attach chartJsAttachment}></canvas>
  </div>
</div>
