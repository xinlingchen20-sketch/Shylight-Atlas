import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { createInfluencer } from "../services";
import { Influencer, CooperationStatus } from "../types";
import { motion } from "motion/react";
import { 
  X, FileSpreadsheet, Upload, AlertCircle, CheckCircle2, 
  Settings2, Eye, RefreshCw, HelpCircle, HardDriveDownload 
} from "lucide-react";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedRecord {
  name: string;
  platform: string;
  followers: number;
  rateCard: number;
  contact: string;
  country: string;
  notes: string;
}

export default function ExcelImportModal({ isOpen, onClose, onSuccess }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRecord[]>([]);
  const [mappedInfluencers, setMappedInfluencers] = useState<Omit<Influencer, "id" | "createdAt" | "updatedAt">[]>([]);
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMsg(null);
    setImportSuccess(null);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        parseExcelFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setImportSuccess(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        parseExcelFile(selectedFile);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv"
    ];
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!validTypes.includes(file.type) && extension !== "csv" && extension !== "xlsx" && extension !== "xls") {
      setErrorMsg("不支持的文件格式，请上传 .xlsx, .xls 或 .csv 表格文件！");
      return false;
    }
    return true;
  };

  // Helper keyword map for intelligent headers recognition
  const findValueByKeys = (row: any, keys: string[]): any => {
    const matchedKey = Object.keys(row).find((originalKey) => {
      const lower = originalKey.trim().toLowerCase();
      return keys.some(k => lower === k || lower.includes(k));
    });
    return matchedKey ? row[matchedKey] : undefined;
  };

  const parseExcelFile = (targetFile: File) => {
    setParsing(true);
    setErrorMsg(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonData || jsonData.length === 0) {
          setErrorMsg("表格看起来是空的。请检查表格文件是否含有数据。");
          setParsing(false);
          return;
        }

        const keysName = ["名字", "姓名", "name", "昵称", "博主", "达人", "达人姓名", "账号名称"];
        const keysPlatform = ["平台", "platform", "渠道", "社交媒体"];
        const keysFollowers = ["粉丝", "粉丝量", "followers", "fans", "follower", "关注者"];
        const keysRateCard = ["报价", "单价", "rate", "ratecard", "价格", "单贴报价", "cost"];
        const keysContact = ["联系方式", "联系电话", "电话", "邮箱", "email", "phone", "手机", "whatsapp", "微信", "wechat", "e-mail"];
        const keysCountry = ["国家", "地区", "country", "location", "省份"];
        const keysNotes = ["备注", "简介", "notes", "note", "打法描述", "详情"];

        const tempRecords: ParsedRecord[] = [];
        const finalInfluencers: Omit<Influencer, "id" | "createdAt" | "updatedAt">[] = [];

        // Loop and parse smartly
        jsonData.forEach((row: any) => {
          let name = findValueByKeys(row, keysName) || "";
          name = name.toString().trim();
          if (!name) return; // Skip rows without name

          let platform = findValueByKeys(row, keysPlatform) || "";
          platform = platform.toString().trim();

          const rawFollowers = findValueByKeys(row, keysFollowers);
          const followers = Number(rawFollowers) || 0;

          const rawPrice = findValueByKeys(row, keysRateCard);
          const price = Number(rawPrice) || 0;

          let contact = findValueByKeys(row, keysContact) || "";
          contact = contact.toString().trim();

          let country = findValueByKeys(row, keysCountry) || "未知";
          country = country.toString().trim();

          let notes = findValueByKeys(row, keysNotes) || "Excel数据一键入库";
          notes = notes.toString().trim();

          tempRecords.push({
            name,
            platform,
            followers,
            rateCard: price,
            contact,
            country,
            notes
          });

          // Build Influencer schema payload
          let youtube = { profileUrl: "", followers: 0, er: 2.5, avgViews: 0, avgLikes: 0, avgComments: 0 };
          let tiktok = { profileUrl: "", followers: 0, er: 3.8, avgViews: 0, avgLikes: 0, avgComments: 0 };
          let instagram = { profileUrl: "", followers: 0, er: 1.8, avgViews: 0, avgLikes: 0, avgComments: 0 };

          const platLower = platform.toLowerCase();
          const cleanLink = contact.includes("http") ? contact : "";

          if (platLower.includes("youtube") || platLower.includes("yt") || platLower.includes("油管")) {
            youtube.followers = followers;
            youtube.profileUrl = cleanLink || "https://youtube.com";
          } else if (platLower.includes("tiktok") || platLower.includes("tk") || platLower.includes("抖音")) {
            tiktok.followers = followers;
            tiktok.profileUrl = cleanLink || "https://tiktok.com";
          } else if (platLower.includes("instagram") || platLower.includes("ig") || platLower.includes("ins")) {
            instagram.followers = followers;
            instagram.profileUrl = cleanLink || "https://instagram.com";
          } else {
            // Unspecified default, heuristic by links if they put link in contact
            if (cleanLink.includes("youtube.com") || cleanLink.includes("youtu.be")) {
              youtube.followers = followers;
              youtube.profileUrl = cleanLink;
            } else if (cleanLink.includes("instagram.com")) {
              instagram.followers = followers;
              instagram.profileUrl = cleanLink;
            } else {
              tiktok.followers = followers;
              tiktok.profileUrl = cleanLink || "https://tiktok.com";
            }
          }

          const isEmail = contact.includes("@");

          finalInfluencers.push({
            name,
            avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&q=80&w=150`,
            country,
            city: "",
            email: isEmail ? contact : "",
            phone: !isEmail ? contact : "",
            agency: "",
            notes,
            instagram,
            tiktok,
            youtube,
            personas: ["Excel批量导入"],
            scenarios: [],
            categories: [],
            abilities: [],
            strategies: [],
            status: "待开发",
            rateCard: price,
            dealPrice: price,
            recommendedDirections: "Excel一键识别"
          });
        });

        if (tempRecords.length === 0) {
          setErrorMsg("未能在表格中识别出合法的博主数据。请保证您的表格含有「名字/姓名」一栏属性。");
        } else {
          setParsedData(tempRecords);
          setMappedInfluencers(finalInfluencers);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg("表格解析异常: " + (err.message || "文件结构非法。"));
      } finally {
        setParsing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg("读取本地文件失败！");
      setParsing(false);
    };

    reader.readAsArrayBuffer(targetFile);
  };

  const handleStartImport = async () => {
    if (mappedInfluencers.length === 0) return;
    setImporting(true);
    setErrorMsg(null);

    try {
      let count = 0;
      for (const inf of mappedInfluencers) {
        await createInfluencer(inf);
        count++;
      }
      setImportSuccess(true);
      setImporting(false);
      setTimeout(() => {
        onSuccess();
        onClose();
        resetComponent();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("数据入库期间发生部分失败，请确认您的网络连接和写入权限。" + (err.message || ""));
      setImporting(false);
    }
  };

  const resetComponent = () => {
    setFile(null);
    setParsedData([]);
    setMappedInfluencers([]);
    setImportSuccess(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadDemoExcel = () => {
    try {
      const demoData = [
        { "达人姓名": "Jessica Taylor", "平台": "TikTok", "粉丝量": 1200000, "报价": 2500, "联系方式": "jessica@tiktok.com", "国家": "United States", "备注": "擅长美妆开箱评测" },
        { "达人姓名": "Hiroshi Tanaka", "平台": "YouTube", "粉丝量": 450000, "报价": 1800, "联系方式": "+81-90-1234-5678", "国家": "Japan", "备注": "高画质科技数码测评" },
        { "达人姓名": "Clara Rossi", "平台": "Instagram", "粉丝量": 85000, "报价": 600, "联系方式": "clara_rossi@gmail.com", "国家": "Italy", "备注": "每日高级时装穿搭分享" }
      ];
      
      const ws = XLSX.utils.json_to_sheet(demoData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "示例模板");
      XLSX.writeFile(wb, "shylight_influencer_template.xlsx");
    } catch (e: any) {
      alert("生成示例表失败: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Background overlay backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Main container with animations */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-[#131316] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col"
        id="excel-import-modal-view"
      >
        
        {/* Banner header */}
        <div className="bg-gradient-to-r from-emerald-700/15 via-zinc-900/10 to-transparent p-6 pb-4 border-b border-zinc-900 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 rounded-xl shrink-0">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 font-sans flex items-center gap-2">
                Excel 表格一键识别录入
                <span className="text-[10px] bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 font-bold px-1.5 py-0.2 rounded">Smart Parse AI</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">自动识别表头字段映射，多维表格自动解包入库</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-805 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Core contents area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Support headers list guides */}
          <div className="bg-[#18181C] border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
            <div className="space-y-1">
              <strong className="text-zinc-300 flex items-center gap-1">
                <Settings2 size={13} className="text-emerald-400" />
                支持匹配的各列标头名称:
              </strong>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                只要您的表头键包含这些关键字，系统即可完美读取：<br />
                • <strong className="text-zinc-200 font-bold font-sans">姓名/名字</strong> • <strong className="text-zinc-200 font-bold font-sans">平台/渠道</strong> • <strong className="text-zinc-200 font-bold font-sans">粉丝量</strong> • <strong className="text-zinc-200 font-bold font-sans">报价/价格</strong> • <strong className="text-zinc-200 font-bold font-sans">联系方式/邮箱/电话</strong> • <strong className="text-zinc-200 font-bold font-sans">国家/地区</strong> • <strong className="text-zinc-200 font-bold font-sans">备注</strong>
              </p>
            </div>
            <button
              onClick={downloadDemoExcel}
              type="button"
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <HardDriveDownload size={12} />
              获取示例 Excel 模板
            </button>
          </div>

          {/* Upload card dragdrop area */}
          {parsedData.length === 0 ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 select-none ${
                isDragging 
                  ? "bg-emerald-500/10 border-emerald-500/50 scale-[98%] shadow-lg shadow-emerald-500/5" 
                  : "bg-[#0b0b0d] hover:bg-[#101014] border-zinc-805 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
              />
              
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 mb-4 animate-bounce">
                <Upload size={24} className={isDragging ? "text-emerald-400" : ""} />
              </div>

              <strong className="text-sm font-bold text-zinc-300">
                {isDragging ? "松开鼠标即可倒入该表格" : "拖拽 Excel 或点击此处选择上传文件"}
              </strong>
              <p className="text-xs text-zinc-500 mt-1.5">支持 .xlsx, .xls 和标准 CSV 逗号分隔格式表格</p>
            </div>
          ) : (
            // Success preview block
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">Excel Sheet Data 解析预览</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="text-xs text-zinc-300 font-bold">成功映射识别出 <strong className="text-emerald-400">{parsedData.length}</strong> 位网红博主。</span>
                  </div>
                </div>
                <button
                  onClick={resetComponent}
                  disabled={importing}
                  className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                >
                  <RefreshCw size={11} /> 重新选择
                </button>
              </div>

              {/* Table rendering of output mapping */}
              <div className="border border-zinc-850 border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 font-sans max-h-[300px] overflow-y-auto">
                <table className="w-full text-left border-collapse table-auto text-xs text-zinc-300">
                  <thead className="bg-[#111114] border-b border-zinc-850 border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-400 sticky top-0">
                    <tr>
                      <th className="px-4 py-3">名字 (Name)</th>
                      <th className="px-4 py-3">核心平台 (Platform)</th>
                      <th className="px-4 py-3 text-right">估算粉丝 (Followers)</th>
                      <th className="px-4 py-3 text-right">建议报价 (Price)</th>
                      <th className="px-4 py-3">联系方式 (Contact)</th>
                      <th className="px-4 py-3">国家/地区 (Country)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850 divide-zinc-800 font-medium">
                    {parsedData.map((row, index) => (
                      <tr key={index} className="hover:bg-zinc-900/50 transition">
                        <td className="px-4 py-2.5 font-bold text-zinc-200">{row.name}</td>
                        <td className="px-4 py-2.5">
                          {row.platform ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-950/40 border border-blue-900/30 text-blue-300">
                              {row.platform}
                            </span>
                          ) : (
                            <span className="text-zinc-600 font-normal">未标明</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-zinc-400">
                          {row.followers ? row.followers.toLocaleString() : "--"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-emerald-400 font-semibold">
                          {row.rateCard ? `$${row.rateCard.toLocaleString()}` : "--"}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400 truncate max-w-[140px]" title={row.contact}>
                          {row.contact || <span className="text-zinc-600 font-normal">留空</span>}
                        </td>
                        <td className="px-4 py-2.5 text-zinc-400">{row.country}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Loading status bar indicator */}
          {parsing && (
            <div className="flex items-center justify-center gap-2 text-xs py-10 text-zinc-400">
              <RefreshCw size={16} className="animate-spin text-emerald-400" />
              <span>正在对您的 Excel 报表执行列头对齐与解压映射...</span>
            </div>
          )}

          {/* Alert messages */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/5 border border-rose-500/25 text-rose-410 text-rose-400 text-xs rounded-xl flex items-start gap-2 leading-relaxed">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/25 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
              <span>🎉 一键保存完成！所有达人已成功挂载入库，安全隔离备份中！</span>
            </div>
          )}

        </div>

        {/* Footer actions area */}
        <div className="bg-[#0b0b0d] p-4 px-6 border-t border-zinc-900 flex justify-between items-center text-xs">
          <span className="text-zinc-500 flex items-center gap-1">
            <HelpCircle size={12} />
            导入过程中将自动过滤缺失「名字」属性的废弃空行。
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              disabled={importing}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl font-semibold text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            >
              取消
            </button>
            {parsedData.length > 0 && (
              <button
                onClick={handleStartImport}
                disabled={importing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/15 cursor-pointer"
              >
                {importing ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    正在抽取转写并导入...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} />
                    确认导入这 {parsedData.length} 个达人
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
