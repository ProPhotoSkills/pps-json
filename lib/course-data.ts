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

function findText(value: unknown, preferredKeys: string[]): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (!value || typeof value !== "object") return undefined;

  const record = value as JsonRecord;
  for (const key of preferredKeys) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate;
    if (candidate && typeof candidate === "object") {
      const nested = findText(candidate, ["rendered", "content", "value"]);
      if (nested) return nested;
    }
  }
  return undefined;
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

export function diviToHtml(markup: string) {
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

    const title = findText(data, ["title", "post_title", "name", "headline"]) ?? titleFromFilename(filename);
    const markup = findText(data, ["content", "post_content", "body", "description", "html"]) ?? "";
    const html = diviToHtml(markup);
    const plainText = markup.replace(/\[.*?\]/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

    return {
      number: index + 1,
      title,
      slug: filename.replace(/\.json$/, ""),
      html,
      summary: plainText.slice(0, 150),
    };
  });
}
