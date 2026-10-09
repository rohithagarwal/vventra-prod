import React from "react";
import { AuthPortal } from "@/components/auth/AuthPortal";

export const metadata = {
  title: "Sign In | vvEntra - Venture Intelligence Platform",
  description: "Sign in to vvEntra to access verified micro-SaaS opportunities, financial disclosures, and deal rooms.",
};

export default function LoginPage() {
  return <AuthPortal initialMode="signin" />;
}
