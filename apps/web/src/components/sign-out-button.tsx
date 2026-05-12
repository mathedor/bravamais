import { signOutAction } from "@/app/auth/actions";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={
          className ??
          "rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
        }
      >
        Sair
      </button>
    </form>
  );
}
