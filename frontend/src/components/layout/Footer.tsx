import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <div className="footer-links">
            <Link href="/#browse">Opportunities</Link>
            <Link href="/#list">Apply as an architect</Link>
            <Link href="/login">Log in</Link>
            <Link href="/#apply">Apply for access</Link>
            <Link href="/#terms">Terms</Link>
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
