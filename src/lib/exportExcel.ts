import {
  Box,
  Visit,
  Category,
  WarehouseItem,
  ArchivedVisit,
  BoxItem,
  getItemReturnedSerials,
  getItemMissingSerials,
  getItemSerials,
} from "@/types";
import { buildXlsxBlob, SheetSpec, downloadBlob } from "@/lib/xlsx";

const STATUS_AR: Record<string, string> = {
  returned: "عاد",
  consumed: "استُهلك",
  missing: "مفقود",
};

export type ExportFilter = "all" | "missing" | "consumed" | "returned";

export interface ExportOptions {
  includeBoxes: string[];
  includeFlat: boolean;
  includeSummary: boolean;
  totals: boolean;
  serials: boolean;
  filter: ExportFilter;
}

export interface ExportSettings {
  includeFlat: boolean;
  includeSummary: boolean;
  totals: boolean;
  serials: boolean;
  filter: ExportFilter;
}

const DEFAULT_SETTINGS: ExportSettings = {
  includeFlat: true,
  includeSummary: true,
  totals: true,
  serials: true,
  filter: "all",
};

const SETTINGS_KEY = "it_excel_settings";

export function loadExportSettings(): ExportSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveExportSettings(s: ExportSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function resolveOptions(opts: Partial<ExportOptions> | undefined, allBoxIds: string[]): ExportOptions {
  return {
    includeBoxes: opts?.includeBoxes ?? allBoxIds,
    includeFlat: opts?.includeFlat ?? DEFAULT_SETTINGS.includeFlat,
    includeSummary: opts?.includeSummary ?? DEFAULT_SETTINGS.includeSummary,
    totals: opts?.totals ?? DEFAULT_SETTINGS.totals,
    serials: opts?.serials ?? DEFAULT_SETTINGS.serials,
    filter: opts?.filter ?? DEFAULT_SETTINGS.filter,
  };
}

function catLabel(categories: Category[], key: string): string {
  return categories.find((c) => c.key === key)?.label || key;
}

function itemMetrics(item: BoxItem) {
  const deployedQty = item.originalQty || item.qty;
  const returnedQty = item.returnedQty ?? (item.status === "returned" ? item.qty : 0);
  const shortage = deployedQty - returnedQty;
  const consumedQty = item.consumable ? shortage : 0;
  const missingQty = !item.consumable ? shortage : 0;
  const status = item.status || (returnedQty === deployedQty ? "returned" : item.consumable ? "consumed" : "missing");
  return { deployedQty, returnedQty, consumedQty, missingQty, status };
}

function serialsText(item: BoxItem): string {
  const serials = getItemSerials(item);
  if (serials.length === 0) return "—";
  const out = item.outSerials || [];
  const returned = item.returnedSerials || [];
  if (out.length === 0) return serials.join("، ");
  return serials
    .map((s) => {
      if (!out.includes(s)) return s;
      return returned.includes(s) ? `${s} (عاد)` : `${s} (مفقود)`;
    })
    .join("، ");
}

function boxHeaders(serials: boolean): string[] {
  return serials
    ? ["اسم الصنف", "الفئة", "الأرقام العائدة", "الأرقام المفقودة", "المُرسل", "عاد", "استُهلك", "مفقود", "الحالة"]
    : ["اسم الصنف", "الفئة", "الأرقام", "المُرسل", "عاد", "استُهلك", "مفقود", "الحالة"];
}

function boxWidths(serials: boolean): number[] {
  return serials ? [25, 16, 26, 26, 10, 10, 10, 10, 12] : [25, 16, 40, 10, 10, 10, 10, 12];
}

function boxRow(item: BoxItem, categories: Category[], serials: boolean): (string | number)[] {
  const m = itemMetrics(item);
  const row: (string | number)[] = [item.name, catLabel(categories, item.category)];
  if (serials) {
    const returned = getItemReturnedSerials(item);
    const missing = getItemMissingSerials(item);
    row.push(returned.length > 0 ? returned.join("، ") : "—");
    row.push(missing.length > 0 ? missing.join("، ") : "—");
  } else {
    row.push(serialsText(item));
  }
  row.push(m.deployedQty, m.returnedQty, m.consumedQty, m.missingQty, STATUS_AR[m.status] || "—");
  return row;
}

function passesFilter(item: BoxItem, filter: ExportFilter): boolean {
  if (filter === "all") return true;
  return itemMetrics(item).status === filter;
}

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

function buildTotalRow(rows: (string | number)[][], ncols: number, qtyIdx: number[]): (string | number)[] | undefined {
  if (rows.length === 0) return undefined;
  const total: (string | number)[] = new Array(ncols).fill("");
  total[0] = "الإجمالي";
  for (const i of qtyIdx) {
    total[i] = rows.reduce((a, r) => a + (typeof r[i] === "number" ? (r[i] as number) : 0), 0);
  }
  return total;
}

function boxSheet(box: Box, categories: Category[], opts: ExportOptions): SheetSpec {
  const headers = boxHeaders(opts.serials);
  const rows = box.items
    .filter((i) => passesFilter(i, opts.filter))
    .map((i) => boxRow(i, categories, opts.serials));
  return {
    name: box.name,
    title: `تقرير صندوق: ${box.name}`,
    headers,
    rows,
    widths: boxWidths(opts.serials),
    totalRow: opts.totals ? buildTotalRow(rows, headers.length, range(headers.length - 5, headers.length - 2)) : undefined,
  };
}

function flatSheet(visit: Visit, categories: Category[], opts: ExportOptions): SheetSpec {
  const headers = ["الصندوق", ...boxHeaders(opts.serials)];
  const rows = visit.boxes.flatMap((b) =>
    b.items
      .filter((i) => passesFilter(i, opts.filter))
      .map((i) => [b.name, ...boxRow(i, categories, opts.serials)])
  );
  return {
    name: "كل الأصناف",
    title: `كل الأصناف — ${visit.name}`,
    headers,
    rows,
    widths: [16, ...boxWidths(opts.serials)],
    totalRow: opts.totals ? buildTotalRow(rows, headers.length, range(headers.length - 5, headers.length - 2)) : undefined,
  };
}

function visitTotals(visit: Visit) {
  const allItems = visit.boxes.flatMap((b) => b.items);
  return {
    totalItems: allItems.length,
    deployed: allItems.reduce((a, i) => a + itemMetrics(i).deployedQty, 0),
    returned: allItems.reduce((a, i) => a + itemMetrics(i).returnedQty, 0),
    consumed: allItems.reduce((a, i) => a + itemMetrics(i).consumedQty, 0),
    missing: allItems.reduce((a, i) => a + itemMetrics(i).missingQty, 0),
  };
}

function visitSummaryRows(visit: Visit): (string | number)[][] {
  const t = visitTotals(visit);
  return [
    ["اسم الزيارة", visit.name],
    ["التاريخ", visit.date],
    ["التاريخ الهجري", visit.hijriDate || "—"],
    ["السنة", visit.year || "—"],
    [],
    ["عدد الصناديق", visit.boxes.length],
    ["عدد الأصناف", t.totalItems],
    ["إجمالي المُرسل", t.deployed],
    ["عاد للمخزن", t.returned],
    ["استُهلك", t.consumed],
    ["مفقود", t.missing],
  ];
}

function boxSummaryRows(box: Box, visitName: string): (string | number)[][] {
  const allItems = box.items;
  return [
    ["اسم الزيارة", visitName],
    ["الصندوق", box.name],
    [],
    ["عدد الأصناف", allItems.length],
    ["إجمالي المُرسل", allItems.reduce((a, i) => a + itemMetrics(i).deployedQty, 0)],
    ["عاد للمخزن", allItems.reduce((a, i) => a + itemMetrics(i).returnedQty, 0)],
    ["استُهلك", allItems.reduce((a, i) => a + itemMetrics(i).consumedQty, 0)],
    ["مفقود", allItems.reduce((a, i) => a + itemMetrics(i).missingQty, 0)],
  ];
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function exportVisitReportToExcel(visit: Visit, categories: Category[], opts?: Partial<ExportOptions>) {
  const o = resolveOptions(opts, visit.boxes.map((b) => b.id));
  const sheets: SheetSpec[] = [];
  for (const box of visit.boxes) {
    if (o.includeBoxes.includes(box.id)) sheets.push(boxSheet(box, categories, o));
  }
  if (o.includeFlat) sheets.push(flatSheet(visit, categories, o));
  const blob = buildXlsxBlob({
    sheets,
    summaryTitle: `ملخص الزيارة: ${visit.name}`,
    summaryHeaders: ["البند", "القيمة"],
    summaryRows: visitSummaryRows(visit),
    appendSummary: o.includeSummary,
  });
  const date = visit.date || today();
  downloadBlob(blob, `تقرير_زيارة_${visit.name}_${date}.xlsx`);
}

export function exportBoxToExcel(box: Box, visitName: string, categories: Category[], opts?: Partial<ExportOptions>) {
  const o = resolveOptions(opts, [box.id]);
  const headers = boxHeaders(o.serials);
  const rows = box.items
    .filter((i) => passesFilter(i, o.filter))
    .map((i) => boxRow(i, categories, o.serials));
  const blob = buildXlsxBlob({
    sheets: [
      {
        name: box.name,
        title: `تقرير صندوق: ${box.name} — ${visitName}`,
        headers,
        rows,
        widths: boxWidths(o.serials),
        totalRow: o.totals ? buildTotalRow(rows, headers.length, range(headers.length - 5, headers.length - 2)) : undefined,
      },
    ],
    summaryTitle: `ملخص الصندوق: ${box.name}`,
    summaryHeaders: ["البند", "القيمة"],
    summaryRows: boxSummaryRows(box, visitName),
    appendSummary: o.includeSummary,
  });
  const date = today();
  downloadBlob(blob, `صندوق_${box.name}_${visitName}_${date}.xlsx`);
}

export function exportWarehouseToExcel(items: WarehouseItem[], categories: Category[], opts?: Partial<ExportOptions>) {
  const o = resolveOptions(opts, []);
  const headers = o.serials
    ? ["اسم الصنف", "الفئة", "الأرقام", "الكمية", "استهلاكي"]
    : ["اسم الصنف", "الفئة", "الكمية", "استهلاكي"];
  const rows = items.map((i) => {
    const serials = getItemSerials(i);
    const base: (string | number)[] = [i.name, catLabel(categories, i.category)];
    if (o.serials) base.push(serials.length > 0 ? serials.join("، ") : "—");
    base.push(i.totalQty, i.consumable ? "نعم" : "لا");
    return base;
  });
  const qtyIdx = o.serials ? [3] : [2];
  const totalQty = items.reduce((a, i) => a + i.totalQty, 0);
  const serialCount = items.reduce((a, i) => a + getItemSerials(i).length, 0);
  const blob = buildXlsxBlob({
    sheets: [
      {
        name: "المخزن",
        title: "تقرير مخزون تقنية المعلومات",
        headers,
        rows,
        widths: o.serials ? [28, 16, 40, 10, 10] : [28, 16, 10, 10],
        totalRow: o.totals ? buildTotalRow(rows, headers.length, qtyIdx) : undefined,
      },
    ],
    summaryTitle: "ملخص المخزن",
    summaryHeaders: ["البند", "القيمة"],
    summaryRows: [
      ["عدد الأصناف", items.length],
      ["إجمالي الكمية", totalQty],
      ["الأرقام المسلسلة", serialCount],
      ["الأصناف الاستهلاكية", items.filter((i) => i.consumable).length],
    ],
    appendSummary: o.includeSummary,
  });
  const date = today();
  downloadBlob(blob, `المخزن_${date}.xlsx`);
}

export function exportCompletedVisitsToExcel(
  archivedVisits: ArchivedVisit[],
  categories: Category[],
  opts?: Partial<ExportOptions>
) {
  const o = resolveOptions(opts, archivedVisits.map((a) => a.id));
  const sheets: SheetSpec[] = [];

  for (const archive of archivedVisits) {
    if (!o.includeBoxes.includes(archive.id)) continue;
    const headers = ["الصندوق", ...boxHeaders(o.serials)];
    const rows = archive.boxes.flatMap((b) =>
      b.items
        .filter((i) => passesFilter(i, o.filter))
        .map((i) => [b.name, ...boxRow(i, categories, o.serials)])
    );
    sheets.push({
      name: archive.name,
      title: `تقرير زيارة مكتملة: ${archive.name}`,
      headers,
      rows,
      widths: [16, ...boxWidths(o.serials)],
      totalRow: o.totals ? buildTotalRow(rows, headers.length, range(headers.length - 5, headers.length - 2)) : undefined,
    });
  }

  const logHeaders = ["اسم الزيارة", "التاريخ", "التاريخ الهجري", "السنة", "الصناديق", "الأصناف", "المُرسل", "عاد", "استُهلك", "مفقود"];
  const logRows: (string | number)[][] = archivedVisits.map((a) => {
    const t = visitTotals({
      id: a.visitId,
      name: a.name,
      date: a.date,
      hijriDate: a.hijriDate,
      year: a.year,
      status: "completed",
      boxes: a.boxes,
    });
    return [a.name, a.date, a.hijriDate || "—", a.year || "—", a.boxes.length, t.totalItems, t.deployed, t.returned, t.consumed, t.missing];
  });
  if (o.includeFlat) {
    sheets.push({
      name: "سجل الزيارات",
      title: "سجل الزيارات المكتملة",
      headers: logHeaders,
      rows: logRows,
      widths: [22, 12, 14, 10, 9, 9, 9, 9, 9, 9],
      totalRow: o.totals ? buildTotalRow(logRows, logHeaders.length, range(logHeaders.length - 4, logHeaders.length - 1)) : undefined,
    });
  }

  const grand = archivedVisits.reduce(
    (acc, a) => {
      const t = visitTotals({
        id: a.visitId,
        name: a.name,
        date: a.date,
        hijriDate: a.hijriDate,
        year: a.year,
        status: "completed",
        boxes: a.boxes,
      });
      return {
        deployed: acc.deployed + t.deployed,
        returned: acc.returned + t.returned,
        consumed: acc.consumed + t.consumed,
        missing: acc.missing + t.missing,
      };
    },
    { deployed: 0, returned: 0, consumed: 0, missing: 0 }
  );

  const blob = buildXlsxBlob({
    sheets,
    summaryTitle: "ملخص الزيارات المكتملة",
    summaryHeaders: ["البند", "القيمة"],
    summaryRows: [
      ["عدد الزيارات", archivedVisits.length],
      [],
      ["إجمالي المُرسل", grand.deployed],
      ["عاد للمخزن", grand.returned],
      ["استُهلك", grand.consumed],
      ["مفقود", grand.missing],
    ],
    appendSummary: o.includeSummary,
  });
  const date = today();
  downloadBlob(blob, `الزيارات_المكتملة_${date}.xlsx`);
}
