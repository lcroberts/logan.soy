<script lang="ts">
  import { slide } from "svelte/transition";
  import type { HTMLAttributes, MouseEventHandler } from "svelte/elements";
  interface Props extends HTMLAttributes<HTMLDivElement> {
    title: string;
    defaultOpen?: boolean;
    children?: any;
  }
  let { title, defaultOpen = false, children, class: className, ...rest }: Props = $props();
  let open = $state(defaultOpen);
  let elem;
  $effect(() => {});
</script>

<div bind:this={elem} class={["bg-surface-2 rounded p-2", className]}>
  <button
    class="flex w-full justify-between text-left"
    onclick={() => {
      open = !open;
    }}
  >
    <div>
      {title}
    </div>
    <div><i class={["bi", !open && "bi-caret-down-fill", open && "bi-caret-up-fill"]}></i></div>
  </button>
  {#if open}
    <div transition:slide class="transition-height overflow-hidden duration-150">
      {@render children?.()}
    </div>
  {/if}
</div>
