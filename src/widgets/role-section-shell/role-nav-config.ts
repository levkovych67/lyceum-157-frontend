/** Ролі, що мають кабінет із власним хедером. */
export type CabinetRole = "student" | "admin";

export type RoleNavItem = {
  href: string;
  label: string;
  /** active лише при точному збігу pathname (для кореневого «Панель»). */
  exact?: boolean;
};

export const roleNav: Record<CabinetRole, RoleNavItem[]> = {
  student: [
    { href: "/student", label: "Панель", exact: true },
    { href: "/student/products", label: "Мої роботи" },
    { href: "/student/finance", label: "Фінанси" },
  ],
  admin: [
    { href: "/admin", label: "Панель", exact: true },
    { href: "/admin/products", label: "Модерація" },
    { href: "/admin/payouts", label: "Виплати" },
    { href: "/admin/reports/tax", label: "Звіти" },
    { href: "/admin/2fa", label: "2FA" },
  ],
};

export const roleTitle: Record<CabinetRole, string> = {
  student: "Кабінет учня",
  admin: "Адміністрування",
};
