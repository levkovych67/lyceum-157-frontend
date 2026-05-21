/**
 * Query-key factory for the admin cabinet. Views build keys for `useQuery`;
 * feature mutations invalidate by prefix. NOTE: the existing admin features
 * (`admin-product-reject`, `admin-payout-execute`) invalidate the bare prefixes
 * `["admin","products"]` / `["admin","payouts"]` — these factory keys are
 * prefix-compatible so that invalidation still catches filtered queries.
 */
export const adminKeys = {
  products: (params?: unknown) =>
    params === undefined
      ? (["admin", "products"] as const)
      : (["admin", "products", params] as const),
  orders: (params?: unknown) =>
    params === undefined ? (["admin", "orders"] as const) : (["admin", "orders", params] as const),
  order: (id: string) => ["admin", "order", id] as const,
  payouts: (params?: unknown) =>
    params === undefined
      ? (["admin", "payouts"] as const)
      : (["admin", "payouts", params] as const),
  me: () => ["admin", "me"] as const,
};
