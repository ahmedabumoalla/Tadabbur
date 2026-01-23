"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // 👈 تم إضافة استيراد الصور
import { useRouter } from 'next/navigation';
import { Home, BookOpen, Hand, Activity, Settings, LogOut, MessageSquare, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userName, setUserName] = useState("جاري التحميل...");
  const [userPlan, setUserPlan] = useState("مشترك جديد");

  // جلب بيانات المستخدم عند تحميل الصفحة
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // جلب الاسم من جدول profiles
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

  // دالة تسجيل الخروج
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("tadabbur_user");
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6]" dir="rtl">
      {/* القائمة الجانبية - Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-200 hidden md:flex flex-col">
        
        {/* 👇 منطقة الشعار المعدلة */}
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
             <h1 className="text-2xl font-extrabold text-[#0A74DA] font-amiri"></h1>
          </Link>
        </div>
        {/* 👆 نهاية التعديل */}

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto font-tajawal">
          <NavItem href="/dashboard" icon={<Home size={20} />} label="الرئيسية" />
          <NavItem href="/dashboard/recitation" icon={<BookOpen size={20} />} label="المصحف الذكي" />
          <NavItem href="/dashboard/sign-language" icon={<Hand size={20} />} label="مترجم الإشارة" />
          <NavItem href="/dashboard/chatbot" icon={<MessageSquare size={20} />} label="المساعد الذكي" />
          <div className="pt-8">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">الإعدادات</p>
            <NavItem href="/dashboard/profile" icon={<Settings size={20} />} label="الملف الشخصي" />
          </div>
        </nav>

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

      {/* المحتوى الرئيسي */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-bold text-gray-800 font-tajawal">لوحة التحكم</h2>
          <div className="flex items-center gap-4 font-tajawal">
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0A74DA] border border-blue-200">
               <User size={20} />
             </div>
             <div className="text-sm">
               <p className="font-bold text-gray-900">{userName}</p>
               <p className="text-gray-500 text-xs">{userPlan}</p>
             </div>
          </div>
        </header>
        <div className="p-8 font-tajawal">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }: any) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-600 hover:bg-gray-50 hover:text-[#0A74DA]"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}