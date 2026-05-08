import { Container } from "@/shared/ui/layout";
import { PaperSkeletonForm } from "@/shared/ui/paper-skeleton";
export default function RegisterLoading() {
  return (
    <Container narrow>
      <div className="py-12">
        <PaperSkeletonForm fields={4} />
      </div>
    </Container>
  );
}
