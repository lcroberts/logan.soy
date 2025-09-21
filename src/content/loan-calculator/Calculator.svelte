<script module lang="ts">
  import { Chart } from "chart.js/auto";
</script>

<script lang="ts">
  import NumberInput from "../../components/svelte/NumberInput.svelte";
  import type { Attachment } from "svelte/attachments";
  import { bankersRound, totalMontlyPayment, formatCurrency, getCssVar } from "./functions";

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

  const chartJsAttachment: Attachment = (element) => {
    const labelUnit = termMultiplier === 12 ? "Year" : "Month";
    let remainingPrincipal = structuredClone(amount);
    let labels = [];
    let interestDataset = [];
    let principalDataset = [];
    for (let i = 0; i < term; i++) {
      for (let j = 0; j < termMultiplier; j++) {
        labels.push(i * termMultiplier + j + 1);
        const interestPayment = bankersRound(remainingPrincipal * (interest / 12));
        const principalPayment = bankersRound(montlyPayment - interestPayment);
        remainingPrincipal -= principalPayment;
        interestDataset.push(interestPayment);
        principalDataset.push(principalPayment);
      }
    }
    const chart = new Chart(element as HTMLCanvasElement, {
      type: "line",
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              title(tooltipItems) {
                return "Month " + tooltipItems[0].label;
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
        labels: labels,
        datasets: [
          {
            label: "Principal Payment",
            data: principalDataset,
            borderColor: greenValue,
            backgroundColor: greenValue,
          },
          {
            label: "Interest Payment",
            data: interestDataset,
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
    <div class="flex gap-2 items-center justify-between">
      <label for="loan-interest">Interest Rate:</label>
      <div class="input">
        <NumberInput id="loan-interest" bind:value={interestPercentage} maxDecimal={5} allowNegative={false} class="no-style" /> %
      </div>
    </div>
    <div>Monthly Payment: {formatCurrency(montlyPayment)}</div>
    <div>Total Payment: {formatCurrency(predictedTotalPayment)}</div>
  </div>
  <div class="grow">
    <canvas {@attach chartJsAttachment}></canvas>
  </div>
</div>
