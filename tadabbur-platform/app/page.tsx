"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, Mic, Sparkles, User, LayoutDashboard, 
  ArrowRight, MessageSquare, Heart, 
  Globe, ShieldCheck, Activity 
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  
  // States
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Typewriter Effect Logic
  const textOptions = [
    "رحلة ذكية لحفظ القرآن الكريم",
    "مصحف تفاعلي يصحح تلاوتك",
    "تعلم لغة الإشارة للآيات",
    "مساعد ذكي يجيب عن تساؤلاتك"
  ];
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  // 1. تأثير الكتابة (Typewriter)
  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % textOptions.length;
      const fullText = textOptions[i];

      setText(isDeleting 
        ? fullText.substring(0, text.length - 1) 
        : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 30 : 150);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1500); // انتظر قبل الحذف
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed, textOptions]);

  // 2. مراقبة السكرول لتغيير شفافية الهيدر
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. التحقق من تسجيل الدخول (محاكاة)
  useEffect(() => {
    const storedUser = localStorage.getItem("tadabbur_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <main className="relative min-h-screen font-tajawal bg-[#0f172a] text-white selection:bg-[#0A74DA] selection:text-white" dir="rtl">
      
      {/* ================= HEADER ================= */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-lg py-3" : "bg-transparent py-6"
      }`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
             {/* ✅ تم تعديل هذا الجزء لعرض الشعار الحقيقي */}
             <div className="relative w-10 h-10 md:w-12 md:h-12 group-hover:scale-110 transition duration-300">
                <Image src="/logo.png" alt="شعار تدبر" fill className="object-contain drop-shadow-lg" />
             </div>
             <span className={`text-2xl md:text-3xl font-extrabold tracking-wide font-amiri ${isScrolled ? "text-[#0A74DA]" : "text-white"}`}>
              
             </span>
          </Link>

          {/* Nav & Auth */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className={`flex items-center gap-3 px-3 py-2 md:px-4 rounded-full border shadow-lg backdrop-blur-md transition-all ${
                isScrolled ? "bg-gray-100 border-gray-200" : "bg-white/10 border-white/20 text-white"
              }`}>
                <div className="w-8 h-8 bg-[#0A74DA] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-sm">
                  <span className={`block text-xs ${isScrolled ? "text-gray-500" : "text-white/60"}`}>مرحباً،</span>
                  <span className={`font-bold ${isScrolled ? "text-gray-800" : "text-white"}`}>{user.name}</span>
                </div>
                <Link href="/dashboard" className={`mr-2 flex items-center gap-2 text-sm font-bold hover:text-[#0A74DA] transition ${isScrolled ? "text-gray-700" : "text-white"}`}>
                  <LayoutDashboard size={18} />
                  <span className="hidden md:inline">لوحتي</span>
                </Link>
              </div>
            ) : (
              <Link href="/login" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition shadow-lg hover:-translate-y-1 ${
                isScrolled 
                  ? "bg-[#0A74DA] text-white hover:bg-blue-700" 
                  : "bg-white text-[#0A74DA] hover:bg-gray-100"
              }`}>
                <User size={18} />
                <span>دخول</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#0f172a] z-10" />
          <video 
            autoPlay loop muted playsInline 
            className="w-full h-full object-cover scale-105"
            poster="https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1920"
          >
            {/* تأكد من وجود الفيديو في مجلد public */}
            <source src="/quran-bg.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto mt-16 md:mt-0">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-blue-200 text-sm animate-fade-in-up">
            <Sparkles size={16} className="text-yellow-400" />
            <span>المنصة الأولى عالمياً لخدمة القرآن بالذكاء الاصطناعي</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl font-amiri min-h-[80px] md:min-h-[100px]">
            {text}
            <span className="animate-pulse text-[#0A74DA]">|</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
            منصة "تدبُّر" تجمع بين أصالة القرآن وتقنيات المستقبل. حفظ، تلاوة، وتفسير ميسر للجميع، بمن فيهم ذوي الهمم.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center w-full max-w-2xl mx-auto px-4">
            <button onClick={() => router.push('/dashboard/recitation')} className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#0A74DA] hover:bg-blue-600 text-white rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-900/50">
              <Mic size={24} />
              <span>ابدأ التلاوة الآن</span>
            </button>
            <button onClick={() => router.push('/dashboard/chatbot')} className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1">
              <MessageSquare size={24} />
              <span>تحدث مع المساعد</span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-white/50 hidden md:block">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* ================= FEATURES CARDS ================= */}
      <section className="py-24 relative z-20 -mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              title="المصحف الذكي" 
              desc="مصحف يستمع لتلاوتك ويصحح الأخطاء فورياً باستخدام تقنيات التعرف الصوتي المتقدمة."
              icon={<BookOpen size={40} className="text-[#0A74DA]" />}
              bg="bg-blue-500/10"
              link="/dashboard/recitation"
            />
            <FeatureCard 
              title="مترجم الإشارة" 
              desc="تقنية ثورية تحول الآيات وتفسيرها إلى لغة إشارة مرئية لخدمة فئة الصم والبكم."
              icon={<Activity size={40} className="text-green-400" />}
              bg="bg-green-500/10"
              link="/dashboard/sign"
            />
            <FeatureCard 
              title="المرشد القرآني AI" 
              desc="شات بوت متخصص يجيب على أسئلتك في التفسير وأسباب النزول بدقة عالية."
              icon={<Sparkles size={40} className="text-yellow-400" />}
              bg="bg-yellow-500/10"
              link="/dashboard/chatbot"
            />
          </div>
        </div>
      </section>

      {/* ================= STATS SECTION ================= */}
      <section className="py-20 bg-[#0f172a] border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white font-amiri">لماذا يختار الحفاظ منصة تدبُّر؟</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem number="+10K" label="مستخدم نشط" icon={<User />} />
            <StatItem number="98%" label="دقة التصحيح" icon={<ShieldCheck />} />
            <StatItem number="+50" label="دولة حول العالم" icon={<Globe />} />
            <StatItem number="+1M" label="آية تم تسميعها" icon={<Heart />} />
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-black py-12 border-t border-white/10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
             {/* ✅ تم تعديل الشعار في الفوتر أيضاً */}
             <div className="relative w-10 h-10 opacity-90">
                <Image src="/logo.png" alt="شعار تدبر" fill className="object-contain" />
             </div>
             <span className="text-2xl font-bold text-white font-amiri">منصة تدبُّر</span>
          </div>
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            رفيقك الرقمي في رحلة القرآن الكريم، نستخدم التقنية لخدمة كتاب الله وتيسير فهمه للجميع.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm">
            <a href="#" className="hover:text-[#0A74DA] transition">سياسة الخصوصية</a>
            <a href="#" className="hover:text-[#0A74DA] transition">شروط الاستخدام</a>
            <a href="#" className="hover:text-[#0A74DA] transition">اتصل بنا</a>
          </div>
          <p className="text-gray-600 text-xs mt-8">جميع الحقوق محفوظة © 2026 تدبُّر</p>
        </div>
      </footer>

    </main>
  );
}

// --- Sub Components ---

function FeatureCard({ title, desc, icon, bg, link }: any) {
  return (
    <Link href={link} className="group relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:border-[#0A74DA]/50 hover:shadow-2xl hover:shadow-[#0A74DA]/20 flex flex-col h-full">
      <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300 shadow-inner`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#0A74DA] transition font-amiri">{title}</h3>
      <p className="text-gray-400 leading-relaxed mb-8 flex-1 group-hover:text-gray-200 transition">{desc}</p>
      <div className="flex items-center gap-2 text-[#0A74DA] font-bold text-sm mt-auto">
        <span>جرب الآن</span>
        <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition" />
      </div>
    </Link>
  );
}

function StatItem({ number, label, icon }: any) {
  return (
    <div className="flex flex-col items-center p-4 rounded-2xl hover:bg-white/5 transition duration-300">
      <div className="text-[#0A74DA] mb-4 opacity-80 scale-125">{icon}</div>
      <h4 className="text-4xl md:text-5xl font-extrabold text-white mb-2 font-tajawal">{number}</h4>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
    </div>
  );
}