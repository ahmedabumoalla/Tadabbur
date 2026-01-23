"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ArrowRight, Mail, Lock, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // استيراد عميل Supabase

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // 1. محاولة تسجيل الدخول عبر Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }

      // 2. جلب بيانات الملف الشخصي (للحصول على الاسم)
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, plan')
          .eq('id', data.user.id)
          .single();

        // 3. حفظ البيانات محلياً لتسريع عرض الداشبورد
        localStorage.setItem("tadabbur_user", JSON.stringify({
          id: data.user.id,
          name: profile?.full_name || "مستخدم",
          email: data.user.email,
          plan: profile?.plan || "free"
        }));

        // 4. التوجيه للداشبورد
        router.push("/dashboard");
      }

    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg(err.message || "حدث خطأ أثناء تسجيل الدخول");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-tajawal bg-white" dir="rtl">
      
      {/* ================= القسم الأيمن ================= */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0f172a] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0A74DA]/80 to-[#0f172a]/90 z-10" />
        <Image 
          src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1920" 
          alt="خلفية إسلامية" 
          fill
          className="object-cover opacity-50"
          priority
        />
        
        <div className="relative z-20 p-12 text-white text-center max-w-lg">
          <div className="mb-8 flex justify-center animate-fade-in-up">
             <div className="relative w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-white/20">
                <Image src="/logo.png" alt="شعار تدبر" fill className="object-contain p-3 drop-shadow-lg" />
             </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 font-amiri leading-tight">أهلاً بك في منصة تدبُّر</h1>
          <p className="text-xl text-blue-100 leading-relaxed font-light">
            سجل دخولك لإكمال رحلتك في حفظ وفهم القرآن الكريم باستخدام أحدث تقنيات الذكاء الاصطناعي.
          </p>
        </div>
        
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#0A74DA] rounded-full blur-3xl opacity-20 z-0"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500 rounded-full blur-3xl opacity-10 z-0"></div>
      </div>

      {/* ================= القسم الأيسر: النموذج ================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-white relative">
        
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-[#0A74DA] transition group text-sm font-bold">
          <ArrowRight size={18} className="rotate-180 group-hover:-translate-x-1 transition" />
          العودة للرئيسية
        </Link>

        <div className="w-full max-w-md">
          <div className="lg:hidden flex flex-col items-center mb-8">
             <div className="relative w-16 h-16 mb-4">
                <Image src="/logo.png" alt="شعار تدبر" fill className="object-contain" />
             </div>
             <h2 className="text-2xl font-bold text-[#0A74DA] font-amiri">منصة تدبُّر</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">تسجيل الدخول</h2>
            <p className="text-gray-600">أدخل بيانات حسابك للمتابعة</p>
          </div>

          {/* رسالة الخطأ */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2 animate-pulse">
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* البريد الإلكتروني */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
                  <Mail size={20} />
                </div>
                <input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-[#0A74DA] focus:ring-4 focus:ring-[#0A74DA]/10 outline-none transition-all font-medium text-gray-800" 
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* كلمة المرور */}
            <div>
               <div className="flex justify-between items-center mb-2">
                 <label htmlFor="password" className="block text-sm font-bold text-gray-700">كلمة المرور</label>
                 <a href="#" className="text-sm text-[#0A74DA] hover:underline font-bold">نسيت كلمة المرور؟</a>
               </div>
              <div className="relative">
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-[#0A74DA] focus:ring-4 focus:ring-[#0A74DA]/10 outline-none transition-all font-medium text-gray-800" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* زر الدخول */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#0A74DA] hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  جاري الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>

          </form>

          <div className="mt-8 text-center text-gray-600">
            ليس لديك حساب؟ 
            <Link href="/register" className="text-[#0A74DA] font-bold hover:underline mr-2">أنشئ حساباً جديداً</Link>
          </div>
        </div>
      </div>
    </div>
  );
}