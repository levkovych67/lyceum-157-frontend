import { useEffect, useState } from "react";

/** Поріг скролу (px), за яким хедер переходить у floating-стан (матове скло). */
const FLOATING_THRESHOLD = 8;

/**
 * Слідкує, чи прокручено сторінку за {@link FLOATING_THRESHOLD}.
 * `floating` керує скляним/компактним трактуванням хедера.
 */
export function useHeaderState() {
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > FLOATING_THRESHOLD);
    onScroll(); // синхронізація на маунті (напр. відновлена позиція скролу)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { floating };
}
