import { Container } from "@/shared/ui/layout";
import { PaperSkeletonArticle } from "@/shared/ui/paper-skeleton";
export default function ProductLoading() {
  return (
    <Container>
      <div className="py-12">
        <PaperSkeletonArticle />
      </div>
    </Container>
  );
}
