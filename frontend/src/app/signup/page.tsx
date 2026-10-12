import React, { Suspense } from "react";
import { AuthPortal } from "@/components/auth/AuthPortal";

export const metadata = {
  title: "Create Account | vvEntra - Venture Intelligence Platform",
  description: "Create your verified Investor or Architect profile on vvEntra.",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="page login-page" />}>
      <AuthPortal initialMode="signup" />
    </Suspense>
  );
}
