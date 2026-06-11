import React, { useState } from "react";
import { 
  auth, 
  googleProvider 
} from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { motion } from "motion/react";
import { Shield, Mail, Lock, LogIn, X, Compass, AlertCircle, Sparkles, Check } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setErrorMsg("请输入电子邮箱账户。");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setErrorMsg("出于安全考虑，密码长度必须至少为 6 位字符。");
      setLoading(false);
      return;
    }

    try {
      if (activeTab === "register") {
        // Create user
        const credential = await createUserWithEmailAndPassword(auth, emailTrimmed, password);
        // Optionally update display name
        if (displayName.trim()) {
          await updateProfile(credential.user, {
            displayName: displayName.trim()
          });
        }
        setSuccessMsg("🎉 账号注册成功！正在为您登入...");
        setTimeout(() => {
          setLoading(false);
          onSuccess();
          onClose();
        }, 1500);
      } else {
        // Sign in user
        await signInWithEmailAndPassword(auth, emailTrimmed, password);
        setSuccessMsg("✓ 身份验证成功，正在进入管理员空间...");
        setTimeout(() => {
          setLoading(false);
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error("Firebase auth error details:", err);
      let friendlyError = err.message;

      // Map firebase auth code to friendly Chinese messages
      if (err.code === "auth/invalid-email") {
        friendlyError = "邮箱地址格式不正确，请输入有效的 Email 地址。";
      } else if (err.code === "auth/user-not-found") {
        friendlyError = "该邮箱尚未注册账户，请先切换到「账户注册」页面。";
      } else if (err.code === "auth/wrong-password") {
        friendlyError = "您输入的登录密码有误，请重新输入。";
      } else if (err.code === "auth/email-already-in-use") {
        friendlyError = "该邮箱已被注册。若您已经有账号，请切换到「账户登录」页面。";
      } else if (err.code === "auth/operation-not-allowed" || err.message?.includes("CONFIGURATION_NOT_FOUND")) {
        friendlyError = "由于您是首次注册：Firebase 项目管理员需要前往 Firebase 控制台的 [Authentication] -> [Sign-in method] 栏目中，手动启用「电子邮件/密码」登录提供程序。";
      } else if (err.code === "auth/weak-password") {
        friendlyError = "注册密码强度较弱，最少需要 6 位字符。";
      } else if (err.code === "auth/invalid-credential") {
        friendlyError = "凭证验证失败，请确认邮箱和密码是否匹配。";
      }

      setErrorMsg(friendlyError);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessMsg("✓ 谷歌授权成功！");
      setTimeout(() => {
        setLoading(false);
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("谷歌登录失败: " + (err.message || "登录窗口已关闭。"));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#000000]/80 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Auth dialog body */}
      <motion.div 
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative z-10"
        id="auth-modal-dialog"
      >
        
        {/* Header decoration banner */}
        <div className="bg-gradient-to-r from-blue-700/20 via-indigo-600/10 to-transparent p-6 pb-4 border-b border-zinc-900 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/15 rounded-xl border border-blue-500/20 shrink-0">
              <Shield className="text-blue-400 size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5 font-sans">
                管理员空间验证 
                <span className="text-[10px] font-normal text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded">Admin Required</span>
              </h2>
              <p className="text-xs text-zinc-450 text-zinc-400 mt-1">若要进入编辑、录入和删除等写操作，请先登录</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Custom functional warning/tip for first-time firebase configuration */}
          <div className="bg-amber-500/5 hover:bg-amber-500/10 transition-colors border border-amber-500/15 rounded-xl p-3 text-[11px] leading-relaxed text-amber-300 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-400" />
            <div>
              <strong className="block mb-0.5">💡 重温开发与部署提示:</strong>
              若初次使用邮箱模式遇到配置不可用错误，需在 <strong>Firebase Console</strong> 的「Authentication」服务中启用「电子邮件/密码」作为登录源。
            </div>
          </div>

          {/* Dual sub-tab navigation */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900 text-xs">
            <button
              onClick={() => {
                setActiveTab("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-center font-bold tracking-wide rounded-lg transition-all cursor-pointer ${
                activeTab === "login" 
                  ? "bg-zinc-805 bg-zinc-800 text-zinc-100 shadow-sm" 
                  : "text-zinc-450 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              账户密码登录
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-center font-bold tracking-wide rounded-lg transition-all cursor-pointer ${
                activeTab === "register" 
                  ? "bg-zinc-805 bg-zinc-800 text-zinc-100 shadow-sm" 
                  : "text-zinc-450 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              新管理员注册
            </button>
          </div>

          {/* Dynamic Forms */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {activeTab === "register" && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">您的昵称 / 姓名</label>
                <div className="relative">
                  <Compass className="absolute left-3 top-2.5 size-4 text-zinc-650 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="例如: 商务经理"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 transition-all font-sans"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">邮箱 (EMAIL)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-zinc-650 text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="admin@shylight.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 transition-all font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">安全密码 (PASSWORD)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-zinc-650 text-zinc-500 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="至少 6 位字符密码"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10 transition-all font-sans"
                />
              </div>
            </div>

            {/* Error alerts */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-500/5 border border-rose-500/20 text-rose-405 text-rose-400 rounded-xl text-xs leading-normal flex items-start gap-1.5 font-sans"
              >
                <div className="shrink-0 text-rose-400 mt-0.5">⚠️</div>
                <span className="flex-1">{errorMsg}</span>
              </motion.div>
            )}

            {/* Success alerts */}
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-500/5 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs leading-normal flex items-start gap-1.5 font-sans"
              >
                <Check className="shrink-0 size-4 text-emerald-400 mt-0.5" />
                <span className="flex-1">{successMsg}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[99%] text-white py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md shadow-blue-900/15 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
              ) : activeTab === "register" ? (
                <>
                  <Sparkles size={13} />
                  立即注册为管理员
                </>
              ) : (
                <>
                  <LogIn size={13} />
                  登 录 系 统
                </>
              )}
            </button>
          </form>

          {/* Visual Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-900" />
            <span className="flex-shrink mx-4 text-zinc-650 text-zinc-500 text-[10px] uppercase font-mono tracking-widest">或者使用第三方</span>
            <div className="flex-grow border-t border-zinc-900" />
          </div>

          {/* Dual Google Login Choice */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-zinc-850 active:scale-[99%] text-zinc-300 border border-zinc-800 rounded-xl py-2.5 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.29 0-5.97-2.73-5.97-6s2.68-6 5.97-6c1.47 0 2.815.543 3.86 1.438l2.36-2.3C16.96 3.73 14.76 3 12.24 3c-4.965 0-9 4.035-9 9s4.035 9 9 9c5.215 0 8.66-3.665 8.66-8.8 0-.6-.055-1.16-.16-1.685H12.24z"/>
            </svg>
            <span>使用 Google 谷歌账号登录</span>
          </button>
        </div>

        {/* Guest fallback banner */}
        <div className="bg-[#0b0b0d] border-t border-zinc-900 py-3.5 px-6 flex items-center justify-between text-[11px]">
          <span className="text-zinc-500">不打算登录？仍可浏览全部达人</span>
          <button 
            type="button"
            onClick={onClose}
            className="text-blue-400 font-bold hover:text-blue-300 transition-colors cursor-pointer"
          >
            以游客浏览 ➜
          </button>
        </div>

      </motion.div>
    </div>
  );
}
