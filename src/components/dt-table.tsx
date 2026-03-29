"use client";

import DataTable from "datatables.net-react";
import DT from "datatables.net-bs";
import "datatables.net-bs/css/dataTables.bootstrap.min.css";

// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DT);

export { DataTable };
export type { Config as DataTableConfig } from "datatables.net";
