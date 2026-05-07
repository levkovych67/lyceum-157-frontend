import { AuthorProfileScreen } from "@/views/author-profile";
export const revalidate = 600;
export default function Page({ params }: { params: { id: string } }) {
  return <AuthorProfileScreen id={params.id} />;
}
