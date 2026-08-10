import React, { useState, useRef, useEffect } from "react"
import { MessageSquare, Send, X, Bot, Sparkles, AlertCircle } from "lucide-react"
import { apiService } from "../../apis/service"
import { useLanguage } from "../../context/LanguageContext"
import { extractApiError } from "../../apis/http"

type Message = {
  id: string
  role: "user" | "model"
  text: string
  timestamp: Date
}

let messageIdCounter = 0
const createMessage = (role: "user" | "model", text: string): Message => {
  messageIdCounter++
  return {
    id: `msg-${messageIdCounter}-${Date.now()}`,
    role,
    text,
    timestamp: new Date()
  }
}

export default function Chatbox() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const { language } = useLanguage()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isVi = language === "vi"

  // Suggestion questions based on Vietnamese/English language selection
  const suggestions = isVi ? [
    "Phân tích chi tiêu tháng này của tôi?",
    "Tôi đang có những ngân sách nào?",
    "Mục tiêu tiết kiệm của tôi như thế nào?",
    "Lời khuyên quản lý tài chính hôm nay?"
  ] : [
    "Analyze my spending this month?",
    "What are my current budgets?",
    "How are my savings goals doing?",
    "Give me financial advice today?"
  ]

  // Welcome messages
  const welcomeText = isVi 
    ? "Xin chào! Tôi là Trợ lý tài chính Cyber Vault AI. Tôi có thể truy cập dữ liệu ví của bạn để trả lời các câu hỏi về chi tiêu, ngân sách hay mục tiêu tiết kiệm. Hãy hỏi tôi bất cứ điều gì!"
    : "Hello! I am your Cyber Vault AI Financial Assistant. I can analyze your wallet data to answer questions about your transactions, budgets, or savings goals. How can I help you today?"

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      role: "model",
      text: welcomeText,
      timestamp: new Date()
    }
  ])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen, isLoading])

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return

    const userMessage = createMessage("user", textToSend)

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setErrorMsg(null)

    try {
      // Map frontend Message history to backend DTO ChatMessage structure
      // Format: { role: 'user' | 'model', text: string }
      const history = messages
        .filter(m => m.id !== "welcome") // Exclude welcome message
        .map(m => ({
          role: m.role,
          text: m.text
        }))

      const response = await apiService.chatWithAi(textToSend, history)
      
      const botMessage = createMessage("model", response.response)

      setMessages(prev => [...prev, botMessage])
    } catch (err) {
      console.error("AI Chat Error:", err)
      const errorText = extractApiError(err, isVi ? "Không thể kết nối với máy chủ AI." : "Failed to connect to AI server.")
      setErrorMsg(errorText)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend(input)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="glass-panel-strong mb-4 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-3xl border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] sm:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <Bot size={20} className="text-white" />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">Cyber Vault AI</h3>
                <span className="text-[10px] text-cyan-400 tracking-widest uppercase font-medium">{isVi ? "Trợ lý tài chính" : "Finance Assistant"}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-white/5 bg-white/5 p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto bg-slate-950/20 p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((msg) => {
              const isUser = msg.role === "user"
              return (
                <div key={msg.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-white/10 text-cyan-400">
                      <Bot size={14} />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser 
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-[0_4px_12px_rgba(6,182,212,0.15)]"
                      : "bg-slate-900/90 border border-white/10 text-slate-100 rounded-tl-none"
                  }`}>
                    {/* Render newlines correctly */}
                    {msg.text.split("\n").map((line, index) => (
                      <p key={index} className={line.trim() === "" ? "h-2" : "mb-1 last:mb-0"}>
                        {line}
                      </p>
                    ))}
                    <span className="mt-1 block text-[9px] text-slate-500 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Error Message */}
            {errorMsg && (
              <div className="flex gap-2 rounded-2xl border border-red-500/20 bg-red-950/20 p-4 text-xs text-red-300">
                <AlertCircle size={16} className="shrink-0" />
                <div className="flex-1">
                  <p>{errorMsg}</p>
                  {errorMsg.includes("api-key") && (
                    <p className="mt-1 font-mono text-[10px] text-red-400/80">
                      Properties path: server/src/main/resources/application.properties
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Loading / Typing indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-white/10 text-cyan-400">
                  <Bot size={14} />
                </div>
                <div className="max-w-[75%] rounded-2xl bg-slate-900/90 border border-white/10 px-4 py-3 text-sm rounded-tl-none">
                  <div className="flex items-center gap-1.5 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          {messages.length === 1 && !isLoading && (
            <div className="border-t border-white/5 bg-slate-950/40 px-4 py-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                <Sparkles size={10} className="text-cyan-400" />
                <span>{isVi ? "Gợi ý hỏi AI" : "Suggested questions"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(suggestion)}
                    className="rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200 text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Panel */}
          <div className="border-t border-white/10 bg-slate-950/80 p-4">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                placeholder={isVi ? "Nhập câu hỏi của bạn..." : "Ask me anything..."}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/60 py-3 pl-4 pr-12 text-sm text-slate-200 placeholder-slate-500 transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-50"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={isLoading || !input.trim()}
                className="absolute right-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 p-2 text-white transition hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.2)]"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition duration-300 hover:scale-115 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] cursor-pointer"
        aria-label="Mở chat AI"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  )
}
