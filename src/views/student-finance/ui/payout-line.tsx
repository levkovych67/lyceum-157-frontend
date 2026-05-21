import { fmtUAH } from "@/shared/lib/money";

export function PayoutLine({
  label,
  amount,
  negative = false,
  strong = false,
}: {
  label: string;
  amount: string;
  negative?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between border-b border-line py-2 ${
        strong ? "font-display text-h3 italic text-green" : "text-body text-ink"
      }`}
    >
      <span>{label}</span>
      <span className="font-mono">
        {negative ? "−" : ""}
        {fmtUAH(amount)}
      </span>
    </div>
  );
}
