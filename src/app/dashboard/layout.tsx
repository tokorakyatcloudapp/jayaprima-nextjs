import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "./dashboard-shell";
import "./dashboard.css";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await verifySession();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardShell userId={session.userId} nama={session.nama} levelAkses={session.levelAkses}>
      {children}
    </DashboardShell>
  );
}
