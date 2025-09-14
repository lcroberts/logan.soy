<script lang="ts">
  import { onMount } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  interface Props extends HTMLInputAttributes {
    maxDecimal?: number;
    thousandsSeparator?: string;
    decimalSeparator?: string;
  }
  let { class: classVal, value = $bindable(), maxDecimal = 2, thousandsSeparator = ",", decimalSeparator = ".", ...props }: Props = $props();

  let element: HTMLInputElement;

  const formatNumber = (val: string) => {
    if (val === "" || val === "-") return val;
    const stripInvalidRegex = new RegExp(String.raw`[^\d\-${thousandsSeparator}${decimalSeparator}]`, "g");
    val = val.replaceAll(stripInvalidRegex, '');
    let isNegative = false;
    if (val.charAt(0) === "-") {
      isNegative = true;
    }
    val = val.replaceAll("-", "");
    val = val.replaceAll(thousandsSeparator, "");
    // Format regardless of negative status
    const parts = val.split(decimalSeparator);
    const sliceIndex = parts.length > 1 ? parts.length - 1 : parts.length;
    let thousands = parts
      .slice(0, sliceIndex)
      .join("")
      .replaceAll(decimalSeparator, "");
    thousands = thousands.replace(/^0+/g, '');
    let separatorIndex = thousands.length - 3;
    while (separatorIndex > 0) {
      thousands = [thousands.slice(0, separatorIndex), thousandsSeparator, thousands.slice(separatorIndex)].join("");
      separatorIndex -= 3;
    }
    let decimal = parts.slice(sliceIndex).join("");
    decimal = decimal.substring(0, maxDecimal);

    val = thousands;
    if (parts.length > 1) {
      val += decimalSeparator;
    }
    if (decimal !== "") {
      val += decimal;
    }
    if (isNegative) {
      val = "-" + val;
    }
    return val;
  };

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const selectionStart = target.selectionStart ?? 0;

    let digits = target.value.replace(/,/g, "");
    const formatted = formatNumber(digits);

    const regex = new RegExp(String.raw`/${thousandsSeparator}/`, "g");
    digits = formatted.replace(regex, "");
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
