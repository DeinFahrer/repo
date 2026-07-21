import { AdminLoginForm } from "@/components/admin/admin-login-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex w-full min-h-screen max-w-md flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Admin-Login</CardTitle>
          <CardDescription>Nur für Dein Fahrer intern.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
