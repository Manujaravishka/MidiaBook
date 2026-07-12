import { Redirect } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { ReactNode } from "react";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: ReactNode;
  role: "admin" | "doctor" | "patient";
}) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== role) return <Redirect href="/" />;

  return <>{children}</>;
}
