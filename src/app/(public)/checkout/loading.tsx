import { Container } from "@/shared/ui/layout";
import { PaperSkeletonForm } from "@/shared/ui/paper-skeleton";
export default function CheckoutLoading() {
  return (
    <Container narrow>
      <div className="py-12">
        <PaperSkeletonForm fields={6} />
      </div>
    </Container>
  );
}
