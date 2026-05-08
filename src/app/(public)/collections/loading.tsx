import { Container } from "@/shared/ui/layout";
import { PaperSkeletonGrid } from "@/shared/ui/paper-skeleton";
export default function CollectionsLoading() {
  return (
    <Container>
      <div className="py-12">
        <PaperSkeletonGrid cols={2} rows={3} />
      </div>
    </Container>
  );
}
