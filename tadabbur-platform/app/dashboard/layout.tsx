"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Home, BookOpen, Hand, Activity, Settings, LogOut, MessageSquare, User, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // لتحديد الصفحة النشطة وإغلاق القائمة عند التنقل
  const [userName, setUserName] = useState("جاري التحميل...");
  const [userPlan, setUserPlan] = useState("مشترك جديد");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // حالة القائمة في الجوال

  // إغلاق القائمة تلقائياً عند الانتقال لصفحة أخرى في الجوال
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // جلب بيانات المستخدم
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, plan')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserName(profile.full_name || "مستخدم");
          setUserPlan(profile.plan === 'premium' ? 'مشترك ذهبي' : 'الباقة المجانية');
        }
      } else {
        router.push('/login');
      }
    };
    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("tadabbur_user");
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6]" dir="rtl">
      
      {/* === خلفية تعتيم للجوال (Overlay) === */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* === القائمة الجانبية (Sidebar) === */}
      <aside 
        className={`
          fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-200 transition-transform duration-300 ease-in-out
          flex flex-col 
          md:relative md:translate-x-0 
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} 
        `}
      >
        {/* زر إغلاق القائمة (يظهر فقط في الجوال داخل القائمة) */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute left-4 top-6 text-gray-400 hover:text-red-500 md:hidden"
        >
          <X size={24} />
        </button>

        {/* الشعار */}
        <div className="p-6 flex items-center justify-center border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3 group">
             <div className="relative w-10 h-10 group-hover:scale-110 transition duration-300">
                <Image 
                  src="/logo.png" 
                  alt="شعار تدبر" 
                  fill 
                  className="object-contain drop-shadow-sm" 
                  priority
                />
             </div>
             {/* يمكنك إضافة اسم المنصة هنا إذا أردت */}
          </Link>
        </div>

        {/* الروابط */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto font-tajawal">
          <NavItem href="/dashboard" icon={<Home size={20} />} label="الرئيسية" active={pathname === '/dashboard'} />
          <NavItem href="/dashboard/recitation" icon={<BookOpen size={20} />} label="المصحف الذكي" active={pathname === '/dashboard/recitation'} />
          <NavItem href="/dashboard/sign-language" icon={<Hand size={20} />} label="مترجم الإشارة" active={pathname === '/dashboard/sign-language'} />
          <NavItem href="/dashboard/chatbot" icon={<MessageSquare size={20} />} label="المساعد الذكي" active={pathname === '/dashboard/chatbot'} />
          <div className="pt-8">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">الإعدادات</p>
            <NavItem href="/dashboard/profile" icon={<Settings size={20} />} label="الملف الشخصي" active={pathname === '/dashboard/profile'} />
          </div>
        </nav>

        {/* زر الخروج */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-600 hover:bg-red-50 w-full p-3 rounded-xl transition-colors font-tajawal"
          >
            <LogOut size={20} />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* === المحتوى الرئيسي === */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* الشريط العلوي (Header) */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          
          {/* القسم الأيمن: زر القائمة (للجوال) + العنوان */}
          <div className="flex items-center gap-3">
            {/* زر فتح القائمة للجوال فقط */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
            >
              <Menu size={24} />
            </button>
            
            <h2 className="text-xl font-bold text-gray-800 font-tajawal truncate">لوحة التحكم</h2>
          </div>

          {/* القسم الأيسر: معلومات المستخدم */}
          <div className="flex items-center gap-4 font-tajawal">
             <div className="hidden md:block text-left"> {/* إخفاء التفاصيل النصية في الجوال الضيق جداً */}
               <p className="font-bold text-gray-900 text-sm">{userName}</p>
               <p className="text-gray-500 text-[10px]">{userPlan}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0A74DA] border border-blue-200 shrink-0">
               <User size={20} />
             </div>
          </div>
        </header>

        {/* منطقة المحتوى المتغير (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 font-tajawal scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
}

// مكون الرابط المحسن (يقبل active prop لتمييز الصفحة الحالية)
function NavItem({ href, icon, label, active }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-blue-50 text-[#0A74DA] font-bold shadow-sm' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-[#0A74DA] font-medium'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}