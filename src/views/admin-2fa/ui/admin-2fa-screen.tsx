"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/shared/api/generated/user-account/user-account";
import { verify } from "@/shared/api/generated/admin-2fa/admin-2fa";
import { adminKeys } from "@/shared/api/admin-keys";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider } from "@/shared/ui";
import { PaperSkeletonProfile } from "@/shared/ui/paper-skeleton";
import { Enroll2faPanel } from "@/features/admin-2fa-enroll";
import { TotpVerifyModal } from "@/features/admin-2fa-verify";

export function Admin2faScreen() {
  const me = useQuery({ queryKey: adminKeys.me(), queryFn: () => getMe() });
  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [checking, setChecking] = useState(false);

  async function onVerify(code: string) {
    setError(undefined);
    setChecking(true);
    try {
      const r = await verify({ code });
      setResult(r.valid ? "Код дійсний ✓" : "Код недійсний ✗");
      setModalOpen(false);
    } catch {
      setError("Помилка перевірки коду");
    } finally {
      setChecking(false);
    }
  }

  return (
    <EditorialPageShell>
      <EditorialLabel>ДВОФАКТОРНА АВТЕНТИФІКАЦІЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">2FA</h1>

      {me.isLoading ? (
        <PaperSkeletonProfile />
      ) : me.data?.twoFaEnrolled ? (
        <>
          <p className="text-body text-green">2FA підключено ✓</p>
          <p className="text-body text-ink-soft">
            Перевір, що додаток автентифікації досі видає правильні коди.
          </p>
          <button
            type="button"
            onClick={() => {
              setResult(undefined);
              setModalOpen(true);
            }}
            className="self-start rounded-full border border-burgundy px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide text-burgundy"
          >
            Перевірити код
          </button>
          {result ? <p className="font-mono text-sm text-ink">{result}</p> : null}
          <TotpVerifyModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            onSubmit={onVerify}
            error={error}
            loading={checking}
          />
        </>
      ) : (
        <>
          <p className="text-body text-ink-soft">
            2FA ще не підключено. Дії над виплатами без нього заблоковані.
          </p>
          <EditorialDivider />
          <Enroll2faPanel />
        </>
      )}
    </EditorialPageShell>
  );
}
