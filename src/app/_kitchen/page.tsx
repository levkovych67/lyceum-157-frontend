import { notFound } from "next/navigation";
import { KitchenScreen } from "@/pages/kitchen";
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <KitchenScreen />;
}
