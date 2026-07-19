import * as XLSX from "xlsx";
import { Box, Visit, Category } from "@/types";

const STATUS_AR: Record<string, string> = {
  returned: "عاد",
  consumed: "استُهلك",
  missing: "مفقود",
};

function catLabel(categories: Category[], key: string): string {
  return categories.find((c) => c.key === key)?.label || key;
}

function downloadSheet(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportBoxToExcel(
  box: Box,
  visitName: string,
  categories: Category[]
) {
  const rows: (string | number)[][] = [
    ["اسم الصنف", "الفئة", "الرقم التسلسلي", "الكمية", "الحالة"],
  ];

  for (const item of box.items) {
    rows.push([
      item.name,
      catLabel(categories, item.category),
      item.serialNumber || "—",
      item.qty,
      item.status ? STATUS_AR[item.status] : "—",
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 20 },
    { wch: 10 },
    { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, box.name);
  downloadSheet(wb, `صندوق_${box.name}_${visitName}`);
}

export function exportVisitReportToExcel(
  visit: Visit,
  categories: Category[]
) {
  const wb = XLSX.utils.book_new();

  // Header sheet with visit info
  const headerRows: (string | number)[][] = [
    ["تقرير الزيارة"],
    [],
    ["اسم الزيارة", visit.name],
    ["التاريخ", visit.date],
    ["التاريخ الهجري", visit.hijriDate || "—"],
    [],
  ];

  const allItems = visit.boxes.flatMap((b) =>
    b.items.map((bi) => ({ ...bi, boxName: b.name }))
  );
  const returnedQty = allItems
    .filter((i) => i.status === "returned")
    .reduce((a, i) => a + i.qty, 0);
  const consumedQty = allItems
    .filter((i) => i.status === "consumed")
    .reduce((a, i) => a + i.qty, 0);
  const missingQty = allItems
    .filter((i) => i.status === "missing")
    .reduce((a, i) => a + i.qty, 0);
  const totalDeployedQty = allItems.reduce((a, i) => a + i.qty, 0);

  headerRows.push(
    ["إجمالي المُرسل", totalDeployedQty],
    ["عاد للمخزن", returnedQty],
    ["استُهلك", consumedQty],
    ["مفقود", missingQty]
  );

  const headerWs = XLSX.utils.aoa_to_sheet(headerRows);
  headerWs["!cols"] = [{ wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, headerWs, "ملخص");

  // One sheet per box
  for (const box of visit.boxes) {
    const boxRows: (string | number)[][] = [
      ["اسم الصنف", "الفئة", "الرقم التسلسلي", "الكمية", "الحالة"],
    ];

    for (const item of box.items) {
      boxRows.push([
        item.name,
        catLabel(categories, item.category),
        item.serialNumber || "—",
        item.qty,
        item.status ? STATUS_AR[item.status] : "—",
      ]);
    }

    const boxWs = XLSX.utils.aoa_to_sheet(boxRows);
    boxWs["!cols"] = [
      { wch: 25 },
      { wch: 18 },
      { wch: 20 },
      { wch: 10 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, boxWs, box.name.slice(0, 31));
  }

  downloadSheet(wb, `تقرير_زيارة_${visit.name}`);
}
