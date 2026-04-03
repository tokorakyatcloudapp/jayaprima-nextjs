"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TopNav({
  nama,
  userId,
  dbYears,
  currentYear,
}: Readonly<{
  nama: string;
  userId: number;
  dbYears: string[];
  currentYear: string;
}>) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [dbOpen, setDbOpen] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const profileRef = useRef<HTMLLIElement>(null);
  const dbRef = useRef<HTMLLIElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (dbRef.current && !dbRef.current.contains(e.target as Node)) {
        setDbOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <ul className="nav navbar-nav navbar-right">
      <li className={profileOpen ? "open" : ""} ref={profileRef}>
        <a
          href="#"
          className="user-profile dropdown-toggle"
          onClick={(e) => {
            e.preventDefault();
            setProfileOpen(!profileOpen);
          }}
        >
          { }
          {!profileLoaded && <span className="profile-img-loader shimmer" aria-hidden="true" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/foto-profil?id=${userId}`}
            alt=""
            style={{ display: profileLoaded ? "inline-block" : "none" }}
            onLoad={() => setProfileLoaded(true)}
            onError={() => setProfileLoaded(true)}
          />
          {nama}
          <span className=" fa fa-angle-down" />
        </a>
        <ul className="dropdown-menu dropdown-usermenu pull-right">
          <li>
            <a href={`/dashboard/akun?id=${userId}`} target="_blank" rel="noopener noreferrer">
              {" "}
              Profil
            </a>
          </li>
          <li>
            <a onClick={handleLogout} style={{ cursor: "pointer" }}>
              <i className="fa fa-sign-out pull-right" /> Logout
            </a>
          </li>
        </ul>
      </li>
      <li className={dbOpen ? "open" : ""} ref={dbRef}>
        <a
          href="#"
          className="user-profile dropdown-toggle"
          onClick={(e) => {
            e.preventDefault();
            setDbOpen(!dbOpen);
          }}
        >
          Data: {currentYear}
          <span className=" fa fa-angle-down" />
        </a>
        <ul className="dropdown-menu dropdown-usermenu pull-right">
          {dbYears.map((year) => (
            <li key={year}>
              <a href={`?DBYEAR=${year}`}>{year}</a>
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
}
