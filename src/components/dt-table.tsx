"use client";

import DataTable from "datatables.net-react";
import DT from "datatables.net-bs";
import "datatables.net-bs/css/dataTables.bootstrap.min.css";

// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DT);

DT.defaults.language = {
  emptyTable: "Tidak ada data tersedia",
  info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ entri",
  infoEmpty: "Menampilkan 0 sampai 0 dari 0 entri",
  infoFiltered: "(disaring dari _MAX_ total entri)",
  lengthMenu: "Tampilkan _MENU_ entri",
  loadingRecords: "Memuat...",
  processing: "Memproses...",
  search: "Cari:",
  zeroRecords: "Tidak ditemukan data yang cocok",
  paginate: {
    first: "",
    last: "",
    next: "Berikutnya",
    previous: "Sebelumnya",
  },
};

DT.defaults.pagingType = "simple_numbers";
DT.defaults.pageLength = 10;

export { DataTable };
export type { Config as DataTableConfig } from "datatables.net";
