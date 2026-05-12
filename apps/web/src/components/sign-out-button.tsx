import { signOutAction } from "@/app/auth/actions";

interface Props {
  className?: string;
  /** Renderiza só ícone (porta-saída) em vez de "Sair" */
  iconOnly?: boolean;
}

export function SignOutButton({ className, iconOnly }: Props) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        aria-label="Sair"
        title="Sair"
        className={
          className ??
          "rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
        }
      >
        {iconOnly ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        ) : (
          "Sair"
        )}
      </button>
    </form>
  );
}
