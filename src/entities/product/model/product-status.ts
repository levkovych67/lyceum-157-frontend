import type { StudentProductDtoStatus } from "@/shared/api/generated/models/studentProductDtoStatus";

export type ProductStatusTone = "green" | "burgundy" | "muted";

const LABELS: Record<StudentProductDtoStatus, string> = {
  DRAFT: "Чернетка",
  PENDING_REVIEW: "На розгляді",
  ACTIVE: "Активна",
  HIDDEN: "Прихована",
  REJECTED: "Відхилена",
  SOLD_OUT: "Розпродано",
};

const TONES: Record<StudentProductDtoStatus, ProductStatusTone> = {
  DRAFT: "muted",
  PENDING_REVIEW: "muted",
  ACTIVE: "green",
  HIDDEN: "muted",
  REJECTED: "burgundy",
  SOLD_OUT: "burgundy",
};

export function productStatusLabel(status: StudentProductDtoStatus): string {
  return LABELS[status];
}

export function productStatusTone(status: StudentProductDtoStatus): ProductStatusTone {
  return TONES[status];
}
