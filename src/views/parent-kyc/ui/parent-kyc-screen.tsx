import { Stamp, EditorialLabel, Sticker } from "@/shared/ui";

export function ParentKycScreen({ token }: { token: string }) {
  return (
    <div className="space-y-6 py-10">
      <Sticker color="yellow" rotation={-3}>
        КОНФІДЕНЦІЙНО
      </Sticker>
      <EditorialLabel color="burgundy">ЗГОДА БАТЬКІВ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Magic-link для батьків</h1>
      <p className="text-lead text-ink-soft">Token: {token.slice(0, 8)}…</p>
      <Stamp text="EST. 1957" rotation={-8} animateOn="load" size={80} />
      <p className="text-small text-ink-fade">Форма KYC (Phase 6)</p>
    </div>
  );
}
