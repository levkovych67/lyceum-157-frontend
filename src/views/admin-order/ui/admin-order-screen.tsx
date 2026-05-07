import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
export function AdminOrderScreen({ id }: { id: string }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>ЗАМОВЛЕННЯ #{id}</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Деталі</h1>
      <PageStubBanner cluster="admin" />
    </EditorialPageShell>
  );
}
