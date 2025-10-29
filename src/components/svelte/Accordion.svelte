<script lang="ts">
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

<div bind:this={elem} class={["bg-surface-2 rounded", className]}>
  <button class="flex w-full justify-between p-2 text-left" onclick={() => (open = !open)}>
    <div>
      {title}
    </div>
    <div><i class={['bi', !open && 'bi-caret-down-fill', open && 'bi-caret-up-fill']}></i></div>
  </button>
  <div style:height={open ? (elem?.scrollHeight || 0) + "px" : 0} class="transition-height overflow-hidden px-2 duration-150">
    {@render children?.()}
  </div>
</div>
