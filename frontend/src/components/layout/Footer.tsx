import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <div className="footer-links">
            <Link href="/dashboard" data-route="dashboard">Dashboard</Link>
            <Link href="/trust" data-route="trust">Trust</Link>
            <Link href="/playbook" data-route="playbook">Playbook</Link>
            <Link href="/faq" data-route="faq">FAQ</Link>
            <Link href="/pricing" data-route="pricing">Pricing</Link>
            <Link href="/" data-route="home">Home</Link>
            <Link href="/#about" data-route="about">About</Link>
            <Link href="/#browse" data-route="browse">Opportunities</Link>
            <Link href="/signup" data-route="list">Apply as an architect</Link>
            <Link href="/login" data-route="login">Log in</Link>
            <Link href="/signup" data-route="apply">Apply for access</Link>
            <Link href="/terms" data-route="terms">Terms</Link>
          </div>
          <div className="footer-meta">
            <span>© 2026 vvEntra · A venture intelligence company</span>
            <span>
              <em>We enter ventures together.</em>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
