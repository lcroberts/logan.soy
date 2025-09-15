<script lang="ts">
  import NumberInput from "../../components/svelte/NumberInput.svelte";
  import { totalMontlyPayment, formatCurrency } from "./functions";

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
</script>

<div class="w-full">
  <label for="loan-amount">Loan Amount:</label>
  <div class="input w-fit">
    $ <NumberInput id="loan-interest" bind:value={amount} class="no-style" min="1" allowNegative={false}/>
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
</div>
