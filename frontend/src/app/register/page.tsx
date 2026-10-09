import React from "react";
import { AuthPortal } from "@/components/auth/AuthPortal";

export const metadata = {
  title: "Register | vvEntra - Venture Intelligence Platform",
  description: "Create your verified Investor or Architect profile on vvEntra.",
};

export default function RegisterPage() {
  return <AuthPortal initialMode="signup" />;
}
