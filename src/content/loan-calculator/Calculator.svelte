<script lang="ts">
  let amount: Number | null | undefined = $state(null);
</script>

<div class="w-full">
  <input bind:value={amount} type="number" />
  {#if amount}
    not null
  {/if}
</div>
