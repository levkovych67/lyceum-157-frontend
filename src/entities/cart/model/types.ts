export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  priceUah: string;
  qty: number;
  thumbnailUrl: string | null;
  type: "PHYSICAL" | "DIGITAL";
};
