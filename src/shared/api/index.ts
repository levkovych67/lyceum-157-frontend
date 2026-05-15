export * from "./constants";
export * from "./types";
export {
  ProductStatus,
  type ProductStatusValue,
  ProductType,
  type ProductTypeValue,
  KycStatus,
  type KycStatusValue,
  type OrderStatus,
  type PayoutStatus,
} from "./enums";
export * from "./errors";
export * from "./error-messages";
export * from "./api-error-to-form";
export * from "./auth-token";
export * from "./refresh";
export * from "./idempotency";
export * from "./client";
export * from "./dispatch-problem";
export * from "./upload-s3";
export * from "./revalidate";

// Re-export selected orval-generated MODELS only (no functions; consumers import
// those directly from generated/<tag>/<tag>.ts to avoid name collisions like
// `create`/`list`/`submit` overlapping across tags).
export type {
  // auth
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  TokenResponse,
  // catalog (public)
  ProductCardDto,
  ProductDetailDto,
  AuthorDto,
  PageProductCardDto,
  // orders
  CreateOrderRequest,
  OrderCreationResponse,
  OrderItemRequest,
  // kyc-parent
  KycSessionResponse,
  KycSubmitRequest,
  KycSubmitResponse,
  CardUpdateRequest,
  // student-products
  CreateProductRequest,
  EditProductRequest,
  ConfirmImageRequest,
  UploadImageRequest,
  PresignedUploadDto,
  CreatedProductResponse,
  RejectProductRequest,
  // student-finance
  FinanceSummaryDto,
  // admin-products
  AdminProductDto,
  PageAdminProductDto,
  // admin-payouts
  PayoutBatchRequest,
  PayoutBatchResponse,
  // admin-2fa
  TotpEnrollResponse,
  TotpCodeRequest,
  TotpVerifyResponse,
  // admin-orders
  RefundOrderRequest,
} from "./generated/models";

// Catalog sort literal not exposed via OpenAPI; keep here until BE annotates.
export type Sort = "newest" | "price_asc" | "price_desc" | "popular";
