import React, { useState, useEffect, useMemo } from "react";
import { 
  getInfluencers, 
  createInfluencer, 
  updateInfluencer, 
  deleteInfluencer, 
  ensureSeedLoaded,
  getCustomTags,
  createCustomTag,
  deleteCustomTag,
  createCooperationRecord,
  getCooperationRecords
} from "./services";
import { Influencer, CooperationStatus, AuthRole, CooperationRecord } from "./types";
import { exportToExcelCSV, formatCompactNumber, formatCurrency } from "./utils";
import CreateEditInfluencerModal from "./components/CreateEditInfluencerModal";
import ManageTagsModal from "./components/ManageTagsModal";
import InfluencerDetailView from "./components/InfluencerDetailView";
import ExcelImportModal from "./components/ExcelImportModal";
import AddEditRecordModal from "./components/AddEditRecordModal";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, SlidersHorizontal, ArrowUpDown, Download, Plus, Sparkles, Star, Users, CheckCircle,
  Eye, RefreshCw, LogIn, LogOut, Check, Shield, ShieldAlert, HelpCircle, X, ChevronRight, Globe, Layers, Award, Trash2,
  FileSpreadsheet, Settings2
} from "lucide-react";

export default function App() {
  // Database & State loading
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);



  // UI & Excel triggers
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Search, Filter & sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState<"All" | "youtube" | "instagram" | "tiktok">("All");
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterStatus, setFilterStatus] = useState<"All" | CooperationStatus>("All");
  const [filterFollowers, setFilterFollowers] = useState<"All" | "100K-500K" | "500K-1M" | "1M+">("All");
  const [filterER, setFilterER] = useState<number>(0); // 0 means any
  
  // Specific tag filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);

  // Sorting Option
  const [sortBy, setSortBy] = useState<"followers" | "er" | "rateCard" | "dealPrice" | "name" | "recent">("recent");

  // Modals state
  const [isInfluencerModalOpen, setIsInfluencerModalOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const [manageTagsType, setManageTagsType] = useState<"categories" | "scenarios">("categories");
  const [isCoopRecordModalOpen, setIsCoopRecordModalOpen] = useState(false);
  const [coopRecordInfluencerId, setCoopRecordInfluencerId] = useState<string | null>(null);

  // All operations are fully unlocked for any visitor (Admin override)
  const userRole: AuthRole = "Admin";

  // Dynamic User Custom Tags State
  const [customTags, setCustomTags] = useState<{ id: string; type: string; value: string }[]>([]);
  const [coopRecords, setCoopRecords] = useState<{[influencerId: string]: CooperationRecord[]}>({});

  // Add custom tag global handler
  const handleAddCustomTagGlobal = async (type: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const exists = customTags.some(t => t.type === type && t.value.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;

    try {
      await createCustomTag(type, trimmed);
      // reload tags
      const tagsList = await getCustomTags();
      setCustomTags(tagsList);
    } catch (err: any) {
      console.error("Failed to save custom tag:", err);
    }
  };

  // Delete custom tag global handler
  const handleDeleteCustomTagGlobal = async (id: string) => {
    try {
      await deleteCustomTag(id);
      // reload tags
      const tagsList = await getCustomTags();
      setCustomTags(tagsList);
    } catch (err: any) {
      console.error("Failed to delete custom tag:", err);
    }
  };

  // Load database and seed if empty
  const loadDatabase = async () => {
    setLoading(true);
    try {
      await ensureSeedLoaded();
      const list = await getInfluencers();
      setInfluencers(list);
      
      // Fetch cooperation records for all influencers in parallel
      const recordsPromises = list.map(async (inf) => {
        try {
          const recs = await getCooperationRecords(inf.id);
          return { id: inf.id, recs };
        } catch (e) {
          console.error(`Failed to load cooperation records for influencer ${inf.id}:`, e);
          return { id: inf.id, recs: [] };
        }
      });
      const recordsResults = await Promise.all(recordsPromises);
      const recordsMap: {[influencerId: string]: CooperationRecord[]} = {};
      recordsResults.forEach(res => {
        recordsMap[res.id] = res.recs;
      });
      setCoopRecords(recordsMap);

      // Load custom tags
      const tagsList = await getCustomTags();
      setCustomTags(tagsList);
    } catch (err) {
      console.error("Failed to load db data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load database on mount
  useEffect(() => {
    loadDatabase();
  }, []);

  const handleSaveInfluencer = async (data: Omit<Influencer, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (editingInfluencer) {
        await updateInfluencer(editingInfluencer.id, data);
        // If the updated influencer is currently being viewed, update details too
        if (selectedInfluencer?.id === editingInfluencer.id) {
          setSelectedInfluencer({ ...selectedInfluencer, ...data });
        }
      } else {
        await createInfluencer(data);
      }
      await loadDatabase();
    } catch (err: any) {
      alert("操作失败! 错误原因: " + (err?.message || "权限不足"));
    }
  };

  const handleSaveCoopRecordFromCard = async (data: Omit<CooperationRecord, "id" | "createdAt">) => {
    if (!coopRecordInfluencerId) return;
    try {
      await createCooperationRecord(coopRecordInfluencerId, data);
      
      // If adding a cooperation record, automatically set the influencer's status to "已合作"
      const currentInf = influencers.find(i => i.id === coopRecordInfluencerId);
      if (currentInf && currentInf.status !== "已合作") {
        await updateInfluencer(coopRecordInfluencerId, { status: "已合作" });
      }
      await loadDatabase();
    } catch (err: any) {
      alert("合作记录保存失败: " + (err?.message || "无写操作权限"));
    }
  };

  const handleDeleteInfluencer = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("确定要将该达人移出数据库吗？一并删除的还有其关联合作记录。")) return;
    try {
      await deleteInfluencer(id);
      await loadDatabase();
    } catch (err: any) {
      alert("删除失败: " + (err?.message || "您暂无Admin特权"));
    }
  };

  // Collect list of unique countries and cities in database dynamically for selection
  const countriesList = useMemo(() => {
    const list = new Set<string>();
    influencers.forEach(inf => { if (inf.country) list.add(inf.country); });
    return Array.from(list);
  }, [influencers]);

  // Gather total stats counts
  const totalCount = influencers.length;
  const cooperatedCount = influencers.filter(i => i.status === "已合作").length;

  // Compute all available tags for hot tag clouds
  const allCategories = useMemo(() => {
    const counts: { [key: string]: number } = {};
    // Pre-populate with our persistent custom tags so they show up even with 0 counts
    customTags.filter(t => t.type === "categories").forEach(t => {
      counts[t.value] = 0;
    });
    influencers.forEach(i => i.categories?.forEach(tag => counts[tag] = (counts[tag] || 0) + 1));
    return Object.entries(counts).sort((a,b) => b[1] - a[1]);
  }, [influencers, customTags]);

  const allScenarios = useMemo(() => {
    const counts: { [key: string]: number } = {};
    // Pre-populate with persistent custom scenarios
    customTags.filter(t => t.type === "scenarios").forEach(t => {
      counts[t.value] = 0;
    });
    influencers.forEach(i => i.scenarios?.forEach(tag => counts[tag] = (counts[tag] || 0) + 1));
    return Object.entries(counts).sort((a,b) => b[1] - a[1]);
  }, [influencers, customTags]);

  // Execute filters on search lists
  const filteredInfluencers = useMemo(() => {
    return influencers.filter((inf) => {
      // 1. Keyword query matches
      const keyword = searchQuery.toLowerCase().trim();
      const matchKeyword = !keyword || 
        inf.name.toLowerCase().includes(keyword) ||
        inf.city?.toLowerCase().includes(keyword) ||
        inf.country?.toLowerCase().includes(keyword) ||
        inf.agency?.toLowerCase().includes(keyword) ||
        inf.email?.toLowerCase().includes(keyword) ||
        inf.notes?.toLowerCase().includes(keyword);

      if (!matchKeyword) return false;

      // 2. Selected Platform
      if (filterPlatform !== "All") {
        const platformStats = inf[filterPlatform];
        if (!platformStats || !platformStats.profileUrl) return false;
      }

      // 3. Country matching
      if (filterCountry !== "All" && inf.country !== filterCountry) {
        return false;
      }

      // 4. Status matching
      if (filterStatus !== "All" && inf.status !== filterStatus) {
        return false;
      }

      // 5. ER rate thresholds
      if (filterER > 0) {
        const ytEr = inf.youtube?.er || 0;
        const igEr = inf.instagram?.er || 0;
        const ttEr = inf.tiktok?.er || 0;
        const maxEr = Math.max(ytEr, igEr, ttEr);
        if (maxEr < filterER) return false;
      }

      // 6. Followers Scale
      if (filterFollowers !== "All") {
        const ytFollowers = inf.youtube?.followers || 0;
        const igFollowers = inf.instagram?.followers || 0;
        const ttFollowers = inf.tiktok?.followers || 0;
        const maxFollowers = Math.max(ytFollowers, igFollowers, ttFollowers);

        if (filterFollowers === "100K-500K" && (maxFollowers < 100000 || maxFollowers > 500000)) return false;
        if (filterFollowers === "500K-1M" && (maxFollowers < 500000 || maxFollowers > 1000000)) return false;
        if (filterFollowers === "1M+" && maxFollowers < 1000000) return false;
      }

      // 7. Categories
      if (selectedCategories.length > 0) {
        const hasMatch = selectedCategories.every(tag => inf.categories?.includes(tag));
        if (!hasMatch) return false;
      }

      // 8. Scenarios
      if (selectedScenarios.length > 0) {
        const hasMatch = selectedScenarios.every(tag => inf.scenarios?.includes(tag));
        if (!hasMatch) return false;
      }

      // 9. Personas
      if (selectedPersonas.length > 0) {
        const hasMatch = selectedPersonas.every(tag => inf.personas?.includes(tag));
        if (!hasMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      // Apply Sorting
      if (sortBy === "followers") {
        const getFollowers = (inf: Influencer) => Math.max(inf.youtube?.followers || 0, inf.instagram?.followers || 0, inf.tiktok?.followers || 0);
        return getFollowers(b) - getFollowers(a);
      }
      if (sortBy === "er") {
        const getEr = (inf: Influencer) => Math.max(inf.youtube?.er || 0, inf.instagram?.er || 0, inf.tiktok?.er || 0);
        return getEr(b) - getEr(a);
      }
      if (sortBy === "rateCard") {
        return b.rateCard - a.rateCard;
      }
      if (sortBy === "dealPrice") {
        return b.dealPrice - a.dealPrice;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      // default sortBy === "recent"
      return 1; // Fallback sorted index
    });
  }, [influencers, searchQuery, filterPlatform, filterCountry, filterStatus, filterFollowers, filterER, selectedCategories, selectedScenarios, selectedPersonas, sortBy]);

  // Clean tags resets
  const handleClearAllFilters = () => {
    setSearchQuery("");
    setFilterPlatform("All");
    setFilterCountry("All");
    setFilterStatus("All");
    setFilterFollowers("All");
    setFilterER(0);
    setSelectedCategories([]);
    setSelectedScenarios([]);
    setSelectedPersonas([]);
  };

  const handleToggleCategoryFilter = (tag: string) => {
    if (selectedCategories.includes(tag)) {
      setSelectedCategories(selectedCategories.filter(t => t !== tag));
    } else {
      setSelectedCategories([...selectedCategories, tag]);
    }
  };

  const handleToggleScenarioFilter = (tag: string) => {
    if (selectedScenarios.includes(tag)) {
      setSelectedScenarios(selectedScenarios.filter(t => t !== tag));
    } else {
      setSelectedScenarios([...selectedScenarios, tag]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 antialiased font-sans flex flex-col">
      {/* 1. TOP UTILITY INFORMATION BAR (Identity & Enterprise Settings) */}
      <div className="w-full bg-[#0F0F11] text-zinc-400 py-1.5 px-4 sm:px-6 flex flex-wrap items-center justify-between text-xs font-semibold select-none border-b border-zinc-800 gap-2">
        <div className="flex items-center space-x-1.5 shrink-0">
          <Shield size={13} className="text-blue-450 text-blue-400 shrink-0" />
          <span className="hidden lg:inline">Shylight Atlas 管理中心: <strong className="text-zinc-100 font-bold">已无缝解锁全站管理机制，无需验证即可操作</strong></span>
          <span className="lg:hidden text-zinc-100 font-bold">Shylight Atlas</span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0 text-zinc-500 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400 font-bold">免密管理模式已开启</span>
          </span>
          <span className="border-l border-zinc-800 pl-2">直连状态: 运行良好</span>
        </div>
      </div>


      {/* 2. MAIN NAVIGATION HEADER CONTAINER */}
      <header className="bg-[#0F0F11] border-b border-zinc-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-row items-center justify-between gap-2">
          
          {/* LOGO AREA */}
          <div className="flex items-center space-x-2 sm:space-x-4 cursor-pointer select-none animate-none" onClick={() => setSelectedInfluencer(null)}>
            <div className="relative flex items-center filter drop-shadow-[0_0_12px_rgba(14,165,233,0.35)] shrink-0">
              {/* EON CREATIVE Brand SVG */}
              <svg viewBox="0 0 200 80" className="h-7 sm:h-10 w-auto text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Soft blue glowing nebulous outer glow */}
                  <radialGradient id="nebulaGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#0284c7" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
                  </radialGradient>
                  
                  {/* Glowing center highlight core */}
                  <radialGradient id="highLightCore" cx="50%" cy="50%" r="40%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="35%" stopColor="#e0f2fe" stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* BACKGROUND NEBULA IN RECTANGLE OR OVAL */}
                <g transform="translate(100, 39) rotate(-34) translate(-100, -39)">
                  {/* Blue glowing capsule background */}
                  <ellipse cx="100" cy="39" rx="48" ry="16" fill="url(#nebulaGlow)" opacity="0.85" />
                  {/* Saturated cyan band */}
                  <ellipse cx="100" cy="39" rx="36" ry="9" fill="#06b6d4" opacity="0.65" />
                  {/* Inner bright highlight beam */}
                  <ellipse cx="100" cy="39" rx="24" ry="3" fill="#ffffff" opacity="0.85" />
                </g>

                {/* Glowing bright core white sphere in the center of the orbit */}
                <circle cx="100" cy="39" r="14" fill="url(#highLightCore)" />
                <circle cx="100" cy="39" r="6" fill="#ffffff" />

                {/* E shape left (solid modern block letter) */}
                <rect x="25" y="15" width="8" height="48" fill="#FFFFFF" />
                <rect x="33" y="15" width="18" height="8" fill="#FFFFFF" />
                <rect x="33" y="35" width="13" height="8" fill="#FFFFFF" />
                <rect x="33" y="55" width="18" height="8" fill="#FFFFFF" />

                {/* N shape right (solid modern block letter) */}
                <rect x="149" y="15" width="8" height="48" fill="#FFFFFF" />
                <rect x="175" y="15" width="8" height="48" fill="#FFFFFF" />
                <polygon points="152,15 159,15 178,63 171,63" fill="#FFFFFF" />

                {/* CREATIVE letter-spaced text under N */}
                <text x="131" y="74" fill="#E4E4E7" fontSize="5.5" fontWeight="950" letterSpacing="2.1" fontFamily="sans-serif" opacity="0.95">CREATIVE</text>
              </svg>
            </div>
            <div className="border-l border-zinc-800 pl-2.5 sm:pl-4 h-7 sm:h-9 flex flex-col justify-center">
              <h1 className="text-xs sm:text-sm font-extrabold text-zinc-100 tracking-tight flex items-center gap-1 sm:gap-1.5 leading-none">
                Shylight Atlas
                <span className="bg-blue-950/60 text-blue-400 text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold border border-blue-900/40 whitespace-nowrap">MVP</span>
              </h1>
              <p className="text-[10px] text-zinc-500 mt-1 leading-none hidden sm:block">达人多维智能检索与合作履约沉淀系统</p>
            </div>
          </div>

          {/* Quick Stats Banner inside header */}
          <div className="hidden md:flex items-center gap-8 text-xs border-l border-zinc-800 pl-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-850 text-zinc-300 flex items-center justify-center font-bold border border-zinc-700">
                {totalCount}
              </div>
              <div>
                <p className="text-zinc-400 font-medium">总达人数</p>
                <p className="text-zinc-500 font-semibold text-[11px]">In Database</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-950/30 text-emerald-400 flex items-center justify-center font-bold border border-emerald-900/30">
                {cooperatedCount}
              </div>
              <div>
                <p className="text-zinc-400 font-medium">已成功合作达人</p>
                <p className="text-zinc-500 font-semibold text-[11px]">Active Collaborated</p>
              </div>
            </div>
          </div>

          {/* Add Influencer Button if Admin */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <button
              onClick={loadDatabase}
              className="p-1.5 sm:p-2 border border-zinc-800 rounded-lg text-zinc-400 hover:bg-zinc-850 transition cursor-pointer"
              title="重新加载数据库"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>

            {userRole === "Admin" && (
              <>
                <button
                  type="button"
                  onClick={() => setIsExcelModalOpen(true)}
                  className="bg-zinc-900 border border-zinc-850 hover:border-emerald-500/30 text-zinc-300 hover:text-emerald-400 font-semibold text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  <FileSpreadsheet size={13} className="sm:size-4 text-emerald-400" />
                  <span>Excel 批量导入</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingInfluencer(null);
                    setIsInfluencerModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg inline-flex items-center gap-1 sm:gap-1.5 shadow-md shadow-blue-900/20 transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  <Plus size={13} className="sm:size-4" />
                  <span>人工录入</span>
                </button>
              </>
            )}
          </div>

        </div>
      </header>

      {/* 3. BUSINESS CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        


        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-zinc-500 text-xs mt-3">安全链接到 Firestore 并加载信息中...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* SCREEN B: DETAILED VIEW */}
            {selectedInfluencer ? (
              <motion.div
                key="detailView"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <InfluencerDetailView
                  influencer={selectedInfluencer}
                  userRole={userRole}
                  onBack={() => setSelectedInfluencer(null)}
                  onRefreshInfluencer={async () => {
                    // Pull fresh data to keep detail screen in sync
                    const list = await getInfluencers();
                    setInfluencers(list);
                    const fresh = list.find(i => i.id === selectedInfluencer.id);
                    if (fresh) setSelectedInfluencer(fresh);

                    try {
                      const recs = await getCooperationRecords(selectedInfluencer.id);
                      setCoopRecords(prev => ({
                        ...prev,
                        [selectedInfluencer.id]: recs
                      }));
                    } catch (e) {
                      console.error("Failed to sync records in onRefreshInfluencer:", e);
                    }
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="homeView"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* HOT CATEGORIES WIDGET */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <Layers size={14} className="text-blue-400" />
                        热门品类热词
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setManageTagsType("categories");
                          setIsManageTagsOpen(true);
                        }}
                        className="text-[11px] text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/10 hover:border-teal-500/20 px-2 py-0.5 rounded-md transition cursor-pointer select-none"
                        title="管理品类标签库"
                      >
                        <Settings2 size={11} />
                        <span>管理</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {allCategories.length === 0 ? (
                        <p className="text-xs text-zinc-500">暂无品类数据</p>
                      ) : (
                        allCategories.map(([tag, count]) => {
                          const active = selectedCategories.includes(tag);
                          return (
                            <button
                              key={tag}
                              onClick={() => handleToggleCategoryFilter(tag)}
                              className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                                active 
                                  ? "bg-teal-600 border-teal-600 text-white font-semibold" 
                                  : "bg-zinc-805 bg-zinc-800 text-zinc-300 border-zinc-700/80 hover:bg-zinc-750"
                              }`}
                            >
                              <span>{tag}</span>
                              <span className={`text-[9px] px-1 rounded ${active ? "bg-teal-800 text-white" : "bg-zinc-700 text-zinc-400"}`}>
                                {count}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* HOT SCENARIOS WIDGET */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <Globe size={14} className="text-blue-400" />
                        热门投放/应用场景
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setManageTagsType("scenarios");
                          setIsManageTagsOpen(true);
                        }}
                        className="text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 bg-sky-500/5 hover:bg-sky-500/10 border border-sky-500/10 hover:border-sky-500/20 px-2 py-0.5 rounded-md transition cursor-pointer select-none"
                        title="管理应用场景库"
                      >
                        <Settings2 size={11} />
                        <span>管理</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {allScenarios.length === 0 ? (
                        <p className="text-xs text-zinc-500">暂无场景数据</p>
                      ) : (
                        allScenarios.map(([tag, count]) => {
                          const active = selectedScenarios.includes(tag);
                          return (
                            <button
                              key={tag}
                              onClick={() => handleToggleScenarioFilter(tag)}
                              className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                                active 
                                  ? "bg-sky-600 border-sky-600 text-white font-semibold" 
                                  : "bg-zinc-805 bg-zinc-800 text-zinc-300 border-zinc-700/80 hover:bg-zinc-750"
                              }`}
                            >
                              <span>{tag}</span>
                              <span className={`text-[9px] px-1 rounded ${active ? "bg-sky-850 text-white" : "bg-zinc-700 text-zinc-400"}`}>
                                {count}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* MINI ADVANTAGES / SEED INFO */}
                  <div className="bg-gradient-to-br from-blue-950 to-zinc-900 text-zinc-100 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                      <Award size={150} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-extrabold flex items-center gap-1 text-blue-400">
                        <Star size={16} fill="currentColor" /> 达人管理与推荐打法
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        支持根据国家/平台/粉丝范围组合筛选，沉淀历史合作价格、视频播放等实锤效果，避免重复踩坑，快速向业务与客户推荐最优提报达人。
                      </p>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-2">
                       © Offline Excel Alternative Solution
                    </div>
                  </div>
                </div>

                {/* SEARCH COMPONENT & ACTION TOOLBAR */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    
                    {/* Search Field */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-2.5 text-zinc-500" size={18} />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="键入达人名称、城市、联系邮箱或所属公司/经纪机构..." 
                        className="w-full text-sm pl-10 pr-12 py-2 border rounded-xl border-zinc-800 bg-[#0A0A0B] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-2 text-zinc-400 hover:text-zinc-200 text-xs font-semibold select-none cursor-pointer"
                        >
                          清除
                        </button>
                      )}
                    </div>

                    {/* Filter Panel toggler */}
                    <button
                      type="button"
                      onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                        isFilterPanelOpen || selectedCategories.length > 0 || selectedScenarios.length > 0 || selectedPersonas.length > 0
                          ? "bg-blue-950/40 border-blue-800 text-blue-400 font-semibold" 
                          : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-750"
                      }`}
                    >
                      <SlidersHorizontal size={16} />
                      高级多层过滤
                      {(selectedCategories.length > 0 || selectedScenarios.length > 0 || selectedPersonas.length > 0) && (
                        <span className="bg-blue-600 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                          {selectedCategories.length + selectedScenarios.length + selectedPersonas.length}
                        </span>
                      )}
                    </button>

                    {/* Exporter Excel */}
                    <button
                      type="button"
                      onClick={() => exportToExcelCSV(filteredInfluencers)}
                      className="bg-zinc-805 bg-zinc-800 hover:bg-zinc-705 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-1.5 transition-all duration-150 cursor-pointer"
                    >
                      <Download size={16} className="text-zinc-400" />
                      导出 Excel 名单 ({filteredInfluencers.length})
                    </button>

                  </div>

                  {/* COLLAPSIBLE HIGHER FILTERS PANEL */}
                  {isFilterPanelOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="border-t border-zinc-800 pt-4 grid grid-cols-1 md:grid-cols-4 gap-4"
                    >
                      
                      {/* Filter 1: Main Platform */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">社媒主平台 (Platform)</label>
                        <select 
                          value={filterPlatform}
                          onChange={(e) => setFilterPlatform(e.target.value as any)}
                          className="w-full text-xs p-2 border border-zinc-800 bg-[#0A0A0B] text-zinc-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="All">任意社媒平台 (Any)</option>
                          <option value="youtube">YouTube</option>
                          <option value="instagram">Instagram</option>
                          <option value="tiktok">TikTok</option>
                        </select>
                      </div>

                      {/* Filter 2: Countries */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">所在地区/国家 (Country)</label>
                        <select 
                          value={filterCountry}
                          onChange={(e) => setFilterCountry(e.target.value)}
                          className="w-full text-xs p-2 border border-zinc-800 bg-[#0A0A0B] text-zinc-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="All">全球地区 (Any Countries)</option>
                          {countriesList.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>

                      {/* Filter 3: Followers scale */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">粉丝规模 (Followers)</label>
                        <select 
                          value={filterFollowers}
                          onChange={(e) => setFilterFollowers(e.target.value as any)}
                          className="w-full text-xs p-2 border border-zinc-800 bg-[#0A0A0B] text-zinc-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="All">任意等级（不限）</option>
                          <option value="100K-500K">100K - 500K (腰部达人)</option>
                          <option value="500K-1M">500K - 1M (头部达人)</option>
                          <option value="1M+">1M+ (巨量级头部) </option>
                        </select>
                      </div>

                      {/* Filter 4: Status */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">合作履约状态 (State)</label>
                        <select 
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value as any)}
                          className="w-full text-xs p-2 border border-zinc-800 bg-[#0A0A0B] text-zinc-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="All">全部合作状态</option>
                          <option value="已合作">已合作 (Collaborated)</option>
                          <option value="已报价未合作">已报价未合作</option>
                          <option value="沟通中">沟通中 (Negotiating)</option>
                          <option value="待开发">待开发 (Developable)</option>
                          <option value="不合作">不合作黑名单</option>
                        </select>
                      </div>

                      {/* Filter 5: Engagement Rate */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">互动率 ER 门槛 (&gt; %)</label>
                        <select 
                          value={filterER}
                          onChange={(e) => setFilterER(Number(e.target.value))}
                          className="w-full text-xs p-2 border border-zinc-800 bg-[#0A0A0B] text-zinc-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="0">无互动率要求 (Any ER%)</option>
                          <option value="1.5">&gt; 1.5% 互动率</option>
                          <option value="3">&gt; 3.0% 互动率</option>
                          <option value="5">&gt; 5.0% 互动率</option>
                        </select>
                      </div>

                      {/* Buttons Action filters */}
                      <div className="md:col-span-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-xs">
                        <span className="text-zinc-500">结合上述多重条件和顶部热词可得到精准达人列表。</span>
                        <button
                          type="button"
                          onClick={handleClearAllFilters}
                          className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 border border-zinc-800 hover:bg-zinc-800 px-2 py-1 rounded cursor-pointer transition"
                        >
                          <X size={12} /> 一键清空所有分类过滤
                        </button>
                      </div>

                    </motion.div>
                  )}

                </div>


                {/* DATABASE HEADER CONTROL BAR (Results count with Sort option) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-zinc-400 font-medium">
                    找到符合过滤条件的达人: <strong className="text-blue-400 font-bold">{filteredInfluencers.length}</strong> 位 / 库内总计 {totalCount} 名
                  </div>

                  {/* SORT BY BLOCK */}
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-zinc-500 flex items-center gap-1">
                      <ArrowUpDown size={14} /> 排序方式 (Sort By):
                    </span>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className="border border-zinc-800 bg-zinc-900 text-xs py-1 px-2 rounded-lg font-medium focus:outline-none text-zinc-300 cursor-pointer"
                    >
                      <option value="recent">库内最近更新 (Recent)</option>
                      <option value="followers">最高粉丝量优先 (Followers)</option>
                      <option value="er">最高互动率优先 (ER%)</option>
                      <option value="rateCard">标准报价高低 (Rate Card)</option>
                      <option value="dealPrice">实投底价由低到高 (Partner Price)</option>
                      <option value="name">姓名拼音字母 (A-Z Name)</option>
                    </select>
                  </div>
                </div>


                {/* DATABASE LISTING CARDS */}
                {filteredInfluencers.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-16 text-center space-y-3">
                    <p className="text-zinc-400 text-sm">💡 没有找到完美匹配相关过滤条件的达人信息。</p>
                    <button
                      onClick={handleClearAllFilters}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      重置所有过滤器
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInfluencers.map((inf) => {
                      // Calculate peak followers count among platforms to show on card
                      const followersArray = [inf.youtube?.followers || 0, inf.instagram?.followers || 0, inf.tiktok?.followers || 0];
                      const maxFollowers = Math.max(...followersArray);

                      // Calculate peak ER%
                      const erArray = [inf.youtube?.er || 0, inf.instagram?.er || 0, inf.tiktok?.er || 0];
                      const maxEr = Math.max(...erArray);

                      return (
                        <div
                          key={inf.id}
                          onClick={() => setSelectedInfluencer(inf)}
                          className="bg-zinc-900 rounded-3xl border border-zinc-800/80 hover:border-zinc-750 shadow-sm hover:shadow-md hover:shadow-zinc-950/25 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
                        >
                          
                          {/* Inner Information Container */}
                          <div className="p-6 space-y-4">
                            
                            {/* Card Top Line */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={inf.avatarUrl} 
                                  alt={inf.name}
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-12 rounded-full object-cover border border-zinc-805 border-zinc-800 bg-zinc-950"
                                />
                                <div className="truncate max-w-[150px]">
                                  <h3 className="font-bold text-zinc-100 text-md truncate group-hover:text-blue-400 transition">
                                    {inf.name}
                                  </h3>
                                  <p className="text-[10px] text-zinc-500 font-medium truncate">
                                    {inf.city ? `${inf.city}, ` : ""}{inf.country}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col items-end space-y-1">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                  inf.status === "已合作" 
                                    ? "bg-emerald-950/40 text-emerald-400 font-bold border border-emerald-900/30" 
                                    : inf.status === "已报价未合作" 
                                      ? "bg-amber-950/40 text-amber-400 font-bold border border-amber-900/30" 
                                      : inf.status === "沟通中" 
                                        ? "bg-blue-950/40 text-blue-400 font-bold border border-blue-900/30"
                                        : inf.status === "待开发" 
                                          ? "bg-zinc-800 text-zinc-300" 
                                          : "bg-red-950/40 text-red-500 border border-red-900/30"
                                }`}>
                                  {inf.status}
                                </span>
                              </div>
                            </div>

                            {/* Core Performance KPI indicators */}
                            <div className="grid grid-cols-2 gap-2 text-center py-2 bg-[#0A0A0B] rounded-2xl border border-zinc-800/40">
                              <div>
                                <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wide">最大粉丝数</span>
                                <span className="text-sm font-extrabold text-[#F4F4F5]">{formatCompactNumber(maxFollowers)}</span>
                              </div>
                              <div>
                                <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wide">最高互动率</span>
                                <span className="text-sm font-extrabold text-[#F4F4F5]">{maxEr}%</span>
                              </div>
                            </div>

                            {/* Platform indicators with mini icons */}
                            <div className="flex items-center space-x-3 text-xs text-zinc-400 border-b border-zinc-850 pb-2.5">
                              {inf.youtube?.profileUrl && (
                                <span className="flex items-center gap-0.5" title="开设 YouTube 频道">
                                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                  YT: <strong className="text-zinc-200 font-bold">{formatCompactNumber(inf.youtube.followers)}</strong>
                                </span>
                              )}
                              {inf.instagram?.profileUrl && (
                                <span className="flex items-center gap-0.5" title="开设 Instagram 账号">
                                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                                  IG: <strong className="text-zinc-200 font-bold">{formatCompactNumber(inf.instagram.followers)}</strong>
                                </span>
                              )}
                              {inf.tiktok?.profileUrl && (
                                <span className="flex items-center gap-0.5" title="开设 TikTok 渠道">
                                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                  TK: <strong className="text-zinc-200 font-bold">{formatCompactNumber(inf.tiktok.followers)}</strong>
                                </span>
                              )}
                            </div>

                            {/* Cooperation Records block (Dynamic Display on Dashboard Card if they exist) */}
                            {coopRecords[inf.id] && coopRecords[inf.id].length > 0 && (
                              <div className="bg-[#0D0D10] p-3 rounded-2xl border border-zinc-800/50 space-y-2 select-none">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1">
                                    <CheckCircle size={10} className="text-emerald-500" />
                                    合作案例 ({coopRecords[inf.id].length})
                                  </span>
                                </div>
                                <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-0.5 custom-scrollbar">
                                  {coopRecords[inf.id].map((rec) => (
                                    <div key={rec.id} className="text-[10px] bg-[#121215]/90 p-2 rounded-xl border border-zinc-850/80 flex items-center justify-between gap-1.5">
                                      <div className="min-w-0 flex-1">
                                        <span className="font-bold text-zinc-200 block truncate leading-tight" title={`${rec.brandName} - ${rec.projectName}`}>
                                          {rec.brandName} - {rec.projectName}
                                        </span>
                                        <span className="text-[9px] text-zinc-500 block truncate mt-0.5">
                                          {rec.date} • {rec.platform}
                                        </span>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <span className="text-[10px] font-bold text-emerald-400 block">
                                          {formatCurrency(rec.dealPrice)}
                                        </span>
                                        <span className="text-[9px] text-zinc-500 block">
                                          播放: {formatCompactNumber(rec.views)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Tags list (Categorised shown combined or clean) */}
                            <div className="flex flex-wrap gap-1 min-h-[50px] items-start">
                              {/* Categories (品类) */}
                              {inf.categories?.slice(0, 2).map(c => (
                                <span key={c} className="px-2.5 py-1 text-[11px] font-semibold bg-teal-950/30 text-teal-400 rounded border border-teal-900/30">
                                  #{c}
                                </span>
                              ))}
                              {/* Scenarios (场景) */}
                              {inf.scenarios?.slice(0, 2).map(s => (
                                <span key={s} className="px-2.5 py-1 text-[11px] font-semibold bg-sky-950/30 text-sky-400 rounded border border-sky-900/30">
                                  #{s}
                                </span>
                              ))}
                              {/* Personas (人设) */}
                              {inf.personas?.slice(0,1).map(p => (
                                <span key={p} className="px-2.5 py-1 text-[11px] font-semibold bg-violet-950/30 text-violet-400 rounded border border-violet-900/30">
                                  {p}
                                </span>
                              ))}
                              {(((inf.categories?.length || 0) + (inf.scenarios?.length || 0) + (inf.personas?.length || 0)) > 5) && (
                                <span className="text-[9px] text-zinc-500 self-center font-medium">
                                  +{((inf.categories?.length || 0) + (inf.scenarios?.length || 0) + (inf.personas?.length || 0)) - 5}
                                </span>
                              )}
                            </div>

                          </div>

                          {/* Card bottom footer block */}
                          <div className="px-6 py-3.5 border-t border-zinc-800 bg-[#0F0F11]/90 flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-400">
                             实际低价: <strong className="text-blue-400 font-extrabold text-sm ml-0.5">{formatCurrency(inf.dealPrice)}</strong>
                            </span>
                            
                            <div className="flex items-center space-x-1.5">
                              {/* Edit / Trash actions ONLY if Admin */}
                              {userRole === "Admin" && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingInfluencer(inf);
                                      setIsInfluencerModalOpen(true);
                                    }}
                                    className="p-1 px-2 text-[10px] text-zinc-300 border border-zinc-800 hover:border-zinc-700 bg-zinc-805 bg-zinc-800 hover:bg-zinc-750 rounded-lg font-semibold flex items-center transition cursor-pointer"
                                  >
                                    编辑
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteInfluencer(inf.id, e)}
                                    className="p-1.5 text-rose-450 text-rose-450 text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 rounded-lg transition border border-rose-900/40 cursor-pointer"
                                    title="删除达人"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}
                              
                              <span className="text-[10px] text-blue-400 font-bold group-hover:translate-x-1 transition duration-150 flex items-center">
                                详情 <ChevronRight size={12} />
                              </span>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>
        )}

      </main>

      {/* 4. FOOTER CREDITS */}
      <footer className="w-full bg-[#0F0F11] border-t border-zinc-800 py-6 px-6 text-center text-xs text-zinc-500 font-medium mt-auto animate-in fade-in">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Shylight Atlas © 2026. Built internally for Agency campaign efficiency optimizations.</p>
          <p className="flex items-center gap-1.5 justify-center">
            <Shield size={12} className="text-zinc-500" />
            <span>Authenticated Data Storage via Firestore Enterprise Edition</span>
          </p>
        </div>
      </footer>

      {/* Influencer Creation/Modification Modal */}
      <CreateEditInfluencerModal
        isOpen={isInfluencerModalOpen}
        onClose={() => setIsInfluencerModalOpen(false)}
        influencer={editingInfluencer}
        onSave={handleSaveInfluencer}
        customTags={customTags}
        onAddCustomTagGlobal={handleAddCustomTagGlobal}
        onDeleteCustomTagGlobal={handleDeleteCustomTagGlobal}
      />

      {/* Dynamic Tags Management Modal Overlay */}
      <ManageTagsModal
        isOpen={isManageTagsOpen}
        onClose={() => setIsManageTagsOpen(false)}
        initialType={manageTagsType}
        customTags={customTags}
        onAddCustomTagGlobal={handleAddCustomTagGlobal}
        onDeleteCustomTagGlobal={handleDeleteCustomTagGlobal}
      />



      {/* Excel Sheet Parsing Import Trigger Dialog Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={() => {
          setIsExcelModalOpen(false);
          loadDatabase(); // Reload dataset when rows successfully enter the database
        }}
      />

      {/* Quick Add Record Modal Overlay for Dashboard */}
      {isCoopRecordModalOpen && coopRecordInfluencerId && (
        <AddEditRecordModal
          isOpen={isCoopRecordModalOpen}
          onClose={() => {
            setIsCoopRecordModalOpen(false);
            setCoopRecordInfluencerId(null);
          }}
          record={null}
          influencerId={coopRecordInfluencerId}
          onSave={handleSaveCoopRecordFromCard}
        />
      )}

    </div>
  );
}
