<script module lang="ts">
  import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement } from "chart.js";
  Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement);
</script>

<script lang="ts">
  import NumberInput from "../../components/svelte/NumberInput.svelte";
  import { totalMontlyPayment, formatCurrency } from "./functions";
  import type { Attachment } from "svelte/attachments";

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
    const chart = new Chart(element as HTMLCanvasElement, {
      type: "line",
      data: {
        labels: [1, 2, 3, 4, 5],
        datasets: [
          {
            data: [100, 200, 300, 400, amount],
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
