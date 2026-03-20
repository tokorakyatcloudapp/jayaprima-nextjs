"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface MenuItem {
  href?: string;
  icon: string;
  label: string;
  adminOnly?: boolean;
  children?: { href: string; label: string }[];
}

const menuItems: MenuItem[] = [
  { href: "/dashboard", icon: "fa-home", label: "Beranda" },
  { href: "/dashboard/profil-usaha", icon: "fa-building", label: "Profil Usaha", adminOnly: true },
  { href: "/dashboard/akun", icon: "fa-sitemap", label: "Manajemen Akun", adminOnly: true },
  { href: "/dashboard/supplier", icon: "fa-industry", label: "Supplier" },
  { href: "/dashboard/pelanggan", icon: "fa-users", label: "Pelanggan" },
  {
    icon: "fa-cubes",
    label: "Barang",
    children: [
      { href: "/dashboard/produk", label: "Produk" },
      { href: "/dashboard/sisa-stok", label: "Sisa Stok" },
      { href: "/dashboard/barang-masuk", label: "Masuk" },
      { href: "/dashboard/barang-keluar", label: "Keluar" },
    ],
  },
  { href: "/dashboard/hutang", icon: "fa-book", label: "Hutang" },
  { href: "/dashboard/antrian-printer", icon: "fa-print", label: "Antrian Printer" },
  { href: "/dashboard/data-terdahulu", icon: "fa-database", label: "Data Terdahulu" },
  { href: "/dashboard/panduan", icon: "fa-question-circle", label: "Panduan" },
];

export default function Sidebar({
  nama,
  userId,
  levelAkses,
  companyName,
}: Readonly<{
  nama: string;
  userId: number;
  levelAkses: number;
  companyName: string;
}>) {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  return (
    <div className="col-md-3 left_col">
      <div className="left_col scroll-view">
        <div className="navbar nav_title" style={{ border: "none" }}>
          <Link href="/dashboard" className="site_title">
            <i style={{ border: "none", borderRadius: "0", padding: "0" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/api/logo"
                style={{
                  height: "35px",
                  width: "auto",
                  verticalAlign: "middle",
                  marginLeft: "6px",
                }}
                alt="logo"
              />
            </i>
            <span style={{ marginLeft: "12px" }}>{companyName}</span>
          </Link>
        </div>

        <div className="clearfix" />

        <div className="profile clearfix">
          <div className="profile_pic">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/foto-profil?id=${userId}`}
              alt="foto-profil"
              className="img-circle profile_img"
            />
          </div>
          <div className="profile_info">
            <span>Selamat datang,</span>
            <h2>{nama}</h2>
          </div>
        </div>

        <br />

        <div id="sidebar-menu" className="main_menu_side hidden-print main_menu">
          <div className="menu_section">
            <ul className="nav side-menu">
              {menuItems.map((item) => {
                if (item.adminOnly && levelAkses !== 0) return null;

                if (item.children) {
                  const isChildActive = item.children.some((c) => pathname === c.href);
                  const isOpen = openSubmenu === item.label || isChildActive;
                  return (
                    <li key={item.label} className={isChildActive ? "active" : ""}>
                      <a
                        onClick={() => setOpenSubmenu(isOpen ? null : item.label)}
                        style={{ cursor: "pointer" }}
                      >
                        <i className={`fa ${item.icon}`} /> {item.label}{" "}
                        <span className="fa fa-chevron-down" />
                      </a>
                      <ul className="nav child_menu" style={{ display: isOpen ? "block" : "none" }}>
                        {item.children.map((child) => (
                          <li key={child.href} className={pathname === child.href ? "active" : ""}>
                            <Link href={child.href}>{child.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }

                return (
                  <li
                    key={item.href}
                    className={pathname === item.href ? "active current-page" : ""}
                  >
                    <Link href={item.href!}>
                      <i className={`fa ${item.icon}`} /> {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
