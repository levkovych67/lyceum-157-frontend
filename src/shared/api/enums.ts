/**
 * Single source of truth for BE↔FE enum names.
 *
 * Re-exports generated constants under canonical names so app code never
 * hardcodes string literals like "PENDING_REVIEW" and never drifts from BE.
 *
 * Rule: if BE renames an enum value, only this file changes — consumers
 * keep using the canonical name. If you need a different label for UI, map
 * it in the consuming view/widget, not here.
 */

export {
  AdminProductDtoStatus as ProductStatus,
  type AdminProductDtoStatus as ProductStatusValue,
} from "@/shared/api/generated/models/adminProductDtoStatus";

export {
  AdminProductDtoType as ProductType,
  type AdminProductDtoType as ProductTypeValue,
} from "@/shared/api/generated/models/adminProductDtoType";

export {
  KycSessionResponseStatus as KycStatus,
  type KycSessionResponseStatus as KycStatusValue,
} from "@/shared/api/generated/models/kycSessionResponseStatus";

/**
 * NOTE — OrderStatus and PayoutStatus are not exposed as enum types in the
 * current OpenAPI spec (BE returns them as free-form strings inside DTOs).
 * Until BE annotates the schema, keep these as literal unions and audit on
 * every `api.json` regen.
 */
export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "FULFILLED"
  | "DELIVERED"
  | "REFUNDED"
  | "EXPIRED"
  | "FAILED"
  | "CANCELLED"
  | "DISPUTED";

export type PayoutStatus = "HOLD" | "APPROVED" | "PAID_OUT" | "REFUNDED" | "REJECTED";
