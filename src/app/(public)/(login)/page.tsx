import { Card } from "@/components/ui/card";
import { LoginForm } from "./components/login-form";

export default function Login() {
  return (
    <div className="h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <LoginForm />
      </Card>
    </div>
  );
}
