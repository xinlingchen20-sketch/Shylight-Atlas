import React, { useState, useEffect } from "react";
import { CooperationRecord } from "../types";
import { X, Save } from "lucide-react";

interface AddEditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CooperationRecord | null; // null means create mode
  influencerId: string;
  onSave: (data: Omit<CooperationRecord, "id" | "createdAt">) => Promise<void>;
}

export default function AddEditRecordModal({
  isOpen,
  onClose,
  record,
  influencerId,
  onSave
}: AddEditRecordModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [brandName, setBrandName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [date, setDate] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [link, setLink] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [rateCard, setRateCard] = useState(0);
  const [dealPrice, setDealPrice] = useState(0);
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);
  const [customerReview, setCustomerReview] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    if (record) {
      setBrandName(record.brandName || "");
      setProjectName(record.projectName || "");
      setDate(record.date || "");
      setPlatform(record.platform || "YouTube");
      setLink(record.link || "");
      setScreenshotUrl(record.screenshotUrl || "");
      setRateCard(record.rateCard || 0);
      setDealPrice(record.dealPrice || 0);
      setViews(record.views || 0);
      setLikes(record.likes || 0);
      setComments(record.comments || 0);
      setCustomerReview(record.customerReview || "");
      setInternalNotes(record.internalNotes || "");
    } else {
      setBrandName("");
      setProjectName("");
      setDate(new Date().toISOString().slice(0, 10));
      setPlatform("YouTube");
      setLink("");
      setScreenshotUrl("https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400");
      setRateCard(0);
      setDealPrice(0);
      setViews(0);
      setLikes(0);
      setComments(0);
      setCustomerReview("");
      setInternalNotes("");
    }
    setError(null);
  }, [record, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!brandName.trim()) {
      setError("品牌名称不能为空 (Brand name is required)");
      return;
    }
    if (!projectName.trim()) {
      setError("项目名称不能为空 (Project name is required)");
      return;
    }

    setLoading(true);
    try {
      const payload: Omit<CooperationRecord, "id" | "createdAt"> = {
        influencerId,
        brandName: brandName.trim(),
        projectName: projectName.trim(),
        date,
        platform,
        link: link.trim(),
        screenshotUrl: screenshotUrl.trim() || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400",
        rateCard: Number(rateCard),
        dealPrice: Number(dealPrice),
        views: Number(views),
        likes: Number(likes),
        comments: Number(comments),
        customerReview: customerReview.trim(),
        internalNotes: internalNotes.trim()
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "由于规则或安全权限限制，记录保存失败。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-55 overflow-y-auto">
      <div className="bg-[#0F0F11] border border-zinc-800 text-zinc-100 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#131316]">
          <div>
            <h3 className="text-md font-bold text-zinc-100">
              {record ? `编辑历史履约记录` : "录入新合作记录"}
            </h3>
            <p className="text-xs text-zinc-500">沉淀与该达人的合作绩效、价格及客户评价等信息</p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="m-4 p-3 bg-red-950/40 border border-red-900/40 text-rose-450 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4 bg-[#0A0A0B] font-sans">
          <div className="grid grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">合作品牌 <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                required 
                value={brandName} 
                onChange={e => setBrandName(e.target.value)} 
                placeholder="例如: AWOL Vision" 
                className="w-full text-xs px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">项目名称 <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                required 
                value={projectName} 
                onChange={e => setProjectName(e.target.value)} 
                placeholder="例如: FIFA Campaign" 
                className="w-full text-xs px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">合作开展日期</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full text-xs px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-200 focus:outline-none focus:border-zinc-700 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">合作主要平台</label>
              <select 
                value={platform} 
                onChange={e => setPlatform(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-zinc-700 cursor-pointer"
              >
                <option value="YouTube">YouTube</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Other">其他/综合</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 mb-1">合作内容链接</label>
              <input 
                type="url" 
                value={link} 
                onChange={e => setLink(e.target.value)} 
                placeholder="https://youtube.com/watch?v=..." 
                className="w-full text-xs px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 mb-1">合作截图 URL (Screenshot URL)</label>
              <input 
                type="url" 
                value={screenshotUrl} 
                onChange={e => setScreenshotUrl(e.target.value)} 
                placeholder="https://example.com/screenshot.png" 
                className="w-full text-xs px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Rate Card (USD)</label>
              <input 
                type="number" 
                value={rateCard} 
                onChange={e => setRateCard(Number(e.target.value))} 
                className="w-full text-xs px-3 py-2 border border-zinc-800 rounded-lg bg-[#0F0F11] text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">实际成交价 (USD Partner Price)</label>
              <input 
                type="number" 
                value={dealPrice} 
                onChange={e => setDealPrice(Number(e.target.value))} 
                className="w-full text-xs px-3 py-2 border border-zinc-800 rounded-lg bg-[#0F0F11] text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">合作产生播放量 (Views)</label>
              <input 
                type="number" 
                value={views} 
                onChange={e => setViews(Number(e.target.value))} 
                className="w-full text-xs px-3 py-2 border border-zinc-800 rounded-lg bg-[#0F0F11] text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">点赞数 (Likes)</label>
                <input 
                  type="number" 
                  value={likes} 
                  onChange={e => setLikes(Number(e.target.value))} 
                  className="w-full text-xs px-3 py-2 border border-zinc-800 rounded-lg bg-[#0F0F11] text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">评论数</label>
                <input 
                  type="number" 
                  value={comments} 
                  onChange={e => setComments(Number(e.target.value))} 
                  className="w-full text-xs px-3 py-2 border border-zinc-800 rounded-lg bg-[#0F0F11] text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 mb-1">客户评价 (Customer Feedback)</label>
              <textarea 
                rows={2}
                value={customerReview} 
                onChange={e => setCustomerReview(e.target.value)} 
                placeholder="客户反馈非常满意，希望在后续活动中继续跟进该达人。" 
                className="w-full text-xs px-3 py-2 border border-zinc-800 rounded-lg bg-[#0F0F11] text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#a1a1aa] mb-1">内部备注</label>
              <textarea 
                rows={2}
                value={internalNotes} 
                onChange={e => setInternalNotes(e.target.value)} 
                placeholder="视频按时交稿，转录质量高，性价比极好。" 
                className="w-full text-xs px-3 py-2 border border-zinc-800 rounded-lg bg-[#0F0F11] text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
              />
            </div>

          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-end space-x-2 bg-[#131316]">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={loading}
            className="px-4 py-2 text-xs border border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded-lg transition overflow-hidden cursor-pointer"
          >
            取消
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm transition cursor-pointer"
          >
            <Save size={14} className="mr-1" />
            {loading ? "正在处理..." : record ? "完成修改" : "确认添加"}
          </button>
        </div>

      </div>
    </div>
  );
}
