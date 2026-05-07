import { CheckoutSuccessScreen } from "@/views/checkout-success";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: { orderId?: string } }) {
  return <CheckoutSuccessScreen orderId={searchParams.orderId} />;
}
