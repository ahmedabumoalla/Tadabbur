"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ArrowRight, Mail, Lock, User, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // تأكد من المسار الصحيح

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // حقول الإدخال
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 1. إنشاء المستخدم في Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName, // سيتم نقله تلقائياً لجدول profiles عبر الـ Trigger
          },
        },
      });

      if (error) throw error;

      // 2. نجاح العملية
      setSuccessMsg("تم إنشاء الحساب بنجاح! جاري تحويلك...");
      
      // حفظ بيانات الجلسة محلياً للتسريع (اختياري لأن Supabase يديرها)
      if (data.user) {
         localStorage.setItem("tadabbur_user", JSON.stringify({
            name: fullName,
            email: email,
            id: data.user.id
         }));
      }

      // 3. التوجيه للداشبورد بعد ثانية ونصف
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (error: any) {
      console.error("Error:", error);
      setErrorMsg(error.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-tajawal bg-white" dir="rtl">
      
      {/* ================= القسم الأيمن: الهوية (يختفي على الجوال) ================= */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0f172a] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0A74DA]/80 to-[#0f172a]/90 z-10" />
        <Image 
          src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1920" 
          alt="خلفية قرآنية" 
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
          <h1 className="text-5xl font-bold mb-6 font-amiri leading-tight">انضم لعائلة تدبُّر</h1>
          <p className="text-xl text-blue-100 leading-relaxed font-light">
            أنشئ حسابك الآن وابدأ رحلة تفاعلية مع القرآن الكريم، واستفد من تقنيات الذكاء الاصطناعي في الحفظ والتلاوة.
          </p>
        </div>
      </div>

      {/* ================= القسم الأيسر: نموذج التسجيل ================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-white relative">
        
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-[#0A74DA] transition group text-sm font-bold">
          <ArrowRight size={18} className="rotate-180 group-hover:-translate-x-1 transition" />
          العودة للرئيسية
        </Link>

        <div className="w-full max-w-md">
          {/* شعار للجوال */}
          <div className="lg:hidden flex flex-col items-center mb-8">
             <div className="relative w-16 h-16 mb-4">
                <Image src="/logo.png" alt="شعار تدبر" fill className="object-contain" />
             </div>
             <h2 className="text-2xl font-bold text-[#0A74DA] font-amiri">منصة تدبُّر</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">إنشاء حساب جديد</h2>
            <p className="text-gray-600">أدخل بياناتك للتسجيل في المنصة</p>
          </div>

          {/* رسائل الخطأ والنجاح */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-sm font-bold border border-green-100 flex items-center gap-2">
              <CheckCircle size={18} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* الاسم الكامل */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل</label>
              <div className="relative">
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-[#0A74DA] focus:ring-4 focus:ring-[#0A74DA]/10 outline-none transition-all font-medium text-gray-800" 
                  placeholder="محمد عبدالله"
                />
              </div>
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
                  <Mail size={20} />
                </div>
                <input 
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
               <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  minLength={6}
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-[#0A74DA] focus:ring-4 focus:ring-[#0A74DA]/10 outline-none transition-all font-medium text-gray-800" 
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 mr-2">يجب أن تتكون كلمة المرور من 6 خانات على الأقل</p>
            </div>

            {/* زر التسجيل */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#0A74DA] hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                "إنشاء الحساب"
              )}
            </button>

          </form>

          <div className="mt-8 text-center text-gray-600">
            لديك حساب بالفعل؟ 
            <Link href="/login" className="text-[#0A74DA] font-bold hover:underline mr-2">تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    </div>
  );
}