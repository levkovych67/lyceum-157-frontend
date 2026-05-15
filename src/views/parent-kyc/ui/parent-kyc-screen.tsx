"use client";
import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/shared/api/generated/kyc-parent/kyc-parent";
import { Stamp, EditorialLabel, Sticker } from "@/shared/ui";
import { KycSubmitForm } from "@/features/kyc-submit";

export function ParentKycScreen({ token }: { token: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["kyc", "session", token],
    queryFn: () => getSession(token),
    retry: false,
  });
  if (isLoading) return <p className="py-10 text-lead text-ink-soft">Завантаження…</p>;
  if (isError || !data)
    return (
      <div className="space-y-4 py-10">
        <Stamp text="ВИПУСК ПОШКОДЖЕНО" rotation={5} animateOn="load" />
        <p className="text-lead text-error">
          Посилання прострочене або битке. Зверніться до Ліцею.
        </p>
      </div>
    );
  return (
    <div className="space-y-6 py-10">
      <Sticker color="yellow" rotation={-3}>
        КОНФІДЕНЦІЙНО
      </Sticker>
      <EditorialLabel color="burgundy">
        ЗГОДА БАТЬКІВ — {data.studentName} ({data.grade})
      </EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Оформлення згоди</h1>
      <p className="max-w-xl text-body text-ink">
        Ці дані потрібні для виплат за продані роботи учня. Шифруємо за GDPR.
      </p>
      {data.status === "AWAITING_DETAILS" ? (
        <KycSubmitForm token={token} />
      ) : (
        <p className="text-lead text-ink-soft">Статус: {data.status}</p>
      )}
    </div>
  );
}
