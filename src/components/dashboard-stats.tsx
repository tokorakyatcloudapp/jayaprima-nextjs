"use client";

import { useEffect, useState } from "react";

interface BerandaData {
  hutang_pembelian: number;
  hutang_pelanggan: number;
  supplier: number;
  pelanggan: number;
  produk: number;
  admin_aktif: number;
}

export default function DashboardStats() {
  const [data, setData] = useState<BerandaData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const stats = [
    {
      icon: "fa-cube",
      label: "Hutang Pembelian",
      value: data?.hutang_pembelian ?? 0,
      colorClass: data && data.hutang_pembelian > 0 ? "red" : "green",
    },
    {
      icon: "fa-user",
      label: "Hutang Pelanggan",
      value: data?.hutang_pelanggan ?? 0,
      colorClass: data && data.hutang_pelanggan > 0 ? "red" : "green",
    },
    {
      icon: "fa-industry",
      label: "Supplier",
      value: data?.supplier ?? 0,
      colorClass: "",
    },
    {
      icon: "fa-users",
      label: "Pelanggan",
      value: data?.pelanggan ?? 0,
      colorClass: "",
    },
    {
      icon: "fa-cubes",
      label: "Produk",
      value: data?.produk ?? 0,
      colorClass: "green",
    },
    {
      icon: "fa-sitemap",
      label: "Admin Aktif",
      value: data?.admin_aktif ?? 0,
      colorClass: "",
    },
  ];

  return (
    <div className="row tile_count">
      {stats.map((stat) => (
        <div key={stat.label} className="col-md-2 col-sm-4 col-xs-6">
          <div
            className="tile_stats_count"
            style={{
              background: "#fff",
              border: "1px solid #d9dee4",
              borderRadius: 4,
              marginBottom: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              paddingTop: 10,
            }}
          >
            <span className="count_top">
              <i className={`fa ${stat.icon}`} /> {stat.label}
            </span>
            <div className={`count ${stat.colorClass}`}>{stat.value.toLocaleString("id-ID")}</div>
            <span className="count_bottom" />
          </div>
        </div>
      ))}
    </div>
  );
}
