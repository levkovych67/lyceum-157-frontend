import type { AuthorDto, ProductDetailDto } from "@/shared/api";

/**
 * Narrowed ProductDetailDto with all fields the UI relies on asserted present.
 * BE always emits these for public products; orval marks them optional because
 * the OpenAPI schema does not declare them as `required`.
 */
export type ProductDetail = ProductDetailDto &
  Required<
    Pick<
      ProductDetailDto,
      | "id"
      | "title"
      | "slug"
      | "description"
      | "priceUah"
      | "type"
      | "stockQty"
      | "viewCount"
      | "imageUrls"
    >
  > & { author: Required<Pick<AuthorDto, "firstName" | "grade">> & AuthorDto };

export function assertProductDetail(p: ProductDetailDto): asserts p is ProductDetail {
  if (
    !p.id ||
    !p.title ||
    !p.slug ||
    !p.description ||
    p.priceUah == null ||
    !p.type ||
    p.stockQty == null ||
    p.viewCount == null ||
    !p.author?.firstName ||
    !p.author?.grade ||
    !p.imageUrls
  ) {
    throw new Error("ProductDetailDto missing required fields from BE");
  }
}
