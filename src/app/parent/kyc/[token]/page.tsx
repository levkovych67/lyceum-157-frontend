import { ParentKycScreen } from "@/views/parent-kyc";
export const dynamic = "force-dynamic";
export default function Page({ params }: { params: { token: string } }) {
  return <ParentKycScreen token={params.token} />;
}
