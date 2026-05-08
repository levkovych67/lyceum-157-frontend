import { Container } from "@/shared/ui/layout";
import { PaperSkeletonForm } from "@/shared/ui/paper-skeleton";
export default function LoginLoading() {
  return (
    <Container narrow>
      <div className="py-12">
        <PaperSkeletonForm fields={2} />
      </div>
    </Container>
  );
}
