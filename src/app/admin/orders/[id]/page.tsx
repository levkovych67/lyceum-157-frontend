import { AdminOrderScreen } from "@/views/admin-order";
export default function Page({ params }: { params: { id: string } }) {
  return <AdminOrderScreen id={params.id} />;
}
