import React, { useState, useEffect } from "react";
import { Influencer, CooperationRecord, AuthRole } from "../types";
import { 
  getCooperationRecords, 
  createCooperationRecord, 
  updateCooperationRecord, 
  deleteCooperationRecord,
  updateInfluencer
} from "../services";
import { formatCompactNumber, formatCurrency } from "../utils";
import AddEditRecordModal from "./AddEditRecordModal";
import { 
  ArrowLeft, Mail, Phone, Building, Calendar, Link as LinkIcon, 
  Plus, Edit, Trash2, Shield, Heart, Eye, MessageSquare, Tag, Check, HelpCircle
} from "lucide-react";

interface InfluencerDetailViewProps {
  influencer: Influencer;
  userRole: AuthRole;
  onBack: () => void;
  onRefreshInfluencer: () => void;
}

export default function InfluencerDetailView({
  influencer,
  userRole,
  onBack,
  onRefreshInfluencer
}: InfluencerDetailViewProps) {
  const [records, setRecords] = useState<CooperationRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  
  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CooperationRecord | null>(null);

  // In-place edits for Recommend text
  const [isEditingRecommend, setIsEditingRecommend] = useState(false);
  const [recommendTextState, setRecommendTextState] = useState("");
  const [savingRecommend, setSavingRecommend] = useState(false);

  const isAdmin = userRole === "Admin";

  const loadRecordsNow = async () => {
    setLoadingRecords(true);
    try {
      const recs = await getCooperationRecords(influencer.id);
      setRecords(recs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadRecordsNow();
    setRecommendTextState(influencer.recommendedDirections || "");
  }, [influencer.id]);

  const handleSaveRecommend = async () => {
    setSavingRecommend(true);
    try {
      await updateInfluencer(influencer.id, {
        recommendedDirections: recommendTextState
      });
      setIsEditingRecommend(false);
      onRefreshInfluencer();
    } catch (err) {
      console.error("Failed to update recommend:", err);
      alert("推荐方向保存失败：权限不足或数据库连接异常。");
    } finally {
      setSavingRecommend(false);
    }
  };

  const handleSaveRecord = async (data: Omit<CooperationRecord, "id" | "createdAt">) => {
    try {
      if (selectedRecord) {
        // Edit mode
        await updateCooperationRecord(influencer.id, selectedRecord.id, data);
      } else {
        // Create mode
        await createCooperationRecord(influencer.id, data);
      }
      await loadRecordsNow();
      onRefreshInfluencer();
    } catch (err: any) {
      alert("合作记录保存失败: " + (err?.message || "无写操作权限"));
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("确定要删除这条合作记录吗？此操作无法撤销。")) return;
    try {
      await deleteCooperationRecord(influencer.id, recordId);
      await loadRecordsNow();
      onRefreshInfluencer();
    } catch (err: any) {
      alert("删除失败: " + (err?.message || "无删除操作权限"));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-300 bg-[#131316] hover:bg-zinc-800 font-medium text-sm transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          返回达人列表 (Back)
        </button>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
            influencer.status === "已合作" 
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-900/60" 
              : influencer.status === "已报价未合作" 
                ? "bg-amber-950/40 text-amber-300 border-amber-900/60" 
                : influencer.status === "沟通中" 
                  ? "bg-blue-950/40 text-blue-300 border-blue-900/60"
                  : influencer.status === "待开发" 
                    ? "bg-zinc-900 text-zinc-400 border-zinc-800" 
                    : "bg-red-950/40 text-red-300 border-red-900/60"
          }`}>
            合作状态: {influencer.status}
          </span>
        </div>
      </div>

      {/* Grid Layout: Profile & Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Profile Block Left */}
        <div className="bg-[#0F0F11] rounded-2xl border border-zinc-850 border-zinc-800 p-6 shadow-sm h-fit space-y-6">
          <div className="text-center space-y-3">
            <img 
              src={influencer.avatarUrl} 
              alt={influencer.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-zinc-900 ring-2 ring-blue-500/20"
            />
            <div>
              <h2 className="text-xl font-bold text-zinc-100">{influencer.name}</h2>
              <p className="text-xs text-zinc-400 mt-1">{influencer.city ? `${influencer.city}, ` : ""}{influencer.country}</p>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-5 space-y-3 text-sm">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wide">联系与基本信息</h4>
            
            <div className="flex items-center space-x-2.5 text-zinc-300">
              <Mail size={16} className="text-zinc-500" />
              <span className="truncate text-xs" title={influencer.email}>{influencer.email || "未填写邮箱"}</span>
            </div>
            
            <div className="flex items-center space-x-2.5 text-zinc-300">
              <Phone size={16} className="text-zinc-500" />
              <span className="text-xs">{influencer.phone || "未填写电话"}</span>
            </div>

            <div className="flex items-center space-x-2.5 text-zinc-300">
              <Building size={16} className="text-zinc-500" />
              <span className="text-xs">{influencer.agency || "独立达人 / In-House"}</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="border-t border-zinc-800 pt-5 space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wide">商务定价 (Rate Info)</h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-500 uppercase">Rate Card</p>
                <p className="text-sm font-semibold text-zinc-300 mt-0.5">{formatCurrency(influencer.rateCard)}</p>
              </div>
              <div className="bg-blue-95/10 bg-blue-950/30 p-2.5 rounded-lg border border-blue-950/60">
                <p className="text-[10px] font-bold text-blue-400 uppercase">实际成交底价</p>
                <p className="text-sm font-bold text-blue-300 mt-0.5">{formatCurrency(influencer.dealPrice)}</p>
              </div>
            </div>
          </div>

          {/* Recommended Directions */}
          <div className="border-t border-zinc-800 pt-5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wide">🎬 推荐合作方向</h4>
              {isAdmin && !isEditingRecommend && (
                <button 
                  onClick={() => setIsEditingRecommend(true)}
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-0.5 font-semibold cursor-pointer"
                >
                  <Edit size={12} /> 编辑
                </button>
              )}
            </div>

            {isEditingRecommend ? (
              <div className="space-y-2">
                <textarea
                  className="w-full text-xs p-2.5 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-zinc-700"
                  rows={4}
                  value={recommendTextState}
                  onChange={e => setRecommendTextState(e.target.value)}
                  placeholder="推荐主打投影仪系列测评，侧重游戏低延迟场景..."
                />
                <div className="flex justify-end space-x-1">
                  <button 
                    onClick={() => setIsEditingRecommend(false)}
                    className="px-2 py-1 text-[10px] border border-zinc-800 text-zinc-400 bg-zinc-900 rounded hover:bg-zinc-800 cursor-pointer"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleSaveRecommend}
                    disabled={savingRecommend}
                    className="px-2.5 py-1 text-[10px] bg-blue-600 text-white rounded font-semibold hover:bg-blue-500 inline-flex items-center gap-1 cursor-pointer"
                  >
                    {savingRecommend ? "..." : <><Check size={10} /> 保存</>}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-300 bg-[#131316] p-3 rounded-xl leading-relaxed whitespace-pre-line border border-zinc-800">
                {influencer.recommendedDirections || "暂未填写官方推荐投放方向与营销策略。"}
              </p>
            )}
          </div>

          {/* Remarks */}
          {influencer.notes && (
            <div className="border-t border-zinc-800 pt-5 space-y-2">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wide">📝 内部运营备注</h4>
              <p className="text-xs text-amber-300 bg-amber-950/15 border border-amber-950/40 p-3 rounded-xl leading-relaxed">
                {influencer.notes}
              </p>
            </div>
          )}
        </div>


        {/* 2. Platform Breakdowns & Tags Right */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Platform Performance Cards */}
          <div className="bg-[#0F0F11] rounded-2xl border border-zinc-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              📊 粉丝规模与合作基准数据 (Core Platform Analytics)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* YT Platforms */}
              <div className="border border-red-950/40 bg-red-950/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400">YouTube</span>
                  {influencer.youtube?.profileUrl ? (
                    <a 
                      href={influencer.youtube.profileUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[10px] text-red-400 hover:text-red-300 hover:underline flex items-center"
                    >
                      访问主页 <LinkIcon size={10} className="ml-1" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-zinc-500 bg-[#0F0F11] px-1.5 py-0.5 rounded">未开设</span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between border-b border-red-955/35 pb-1.5">
                    <span className="text-xs text-zinc-400">粉丝数量</span>
                    <span className="text-xs font-bold text-zinc-200">{formatCompactNumber(influencer.youtube?.followers || 0)}</span>
                  </div>
                  <div className="flex justify-between border-b border-red-955/35 pb-1.5">
                    <span className="text-xs text-zinc-400">互动率 ER</span>
                    <span className="text-xs font-bold text-zinc-200">{influencer.youtube?.er || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-zinc-400">平均观看</span>
                    <span className="text-xs font-bold text-zinc-200">{formatCompactNumber(influencer.youtube?.avgViews || 0)}</span>
                  </div>
                </div>
              </div>

              {/* IG Platform */}
              <div className="border border-pink-950/40 bg-pink-950/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-400">Instagram</span>
                  {influencer.instagram?.profileUrl ? (
                    <a 
                      href={influencer.instagram.profileUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[10px] text-pink-400 hover:text-pink-300 hover:underline flex items-center"
                    >
                      访问主页 <LinkIcon size={10} className="ml-1" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-zinc-500 bg-[#0F0F11] px-1.5 py-0.5 rounded">未开设</span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between border-b border-pink-955/35 pb-1.5">
                    <span className="text-xs text-zinc-400">粉丝数量</span>
                    <span className="text-xs font-bold text-zinc-200">{formatCompactNumber(influencer.instagram?.followers || 0)}</span>
                  </div>
                  <div className="flex justify-between border-b border-pink-955/35 pb-1.5">
                    <span className="text-xs text-zinc-400">互动率 ER</span>
                    <span className="text-xs font-bold text-zinc-200">{influencer.instagram?.er || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-zinc-400">平均播放</span>
                    <span className="text-xs font-bold text-zinc-200">{formatCompactNumber(influencer.instagram?.avgViews || 0)}</span>
                  </div>
                </div>
              </div>

              {/* TikTok Platform */}
              <div className="border border-cyan-950/40 bg-cyan-950/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">TikTok</span>
                  {influencer.tiktok?.profileUrl ? (
                    <a 
                      href={influencer.tiktok.profileUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center"
                    >
                      访问主页 <LinkIcon size={10} className="ml-1" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-zinc-500 bg-[#0F0F11] px-1.5 py-0.5 rounded">未开设</span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between border-b border-cyan-955/35 pb-1.5">
                    <span className="text-xs text-zinc-400">粉丝数量</span>
                    <span className="text-xs font-bold text-zinc-200">{formatCompactNumber(influencer.tiktok?.followers || 0)}</span>
                  </div>
                  <div className="flex justify-between border-b border-cyan-955/35 pb-1.5">
                    <span className="text-xs text-zinc-400">互动率 ER</span>
                    <span className="text-xs font-bold text-zinc-200">{influencer.tiktok?.er || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-zinc-400">平均观看</span>
                    <span className="text-xs font-bold text-zinc-200">{formatCompactNumber(influencer.tiktok?.avgViews || 0)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Classified Tag Categories Block */}
          <div className="bg-[#0F0F11] rounded-2xl border border-zinc-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-100">🏷️ 达人核心标签属性</h3>
            
            <div className="space-y-3.5 text-xs">
              
              {/* Persona */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                <span className="text-xs font-medium text-zinc-500 sm:w-28 shrink-0">人设标签 (Persona):</span>
                <div className="flex flex-wrap gap-1">
                  {influencer.personas?.length ? influencer.personas.map(t => (
                    <span key={t} className="px-2 py-0.5 text-xs font-medium bg-violet-950/60 text-violet-300 rounded-full border border-violet-850/60">{t}</span>
                  )) : <span className="text-xs text-zinc-650">暂无</span>}
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                <span className="text-xs font-medium text-zinc-500 sm:w-28 shrink-0">品类标签 (Category):</span>
                <div className="flex flex-wrap gap-1">
                  {influencer.categories?.length ? influencer.categories.map(t => (
                    <span key={t} className="px-2 py-0.5 text-xs font-medium bg-teal-950/60 text-teal-300 rounded-full border border-teal-850/60">{t}</span>
                  )) : <span className="text-xs text-zinc-650">暂无</span>}
                </div>
              </div>

              {/* Scenarios */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                <span className="text-xs font-medium text-zinc-500 sm:w-28 shrink-0">日常/特殊场景:</span>
                <div className="flex flex-wrap gap-1">
                  {influencer.scenarios?.length ? influencer.scenarios.map(t => (
                    <span key={t} className="px-2 py-0.5 text-xs font-medium bg-sky-950/60 text-sky-300 rounded-full border border-sky-850/60">{t}</span>
                  )) : <span className="text-xs text-zinc-650">暂无</span>}
                </div>
              </div>

              {/* Ability */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                <span className="text-xs font-medium text-zinc-500 sm:w-28 shrink-0">能力标签 (Ability):</span>
                <div className="flex flex-wrap gap-1">
                  {influencer.abilities?.length ? influencer.abilities.map(t => (
                    <span key={t} className="px-2 py-0.5 text-xs font-medium bg-emerald-950/60 text-emerald-300 rounded-full border border-emerald-850/60">{t}</span>
                  )) : <span className="text-xs text-zinc-650">暂无</span>}
                </div>
              </div>

              {/* Strategies */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                <span className="text-xs font-medium text-zinc-500 sm:w-28 shrink-0">营销打法:</span>
                <div className="flex flex-wrap gap-1">
                  {influencer.strategies?.length ? influencer.strategies.map(t => (
                    <span key={t} className="px-2 py-0.5 text-xs font-medium bg-amber-950/60 text-amber-300 rounded-full border border-amber-850/60">{t}</span>
                  )) : <span className="text-xs text-zinc-650">暂无</span>}
                </div>
              </div>

            </div>
          </div>


          {/* 3. Cooperation Records History */}
          <div className="bg-[#0F0F11] rounded-2xl border border-zinc-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-100">💼 历史合作与履约记录</h3>
                <p className="text-xs text-zinc-500">积累实锤投放绩效，杜绝低效重复尝试</p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRecord(null);
                    setIsRecordModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <Plus size={14} /> Add Record
                </button>
              )}
            </div>

            {loadingRecords ? (
              <div className="text-center py-6 text-zinc-500 text-xs animate-pulse">
                正在加载履约数据...
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-xl border-zinc-800 text-zinc-500 text-xs space-y-1">
                <p>💡 目前暂无该达人的历史合作记录。</p>
                {isAdmin && <p className="text-[10px] text-zinc-600">您可以点击右上角 “Add Record” 新增第一笔履约案例</p>}
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((rec) => (
                  <div key={rec.id} className="border border-zinc-850 border-zinc-800 rounded-xl p-4 bg-[#131316]/50 hover:bg-[#131316] transition space-y-3.5">
                    
                    {/* Brand & Project Info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-850 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-zinc-200 text-sm">{rec.brandName}</span>
                        <span className="text-zinc-700">|</span>
                        <span className="text-xs font-medium text-zinc-455 text-zinc-400">{rec.projectName}</span>
                        <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-[9px] uppercase tracking-wide font-semibold text-zinc-400 border border-zinc-750">
                          {rec.platform}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-zinc-500 flex items-center">
                          <Calendar size={12} className="mr-0.5" /> {rec.date}
                        </span>
                        
                        {isAdmin && (
                          <div className="flex items-center space-x-1 pl-2">
                            <button
                              onClick={() => {
                                setSelectedRecord(rec);
                                setIsRecordModalOpen(true);
                              }}
                              className="p-1 rounded bg-[#0F0F11] border border-zinc-800 text-blue-400 hover:text-blue-300 hover:bg-zinc-850 cursor-pointer"
                              title="编辑记录"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(rec.id)}
                              className="p-1 rounded bg-[#0F0F11] border border-zinc-800 text-rose-455 text-red-400 hover:text-red-300 hover:bg-zinc-850 cursor-pointer"
                              title="删除记录"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center bg-[#0F0F11] p-3 rounded-xl border border-zinc-850">
                      
                      <div>
                        <span className="block text-[9px] font-bold text-zinc-500 uppercase">播放量 (Views)</span>
                        <span className="text-sm font-semibold text-zinc-300">{formatCompactNumber(rec.views)}</span>
                      </div>

                      <div>
                        <span className="block text-[9px] font-bold text-zinc-500 uppercase">点赞数 (Likes)</span>
                        <span className="text-sm font-semibold text-zinc-300">{formatCompactNumber(rec.likes)}</span>
                      </div>

                      <div>
                        <span className="block text-[9px] font-bold text-zinc-500 uppercase">实投价格 (Paid)</span>
                        <span className="text-sm font-bold text-blue-400">{formatCurrency(rec.dealPrice)}</span>
                      </div>

                      <div>
                        <span className="block text-[9px] font-bold text-zinc-500 uppercase">公开价对比</span>
                        <span className="text-xs text-zinc-500 line-through mt-0.5 block">{formatCurrency(rec.rateCard)}</span>
                      </div>

                    </div>

                    {/* Feedback in bullet layout */}
                    <div className="space-y-2 text-xs text-zinc-400">
                      {rec.customerReview && (
                        <div>
                          <span className="font-semibold text-zinc-350 text-zinc-300">📣 客户反馈:</span> {rec.customerReview}
                        </div>
                      )}
                      {rec.internalNotes && (
                        <div>
                          <span className="font-semibold text-zinc-350 text-zinc-300">🛡️ 内部备注:</span> {rec.internalNotes}
                        </div>
                      )}
                      {rec.link && (
                        <div className="pt-1">
                          <a 
                            href={rec.link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1 font-medium"
                          >
                            <LinkIcon size={12} /> 查看发布原片/原帖链接
                          </a>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Record Addition/Modification Modal */}
      <AddEditRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        record={selectedRecord}
        influencerId={influencer.id}
        onSave={handleSaveRecord}
      />

    </div>
  );
}
