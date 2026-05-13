"use client";

import { ErrorDisplay } from "@/components/ui/error-display";

export default function LojaError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorDisplay error={error} reset={reset} variant="loja" />;
}
