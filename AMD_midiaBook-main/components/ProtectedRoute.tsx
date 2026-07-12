import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";
import { UserRole } from "../types";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: ReactNode;
  role: UserRole;
}) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== role) {
    if (user.role === "admin") return <Redirect href="/(dashboard)/admindash" />;
    if (user.role === "doctor") return <Redirect href="/(dashboard)/doctordash" />;
    return <Redirect href="/(dashboard)/patientdash" />;
  }

  return <>{children}</>;
}
