import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel, Stamp, Stack } from "@/shared/ui";

export function HomeScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>ВИПУСК №47 · ТРАВЕНЬ 2026</EditorialLabel>
      <h1 className="font-display text-mega italic text-burgundy">Майстерня 157</h1>
      <Stack gap={4}>
        <p className="max-w-prose text-lead text-ink-soft">
          Архів учнівських робіт Ліцею №157. Київ · Оболонь · з 1957 року.
        </p>
        <Stamp text="EST. 1957" rotation={-8} animateOn="load" />
      </Stack>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
