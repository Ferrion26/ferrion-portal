import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export const metadata = { title: "Login — Ferrion" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0d1117] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src="/logos/ferrion.svg" alt="Ferrion" className="h-12 w-auto mx-auto mb-6" />
          <p className="text-gray-500 text-xs tracking-widest uppercase">Bitte anmelden</p>
        </div>
        <div className="bg-[#111827] border border-white/10 p-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="text-center text-gray-600 text-xs mt-6">
          © {new Date().getFullYear()} Ferrion IT Systemhaus
        </p>
      </div>
    </main>
  );
}
