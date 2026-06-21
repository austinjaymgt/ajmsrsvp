import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminLoginForm from "./LoginForm";

export default async function AdminPage() {
  const authed = await isAuthenticated();
  if (authed) redirect("/admin/dashboard");
  return <AdminLoginForm />;
}
