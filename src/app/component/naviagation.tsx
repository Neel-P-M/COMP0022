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
        <li className={`nav-item ${pathname === "/reports" ? "active" : ""}`}>
          <Link href="/reports" className="nav-link">
            Genre Popularity & Polarization Reports
          </Link>
        </li>
      </ul>
    </nav>
  );
}