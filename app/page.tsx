"use client";

import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import {
  Send,
  Download,
  FileText,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Store,
  ShoppingBag,
  TrendingUp,
  PackageCheck,
  Users,
  Trash2,
  BookOpen,
  ArrowDown,
  Building2,
  ShieldCheck,
  Clock,
  AlertCircle
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const PRESET_TOPICS = [
  {
    icon: Store,
    category: "門市與電商 OMO 整合",
    title: "實體門市客流下滑，如何導流至趣買購物線上？",
    prompt: "老闆您好！我們趣買購物的實體門市近期平日來客數下滑，請問如何透過線上線下整合（OMO）、社群以及門市專屬活動，把到店顧客引導註冊線上商城，並創造持續回購？",
  },
  {
    icon: PackageCheck,
    category: "訂單處理與出貨防錯",
    title: "電商促銷檔期單量暴增，如何優化揀貨出貨SOP防錯？",
    prompt: "老闆您好！趣買購物在大型促銷檔期（如雙11、年中慶）常會遇到訂單量瞬間放大3-5倍，倉庫揀貨容易漏件或庫存不同步，請問以大企業的SOP與中小企業靈活性，應如何改善防錯機制？",
  },
  {
    icon: TrendingUp,
    category: "網路行銷與廣告投報",
    title: "Meta / Google 廣告 ROAS 偏低，中小企業預算該如何突破？",
    prompt: "老闆您好！目前趣買購物的付費廣告投報率（ROAS）面臨瓶頸、獲客成本上升，在行銷預算有限的中小企業思維下，我們同仁應該如何重新梳理受眾標籤、行銷素材與漏斗轉換？",
  },
  {
    icon: Users,
    category: "組織與同仁協作機制",
    title: "如何設計門市與電商同仁的業績分潤，避免內部搶單？",
    prompt: "老闆您好！我們希望實體門市夥伴願意主動推薦客人下載或使用趣買購物線上商城，但門市同仁擔心業績被電商吸走。請問老闆在激勵制度與雙贏分潤上，有什麼好的做法可教導我們？",
  },
  {
    icon: ShieldCheck,
    category: "客戶服務與客訴危機化解",
    title: "遇到商品延遲出貨或破損客訴，如何轉化為忠實鐵粉？",
    prompt: "老闆您好！物流高峰時難免遇到物流延遲或外包裝壓損的顧客客訴，請問第一線客服同仁該如何安撫顧客情緒並進行標準化補償流程，甚至將客訴危機轉化為對趣買購物的品牌信任？",
  },
];

let globalIdCounter = 1;
function generateUniqueId(prefix: string): string {
  globalIdCounter += 1;
  return `${prefix}-${globalIdCounter}`;
}

function getFormattedTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: `### 同仁們好！我是趣買購物的營運顧問兼指導老闆 👔

歡迎來到**趣買購物內部營運與行銷決策智庫**。

無論是大企業講究的制度化流程、數據監控、風險控管，或是中小企業最看重的高投報、彈性應變與顧客溫度，只要是趣買購物在**網路行銷推廣**、**訂單物流揀包SOP**、**實體門市與線上整合**或**同仁績效協調**遇到的任何挑戰，我都隨時在這裡陪伴大家。

每次交流，我不僅會為大家提供精準可行的策略解答，更會深入剖析：
1. **【為何這樣做（Why）】**：建立老闆級商業全局觀
2. **【如何具體執行（How）】**：給出第一線同仁落地的 SOP 步驟
3. **【預期成果與指標（Result）】**：掌握衡量績效的關鍵數據

大家現在正在處理什麼棘手的狀況？隨時向我提出，我們一起把趣買購物越做越好！`,
      timestamp: "09:00",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<"md" | "txt">("md");
  const [showExportModal, setShowExportModal] = useState(false);
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = async (userPrompt?: string) => {
    const textToSend = userPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    setErrorMessage(null);
    const timeStr = getFormattedTime();

    const userMessage: Message = {
      id: generateUniqueId("user"),
      role: "user",
      content: textToSend.trim(),
      timestamp: timeStr,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!userPrompt) {
      setInput("");
    }
    setIsLoading(true);

    try {
      // Format history for the server API route
      const payloadMessages = newMessages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        content: msg.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "伺服器通訊錯誤");
      }

      const assistantMessage: Message = {
        id: generateUniqueId("ai"),
        role: "assistant",
        content: data.reply || "我已收到問題，但目前未獲得完整內容，請再試一次。",
        timestamp: getFormattedTime(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : "發生未知錯誤";
      setErrorMessage(errStr);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const formatted = messages
      .map((m) => `【${m.role === "assistant" ? "營運導師（老闆思維）" : "趣買同仁提問"}】(${m.timestamp})\n${m.content}\n\n${"=".repeat(40)}\n`)
      .join("\n");
    navigator.clipboard.writeText(formatted);
    setIsCopiedAll(true);
    setTimeout(() => setIsCopiedAll(false), 2000);
  };

  const handleDownload = (format: "md" | "txt") => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;
    const filename = `趣買購物_營運與行銷問答紀錄_${dateStr}.${format}`;

    let content = "";
    if (format === "md") {
      content = `# 趣買購物 營運決策與行銷指導問答紀錄\n\n`;
      content += `> 匯出時間：${now.toLocaleString("zh-TW")}\n`;
      content += `> 系統定位：結合大企業策略維度與中小企業落地實戰的老闆級顧問系統\n\n`;
      content += `---\n\n`;

      messages.forEach((m, idx) => {
        if (m.role === "user") {
          content += `### ❓ [提問 ${Math.ceil(idx / 2)}] 趣買同仁 (${m.timestamp})\n\n`;
          content += `${m.content}\n\n`;
        } else {
          content += `### 👔 [輔導回覆] 顧問老闆解題指導 (${m.timestamp})\n\n`;
          content += `${m.content}\n\n`;
          content += `---\n\n`;
        }
      });
    } else {
      content = `========================================================\n`;
      content += `       趣買購物 營運決策與行銷指導問答紀錄\n`;
      content += `  匯出日期：${now.toLocaleString("zh-TW")}\n`;
      content += `========================================================\n\n`;

      messages.forEach((m) => {
        const speaker = m.role === "assistant" ? "【顧問老闆指導】" : "【趣買同仁提問】";
        content += `${speaker} [${m.timestamp}]\n`;
        content += `${m.content}\n\n`;
        content += `--------------------------------------------------------\n\n`;
      });
    }

    const blob = new Blob([content], { type: format === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const handleResetChat = () => {
    if (messages.length <= 1 || window.confirm("確定要重啟新的諮詢會議嗎？建議先點擊「下載問答紀錄」留存目前的寶貴討論。")) {
      setMessages([
        {
          id: generateUniqueId("welcome"),
          role: "assistant",
          content: `### 新的諮詢已開始！同仁們好 👔\n\n我們已經為趣買購物準備好新的諮詢紀錄。請隨時提出您在網路行銷、電商訂單處置、實體門市營運或跨部門協調上遇到的實務問題，我會一步步陪大家梳理清晰！`,
          timestamp: getFormattedTime(),
        },
      ]);
      setErrorMessage(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Academic Header */}
      <header className="flex-none bg-slate-950 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 border border-blue-500/30 flex items-center justify-center text-white shadow-inner">
              <ShoppingBag className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-1.5">
                  趣買購物 <span className="text-blue-400 font-medium">營運與行銷決策室</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-950 text-blue-300 border border-blue-800/80">
                  <BookOpen className="w-3 h-3 mr-1" />
                  老闆思維・實戰教練
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                涵蓋大企業系統化戰略 × 中小企業靈活實戰｜網路行銷・訂單物流・虛實OMO
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Download Records Button (Core Requirement) */}
            <button
              id="btn-download-records"
              type="button"
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm border border-blue-400/30 cursor-pointer active:scale-95"
              title="匯出目前問答紀錄方便同仁留存複習"
            >
              <Download className="w-4 h-4" />
              <span>下載問答紀錄</span>
            </button>

            {/* Clear / New Session */}
            <button
              id="btn-reset-session"
              type="button"
              onClick={handleResetChat}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="開啟新議題諮詢"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">新諮詢</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        {/* Left Sidebar: Case Studies & Guidance Matrix (Desktop only) */}
        <aside className="hidden lg:flex flex-col w-80 bg-slate-950/80 border-r border-slate-800/90 p-4 overflow-y-auto">
          <div className="mb-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>輔導方針與教練思維</span>
            </div>
            <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold">1.</span>
                <p><strong className="text-slate-100">為何這樣做 (Why)</strong>：透析商業本質與企業毛利思維。</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold">2.</span>
                <p><strong className="text-slate-100">如何做 (How)</strong>：第一線同仁可直接落地的具體 SOP。</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold">3.</span>
                <p><strong className="text-slate-100">預期結果 (Result)</strong>：數據回饋指標與檢討修正基準。</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              趣買精選實戰議題
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {PRESET_TOPICS.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <button
                  key={idx}
                  id={`preset-topic-${idx}`}
                  type="button"
                  onClick={() => handleSubmit(item.prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 rounded-md bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-700/60 transition-all text-xs group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center space-x-1.5 text-blue-400 group-hover:text-blue-300 font-medium mb-1">
                    <IconComp className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{item.category}</span>
                  </div>
                  <p className="text-slate-300 group-hover:text-white line-clamp-2 leading-relaxed">
                    {item.title}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>對話紀錄可隨時匯出留存</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              導師在線輔導
            </span>
          </div>
        </aside>

        {/* Chat Main Area */}
        <main className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
          {/* Quick topic pills on mobile/tablet */}
          <div className="lg:hidden flex-none bg-slate-950 border-b border-slate-800 px-3 py-2 overflow-x-auto scrollbar-none flex space-x-2">
            {PRESET_TOPICS.slice(0, 4).map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSubmit(topic.prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-full flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                {topic.category}
              </button>
            ))}
          </div>

          {/* Messages Display Box */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {messages.map((message) => {
              const isAssistant = message.role === "assistant";
              return (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 sm:space-x-4 max-w-4xl mx-auto ${
                    isAssistant ? "justify-start" : "justify-end flex-row-reverse space-x-reverse"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-md ${
                      isAssistant
                        ? "bg-gradient-to-br from-blue-600 to-indigo-900 border border-blue-400/40 text-blue-100"
                        : "bg-slate-700 border border-slate-600 text-slate-200"
                    }`}
                  >
                    {isAssistant ? (
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
                    ) : (
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isAssistant ? "items-start" : "items-end"}`}>
                    <div className="flex items-center space-x-2 mb-1 px-1 text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">
                        {isAssistant ? "營運顧問（老闆思維）" : "趣買同仁"}
                      </span>
                      <span>・</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {message.timestamp}
                      </span>
                    </div>

                    <div
                      className={`relative rounded-xl px-4 py-3.5 sm:px-5 sm:py-4 text-sm shadow-sm transition-all ${
                        isAssistant
                          ? "bg-slate-950 text-slate-100 border border-slate-800 rounded-tl-sm"
                          : "bg-blue-700 text-white rounded-tr-sm border border-blue-600/60"
                      }`}
                    >
                      {/* Markdown Body */}
                      <div className="prose prose-invert prose-sm max-w-none break-words leading-relaxed space-y-3 prose-headings:text-slate-100 prose-headings:font-bold prose-h3:text-base prose-h4:text-sm prose-p:my-1.5 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:text-blue-300 prose-code:text-amber-300 prose-code:bg-slate-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-950/20 prose-blockquote:py-1 prose-blockquote:px-3">
                        <Markdown>{message.content}</Markdown>
                      </div>

                      {/* Tool bar for single message */}
                      {isAssistant && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                          <span className="text-[11px] text-slate-400 italic">
                            趣買購物同仁專屬輔導檔案
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(message.content, message.id)}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                            title="複製這段指導內容"
                          >
                            {copiedId === message.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">已複製</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>複製內容</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start space-x-3 sm:space-x-4 max-w-4xl mx-auto justify-start">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-900/60 border border-blue-500/40 flex items-center justify-center text-blue-200">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl rounded-tl-sm px-4 py-3.5 text-sm text-slate-300 max-w-md shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="font-medium text-blue-400">顧問正在梳理老闆思維與執行方案...</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    評估大企業體系化風控 × 中小企業實操效益，並生成 Why / How / Result 框架。
                  </p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {errorMessage && (
              <div className="max-w-4xl mx-auto p-3.5 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold">連線提醒：</span>
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="px-2 py-1 bg-rose-900 hover:bg-rose-800 rounded text-rose-100 border border-rose-700 cursor-pointer font-medium"
                >
                  重新嘗試
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Area */}
          <div className="flex-none bg-slate-950 border-t border-slate-800 p-3 sm:p-4">
            <div className="max-w-4xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="relative bg-slate-900 border border-slate-700 focus-within:border-blue-500 rounded-xl transition-all shadow-inner"
              >
                <textarea
                  id="chat-input-textarea"
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="請輸入趣買購物面臨的問題（如：網路業績、客訴處理、門市引流、庫存出貨SOP...）"
                  rows={2}
                  disabled={isLoading}
                  className="w-full bg-transparent px-4 pt-3 pb-12 text-sm text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
                />

                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span className="hidden sm:inline">Enter 發送，Shift + Enter 換行</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      id="btn-send-message"
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs sm:text-sm font-medium transition-all shadow cursor-pointer disabled:cursor-not-allowed active:scale-95"
                    >
                      <span>請益導師</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-2 text-center text-[11px] text-slate-400">
                趣買購物專用 AI 智庫・隨時留存學習筆記・大企業思維與中小企業落地實戰
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Export / Download Record Modal */}
      {showExportModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-semibold text-white">下載趣買購物問答紀錄</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              將目前的諮詢對話（共 {messages.length} 則問答）匯出，提供趣買購物團隊內部培訓、檢討會及複習策略使用。
            </p>

            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-300 block">選擇匯出格式：</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDownloadFormat("md")}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    downloadFormat === "md"
                      ? "bg-blue-950/70 border-blue-500 text-white ring-1 ring-blue-500"
                      : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="font-semibold text-xs text-blue-400 mb-0.5">Markdown (.md)</div>
                  <p className="text-[11px] text-slate-400">
                    具備排版標題、清單與粗體，適合 Notion、Obsidian 或 GitHub。
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDownloadFormat("txt")}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    downloadFormat === "txt"
                      ? "bg-blue-950/70 border-blue-500 text-white ring-1 ring-blue-500"
                      : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="font-semibold text-xs text-blue-400 mb-0.5">純文字檔案 (.txt)</div>
                  <p className="text-[11px] text-slate-400">
                    最簡潔的純文字紀錄，任何記事本或電腦皆可直接開啟。
                  </p>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {isCopiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">已複製全部紀錄</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>複製全部文字</span>
                  </>
                )}
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md cursor-pointer"
                >
                  取消
                </button>
                <button
                  id="btn-confirm-download"
                  type="button"
                  onClick={() => handleDownload(downloadFormat)}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  確認下載 ({downloadFormat === "md" ? ".md" : ".txt"})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
