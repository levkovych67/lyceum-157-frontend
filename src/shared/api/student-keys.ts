/**
 * Query-key factory for the student cabinet. Views build keys for `useQuery`;
 * feature mutations invalidate by prefix (e.g. ["student","products"] catches
 * every filtered/paginated products query).
 */
export const studentKeys = {
  products: (params?: unknown) =>
    params === undefined
      ? (["student", "products"] as const)
      : (["student", "products", params] as const),
  product: (id: string) => ["student", "product", id] as const,
  finance: () => ["student", "finance"] as const,
  orders: (params?: unknown) =>
    params === undefined
      ? (["student", "orders"] as const)
      : (["student", "orders", params] as const),
  me: () => ["student", "me"] as const,
};
