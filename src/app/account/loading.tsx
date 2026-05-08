import { Container } from "@/shared/ui/layout";
import { PaperSkeletonProfile } from "@/shared/ui/paper-skeleton";
export default function AccountLoading() {
  return (
    <Container>
      <div className="py-12">
        <PaperSkeletonProfile />
      </div>
    </Container>
  );
}
