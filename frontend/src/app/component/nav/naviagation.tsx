"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserAuth from "../auth/user_auth";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="nav-container">
      <div className="nav-content">
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
          <li className={`nav-item ${pathname === "/audience_analysis" ? "active" : ""}`}>
            <Link href="/audience_analysis" className="nav-link">
              Audience Analysis
            </Link>
          </li>
          <li className={`nav-item ${pathname === "/movies/unreleased" ? "active" : ""}`}>
            <Link href="/movies/unreleased" className="nav-link">
              Unreleased Movie
            </Link>
          </li>
          <li className={`nav-item ${pathname === "/personality_traits" ? "active" : ""}`}>
            <Link href="/personality_traits" className="nav-link">
              Personality Analysis
            </Link>
          </li>
          <li className={`nav-item ${pathname === "/planner" ? "active" : ""}`}>
            <Link href="/planner" className="nav-link">
              Planner
            </Link>
          </li>
        </ul>
        <UserAuth />
      </div>
    </nav>
  );
}