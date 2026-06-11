import React, { useState, useEffect } from "react";
import { Influencer, CooperationStatus } from "../types";
import { 
  PRESET_PERSONAS, 
  PRESET_SCENARIOS, 
  PRESET_CATEGORIES, 
  PRESET_ABILITIES, 
  PRESET_STRATEGIES 
} from "../initialData";
import { X, Save, Plus, Trash } from "lucide-react";

interface CreateEditInfluencerModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencer: Influencer | null; // null means create mode
  onSave: (data: Omit<Influencer, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

export default function CreateEditInfluencerModal({
  isOpen,
  onClose,
  influencer,
  onSave
}: CreateEditInfluencerModalProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "platforms" | "tags">("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [country, setCountry] = useState("United States");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agency, setAgency] = useState("");
  const [notes, setNotes] = useState("");
  
  // Platform Metrics
  const [ytUrl, setYtUrl] = useState("");
  const [ytFollow, setYtFollow] = useState(0);
  const [ytEr, setYtEr] = useState(0);
  const [ytViews, setYtViews] = useState(0);
  const [ytLikes, setYtLikes] = useState(0);
  const [ytComments, setYtComments] = useState(0);

  const [igUrl, setIgUrl] = useState("");
  const [igFollow, setIgFollow] = useState(0);
  const [igEr, setIgEr] = useState(0);
  const [igViews, setIgViews] = useState(0);
  const [igLikes, setIgLikes] = useState(0);
  const [igComments, setIgComments] = useState(0);

  const [ttUrl, setTtUrl] = useState("");
  const [ttFollow, setTtFollow] = useState(0);
  const [ttEr, setTtEr] = useState(0);
  const [ttViews, setTtViews] = useState(0);
  const [ttLikes, setTtLikes] = useState(0);
  const [ttComments, setTtComments] = useState(0);

  // Commercials
  const [status, setStatus] = useState<CooperationStatus>("待开发");
  const [rateCard, setRateCard] = useState(0);
  const [dealPrice, setDealPrice] = useState(0);
  const [recommendedDirections, setRecommendedDirections] = useState("");

  // Target Tags Arrays
  const [personas, setPersonas] = useState<string[]>([]);
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [abilities, setAbilities] = useState<string[]>([]);
  const [strategies, setStrategies] = useState<string[]>([]);

  // Custom added tags
  const [customTagType, setCustomTagType] = useState<"personas" | "scenarios" | "categories" | "abilities" | "strategies">("categories");
  const [customTagText, setCustomTagText] = useState("");

  // Sync state on edit open
  useEffect(() => {
    if (influencer) {
      setName(influencer.name || "");
      setAvatarUrl(influencer.avatarUrl || "");
      setCountry(influencer.country || "");
      setCity(influencer.city || "");
      setEmail(influencer.email || "");
      setPhone(influencer.phone || "");
      setAgency(influencer.agency || "");
      setNotes(influencer.notes || "");

      setYtUrl(influencer.youtube?.profileUrl || "");
      setYtFollow(influencer.youtube?.followers || 0);
      setYtEr(influencer.youtube?.er || 0);
      setYtViews(influencer.youtube?.avgViews || 0);
      setYtLikes(influencer.youtube?.avgLikes || 0);
      setYtComments(influencer.youtube?.avgComments || 0);

      setIgUrl(influencer.instagram?.profileUrl || "");
      setIgFollow(influencer.instagram?.followers || 0);
      setIgEr(influencer.instagram?.er || 0);
      setIgViews(influencer.instagram?.avgViews || 0);
      setIgLikes(influencer.instagram?.avgLikes || 0);
      setIgComments(influencer.instagram?.avgComments || 0);

      setTtUrl(influencer.tiktok?.profileUrl || "");
      setTtFollow(influencer.tiktok?.followers || 0);
      setTtEr(influencer.tiktok?.er || 0);
      setTtViews(influencer.tiktok?.avgViews || 0);
      setTtLikes(influencer.tiktok?.avgLikes || 0);
      setTtComments(influencer.tiktok?.avgComments || 0);

      setStatus(influencer.status || "待开发");
      setRateCard(influencer.rateCard || 0);
      setDealPrice(influencer.dealPrice || 0);
      setRecommendedDirections(influencer.recommendedDirections || "");

      setPersonas(influencer.personas || []);
      setScenarios(influencer.scenarios || []);
      setCategories(influencer.categories || []);
      setAbilities(influencer.abilities || []);
      setStrategies(influencer.strategies || []);
    } else {
      // Clear forms for create mode
      setName("");
      // Random default stock avatar if left blank
      const randId = Math.floor(Math.random() * 100);
      setAvatarUrl(`https://images.unsplash.com/photo-${1500000000000 + randId * 10000}?auto=format&fit=crop&q=80&w=250&h=250`);
      setCountry("United States");
      setCity("");
      setEmail("");
      setPhone("");
      setAgency("");
      setNotes("");

      setYtUrl(""); setYtFollow(0); setYtEr(0); setYtViews(0); setYtLikes(0); setYtComments(0);
      setIgUrl(""); setIgFollow(0); setIgEr(0); setIgViews(0); setIgLikes(0); setIgComments(0);
      setTtUrl(""); setTtFollow(0); setTtEr(0); setTtViews(0); setTtLikes(0); setTtComments(0);

      setStatus("待开发");
      setRateCard(0);
      setDealPrice(0);
      setRecommendedDirections("");

      setPersonas([]);
      setScenarios([]);
      setCategories([]);
      setAbilities([]);
      setStrategies([]);
    }
    setError(null);
    setActiveTab("basic");
  }, [influencer, isOpen]);

  if (!isOpen) return null;

  const handleToggleTag = (type: string, tag: string) => {
    let list: string[] = [];
    let setter: React.Dispatch<React.SetStateAction<string[]>>;

    switch (type) {
      case "personas": list = personas; setter = setPersonas; break;
      case "scenarios": list = scenarios; setter = setScenarios; break;
      case "categories": list = categories; setter = setCategories; break;
      case "abilities": list = abilities; setter = setAbilities; break;
      case "strategies": list = strategies; setter = setStrategies; break;
      default: return;
    }

    if (list.includes(tag)) {
      setter(list.filter(t => t !== tag));
    } else {
      setter([...list, tag]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTagText.trim()) return;
    const cleanTag = customTagText.trim();
    
    switch (customTagType) {
      case "personas": if (!personas.includes(cleanTag)) setPersonas([...personas, cleanTag]); break;
      case "scenarios": if (!scenarios.includes(cleanTag)) setScenarios([...scenarios, cleanTag]); break;
      case "categories": if (!categories.includes(cleanTag)) setCategories([...categories, cleanTag]); break;
      case "abilities": if (!abilities.includes(cleanTag)) setAbilities([...abilities, cleanTag]); break;
      case "strategies": if (!strategies.includes(cleanTag)) setStrategies([...strategies, cleanTag]); break;
    }
    setCustomTagText("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("达人名称不能为空 (Name is required)");
      setActiveTab("basic");
      return;
    }

    setLoading(true);
    try {
      const payload: Omit<Influencer, "id" | "createdAt" | "updatedAt"> = {
        name: name.trim(),
        avatarUrl: avatarUrl.trim() || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250&h=250",
        country: country.trim(),
        city: city.trim(),
        email: email.trim(),
        phone: phone.trim(),
        agency: agency.trim(),
        notes: notes.trim(),
        
        instagram: {
          profileUrl: igUrl.trim(),
          followers: Number(igFollow),
          er: Number(igEr),
          avgViews: Number(igViews),
          avgLikes: Number(igLikes),
          avgComments: Number(igComments)
        },
        tiktok: {
          profileUrl: ttUrl.trim(),
          followers: Number(ttFollow),
          er: Number(ttEr),
          avgViews: Number(ttViews),
          avgLikes: Number(ttLikes),
          avgComments: Number(ttComments)
        },
        youtube: {
          profileUrl: ytUrl.trim(),
          followers: Number(ytFollow),
          er: Number(ytEr),
          avgViews: Number(ytViews),
          avgLikes: Number(ytLikes),
          avgComments: Number(ytComments)
        },

        personas,
        scenarios,
        categories,
        abilities,
        strategies,

        status,
        rateCard: Number(rateCard),
        dealPrice: Number(dealPrice),
        recommendedDirections: recommendedDirections.trim()
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "保存失败，请检查规则或连接。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="create-influencer-modal" className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#0F0F11] border border-zinc-805 border-zinc-800 text-zinc-100 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#131316]">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">
              {influencer ? `编辑达人：${influencer.name}` : "录入新达人"}
            </h3>
            <p className="text-xs text-zinc-500">统一导入或更新社交达人的基础与业务核心信息</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs Control */}
        <div className="flex border-b border-zinc-800 bg-[#0F0F11] px-4 font-sans">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "basic" 
                ? "border-blue-500 text-blue-400 font-bold" 
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            1. 基础与商务信息
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("platforms")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "platforms" 
                ? "border-blue-500 text-blue-400 font-bold" 
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            2. 三大平台数据
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tags")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "tags" 
                ? "border-blue-500 text-blue-400 font-bold" 
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            3. 特色标签系统
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="m-4 p-3 bg-red-950/40 border border-red-900/40 text-rose-450 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0A0A0B]">
          
          {/* TAB 1: BASIC & BUSINESS */}
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4 font-sans">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">基础属性</h4>
                
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">达人名称 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="例如: Alex Costa" 
                    className="w-full text-sm px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">头像图片链接 (Avatar URL)</label>
                  <input 
                    type="url" 
                    value={avatarUrl} 
                    onChange={e => setAvatarUrl(e.target.value)} 
                    placeholder="https://example.com/photo.jpg" 
                    className="w-full text-sm px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">所在地区/国家</label>
                    <input 
                      type="text" 
                      value={country} 
                      onChange={e => setCountry(e.target.value)} 
                      placeholder="如: United States" 
                      className="w-full text-sm px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">城市</label>
                    <input 
                      type="text" 
                      value={city} 
                      onChange={e => setCity(e.target.value)} 
                      placeholder="如: Los Angeles" 
                      className="w-full text-sm px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">联系邮箱</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="alex@example.com" 
                      className="w-full text-sm text-zinc-200 px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">联络电话</label>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      placeholder="+1 (310) 999-xxxx" 
                      className="w-full text-sm px-3 py-2 border rounded-lg border-zinc-805 border-[#27272a] bg-[#0F0F11] text-zinc-200 placeholder-[#71717a] focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">所属经纪公司 (Agency)</label>
                  <input 
                    type="text" 
                    value={agency} 
                    onChange={e => setAgency(e.target.value)} 
                    placeholder="如: Costa Media Group" 
                    className="w-full text-sm px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-4 font-sans">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">商务信息 & 合作策略</h4>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">合作状态 (Cooperation Status)</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value as CooperationStatus)}
                    className="w-full text-sm px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-200 focus:outline-none focus:border-zinc-700 cursor-pointer text-zinc-300"
                  >
                    <option value="已合作">已合作 (Collaborated)</option>
                    <option value="已报价未合作">已报价未合作 (Quoted, pending)</option>
                    <option value="沟通中">沟通中 (Negotiating)</option>
                    <option value="待开发">待开发 (To Develop)</option>
                    <option value="不合作">不合作 (Blacklisted / Not interested)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">公开报价 (Rate Card, USD)</label>
                    <input 
                      type="number" 
                      value={rateCard} 
                      onChange={e => setRateCard(Number(e.target.value))} 
                      className="w-full text-sm px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">实际成交价 (Deal Price, USD)</label>
                    <input 
                      type="number" 
                      value={dealPrice} 
                      onChange={e => setDealPrice(Number(e.target.value))} 
                      className="w-full text-sm px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">推荐合作方向 (Recommended Directions)</label>
                  <textarea 
                    rows={2}
                    value={recommendedDirections} 
                    onChange={e => setRecommendedDirections(e.target.value)} 
                    placeholder="适合投影仪办公/观赛场景，推荐锁下长期大使协议..." 
                    className="w-full text-sm px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">内部备注 (Internal Notes)</label>
                  <textarea 
                    rows={2}
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    placeholder="沟通态度极好，只在周二或周四回信..." 
                    className="w-full text-sm px-3 py-2 border rounded-lg border-zinc-800 bg-[#0F0F11] text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PLATFORMS */}
          {activeTab === "platforms" && (
            <div className="space-y-6">
              
              {/* YouTube Card */}
              <div className="p-5 border border-red-950/40 rounded-xl bg-red-950/10 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/55"></span>
                  <h4 className="text-sm font-semibold text-red-400">YouTube 平台数据</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-3">
                    <label className="block text-xs text-zinc-400 font-medium mb-1">Profile URL</label>
                    <input 
                      type="url" 
                      value={ytUrl} 
                      onChange={e => setYtUrl(e.target.value)} 
                      placeholder="https://youtube.com/c/example" 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-red-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">粉丝量 (Followers)</label>
                    <input 
                      type="number" 
                      value={ytFollow} 
                      onChange={e => setYtFollow(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-red-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">互动率 ER% (例如: 1.5 表示 1.5%)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={ytEr} 
                      onChange={e => setYtEr(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-red-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">平均播放量 (Avg Views)</label>
                    <input 
                      type="number" 
                      value={ytViews} 
                      onChange={e => setYtViews(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-red-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">平均点赞量 (Avg Likes)</label>
                    <input 
                      type="number" 
                      value={ytLikes} 
                      onChange={e => setYtLikes(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-red-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">平均评论数 (Avg Comments)</label>
                    <input 
                      type="number" 
                      value={ytComments} 
                      onChange={e => setYtComments(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-red-900"
                    />
                  </div>
                </div>
              </div>

              {/* Instagram Card */}
              <div className="p-5 border border-pink-950/40 rounded-xl bg-pink-950/10 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500 shadow-sm shadow-pink-500/55"></span>
                  <h4 className="text-sm font-semibold text-pink-400">Instagram 平台数据</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-3">
                    <label className="block text-xs text-zinc-400 font-medium mb-1">Profile URL</label>
                    <input 
                      type="url" 
                      value={igUrl} 
                      onChange={e => setIgUrl(e.target.value)} 
                      placeholder="https://instagram.com/example" 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-pink-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">粉丝量 (Followers)</label>
                    <input 
                      type="number" 
                      value={igFollow} 
                      onChange={e => setIgFollow(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-pink-[#ec4899]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">互动率 ER%</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={igEr} 
                      onChange={e => setIgEr(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-pink-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">平均播放量 (Avg Views)</label>
                    <input 
                      type="number" 
                      value={igViews} 
                      onChange={e => setIgViews(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-pink-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">平均点赞量 (Avg Likes)</label>
                    <input 
                      type="number" 
                      value={igLikes} 
                      onChange={e => setIgLikes(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-pink-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">平均评论数 (Avg Comments)</label>
                    <input 
                      type="number" 
                      value={igComments} 
                      onChange={e => setIgComments(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-pink-900"
                    />
                  </div>
                </div>
              </div>

              {/* TikTok Card */}
              <div className="p-5 border border-cyan-950/40 rounded-xl bg-cyan-950/10 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/55"></span>
                  <h4 className="text-sm font-semibold text-cyan-400">TikTok 平台数据</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-3">
                    <label className="block text-xs text-zinc-400 font-medium mb-1">Profile URL</label>
                    <input 
                      type="url" 
                      value={ttUrl} 
                      onChange={e => setTtUrl(e.target.value)} 
                      placeholder="https://tiktok.com/@example" 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-cyan-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">粉丝量 (Followers)</label>
                    <input 
                      type="number" 
                      value={ttFollow} 
                      onChange={e => setTtFollow(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-cyan-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">互动率 ER%</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={ttEr} 
                      onChange={e => setTtEr(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-cyan-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">平均播放量 (Avg Views)</label>
                    <input 
                      type="number" 
                      value={ttViews} 
                      onChange={e => setTtViews(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-cyan-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">平均点赞量 (Avg Likes)</label>
                    <input 
                      type="number" 
                      value={ttLikes} 
                      onChange={e => setTtLikes(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-cyan-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1">平均评论数 (Avg Comments)</label>
                    <input 
                      type="number" 
                      value={ttComments} 
                      onChange={e => setTtComments(Number(e.target.value))} 
                      className="w-full text-xs px-3 py-2 border border-zinc-800 bg-[#0F0F11] text-zinc-200 rounded-lg focus:outline-none focus:border-cyan-900"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: TAGS */}
          {activeTab === "tags" && (
            <div className="space-y-6 font-sans">
              
              {/* Interactive Tag Groups Selector */}
              <div className="space-y-5">
                
                {/* Personas (人设) */}
                <div className="bg-[#131316] border border-zinc-850 p-4 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">人设标签 (Persona)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_PERSONAS.map(p => {
                      const contains = personas.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleToggleTag("personas", p)}
                          className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                            contains 
                              ? "bg-violet-950/60 text-violet-300 border-violet-850" 
                              : "bg-[#0F0F11] text-zinc-400 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Categories (品类) */}
                <div className="bg-[#131316] border border-zinc-850 p-4 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">品类标签 (Category)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_CATEGORIES.map(p => {
                      const contains = categories.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleToggleTag("categories", p)}
                          className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                            contains 
                              ? "bg-teal-905 bg-teal-950/60 text-teal-300 border-teal-850" 
                              : "bg-[#0F0F11] text-zinc-400 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scenarios (场景) */}
                <div className="bg-[#131316] border border-zinc-850 p-4 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">场景标签 (Scenario)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_SCENARIOS.map(p => {
                      const contains = scenarios.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleToggleTag("scenarios", p)}
                          className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                            contains 
                              ? "bg-sky-950/60 text-sky-300 border-sky-850" 
                              : "bg-[#0F0F11] text-zinc-400 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Abilities (能力特征) */}
                <div className="bg-[#131316] border border-zinc-850 p-4 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">能力标签 (Ability)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_ABILITIES.map(p => {
                      const contains = abilities.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleToggleTag("abilities", p)}
                          className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                            contains 
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-850" 
                              : "bg-[#0F0F11] text-zinc-400 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Strategies (营销打法) */}
                <div className="bg-[#131316] border border-zinc-850 p-4 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">营销打法标签 (Marketing Strategy)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_STRATEGIES.map(p => {
                      const contains = strategies.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleToggleTag("strategies", p)}
                          className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
                            contains 
                              ? "bg-amber-950/60 text-amber-300 border-amber-850" 
                              : "bg-[#0F0F11] text-zinc-400 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Add Custom Tag Form */}
              <div className="p-4 border border-dashed rounded-xl border-zinc-800 bg-[#131316]">
                <h5 className="text-xs font-semibold text-zinc-300 mb-2">💡 未在预设中？在此手动录入自定义标签</h5>
                <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
                  <select
                    value={customTagType}
                    onChange={e => setCustomTagType(e.target.value as any)}
                    className="text-xs border border-zinc-800 rounded-lg bg-[#0F0F11] text-zinc-200 px-2 py-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="personas">人设类型 (Persona)</option>
                    <option value="categories">品类类型 (Category)</option>
                    <option value="scenarios">应用场景 (Scenario)</option>
                    <option value="abilities">特殊能力 (Ability)</option>
                    <option value="strategies">打法类型 (Strategy)</option>
                  </select>
                  <div className="flex-1 flex gap-1">
                    <input
                      type="text"
                      value={customTagText}
                      onChange={e => setCustomTagText(e.target.value)}
                      placeholder="自定义标签名称，如: '夫妻档居家'"
                      className="text-xs border border-zinc-850 border-zinc-800 rounded-lg px-3 py-1.5 flex-1 bg-[#0F0F11] text-zinc-200 placeholder-zinc-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs flex items-center gap-1 transition cursor-pointer font-semibold"
                    >
                      <Plus size={14} /> 添加
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </form>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between bg-[#131316]">
          <div className="text-zinc-550 text-zinc-500 text-xs font-sans">
            * 达人名称、头像、合作状态为最基础字段
          </div>
          <div className="flex items-center space-x-2 font-sans">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              className="px-4 py-2 text-sm border border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded-lg transition overflow-hidden cursor-pointer"
            >
              取消
            </button>
            <button 
              type="button" 
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Save size={16} /> 
              {loading ? "正在保存..." : influencer ? "更新达人 (Update)" : "注册入库 (Save)"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
