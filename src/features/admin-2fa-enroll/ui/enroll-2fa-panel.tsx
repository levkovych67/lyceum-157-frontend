"use client";
import { useState } from "react";
import {
  Form,
  FormField,
  Input,
  PillButton,
  FormFooter,
  EditorialDivider,
  toast,
} from "@/shared/ui";
import type { TotpEnrollResponse } from "@/shared/api/generated/models/totpEnrollResponse";
import { useEnroll2fa, useConfirm2fa } from "@/features/admin-2fa-enroll/model/use-2fa-enroll";

export function Enroll2faPanel() {
  const [enrollment, setEnrollment] = useState<TotpEnrollResponse | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const enrollM = useEnroll2fa();
  const confirmM = useConfirm2fa();

  if (!enrollment) {
    return (
      <PillButton
        loading={enrollM.isPending}
        onClick={() =>
          enrollM.mutate(undefined, {
            onSuccess: (data) => setEnrollment(data),
          })
        }
      >
        Почати enroll 2FA
      </PillButton>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {enrollment.qrCodeDataUri ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={enrollment.qrCodeDataUri}
          alt="QR-код для додатку автентифікації"
          className="h-48 w-48 border border-line"
        />
      ) : null}
      <p className="font-mono text-sm text-ink">
        Секрет для ручного вводу: <span className="text-burgundy">{enrollment.secretBase32}</span>
      </p>
      {enrollment.recoveryCodes && enrollment.recoveryCodes.length > 0 ? (
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
            Коди відновлення (збережи офлайн)
          </p>
          <ul className="mt-1 grid grid-cols-2 gap-1 font-mono text-sm text-ink">
            {enrollment.recoveryCodes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <EditorialDivider />
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          setError(undefined);
          confirmM.mutate(code, {
            onSuccess: () => toast.success("2FA підключено"),
            onError: () => setError("Невірний код, спробуй ще"),
          });
        }}
      >
        <FormField name="code" label="Код з додатку для підтвердження" required error={error}>
          <Input
            inputMode="numeric"
            maxLength={8}
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-center font-mono tracking-[0.4em]"
          />
        </FormField>
        <FormFooter>
          <span />
          <PillButton type="submit" loading={confirmM.isPending} disabled={code.length < 6}>
            Підтвердити
          </PillButton>
        </FormFooter>
      </Form>
    </div>
  );
}
