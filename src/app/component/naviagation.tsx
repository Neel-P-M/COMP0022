"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="nav-container">
      <ul className="nav-list">
        <li className={`nav-item ${pathname === "/" ? "active" : ""}`}>
          <Link href="/" className="nav-link">
            Movies
          </Link>
        </li>
        <li className={`nav-item ${pathname === "/genre_report" ? "active" : ""}`}>
          <Link href="/genre_report" className="nav-link">
            Genre Analysis Report
          </Link>
        </li>
      </ul>
    </nav>
  );
}