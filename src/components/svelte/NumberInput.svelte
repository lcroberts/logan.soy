<script lang="ts">
  import { onMount } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  interface Props extends HTMLInputAttributes {
    maxDecimal?: number;
  }
  let { class: classVal, value = $bindable(), maxDecimal = 2, ...props }: Props = $props();

  let element: HTMLInputElement;

  const formatNumber = (val: string) => {
    if (val === "" || val === "-") return val;

    let num = parseFloat(val.replaceAll(",", ""));
    if (isNaN(num)) return val;
    num = Math.trunc(num * 10 ** maxDecimal) / 10 ** maxDecimal;
    console.debug(num);

    let formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(num);
    console.debug(val, num, formatted);

    if (val.endsWith(".")) {
      if (val.endsWith("..")) {
        formatted += ".";
      } else if (val.matchAll(/\./g).toArray().length < 2) {
        formatted += ".";
      }
    }
    const trailingZeros = val.match(/\.\d*0$/);
    if (trailingZeros) {
      const match = trailingZeros[0].substring(1); // Only decimal
      const zeroCount = match.matchAll(/0/g).toArray().length;
      const count = Math.min(maxDecimal - (match.length - zeroCount), match.length);
      if (!(formatted.includes(".") || formatted.includes(".")) && count > 0) {
        formatted += ".";
      }
      formatted += new String("0").repeat(count);
    }

    return formatted;
  };

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const selectionStart = target.selectionStart ?? 0;

    let digits = target.value.replace(/,/g, "");
    const formatted = formatNumber(digits);

    digits = formatted.replace(/,/g, "");
    let num = parseFloat(digits);
    value = isNaN(num) ? null : num;

    // Calculate cursor shift caused by commas
    let oldLen = target.value.length;
    target.value = formatted;
    let newLen = formatted.length;

    let diff = newLen - oldLen;
    target.setSelectionRange(selectionStart + diff, selectionStart + diff);
  }
  onMount(() => {
    element.value = value;
  });
</script>

<input {...props} bind:this={element} class={[classVal]} type="text" oninput={handleInput} />
