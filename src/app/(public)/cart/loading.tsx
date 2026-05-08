import { Container } from "@/shared/ui/layout";
import { PaperSkeletonForm } from "@/shared/ui/paper-skeleton";
export default function CartLoading() {
  return (
    <Container>
      <div className="py-12">
        <PaperSkeletonForm fields={3} />
      </div>
    </Container>
  );
}
