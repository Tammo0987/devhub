import { createMemo, createSignal, onCleanup, onMount, type Accessor } from "solid-js";

interface UseScrollableListOptions<T> {
  items: Accessor<T[]>;
  selectedIndex: Accessor<number>;
  fixedHeights: Accessor<number>;
}

export function useScrollableList<T>(options: UseScrollableListOptions<T>) {
  const [terminalRows, setTerminalRows] = createSignal(process.stdout.rows);

  onMount(() => {
    const handleResize = () => setTerminalRows(process.stdout.rows);
    process.stdout.on("resize", handleResize);
    onCleanup(() => process.stdout.off("resize", handleResize));
  });

  const visibleRows = createMemo(() => {
    const available = terminalRows() - options.fixedHeights();
    return Math.max(1, available);
  });

  const scrollOffset = createMemo(() => {
    const maxVisible = visibleRows();
    const selected = options.selectedIndex();
    const total = options.items().length;

    if (total <= maxVisible) return 0;

    const minOffset = Math.max(0, selected - maxVisible + 1);
    const maxOffset = Math.min(total - maxVisible, selected);
    const idealOffset = Math.max(0, selected - Math.floor(maxVisible / 2));
    return Math.max(minOffset, Math.min(maxOffset, idealOffset));
  });

  const visibleItems = createMemo(() => {
    const offset = scrollOffset();
    const count = visibleRows();
    return options.items().slice(offset, offset + count);
  });

  return {
    visibleItems,
    scrollOffset,
    visibleRows,
  };
}
