"use client";

import {
  ArcElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { id } from "date-fns/locale/id";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("id", id);

const DataTable = dynamic(
  () => import("@/components/dt-table").then((m) => ({ default: m.DataTable })),
  { ssr: false }
);

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Legend,
  Tooltip,
  DoughnutController,
  ArcElement
);

// ── Types ────────────────────────────────────────────────────────────────────

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

interface DbStorageInfo {
  label: string;
  labelTotal: string;
  labelUsed: string;
  labelFree: string;
  dataSize: string;
  storageSize: string;
  indexSize: string;
  percentUsed: number;
  percentFree: number;
  isLowSpace: boolean;
}

interface StorageInfoResponse {
  databases: DbStorageInfo[];
}

type SumTarget = "phutang" | "kas" | "total";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRp(n: number): string {
  return n.toLocaleString("id-ID");
}

function ymToLabel(ym: string): string {
  const [year, month] = ym.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

function tanggalToLabel(tanggal: string): string {
  const [y, m, d] = tanggal.split("-");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function coloredCell(phutang: number, kas: number): string {
  return (
    `<div class="red">Hutang Pelanggan: ${formatRp(phutang)}</div>` +
    `<div class="green">Kas: ${formatRp(kas)}</div>` +
    `<div class="blue">Total: ${formatRp(kas + phutang)}</div>`
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pendapatanColumns(labelFn: (v: string) => string, dateField: string): any[] {
  return [
    {
      title: "Tanggal",
      data: dateField,
      className: "text-left",
      render: (data: string, type: string) => (type === "display" ? labelFn(data) : data),
    },
    {
      title: "Kotor<br/>(Tanpa PPN)",
      data: "kas_kotor",
      className: "text-left",
      render: (data: number, type: string, row: PendapatanHarianRow) =>
        type === "display"
          ? coloredCell(row.phutang_kotor, data)
          : Number(data) + Number(row.phutang_kotor),
    },
    {
      title: "Modal",
      data: "kas_modal",
      className: "text-left",
      render: (data: number, type: string, row: PendapatanHarianRow) =>
        type === "display"
          ? coloredCell(row.phutang_modal, data)
          : Number(data) + Number(row.phutang_modal),
    },
    {
      title: "Bersih",
      data: "kas_bersih",
      className: "text-left",
      render: (data: number, type: string, row: PendapatanHarianRow) =>
        type === "display"
          ? coloredCell(row.phutang_bersih, data)
          : Number(data) + Number(row.phutang_bersih),
    },
  ];
}

// ── Shimmer loaders ──────────────────────────────────────────────────────────

function ShimmerLines({ count = 5 }: { count?: number }) {
  const widths = ["long", "full", "medium", "long", "short", "full", "medium"];
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`shimmer shimmer-line ${widths[i % widths.length]}`} />
      ))}
    </>
  );
}

function ShimmerTable({ rows = 5, cols = 3 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="shimmer-table-row">
          {Array.from({ length: cols }, (_, j) => (
            <div key={j} className="shimmer" />
          ))}
        </div>
      ))}
    </>
  );
}

function ShimmerChart() {
  return <div className="shimmer shimmer-chart" />;
}

// ── Shared components ─────────────────────────────────────────────────────────

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

// ── Section: Grafik Pendapatan Bulanan ────────────────────────────────────────

type PendapatanRow = PendapatanHarianRow | PendapatanBulananRow;
type FieldKas = "kas_kotor" | "kas_modal" | "kas_bersih";
type FieldPhutang = "phutang_kotor" | "phutang_modal" | "phutang_bersih";

function pickValue(
  target: SumTarget,
  row: PendapatanRow,
  kasField: FieldKas,
  phutangField: FieldPhutang
): number {
  if (target === "phutang") return row[phutangField];
  if (target === "kas") return row[kasField];
  return row[kasField] + row[phutangField];
}

function GrafikPendapatanBulanan({
  data,
  loading,
}: Readonly<{ data: PendapatanBulananRow[]; loading: boolean }>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [sumTarget, setSumTarget] = useState<SumTarget>("kas");

  const labels = data.map((r) => ymToLabel(r.Ym));

  const getChartData = (target: SumTarget) => ({
    kotor: data.map((r) => pickValue(target, r, "kas_kotor", "phutang_kotor")),
    bersih: data.map((r) => pickValue(target, r, "kas_bersih", "phutang_bersih")),
  });

  const getTotals = (target: SumTarget) => ({
    kotor: data.reduce((s, r) => s + pickValue(target, r, "kas_kotor", "phutang_kotor"), 0),
    modal: data.reduce((s, r) => s + pickValue(target, r, "kas_modal", "phutang_modal"), 0),
    bersih: data.reduce((s, r) => s + pickValue(target, r, "kas_bersih", "phutang_bersih"), 0),
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const { kotor, bersih } = getChartData(sumTarget);

    if (!chartRef.current) {
      chartRef.current = new Chart(canvasRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Bersih",
              backgroundColor: "rgba(38, 185, 154, 0.51)",
              borderColor: "rgba(38, 185, 154, 0.7)",
              pointBorderColor: "rgba(38, 185, 154, 0.7)",
              pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "rgba(220,220,220,1)",
              pointBorderWidth: 1,
              data: bersih,
              fill: true,
              tension: 0.4,
            },
            {
              label: "Kotor",
              backgroundColor: "rgba(3, 88, 106, 0.3)",
              borderColor: "rgba(3, 88, 106, 0.70)",
              pointBorderColor: "rgba(3, 88, 106, 0.70)",
              pointBackgroundColor: "rgba(3, 88, 106, 0.70)",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "rgba(151,187,205,1)",
              pointBorderWidth: 1,
              data: kotor,
              fill: true,
              tension: 0.4,
            },
          ],
        },
      });
    } else {
      chartRef.current.data.labels = labels;
      chartRef.current.data.datasets[0].data = bersih;
      chartRef.current.data.datasets[1].data = kotor;
      chartRef.current.update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sumTarget]);

  useEffect(() => {
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  const totals = getTotals(sumTarget);

  const sumMsg: Record<SumTarget, React.ReactNode> = {
    phutang: (
      <>
        <span className="red" style={{ fontWeight: "bold" }}>
          Hutang Pelanggan
        </span>
        {
          " adalah Pendapatan Tertahan, yakni pendapatan yang tertahan karena Pelanggan yang berhutang"
        }
      </>
    ),
    kas: (
      <>
        <span className="green" style={{ fontWeight: "bold" }}>
          Kas
        </span>
        {" adalah Pendapatan Aktual, yakni pendapatan yang masuk kas"}
      </>
    ),
    total: (
      <>
        <span className="blue" style={{ fontWeight: "bold" }}>
          Total
        </span>
        {" adalah Total Pendapatan Aktual ditambah Pendapatan Tertahan"}
      </>
    ),
  };

  if (loading) {
    return (
      <div className="row" style={{ marginTop: "60px" }}>
        <CollapsiblePanel title="Grafik Pendapatan Bulanan">
          <div className="col-md-5 col-sm-5 col-xs-12">
            <ShimmerLines count={6} />
          </div>
          <div className="col-md-7 col-sm-7 col-xs-12">
            <ShimmerTable rows={6} cols={4} />
          </div>
          <div className="clearfix" />
        </CollapsiblePanel>
      </div>
    );
  }

  return (
    <div className="row" style={{ marginTop: "60px" }}>
      <CollapsiblePanel title="Grafik Pendapatan Bulanan">
        {/* Left: chart + controls */}
        <div className="col-md-5 col-sm-5 col-xs-12">
          <canvas ref={canvasRef} />
          <br />
          <br />

          <label htmlFor="sumTarget">Jumlahkan semua: </label>
          <select
            id="sumTarget"
            style={{ fontWeight: "bold" }}
            value={sumTarget}
            onChange={(e) => setSumTarget(e.target.value as SumTarget)}
          >
            <option className="red" value="phutang">
              Hutang Pelanggan
            </option>
            <option className="green" value="kas">
              Kas
            </option>
            <option className="blue" value="total">
              Total
            </option>
          </select>

          <table id="table_sum_p_bln">
            <tbody>
              <tr>
                <th>Kotor</th>
                <td>{formatRp(totals.kotor)}</td>
              </tr>
              <tr style={{ color: "#d58512" }}>
                <th>Modal</th>
                <td>{formatRp(totals.modal)}</td>
              </tr>
              <tr style={{ color: "#26B99A" }}>
                <th>Bersih</th>
                <td>{formatRp(totals.bersih)}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: 15, marginBottom: 40 }}>{sumMsg[sumTarget]}</div>
        </div>

        {/* Right: data table */}
        <div className="col-md-7 col-sm-7 col-xs-12 bg-white">
          <DataTable
            id="tabel_pendapatan_bln"
            data={data}
            columns={pendapatanColumns(ymToLabel, "Ym")}
            className="table table-striped table-bordered nowrap"
            options={{ searching: false, info: false, order: [] }}
          />
        </div>

        <div className="clearfix" />
      </CollapsiblePanel>
    </div>
  );
}

// ── Section: Pendapatan Harian ────────────────────────────────────────────────

function formatDateStr(d: Date | null): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function PendapatanHarian() {
  const [data, setData] = useState<PendapatanHarianRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const fetchData = (start: string, end: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (start && end) {
      params.set("startDate", start);
      params.set("endDate", end);
    }
    fetch(`/api/pendapatan-harian?${params}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const params = new URLSearchParams();
    fetch(`/api/pendapatan-harian?${params}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = () => {
    const s = formatDateStr(startDate);
    const e = formatDateStr(endDate);
    if (s && e) fetchData(s, e);
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    fetchData("", "");
  };

  return (
    <CollapsiblePanel title="Pendapatan Harian" colorClass="panel_color4">
      {/* Date range filter */}
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <label>Dari:</label>
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => setStartDate(date)}
          dateFormat="dd/MM/yyyy"
          locale="id"
          placeholderText="Pilih tanggal"
          className="form-control"
        />
        <label>Sampai:</label>
        <DatePicker
          selected={endDate}
          onChange={(date: Date | null) => setEndDate(date)}
          dateFormat="dd/MM/yyyy"
          locale="id"
          placeholderText="Pilih tanggal"
          minDate={startDate ?? undefined}
          className="form-control"
        />
        <button
          className="btn btn-default btn-sm"
          onClick={handleFilter}
          disabled={!startDate || !endDate}
        >
          Filter
        </button>
        <button className="btn btn-default btn-sm" onClick={handleReset}>
          Reset
        </button>
      </div>

      {loading ? (
        <ShimmerTable rows={6} cols={4} />
      ) : (
        <DataTable
          id="tabel_pendapatan_hrn"
          data={data}
          columns={pendapatanColumns(tanggalToLabel, "tanggal")}
          className="table table-striped table-bordered nowrap"
          options={{ order: [] }}
        />
      )}
    </CollapsiblePanel>
  );
}

// ── Section: Info Penyimpanan ─────────────────────────────────────────────────

function DbStorageCard({ db }: { db: DbStorageInfo }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const freeColor = db.isLowSpace ? "#E74C3C" : "#26B99A";

    if (!chartRef.current) {
      chartRef.current = new Chart(canvasRef.current, {
        type: "doughnut",
        data: {
          labels: ["Digunakan (%)", "Sisa (%)"],
          datasets: [
            {
              data: [db.percentUsed, db.percentFree],
              backgroundColor: ["#337AB7", freeColor],
              hoverBackgroundColor: ["#337AB7", freeColor],
            },
          ],
        },
        options: {
          plugins: { legend: { position: "top" } },
          responsive: true,
        },
      });
    } else {
      chartRef.current.data.datasets[0].data = [db.percentUsed, db.percentFree];
      (chartRef.current.data.datasets[0].backgroundColor as string[])[1] = freeColor;
      (chartRef.current.data.datasets[0].hoverBackgroundColor as string[])[1] = freeColor;
      chartRef.current.update();
    }

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [db]);

  return (
    <div className="col-md-6 col-sm-12 col-xs-12" style={{ marginBottom: 16 }}>
      <h5 style={{ fontWeight: 600, marginBottom: 8 }}>{db.label}</h5>
      <div className="row storage-info-layout">
        <div className="col-md-5 col-sm-12 col-xs-12 storage-info-chart-col">
          <div className="storage-info-chart-card">
            <canvas ref={canvasRef} />
          </div>
        </div>
        <div className="col-md-7 col-sm-12 col-xs-12 storage-info-table-col">
          <div className="storage-info-summary-card">
            <table className="table storage-info-table">
              <tbody>
                <tr>
                  <th>Total</th>
                  <td>{db.labelTotal}</td>
                </tr>
                <tr>
                  <th className="storage-info-used">Digunakan</th>
                  <td className="storage-info-used">{db.labelUsed}</td>
                </tr>
                <tr>
                  <th
                    className={db.isLowSpace ? "storage-info-free low-space" : "storage-info-free"}
                  >
                    Sisa
                  </th>
                  <td
                    className={db.isLowSpace ? "storage-info-free low-space" : "storage-info-free"}
                  >
                    {db.labelFree}
                  </td>
                </tr>
                <tr>
                  <th>Data</th>
                  <td>{db.dataSize}</td>
                </tr>
                <tr>
                  <th>Index</th>
                  <td>{db.indexSize}</td>
                </tr>
              </tbody>
            </table>
            {db.isLowSpace && (
              <div className="alert alert-danger storage-info-alert">
                <i className="fa fa-warning" /> Peringatan: Ruang penyimpanan hampir penuh (&lt; 100
                MB)!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoPenyimpanan() {
  const [databases, setDatabases] = useState<DbStorageInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/storage-info")
      .then((r) => r.json())
      .then((data: StorageInfoResponse) => setDatabases(data.databases))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <CollapsiblePanel title="Info Penyimpanan">
      {loading ? (
        <div className="row">
          {[0, 1].map((i) => (
            <div key={i} className="col-md-6 col-sm-12 col-xs-12" style={{ marginBottom: 16 }}>
              <div
                className="shimmer shimmer-line medium"
                style={{ height: 18, marginBottom: 12 }}
              />
              <div className="row">
                <div className="col-md-5 col-sm-12 col-xs-12">
                  <ShimmerChart />
                </div>
                <div className="col-md-7 col-sm-12 col-xs-12">
                  <ShimmerTable rows={5} cols={2} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row">
          {databases.map((db) => (
            <DbStorageCard key={db.label} db={db} />
          ))}
        </div>
      )}
    </CollapsiblePanel>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function DashboardPanels() {
  const [pdptnBulanan, setPdptnBulanan] = useState<PendapatanBulananRow[]>([]);
  const [topKategori, setTopKategori] = useState<TopKategoriRow[]>([]);
  const [topPelanggan, setTopPelanggan] = useState<TopPelangganRow[]>([]);
  const [loadingBulanan, setLoadingBulanan] = useState(true);
  const [loadingKategori, setLoadingKategori] = useState(true);
  const [loadingPelanggan, setLoadingPelanggan] = useState(true);

  useEffect(() => {
    fetch("/api/pendapatan-bulanan")
      .then((r) => r.json())
      .then((rows: PendapatanBulananRow[]) =>
        setPdptnBulanan(rows.sort((a, b) => a.Ym.localeCompare(b.Ym)))
      )
      .catch(() => {})
      .finally(() => setLoadingBulanan(false));
    fetch("/api/top-kategori")
      .then((r) => r.json())
      .then(setTopKategori)
      .catch(() => {})
      .finally(() => setLoadingKategori(false));
    fetch("/api/top-pelanggan")
      .then((r) => r.json())
      .then(setTopPelanggan)
      .catch(() => {})
      .finally(() => setLoadingPelanggan(false));
  }, []);

  return (
    <>
      <GrafikPendapatanBulanan data={pdptnBulanan} loading={loadingBulanan} />
      <br />
      <br />

      {/* Kategori Teratas & Pelanggan Teratas */}
      <div className="row">
        <div className="col-md-6 col-sm-6 col-xs-12">
          <CollapsiblePanel title="Kategori Teratas" colorClass="panel_color2">
            {loadingKategori ? (
              <ShimmerTable rows={5} cols={2} />
            ) : (
              <DataTable
                id="tabel_kategori_top"
                data={topKategori}
                columns={[
                  { title: "Kategori", data: "kategori" },
                  {
                    title: "Total",
                    data: "total",
                    className: "text-right",
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    render: (data: any, type: string) =>
                      type === "display" ? formatRp(data) : data,
                  },
                ]}
                className="table table-striped table-bordered"
                options={{ order: [], searching: false }}
              />
            )}
          </CollapsiblePanel>
        </div>
        <div className="col-md-6 col-sm-6 col-xs-12">
          <CollapsiblePanel title="Pelanggan Teratas" colorClass="panel_color1">
            {loadingPelanggan ? (
              <ShimmerTable rows={5} cols={2} />
            ) : (
              <DataTable
                id="tabel_pelanggan_top"
                data={topPelanggan}
                columns={[
                  { title: "Pelanggan", data: "nama_pelanggan" },
                  {
                    title: "Total Belanja",
                    data: "total_belanja",
                    className: "text-right",
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    render: (data: any, type: string) =>
                      type === "display" ? formatRp(data) : data,
                  },
                ]}
                className="table table-striped table-bordered"
                options={{ order: [], searching: false }}
              />
            )}
          </CollapsiblePanel>
        </div>
      </div>

      {/* Pendapatan Harian */}
      <div className="row">
        <PendapatanHarian />
      </div>

      {/* Info Penyimpanan */}
      <div className="row">
        <InfoPenyimpanan />
      </div>
    </>
  );
}
