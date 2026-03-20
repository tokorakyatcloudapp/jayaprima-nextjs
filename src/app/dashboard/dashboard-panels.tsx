"use client";

import { useEffect, useState } from "react";

interface PendapatanHarianRow {
  tanggal: string;
  kas_kotor: number;
  phutang_kotor: number;
  kas_modal: number;
  phutang_modal: number;
  kas_bersih: number;
  phutang_bersih: number;
}

interface PendapatanBulananRow {
  Ym: string;
  kas_kotor: number;
  phutang_kotor: number;
  kas_modal: number;
  phutang_modal: number;
  kas_bersih: number;
  phutang_bersih: number;
}

interface TopKategoriRow {
  id: number;
  kategori: string;
  total: number;
}

interface TopPelangganRow {
  id: number;
  nama_pelanggan: string;
  total_belanja: number;
}

function formatRp(n: number): string {
  return n.toLocaleString("id-ID");
}

function CollapsiblePanel({
  title,
  colorClass,
  defaultOpen = true,
  children,
}: Readonly<{
  title: string;
  colorClass?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}>) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`x_panel ${colorClass || ""}`}>
      <div className="x_title" style={{ height: "auto" }}>
        <h2>{title}</h2>
        <ul className="nav navbar-right panel_toolbox">
          <li>
            <a
              className="collapse-link"
              onClick={() => setOpen(!open)}
              style={{ cursor: "pointer" }}
            >
              <i className={`fa fa-chevron-${open ? "up" : "down"}`} />
            </a>
          </li>
        </ul>
        <div className="clearfix" />
      </div>
      <div className="x_content" style={{ display: open ? "block" : "none" }}>
        {children}
      </div>
    </div>
  );
}

export default function DashboardPanels() {
  const [pdptnBulanan, setPdptnBulanan] = useState<PendapatanBulananRow[]>([]);
  const [pdptnHarian, setPdptnHarian] = useState<PendapatanHarianRow[]>([]);
  const [topKategori, setTopKategori] = useState<TopKategoriRow[]>([]);
  const [topPelanggan, setTopPelanggan] = useState<TopPelangganRow[]>([]);

  useEffect(() => {
    fetch("/api/pendapatan-bulanan")
      .then((r) => r.json())
      .then(setPdptnBulanan)
      .catch(() => {});
    fetch("/api/pendapatan-harian")
      .then((r) => r.json())
      .then(setPdptnHarian)
      .catch(() => {});
    fetch("/api/top-kategori")
      .then((r) => r.json())
      .then(setTopKategori)
      .catch(() => {});
    fetch("/api/top-pelanggan")
      .then((r) => r.json())
      .then(setTopPelanggan)
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Grafik Pendapatan Bulanan */}
      <div className="row">
        <div className="col-md-12 col-sm-12 col-xs-12">
          <div className="dashboard_graph">
            <div className="row x_title">
              <div className="col-md-6">
                <h3>Grafik Pendapatan Bulanan</h3>
              </div>
            </div>

            <div className="col-md-12 col-sm-12 col-xs-12 bg-white">
              <table
                className="table table-striped table-bordered nowrap"
                cellSpacing={0}
                width="100%"
              >
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Kotor (Tanpa PPN)</th>
                    <th>Modal</th>
                    <th>Bersih</th>
                  </tr>
                </thead>
                <tbody>
                  {pdptnBulanan.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", color: "#999" }}>
                        Belum ada data
                      </td>
                    </tr>
                  ) : (
                    pdptnBulanan.map((row) => (
                      <tr key={row.Ym}>
                        <td>{row.Ym}</td>
                        <td style={{ textAlign: "right" }}>
                          {formatRp(row.kas_kotor + row.phutang_kotor)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {formatRp(row.kas_modal + row.phutang_modal)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {formatRp(row.kas_bersih + row.phutang_bersih)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="clearfix" />
          </div>
        </div>
      </div>
      <br />
      <br />

      {/* Kategori Teratas & Pelanggan Teratas */}
      <div className="row">
        <div className="col-md-6 col-sm-6 col-xs-12">
          <CollapsiblePanel title="Kategori Teratas" colorClass="panel_color2" defaultOpen={false}>
            <table
              className="table table-striped table-bordered nowrap"
              cellSpacing={0}
              width="100%"
            >
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {topKategori.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", color: "#999" }}>
                      Belum ada data
                    </td>
                  </tr>
                ) : (
                  topKategori.map((row) => (
                    <tr key={row.id}>
                      <td>{row.kategori}</td>
                      <td style={{ textAlign: "right" }}>{formatRp(row.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CollapsiblePanel>
        </div>
        <div className="col-md-6 col-sm-6 col-xs-12">
          <CollapsiblePanel title="Pelanggan Teratas" colorClass="panel_color1" defaultOpen={false}>
            <table
              className="table table-striped table-bordered nowrap"
              cellSpacing={0}
              width="100%"
            >
              <thead>
                <tr>
                  <th>Pelanggan</th>
                  <th>Total Belanja</th>
                </tr>
              </thead>
              <tbody>
                {topPelanggan.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", color: "#999" }}>
                      Belum ada data
                    </td>
                  </tr>
                ) : (
                  topPelanggan.map((row) => (
                    <tr key={row.id}>
                      <td>{row.nama_pelanggan}</td>
                      <td style={{ textAlign: "right" }}>{formatRp(row.total_belanja)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CollapsiblePanel>
        </div>
      </div>

      {/* Pendapatan Harian */}
      <div className="row">
        <CollapsiblePanel title="Pendapatan Harian" colorClass="panel_color4">
          <table className="table table-striped table-bordered nowrap" cellSpacing={0} width="100%">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kotor (Tanpa PPN)</th>
                <th>Modal</th>
                <th>Bersih</th>
              </tr>
            </thead>
            <tbody>
              {pdptnHarian.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#999" }}>
                    Belum ada data
                  </td>
                </tr>
              ) : (
                pdptnHarian.map((row) => (
                  <tr key={row.tanggal}>
                    <td>{row.tanggal}</td>
                    <td style={{ textAlign: "right" }}>
                      {formatRp(row.kas_kotor + row.phutang_kotor)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {formatRp(row.kas_modal + row.phutang_modal)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {formatRp(row.kas_bersih + row.phutang_bersih)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CollapsiblePanel>
      </div>
    </>
  );
}
