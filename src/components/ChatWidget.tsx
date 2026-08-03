'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, HelpCircle, Loader2, Bot } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your BizBoost AI Advisor. Ask me anything about technology stack changes, website security & SSL certificates, or optimizing your offline/online marketing budget for Indian SMBs!"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestions = [
    { label: '🔒 Website is unsecure/blocked', query: 'My website looks unsecure and is getting blocked. What is the issue, and where can I buy SSL certificates from? Rank the cheapest and most trusted options.' },
    { label: '💻 MERN vs other tech stacks', query: 'If MERN stack is suggested and I want to use another stack, how and what will change?' },
    { label: '📣 Pamphlets vs Online reels', query: 'If I spend ₹5000k (or a high budget) for offline marketing pamphlets, will it be beneficial? Or should I invest in online marketing (shoot reels, content creation, social media)?' }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, loading, isOpen])

  async function handleSend(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat window */}
      {isOpen && (
        <div className="bg-white/95 backdrop-blur border border-gray-100 shadow-2xl rounded-2xl w-[380px] max-w-[calc(100vw-2rem)] h-[540px] flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-brand-500 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-none">BizBoost AI Advisor</h3>
                <span className="text-[10px] opacity-80">Online · Ready to help</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-500 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-brand-500" />
                  <span className="text-xs text-gray-400">BizBoost AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (only shown when not loading and user hasn't sent many messages yet) */}
          {!loading && messages.length <= 2 && (
            <div className="p-3 bg-white border-t border-gray-100 space-y-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1">Suggested Topics</p>
              <div className="flex flex-col gap-1.5">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.query)}
                    className="text-left text-xs bg-gray-50 hover:bg-brand-50 border border-gray-200 hover:border-brand-200 text-gray-700 hover:text-brand-700 px-3 py-2 rounded-xl transition-all duration-200 font-medium"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend(input)
            }}
            className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Ask anything about technology, SSL, marketing..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none text-gray-900 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  )
}
