<script module lang="ts">
  import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement } from "chart.js";
  Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement);
</script>

<script lang="ts">
  import NumberInput from "../../components/svelte/NumberInput.svelte";
  import type { Attachment } from "svelte/attachments";
  import { totalMontlyPayment, formatCurrency, principlePayment, getCssVar } from "./functions";

  let redValue = $state(getCssVar("--color-red"));
  let greenValue = $state(getCssVar("--color-green"));
  let blueValue = $state(getCssVar("--color-blue"));
  document.addEventListener("theme-change", () => {
    console.debug("running");
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
    let balance = amount;
    let monthly = [];
    let labels = [];
    let interestPayment = [];
    let principalPayment = [];
    let remaining = [];
    for (let i = 0; i < term; i++) {
      labels.push(labelUnit + " " + (i + 1));
      for (let j = 0; j < termMultiplier; j++) {
        monthly.push(montlyPayment);
        const principalReduction = principlePayment(montlyPayment, balance, interest / 12);
        principalPayment.push(principalReduction);
        const interestPayed = montlyPayment - principalReduction;
        interestPayment.push(interestPayed);
        balance -= principalReduction;
        remaining.push(balance);
      }
    }
    const chart = new Chart(element as HTMLCanvasElement, {
      type: "line",
      options: {
        scales: {
          x: {
            ticks: {
              stepSize: termMultiplier,
            },
          },
        },
      },
      data: {
        labels: labels,
        datasets: [
          {
            label: "Balance",
            data: remaining,
            borderColor: blueValue,
            backgroundColor: blueValue,
          },
          {
            label: "Principlay Payment",
            data: principalPayment,
            borderColor: greenValue,
            backgroundColor: greenValue,
          },
          {
            label: "Interest Payment",
            data: interestPayment,
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
    <select id="term-multiplier" bind:value={termMultiplier}>
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
