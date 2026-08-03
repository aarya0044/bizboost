'use client'
import { useState, useRef, useEffect } from 'react'
import { PageShell, Card } from '@/components/ui/shared'
import { Send, Loader2, Bot, User, Trash2, ArrowRight } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Welcome to BizBoost AI Chat! I'm here to help you navigate tech stack choices, secure your website with the right SSL certificates, and plan high-ROI marketing strategies.\n\nHow can I help you boost your business today?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickStartTemplates = [
    {
      title: 'Fix "Connection Not Private"',
      desc: 'SSL certificate issues & cheap options ranked.',
      query: 'My website says "Not Secure" and is getting blocked by browsers. What is the issue, and where can I buy SSL certificates? Rank cheap and trusted options.'
    },
    {
      title: 'MERN vs Other Tech Stacks',
      desc: 'What changes if I switch to WordPress or Next.js?',
      query: 'If MERN stack is suggested for my business, can I use a different stack? How and what will change in terms of hosting, costs, and setup?'
    },
    {
      title: 'Pamphlets vs Online Reels',
      desc: 'Offline pamphlet spend vs hiring content creators.',
      query: 'Should I spend ₹5000 on printing offline pamphlets and flyers, or will it be better to invest in shooting Reels, content creation, and local social media reach?'
    },
    {
      title: 'Local Shop Digital Roadmap',
      desc: 'Step-by-step plan for local search and basic site.',
      query: 'I have a local brick-and-mortar store in India. Give me a step-by-step roadmap to build an online presence, list on maps, and get online customers.'
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

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

  function clearHistory() {
    if (confirm('Are you sure you want to clear this conversation history?')) {
      setMessages([
        {
          role: 'assistant',
          content: "Conversation cleared. How can I help you boost your business today?"
        }
      ])
    }
  }

  return (
    <PageShell active="chat">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">AI Business Assistant</h1>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">Ask your tech stack, marketing strategy, and security questions here.</p>
        </div>
        {messages.length > 1 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-750 rounded-xl text-xs font-semibold transition-all w-fit active:scale-95 shadow-sm"
          >
            <Trash2 size={13} /> Clear Chat
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-6 items-start animate-fade-in-up delay-100">
        {/* Sidebar templates */}
        <div className="md:col-span-1 space-y-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Common Questions</p>
          <div className="space-y-2">
            {quickStartTemplates.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item.query)}
                disabled={loading}
                className="w-full text-left bg-white border border-slate-200 hover:border-teal-500/25 hover:bg-teal-50/10 p-3.5 rounded-xl transition-all group disabled:opacity-55 shadow-sm"
              >
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-teal-700 flex items-center gap-1 transition-colors leading-tight">
                  {item.title} <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-teal-600" />
                </h4>
                <p className="text-[10px] text-slate-450 mt-1 leading-normal font-medium">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className="md:col-span-3 flex flex-col bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl h-[580px] overflow-hidden">
          {/* Header */}
          <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-150 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-md shadow-teal-500/5">
              <Bot size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-850 block tracking-tight">BizBoost AI Expert</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Tailored Guidance</span>
            </div>
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/20">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 flex-shrink-0 mt-0.5 animate-scale-in">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3.5 text-xs leading-relaxed shadow-sm animate-scale-in ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white rounded-tr-none font-semibold'
                      : 'bg-white border border-slate-200/60 text-slate-800 rounded-tl-none markdown-chat-bubble leading-relaxed'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 flex-shrink-0 mt-0.5 font-bold text-xs uppercase animate-scale-in">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3.5 justify-start">
                <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 flex-shrink-0 mt-0.5">
                  <Bot size={15} />
                </div>
                <div className="bg-white border border-slate-200/60 rounded-2xl rounded-tl-none px-4 py-3.5 shadow-sm flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                  <Loader2 size={13} className="animate-spin text-teal-600" />
                  Thinking about your business...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend(input)
            }}
            className="p-4 border-t border-slate-150 bg-slate-50/80 flex gap-3.5 items-center"
          >
            <input
              type="text"
              placeholder="Ask about SSL setup, pamphlets vs digital spend, stack switches, etc..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3.5 text-xs border border-slate-250 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:border-teal-500 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex items-center gap-1.5 px-5 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-xs transition-all active:scale-95 shadow-lg shadow-teal-500/10"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  )
}
