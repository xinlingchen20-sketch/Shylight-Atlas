import { Influencer } from "./types";

/**
 * Format large numbers to a clean human-readable string (e.g. 1.2M, 85K)
 */
export function formatCompactNumber(num: number): string {
  if (num === undefined || num === null || isNaN(num)) return "0";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

/**
 * Format currency numbers in USD format
 */
export function formatCurrency(num: number): string {
  if (num === undefined || num === null || isNaN(num)) return "N/A";
  if (num === 0) return "Free / Seeding";
  return "$" + num.toLocaleString();
}

/**
 * Exporter: Converts a filtered influencer collection into a CSV file
 * openable natively by Microsoft Excel without any garbled Chinese text
 * by pre-pending the UTF-8 Byte Order Mark (BOM).
 */
export function exportToExcelCSV(influencers: Influencer[]): void {
  // Define CSV headers
  const headers = [
    "达人名称 (Name)",
    "合作状态 (Status)",
    "国家 (Country)",
    "城市 (City)",
    "联系邮箱 (Email)",
    "联系电话 (Phone)",
    "经纪公司 (Agency)",
    "YouTube Followers",
    "Instagram Followers",
    "TikTok Followers",
    "人设标签 (Personas)",
    "品类标签 (Categories)",
    "场景标签 (Scenarios)",
    "成交底价 (Deal Price)",
    "合作备注 (Notes)"
  ];

  // Helper to escape double quotes and wrap in quotes if contains comma
  const formatCell = (val: any): string => {
    if (val === undefined || val === null) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Create rows
  const rows = influencers.map((inf) => [
    formatCell(inf.name),
    formatCell(inf.status),
    formatCell(inf.country),
    formatCell(inf.city),
    formatCell(inf.email),
    formatCell(inf.phone),
    formatCell(inf.agency),
    formatCell(inf.youtube?.followers || 0),
    formatCell(inf.instagram?.followers || 0),
    formatCell(inf.tiktok?.followers || 0),
    formatCell(inf.personas?.join("; ") || ""),
    formatCell(inf.categories?.join("; ") || ""),
    formatCell(inf.scenarios?.join("; ") || ""),
    formatCell(inf.dealPrice ? `$${inf.dealPrice}` : "N/A"),
    formatCell(inf.notes || "")
  ]);

  // Combine headers and rows
  const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

  // Prepend UTF-8 BOM \uFEFF to specify UTF-8 encoding for Excel
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  
  // Trigger user browser download flow
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `Influencer_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
