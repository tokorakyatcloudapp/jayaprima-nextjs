"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ProfilData {
  nama: string;
  alamat: string;
  info1: string;
  info2: string;
}

export default function ProfilUsahaPage() {
  const [data, setData] = useState<ProfilData>({ nama: "", alamat: "", info1: "", info2: "" });
  const [original, setOriginal] = useState<ProfilData>(data);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "danger" | "info"; text: string } | null>(
    null
  );
  const [confirming, setConfirming] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const logoFile = useRef<File | null>(null);

  const uploadLogo = useCallback(async (file: File) => {
    setUploading(true);
    setUploadProgress(5);
    setMsg(null);
    const fd = new FormData();
    fd.append("logo", file);
    try {
      const res = await fetch("/api/user-info", { method: "PUT", body: fd });
      const json = await res.json();
      if (res.ok && json.result) {
        setMsg({ type: "success", text: "Logo berhasil diunggah." });
        setUploadProgress(100);
      } else {
        setMsg({ type: "danger", text: json.error || "Gagal mengunggah logo." });
      }
    } catch {
      setMsg({ type: "danger", text: "Terjadi kesalahan jaringan saat unggah logo." });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(null), 400);
    }
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      logoFile.current = file;
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      setUploadProgress(null);
      uploadLogo(file);
    },
    [uploadLogo]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [],
    },
    multiple: false,
    maxFiles: 1,
    onDrop,
    disabled: saving || uploading,
  });

  useEffect(() => {
    fetch("/api/user-info")
      .then((r) => r.json())
      .then((info: ProfilData) => {
        const d = {
          nama: info.nama || "",
          alamat: info.alamat || "",
          info1: info.info1 || "",
          info2: info.info2 || "",
        };
        setData(d);
        setOriginal(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const hasTextChange =
      data.nama !== original.nama ||
      data.alamat !== original.alamat ||
      data.info1 !== original.info1 ||
      data.info2 !== original.info2;
    const hasLogoChange = !!logoFile.current;

    if (!hasTextChange && !hasLogoChange) {
      setMsg({ type: "info", text: "Data masih sama, tidak ada perubahan." });
      return;
    }

    setConfirming(true);
  };

  const doSave = async () => {
    setSaving(true);
    setConfirming(false);
    const fd = new FormData();
    if (data.nama !== original.nama) fd.append("nama", data.nama);
    if (data.alamat !== original.alamat) fd.append("alamat", data.alamat);
    if (data.info1 !== original.info1) fd.append("info1", data.info1);
    if (data.info2 !== original.info2) fd.append("info2", data.info2);
    if (logoFile.current) fd.append("logo", logoFile.current);

    setUploading(true);
    setUploadProgress(uploadProgress ?? 10);

    try {
      const res = await fetch("/api/user-info", {
        method: "PUT",
        body: fd,
      });
      const json = await res.json();
      if (res.ok && json.result) {
        setMsg({ type: "success", text: "Profil usaha berhasil diperbarui." });
        setUploadProgress(100);
        setTimeout(() => window.location.reload(), 400);
      } else {
        setMsg({ type: "danger", text: json.error || "Gagal menyimpan profil." });
      }
    } catch {
      setMsg({ type: "danger", text: "Terjadi kesalahan jaringan." });
    } finally {
      setSaving(false);
      setUploading(false);
      setTimeout(() => setUploadProgress(null), 400);
    }
  };

  if (loading) {
    return (
      <div className="x_panel panel_color3">
        <div className="x_title" style={{ height: "auto" }}>
          <h2>Profil Usaha</h2>
          <div className="clearfix" />
        </div>
        <div className="x_content">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="shimmer shimmer-line long" style={{ marginBottom: 20 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="x_panel panel_color3">
      <div className="x_title" style={{ height: "auto" }}>
        <h2>Profil Usaha</h2>
        <div className="clearfix" />
      </div>
      <div className="x_content">
        <p className="text-muted">
          <i className="fa fa-info-circle" /> Maks 30 karakter per field.
        </p>

        {msg && (
          <div className={`alert alert-${msg.type}`} role="alert">
            {msg.text}
          </div>
        )}

        <form className="form-horizontal form-label-left" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 col-sm-12">
              <div className="form-group">
                <label className="control-label">Nama *</label>
                <input
                  type="text"
                  className="form-control"
                  maxLength={30}
                  required
                  value={data.nama}
                  onChange={(e) => setData({ ...data, nama: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="control-label">Alamat *</label>
                <textarea
                  className="form-control"
                  maxLength={30}
                  required
                  rows={3}
                  style={{ resize: "none" }}
                  value={data.alamat}
                  onChange={(e) => setData({ ...data, alamat: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="control-label">Info 1 *</label>
                <textarea
                  className="form-control"
                  maxLength={30}
                  required
                  rows={2}
                  style={{ resize: "none" }}
                  value={data.info1}
                  onChange={(e) => setData({ ...data, info1: e.target.value })}
                />
                <span className="text-muted" style={{ fontSize: 11 }}>
                  Kota / Telepon / WhatsApp / URL Website
                </span>
              </div>

              <div className="form-group">
                <label className="control-label">Info 2 *</label>
                <textarea
                  className="form-control"
                  maxLength={30}
                  required
                  rows={2}
                  style={{ resize: "none" }}
                  value={data.info2}
                  onChange={(e) => setData({ ...data, info2: e.target.value })}
                />
                <span className="text-muted" style={{ fontSize: 11 }}>
                  Kota / Telepon / WhatsApp / URL Website
                </span>
              </div>
            </div>

            <div className="col-md-6 col-sm-12">
              <div className="panel panel-default" style={{ borderColor: "#d9d9d9" }}>
                <div
                  className="panel-heading"
                  style={{ background: "#fafafa", borderColor: "#d9d9d9" }}
                >
                  <strong>Logo Usaha</strong>
                </div>
                <div className="panel-body">
                  <div
                    {...getRootProps({
                      className: "dropzone",
                      style: {
                        border: "1px dashed #999",
                        borderRadius: 6,
                        padding: 12,
                        cursor: "pointer",
                        background: isDragActive ? "#f7f9fb" : "#fcfcfc",
                      },
                    })}
                  >
                    <input {...getInputProps()} />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 12,
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          border: "1px solid #e0e0e0",
                          borderRadius: 6,
                          background: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: 140,
                          width: "100%",
                          padding: 8,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoPreview || "/api/logo"}
                          alt="Logo preview"
                          style={{
                            maxWidth: "100%",
                            maxHeight: 160,
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Unggah Logo</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                          {isDragActive
                            ? "Lepas file di sini"
                            : "Tarik & letakkan file atau klik untuk pilih (maks 1 file)"}
                        </p>
                        {uploading && (
                          <div style={{ marginTop: 8 }}>
                            <progress
                              value={uploadProgress ?? 100}
                              max={100}
                              style={{ width: "100%", height: 10 }}
                            />
                            <span style={{ fontSize: 11, color: "#888" }}>Mengunggah logo...</span>
                          </div>
                        )}
                        <p style={{ margin: "8px 0 0", fontSize: 11, color: "#888" }}>
                          Disarankan PNG transparan atau JPG. Maks 1 file.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ln_solid" />

          <div className="form-group" style={{ textAlign: "right" }}>
            <div className="col-md-12">
              <button type="submit" className="btn btn-success" disabled={saving || uploading}>
                {saving ? (
                  <>
                    <i className="fa fa-spinner fa-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="fa fa-save" /> Simpan
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {confirming && (
          <div
            className="modal-backdrop"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.35)",
              zIndex: 1050,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 12,
            }}
          >
            <div
              className="modal-content"
              style={{
                background: "white",
                borderRadius: 6,
                maxWidth: 420,
                width: "100%",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              <div
                className="modal-header"
                style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}
              >
                <h4 className="modal-title" style={{ margin: 0 }}>
                  Konfirmasi Simpan
                </h4>
              </div>
              <div className="modal-body" style={{ padding: "12px 16px" }}>
                <p style={{ margin: 0 }}>Apakah data sudah benar?</p>
              </div>
              <div
                className="modal-footer"
                style={{
                  padding: "10px 16px",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  borderTop: "1px solid #eee",
                }}
              >
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={() => setConfirming(false)}
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={doSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fa fa-spinner fa-spin" /> Menyimpan...
                    </>
                  ) : (
                    "Ya, Simpan"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
