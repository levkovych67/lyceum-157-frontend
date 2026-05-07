export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="bg-error/5 rounded-md border-l-4 border-error p-3 text-small text-error"
    >
      {message}
    </p>
  );
}
