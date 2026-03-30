import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { AppHeader } from "@/components/shared/AppHeader";
import type { User } from "@/lib/types/user";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser) {
    redirect("/auth/signin");
  }

  const user: User = {
    id: sessionUser.id ?? "",
    email: sessionUser.email ?? "",
    name: sessionUser.name ?? "",
    role: "owner",
    createdAt: new Date(),
    deletedAt: null,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AppSidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
