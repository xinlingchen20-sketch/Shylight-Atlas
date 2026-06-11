import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error catched in boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/50 border border-rose-900/40 text-rose-400 flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            
            <div className="space-y-2">
              <h2 className="text-base font-extrabold tracking-tight text-white">系统加载遇到意外中断</h2>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                React 运行时捕捉到了一个未处理的错误。这可能是由个别数据库缺失字段、配置微调或网络延迟引起的。
              </p>
            </div>
            
            {this.state.error && (
              <div className="p-4 bg-[#0A0A0B] border border-zinc-850 rounded-xl text-left text-xs font-mono text-rose-400 overflow-auto max-h-56 leading-relaxed">
                <div className="font-bold border-b border-zinc-905 border-zinc-800 pb-1.5 mb-1.5 text-rose-300">
                  [{this.state.error.name}] {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <pre className="mt-2 text-[10px] text-zinc-500 overflow-x-auto whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer active:scale-95 shadow-md shadow-blue-900/10"
              >
                刷新重试 (Reload)
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.clear();
                    window.location.reload();
                  } catch (_) {}
                }}
                className="border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                重置系统缓存 (Reset Cache)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
