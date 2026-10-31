import React, { Suspense } from "react";
import { AuthPortal } from "@/components/auth/AuthPortal";

export const metadata = {
  title: "Reset Password | vvEntra - Venture Intelligence Platform",
  description: "Reset your vvEntra password to access verified micro-SaaS opportunities, financial disclosures, and deal rooms.",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="page login-page" />}>
      <AuthPortal initialMode="forgot" />
    </Suspense>
  );
}
