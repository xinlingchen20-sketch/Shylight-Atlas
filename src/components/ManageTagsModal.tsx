import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Layers, Globe, Plus, Trash2, Tag, ShieldAlert } from "lucide-react";
import { PRESET_CATEGORIES, PRESET_SCENARIOS } from "../initialData";

interface ManageTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType: "categories" | "scenarios";
  customTags: { id: string; type: string; value: string }[];
  onAddCustomTagGlobal: (type: string, value: string) => Promise<void>;
  onDeleteCustomTagGlobal: (id: string) => Promise<void>;
}

export default function ManageTagsModal({
  isOpen,
  onClose,
  initialType,
  customTags,
  onAddCustomTagGlobal,
  onDeleteCustomTagGlobal
}: ManageTagsModalProps) {
  const [activeTab, setActiveTab] = useState<"categories" | "scenarios">(initialType);
  const [newTagVal, setNewTagVal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync activeTab when initialType changes and modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialType);
      setNewTagVal("");
      setErrorMsg(null);
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  // Decide current list
  const presets = activeTab === "categories" ? PRESET_CATEGORIES : PRESET_SCENARIOS;
  const customs = customTags.filter((t) => t.type === activeTab);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWord = newTagVal.trim();
    if (!cleanWord) return;

    // Check duplicates
    const isPresetDup = presets.some((p) => p.toLowerCase() === cleanWord.toLowerCase());
    const isCustomDup = customs.some((c) => c.value.toLowerCase() === cleanWord.toLowerCase());

    if (isPresetDup || isCustomDup) {
      setErrorMsg(`标签 "${cleanWord}" 已存在，不可重复添加！`);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onAddCustomTagGlobal(activeTab, cleanWord);
      setNewTagVal("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("创建自定义标签失败，请重试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      setErrorMsg(null);
      await onDeleteCustomTagGlobal(id);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("删除自定义标签失败，请重试。");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Background overlay click-off */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-[#131316] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative z-10 max-h-[85vh] flex flex-col"
      >
        {/* Banner header */}
        <div className="bg-gradient-to-r from-blue-700/10 via-zinc-900/10 to-transparent p-6 pb-4 border-b border-zinc-900 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/15 text-blue-400 border border-blue-500/20 rounded-xl shrink-0">
              <Tag className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 font-sans flex items-center gap-2">
                标签与维度管理控制台
                <span className="text-[10px] bg-blue-950/40 border border-blue-900/30 text-blue-300 font-bold px-1.5 py-0.2 rounded">
                  云端持久化
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">配置全站通用的品类热词及投放应用场景标签</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 bg-zinc-900 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selection Row */}
        <div className="flex border-b border-zinc-900 bg-zinc-950/40 p-2 gap-1 shrink-0">
          <button
            onClick={() => {
              setActiveTab("categories");
              setNewTagVal("");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "categories"
                ? "bg-teal-600/15 text-teal-400 border border-teal-800/40"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <Layers size={13} />
            <span>品类常设热词 ({presets.length + customs.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("scenarios");
              setNewTagVal("");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "scenarios"
                ? "bg-sky-600/15 text-sky-400 border border-sky-800/40"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <Globe size={13} />
            <span>应用/投放场景 ({presets.length + customs.length})</span>
          </button>
        </div>

        {/* Scrollable Form & tags area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Quick Info text explaining tag mechanics */}
          <div className="bg-[#18181C] border border-zinc-900 rounded-xl p-3 text-[11px] text-zinc-400 leading-relaxed shrink-0">
            👋 自定义添加的标签将会<strong>立即渲染到全站过滤条件极简云端中</strong>，即便当前暂无对应的绑定达人也能够常驻展示，方便业务在新建博主时一键拉取选用，避免每次重复录入。
          </div>

          {/* New Tag Form */}
          <form onSubmit={handleAddTag} className="flex gap-2">
            <input
              type="text"
              value={newTagVal}
              onChange={(e) => {
                setNewTagVal(e.target.value);
                setErrorMsg(null);
              }}
              placeholder={`新加自定义${activeTab === "categories" ? "品类" : "场景"}标签...`}
              maxLength={40}
              className="flex-1 text-xs px-3.5 py-2 border rounded-xl border-zinc-800 bg-[#0A0A0B] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newTagVal.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 transition cursor-pointer"
            >
              <Plus size={14} />
              <span>添加</span>
            </button>
          </form>

          {/* Feedback section */}
          {errorMsg && (
            <div className="p-2.5 bg-rose-500/5 border border-rose-500/15 text-rose-400 text-xs rounded-xl leading-relaxed shrink-0">
              {errorMsg}
            </div>
          )}

          {/* Label section title */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase font-mono">
              当前已被定义的全部池列表 ({presets.length + customs.length})
            </h4>

            {/* List items grids */}
            <div className="space-y-1.5 max-h-[30vh] overflow-y-auto pr-1">
              {/* Presets - System Lock */}
              {presets.map((tag) => (
                <div
                  key={"preset_" + tag}
                  className="flex items-center justify-between p-2.5 px-3.5 bg-zinc-900/30 border border-zinc-850 rounded-xl text-xs text-zinc-300"
                >
                  <span className="font-semibold">{tag}</span>
                  <span className="text-[10px] text-zinc-500 font-medium bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldAlert size={10} />
                    系统预设 (防误删锁)
                  </span>
                </div>
              ))}

              {/* Dynamic user added tags */}
              {customs.map((tagObj) => (
                <div
                  key={tagObj.id}
                  className="flex items-center justify-between p-2.5 px-3.5 bg-[#17171C]/40 border border-zinc-800/80 rounded-xl text-xs hover:border-zinc-700 hover:bg-[#1A1A22] transition-all group"
                >
                  <div>
                    <span className="text-zinc-100 font-semibold">{tagObj.value}</span>
                    <span className="ml-2 text-[9px] bg-blue-950/40 border border-blue-900/20 text-blue-300 px-1 rounded">
                      自定义保存
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTag(tagObj.id)}
                    className="p-1 px-2 rounded-lg text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/50 border border-rose-900/20 hover:border-rose-900/40 opacity-70 group-hover:opacity-100 transition duration-150 cursor-pointer flex items-center gap-1.5"
                    title="彻底永久从标签池中移除该项"
                  >
                    <Trash2 size={12} />
                    <span className="text-[10px]">删除</span>
                  </button>
                </div>
              ))}

              {presets.length === 0 && customs.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-6">暂无任何定义的可用标签池</p>
              )}
            </div>
          </div>

        </div>

        {/* Footer info lock actions detail */}
        <div className="bg-[#0b0b0d] p-4 px-6 border-t border-zinc-900 flex justify-end items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            完成关闭
          </button>
        </div>
      </motion.div>
    </div>
  );
}
