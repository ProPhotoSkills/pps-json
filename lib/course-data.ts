import fs from "node:fs";
import path from "node:path";

export type Lesson = {
  number: number;
  title: string;
  slug: string;
  html: string;
  summary: string;
};

type JsonRecord = Record<string, unknown>;

const insuranceDirectory = path.join(process.cwd(), "INSURANCE");

function titleFromFilename(filename: string) {
  return filename
    .replace(/^t12_l\d+_/, "")
    .replace(/\.json$/, "")
    .split("-")
    .map((word) => (word.length === 0 ? word : word[0].toUpperCase() + word.slice(1)))
    .join(" ");
}

function getRecord(value: unknown): JsonRecord | undefined {
  return value && typeof value === "object" ? value as JsonRecord : undefined;
}

function getDesktopValue(value: unknown): unknown {
  const record = getRecord(value);
  return getRecord(record?.desktop)?.value;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

function cleanHtml(value: string) {
  return value
    .replace(/<\/?(script|style|iframe|object|embed)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*("|')\s*javascript:[\s\S]*?\2/gi, "");
}

function moduleMarkup(payload: JsonRecord, type: string) {
  if (type === "image") {
    const image = getRecord(payload.image);
    const imageValue = getDesktopValue(image?.innerContent);
    const imageRecord = getRecord(imageValue);
    if (typeof imageRecord?.src === "string") {
      const alt = typeof imageRecord.alt === "string" ? imageRecord.alt : "";
      return `<img class="divi-image" src="${escapeHtml(imageRecord.src)}" alt="${escapeHtml(alt)}" />`;
    }
  }

  const contentValue = getDesktopValue(getRecord(payload.content)?.innerContent);
  if (typeof contentValue === "string") return contentValue;

  const titleValue = getDesktopValue(getRecord(payload.title)?.innerContent);
  if (typeof titleValue === "string") return titleValue;

  return "";
}

function diviBlockToHtml(markup: string) {
  const blockPattern = /<!-- (\/)?wp:divi\/([^\s]+)(?: ([\s\S]*?))? (?:\/)?-->/g;
  let html = "";
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(markup))) {
    html += markup.slice(cursor, match.index).replace(/<!-- wp:divi\/placeholder -->/g, "");
    const closing = Boolean(match[1]);
    const type = match[2];

    if (closing) {
      html += ({ section: "</section>", row: "</div>", column: "</div>" } as Record<string, string>)[type] ?? "";
    } else if (type === "section") {
      html += '<section class="divi-section">';
    } else if (type === "row") {
      html += '<div class="divi-row">';
    } else if (type === "column") {
      html += '<div class="divi-column">';
    } else if (match[3]) {
      try {
        const payload = JSON.parse(match[3]) as JsonRecord;
        html += moduleMarkup(payload, type);
      } catch {
        html += "";
      }
    }

    cursor = blockPattern.lastIndex;
  }

  html += markup.slice(cursor).replace(/<!--\/?wp:divi\/[^>]*-->/g, "");
  return cleanHtml(html);
}

export function diviToHtml(markup: string) {
  if (/<!--\s*\/?wp:divi\//i.test(markup)) return diviBlockToHtml(markup);

  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(markup);
  let html = hasHtml ? markup : escapeHtml(markup).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br />");

  html = html
    .replace(/\[et_pb_section[^\]]*\]/gi, '<section class="divi-section">')
    .replace(/\[\/et_pb_section\]/gi, "</section>")
    .replace(/\[et_pb_row[^\]]*\]/gi, '<div class="divi-row">')
    .replace(/\[\/et_pb_row\]/gi, "</div>")
    .replace(/\[et_pb_column[^\]]*\]/gi, '<div class="divi-column">')
    .replace(/\[\/et_pb_column\]/gi, "</div>")
    .replace(/\[et_pb_text[^\]]*\]/gi, '<div class="divi-text">')
    .replace(/\[\/et_pb_text\]/gi, "</div>")
    .replace(/\[et_pb_button[^\]]*\](.*?)\[\/et_pb_button\]/gis, '<span class="divi-button">$1</span>')
    .replace(/\[et_pb_[^\]]*\]/gi, "")
    .replace(/\[\/et_pb_[^\]]*\]/gi, "");

  return cleanHtml(html);
}

function blockMarkupFromData(data: unknown) {
  const record = getRecord(data);
  const blockData = getRecord(record?.data);
  const markup = Object.values(blockData ?? {}).find((value): value is string => typeof value === "string" && value.includes("wp:divi/"));
  return markup ?? "";
}

function plainText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromHtml(html: string) {
  const heading = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i)?.[1];
  return heading ? plainText(heading) : undefined;
}

export function getLessons(): Lesson[] {
  const filenames = fs.readdirSync(insuranceDirectory)
    .filter((filename) => /^t12_l\d+_.+\.json$/.test(filename))
    .sort((a, b) => a.localeCompare(b, "de", { numeric: true }));

  return filenames.map((filename, index) => {
    const source = fs.readFileSync(path.join(insuranceDirectory, filename), "utf8").trim();
    let data: unknown = source;

    try {
      data = JSON.parse(source);
    } catch {
      data = source;
    }

    const markup = typeof data === "string" ? data : blockMarkupFromData(data);
    const html = diviToHtml(markup);
    const text = plainText(html);

    return {
      number: index + 1,
      title: titleFromHtml(html) ?? titleFromFilename(filename),
      slug: filename.replace(/\.json$/, ""),
      html,
      summary: text.slice(0, 150),
    };
  });
}
