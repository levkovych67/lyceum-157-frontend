import { Container } from "@/shared/ui/layout";
import { PaperSkeletonGrid } from "@/shared/ui/paper-skeleton";
export default function CatalogLoading() {
  return (
    <Container>
      <div className="py-12">
        <PaperSkeletonGrid cols={3} rows={3} />
      </div>
    </Container>
  );
}
