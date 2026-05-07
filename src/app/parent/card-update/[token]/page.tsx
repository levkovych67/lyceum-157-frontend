import { ParentCardUpdateScreen } from "@/views/parent-card-update";
export const dynamic = "force-dynamic";
export default function Page({ params }: { params: { token: string } }) {
  return <ParentCardUpdateScreen token={params.token} />;
}
