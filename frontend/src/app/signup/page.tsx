import React from "react";
import { AuthPortal } from "@/components/auth/AuthPortal";

export const metadata = {
  title: "Create Account | vvEntra - Venture Intelligence Platform",
  description: "Create your verified Investor or Architect profile on vvEntra.",
};

export default function SignUpPage() {
  return <AuthPortal initialMode="signup" />;
}
