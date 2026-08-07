export interface SheetSpec {
  name: string;
  title: string;
  headers: string[];
  rows: (string | number)[][];
  widths?: number[];
  totalRow?: (string | number)[];
}

export function xlsxColName(i: number): string {
  let s = "";
  let n = i;
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function xmlEsc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function plainNumber(n: unknown): string {
  const m = String(n ?? "").match(/(\d+)/);
  return m ? String(parseInt(m[1], 10)) : String(n ?? "");
}

function crc32(buf: Uint8Array): number {
  let table = (crc32 as unknown as { table?: Int32Array }).table;
  if (!table) {
    table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    (crc32 as unknown as { table?: Int32Array }).table = table;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function buildZip(entries: { name: string; data: Uint8Array }[]): Uint8Array {
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const enc = new TextEncoder();

  entries.forEach(({ name, data }) => {
    const nameBytes = enc.encode(name);
    const crc = crc32(data);

    const local = new Uint8Array(30 + nameBytes.length + data.length);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 20, true);
    dv.setUint16(6, 0x0800, true);
    dv.setUint16(8, 0, true);
    dv.setUint32(14, crc, true);
    dv.setUint32(18, data.length, true);
    dv.setUint32(22, data.length, true);
    dv.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, 30);
    local.set(data, 30 + nameBytes.length);
    chunks.push(local);

    const c = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(c.buffer);
    cdv.setUint32(0, 0x02014b50, true);
    cdv.setUint16(4, 20, true);
    cdv.setUint16(6, 20, true);
    cdv.setUint16(8, 0x0800, true);
    cdv.setUint32(16, crc, true);
    cdv.setUint32(20, data.length, true);
    cdv.setUint32(24, data.length, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint32(42, offset, true);
    c.set(nameBytes, 46);
    central.push(c);
    offset += local.length;
  });

  const cdSize = central.reduce((s, c) => s + c.length, 0);
  const eocd = new Uint8Array(22);
  const edv = new DataView(eocd.buffer);
  edv.setUint32(0, 0x06054b50, true);
  edv.setUint16(8, entries.length, true);
  edv.setUint16(10, entries.length, true);
  edv.setUint32(12, cdSize, true);
  edv.setUint32(16, offset, true);

  const total = chunks.reduce((s, c) => s + c.length, 0) + cdSize + eocd.length;
  const out = new Uint8Array(total);
  let p = 0;
  chunks.forEach((c) => {
    out.set(c, p);
    p += c.length;
  });
  central.forEach((c) => {
    out.set(c, p);
    p += c.length;
  });
  out.set(eocd, p);
  return out;
}

export function xlsxSheetXml({ title, headers, rows, widths, totalRow }: SheetSpec): string {
  const ncols = headers.length;
  const lastCol = xlsxColName(ncols);

  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';
  xml += '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>';
  xml += '<sheetViews><sheetView rightToLeft="1" workbookViewId="0"/></sheetViews>';
  xml += '<sheetFormatPr defaultRowHeight="15"/>';

  if (widths) {
    xml += '<cols>';
    widths.forEach((w, i) => {
      xml += `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`;
    });
    xml += '</cols>';
  }

  xml += '<sheetData>';

  xml += `<row r="1"><c r="A1" s="2" t="inlineStr"><is><t>${xmlEsc(title)}</t></is></c></row>`;
  xml += '<row r="2"/>';

  xml += '<row r="3">';
  headers.forEach((h, i) => {
    xml += `<c r="${xlsxColName(i + 1)}3" s="1" t="inlineStr"><is><t>${xmlEsc(h)}</t></is></c>`;
  });
  xml += '</row>';

  let r = 4;
  rows.forEach((row, idx) => {
    const s = idx % 2 === 1 ? "5" : "4";
    xml += `<row r="${r}">`;
    row.forEach((val, i) => {
      const ref = xlsxColName(i + 1) + r;
      if (typeof val === "number") xml += `<c r="${ref}" s="${s}"><v>${val}</v></c>`;
      else if (val === "" || val == null) xml += `<c r="${ref}"/>`;
      else xml += `<c r="${ref}" s="${s}" t="inlineStr"><is><t>${xmlEsc(val)}</t></is></c>`;
    });
    xml += '</row>';
    r++;
  });

  if (totalRow) {
    xml += `<row r="${r}">`;
    totalRow.forEach((val, i) => {
      const ref = xlsxColName(i + 1) + r;
      if (typeof val === "number") xml += `<c r="${ref}" s="6"><v>${val}</v></c>`;
      else if (val === "" || val == null) xml += `<c r="${ref}"/>`;
      else xml += `<c r="${ref}" s="6" t="inlineStr"><is><t>${xmlEsc(val)}</t></is></c>`;
    });
    xml += '</row>';
  }

  xml += '</sheetData>';

  xml += `<mergeCells count="1"><mergeCell ref="A1:${lastCol}1"/></mergeCells>`;
  xml += '<pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>';
  xml += '<pageSetup paperSize="9" orientation="portrait" fitToWidth="1" fitToHeight="0"/>';
  xml += '</worksheet>';

  return xml;
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="13"/><name val="Calibri"/></font>
  </fonts>
  <fills count="6">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF991B1B"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF3F4F6"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF9FAFB"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFDF3CD"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFD1D5DB"/></left>
      <right style="thin"><color rgb="FFD1D5DB"/></right>
      <top style="thin"><color rgb="FFD1D5DB"/></top>
      <bottom style="thin"><color rgb="FFD1D5DB"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellXfs count="7">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment wrapText="1" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment wrapText="1" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">
      <alignment wrapText="1" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment wrapText="1" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="1" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment wrapText="1" vertical="center"/>
    </xf>
  </cellXfs>
</styleSheet>`;

export function buildXlsxBlob({
  sheets,
  summaryTitle,
  summaryHeaders,
  summaryRows,
  appendSummary = true,
}: {
  sheets: SheetSpec[];
  summaryTitle: string;
  summaryHeaders: string[];
  summaryRows: (string | number)[][];
  appendSummary?: boolean;
}): Blob {
  const usedNames = new Set<string>();
  const sanitize = (n: string): string => {
    let s = String(n).replace(/[\\\/\?\*\[\]:]/g, "-").slice(0, 31);
    if (usedNames.has(s)) {
      let i = 2;
      while (usedNames.has(s.slice(0, 27) + "-" + i)) i++;
      s = s.slice(0, 27) + "-" + i;
    }
    usedNames.add(s);
    return s;
  };

  const allSheets = sheets.map((sh) => ({ name: sanitize(sh.name), xml: xlsxSheetXml(sh) }));

  if (appendSummary) {
    allSheets.push({
      name: "الملخص التنفيذي",
      xml: xlsxSheetXml({
        name: "الملخص التنفيذي",
        title: summaryTitle,
        headers: summaryHeaders,
        rows: summaryRows,
        widths: [50, 10],
      }),
    });
  }

  if (allSheets.length === 0) {
    allSheets.push({
      name: "الملخص التنفيذي",
      xml: xlsxSheetXml({
        name: "الملخص التنفيذي",
        title: summaryTitle,
        headers: summaryHeaders,
        rows: summaryRows,
        widths: [50, 10],
      }),
    });
  }

  const enc = new TextEncoder();
  const entries: { name: string; data: Uint8Array }[] = [];

  let ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  ct += '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">';
  ct += '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>';
  ct += '<Default Extension="xml" ContentType="application/xml"/>';
  allSheets.forEach((_, i) => {
    ct += `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`;
  });
  ct += '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>';
  ct += '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>';
  ct += '</Types>';
  entries.push({ name: "[Content_Types].xml", data: enc.encode(ct) });

  entries.push({
    name: "_rels/.rels",
    data: enc.encode(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        "</Relationships>"
    ),
  });

  let wb = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  wb += '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">';
  wb += "<sheets>";
  allSheets.forEach((s, i) => {
    wb += `<sheet name="${xmlEsc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`;
  });
  wb += "</sheets></workbook>";
  entries.push({ name: "xl/workbook.xml", data: enc.encode(wb) });

  let wbr = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  wbr += '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
  allSheets.forEach((_, i) => {
    wbr += `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`;
  });
  wbr += '<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>';
  wbr += "</Relationships>";
  entries.push({ name: "xl/_rels/workbook.xml.rels", data: enc.encode(wbr) });

  entries.push({ name: "xl/styles.xml", data: enc.encode(STYLES_XML) });

  allSheets.forEach((s, i) => {
    entries.push({ name: `xl/worksheets/sheet${i + 1}.xml`, data: enc.encode(s.xml) });
  });

  return new Blob([buildZip(entries) as unknown as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
