"use client";
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'أهلاً بك يا بطل القرآن 👋. أنا مساعدك الذكي في "تدبُّر". اسألني عن تفسير آية، أو اطلب جدولاً للحفظ، أو نصيحة لتثبيت الحفظ!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    
    // 1. إضافة رسالة المستخدم
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: userText }]);
    setLoading(true);

    try {
      // 2. إرسال الطلب للذكاء الاصطناعي
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      // ✅ التعديل هنا: استخدام data.reply بدلاً من data.response
      if (data.reply) {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          type: 'bot', 
          text: data.reply  // <--- تم التصحيح هنا
        }]);
      } else {
        console.error("No reply found in data:", data); // للمساعدة في اكتشاف الأخطاء
        throw new Error("No response");
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-tajawal">
      
      {/* منطقة الرسائل */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.type === 'bot' ? 'bg-[#0A74DA] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {msg.type === 'bot' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm leading-relaxed whitespace-pre-line ${
              msg.type === 'bot' 
                ? 'bg-white border border-gray-200 text-gray-800 rounded-tr-none' 
                : 'bg-[#0A74DA] text-white rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {/* مؤشر التحميل */}
        {loading && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#0A74DA] text-white flex items-center justify-center">
               <Bot size={20} />
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tr-none flex items-center gap-2">
              <Loader2 className="animate-spin text-[#0A74DA]" size={18} />
              <span className="text-sm text-gray-500">جاري الكتابة...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* منطقة الكتابة */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-4 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اسأل عن تفسير، جدول حفظ، أو نصيحة..."
          disabled={loading}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-4 focus:outline-none focus:border-[#0A74DA] focus:ring-4 focus:ring-[#0A74DA]/10 transition-all disabled:bg-gray-100 text-gray-900 placeholder-gray-400 bg-white"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="bg-[#0A74DA] text-white p-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}