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
  document.addEventListener("theme-change", () => {
    redValue = getCssVar("--color-red");
    greenValue = getCssVar("--color-green");
    blueValue = getCssVar("--color-blue");
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
        scales: {
          y: {
            ticks: {
              format: {
                style: "currency",
                currency: "USD",
              },
            },
          },
          x: {
            ticks: {
              callback: function(tickValue, index, ticks) {
                if (index % termMultiplier === termMultiplier - 1) {
                  return labelUnit + " " + ((index + 1) / termMultiplier);
                }
              },
            }
          }
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

<div class="w-full">
  <label for="loan-amount">Loan Amount:</label>
  <div class="input w-fit">
    $ <NumberInput id="loan-amount" bind:value={amount} class="no-style" min="1" allowNegative={false} />
  </div>
  <label for="loan-term">Loan Term:</label>
  <div class="flex gap-2">
    <input id="loan-term" bind:value={term} type="number" />
    <select
      id="term-multiplier"
      bind:value={
        () => termMultiplier,
        (v) => {
          if (v === 1 && term < 12) {
            term = 12;
          }
          termMultiplier = v;
        }
      }
    >
      <option value={12}>Years</option>
      <option value={1}>Months</option>
    </select>
  </div>
  <label for="loan-interest">Interest Rate:</label>
  <div class="input w-fit">
    <NumberInput id="loan-interest" bind:value={interestPercentage} maxDecimal={5} allowNegative={false} class="no-style w-20" /> %
  </div>
  <div>Monthly Payment: {formatCurrency(montlyPayment)}</div>
  <canvas {@attach chartJsAttachment}></canvas>
</div>
