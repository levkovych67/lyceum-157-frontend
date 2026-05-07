import { StudentProductEditScreen } from "@/views/student-product-edit";
export default function Page({ params }: { params: { id: string } }) {
  return <StudentProductEditScreen id={params.id} />;
}
