"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";

interface UserInfo {
  nama: string;
  dbYears: string[];
  currentYear: string;
}

export default function DashboardShell({
  userId,
  nama,
  levelAkses,
  children,
}: Readonly<{
  userId: number;
  nama: string;
  levelAkses: number;
  children: ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    nama: "Jaya Prima",
    dbYears: ["2026"],
    currentYear: "2026",
  });

  useEffect(() => {
    fetch("/api/user-info")
      .then((r) => r.json())
      .then(setUserInfo)
      .catch(() => {});
  }, []);

  return (
    <div className={sidebarOpen ? "nav-md" : "nav-sm"}>
      <div className="container body">
        <div className="main_container">
          <Sidebar
            nama={nama}
            userId={userId}
            levelAkses={levelAkses}
            companyName={userInfo.nama}
          />

          <div className="top_nav">
            <div className="nav_menu">
              <nav>
                <div className="nav toggle">
                  <a
                    id="menu_toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fa fa-bars" />
                  </a>
                </div>
                <TopNav
                  nama={nama}
                  userId={userId}
                  dbYears={userInfo.dbYears}
                  currentYear={userInfo.currentYear}
                />
              </nav>
            </div>
          </div>

          <div className="right_col" role="main">
            {children}
          </div>

          <footer>
            <div className="pull-right">
              <p>
                {userInfo.nama} - &copy;{userInfo.currentYear} All Rights Reserved.
              </p>
            </div>
            <div className="clearfix" />
          </footer>
        </div>
      </div>
    </div>
  );
}
