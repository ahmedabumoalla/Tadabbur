"use client";
import { useEffect, useState } from 'react';
import { TrendingUp, Award, Clock, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    completion_rate: 0,
    memorized_verses: 0,
    learning_hours: 0,
    alerts: 0
  });
  const [plans, setPlans] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserName(user.email?.split('@')[0] || "المستخدم");

          // 1. جلب بيانات التلاوات (المصحف الذكي)
          const { data: recitations, error: recError } = await supabase
            .from('recitations')
            .select('ai_score, created_at')
            .eq('user_id', user.id);

          // 2. جلب بيانات لغة الإشارة
          const { data: signSessions, error: signError } = await supabase
            .from('sign_language_sessions')
            .select('score, created_at')
            .eq('user_id', user.id);

          // 3. جلب الخطط
          const { data: plansData } = await supabase
            .from('plans')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!recError && !signError) {
            // === حساب الإحصائيات ===
            
            const totalRecitations = recitations?.length || 0;
            const totalSignSessions = signSessions?.length || 0;

            // أ) الآيات المحفوظة: أي تلاوة درجاتها فوق 85
            const memorizedCount = recitations?.filter(r => r.ai_score >= 85).length || 0;

            // ب) التنبيهات: أي تلاوة أو إشارة درجاتها تحت 60 (تحتاج مراجعة)
            const alertsCount = (recitations?.filter(r => r.ai_score < 60).length || 0) + 
                                (signSessions?.filter(s => s.score < 60).length || 0);

            // ج) ساعات التعلم (تقديري): كل تلاوة 3 دقائق، كل جلسة إشارة 5 دقائق
            const totalMinutes = (totalRecitations * 3) + (totalSignSessions * 5);
            const hours = (totalMinutes / 60).toFixed(1);

            // د) نسبة الختم (تقديري): بناءً على عدد الآيات المحفوظة من إجمالي آيات القرآن (6236)
            // وللجمالية، نضرب الرقم لكي يظهر تحرك في البداية
            const completionPercent = ((memorizedCount / 6236) * 100).toFixed(2);

            setStats({
              completion_rate: Number(completionPercent) > 100 ? 100 : Number(completionPercent),
              memorized_verses: memorizedCount,
              learning_hours: Number(hours),
              alerts: alertsCount
            });
          }

          setPlans(plansData || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center text-[#0A74DA]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin" size={48} />
          <p className="text-gray-400 font-tajawal">جاري تحليل بياناتك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up font-tajawal">
      
      {/* ترحيب */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">مرحباً، {userName} 👋</h1>
          <p className="text-gray-500">إليك ملخص أدائك في منصة تدبَّر اليوم.</p>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm text-gray-400">تاريخ اليوم</p>
          <p className="font-bold text-gray-700 font-amiri">
            {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* بطاقات الإحصائيات (مربوطة بقاعدة البيانات) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="نسبة الختم" 
          value={`${stats.completion_rate}%`} 
          icon={<TrendingUp size={24} />} 
          color="text-blue-600" bg="bg-blue-50" 
          desc="بناءً على محفوظاتك"
        />
        <StatCard 
          title="الآيات المتقنة" 
          value={stats.memorized_verses} 
          icon={<Award size={24} />} 
          color="text-green-600" bg="bg-green-50" 
          desc="تلاوة بنتيجة ممتازة"
        />
        <StatCard 
          title="ساعات التعلم" 
          value={stats.learning_hours} 
          icon={<Clock size={24} />} 
          color="text-orange-600" bg="bg-orange-50" 
          desc="تلاوة ولغة إشارة"
        />
        <StatCard 
          title="تنبيهات المراجعة" 
          value={stats.alerts} 
          icon={<AlertCircle size={24} />} 
          color="text-red-600" bg="bg-red-50" 
          desc="آيات تحتاج تحسين"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* الخطط الحالية */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              📊 الخطط النشطة
            </h3>
            <Link 
  href="/dashboard/plans/create" 
  className="flex items-center gap-1 text-sm bg-blue-50 text-[#0A74DA] px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition"
>
  <Plus size={16} /> خطة جديدة
</Link>
          </div>
          
          <div className="space-y-4">
            {plans.length > 0 ? (
              plans.map((plan) => (
                <PlanItem key={plan.id} title={plan.title} progress={plan.progress} color={plan.color} />
              ))
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300">
                  <TrendingUp size={32} />
                </div>
                <p className="text-gray-500 font-bold">لا توجد خطط حالية</p>
                <p className="text-sm text-gray-400 mt-1">ابدأ بإضافة خطة حفظ جديدة لتتابع تقدمك</p>
              </div>
            )}
          </div>
        </div>

        {/* المساعد الذكي السريع */}
        <div className="bg-gradient-to-br from-[#0A74DA] to-[#2563EB] rounded-2xl p-8 text-white flex flex-col justify-between shadow-xl shadow-blue-200/50 relative overflow-hidden group">
          {/* خلفية زخرفية */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10 transition-transform group-hover:scale-150 delay-75"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-white">
               <Sparkles size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-2 font-amiri">تدبَّر AI 🤖</h3>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed opacity-90">
              أنا مساعدك القرآني الذكي. هل لديك سؤال حول التفسير، أسباب النزول، أو تريد التدرب على التلاوة؟
            </p>
          </div>
          <Link href="/dashboard/chatbot" className="relative z-10 w-full bg-white text-[#0A74DA] py-3.5 rounded-xl font-bold shadow-sm hover:bg-blue-50 transition-all transform hover:-translate-y-1 text-center flex items-center justify-center gap-2">
            بدء محادثة جديدة
          </Link>
        </div>
      </div>
    </div>
  );
}

// === المكونات الفرعية ===

function StatCard({ title, value, icon, color, bg, desc }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-lg hover:border-blue-100 transition-all duration-300 group">
      <div>
        <p className="text-gray-500 text-xs font-bold mb-2">{title}</p>
        <h4 className="text-3xl font-extrabold text-gray-800 font-tajawal mb-1 group-hover:text-[#0A74DA] transition-colors">{value}</h4>
        {desc && <p className="text-[10px] text-gray-400">{desc}</p>}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color} group-hover:scale-110 transition-transform shadow-sm`}>
        {icon}
      </div>
    </div>
  );
}

function PlanItem({ title, progress, color }: any) {
  // تحديد اللون بناءً على الكلاس النصي أو استخدام الافتراضي
  const progressColor = color?.includes('bg-') ? color : 'bg-[#0A74DA]';
  
  return (
    <div className="border border-gray-100 rounded-xl p-5 hover:bg-blue-50/30 transition-colors group cursor-pointer">
      <div className="flex justify-between mb-3">
        <span className="font-bold text-gray-700 group-hover:text-[#0A74DA] transition-colors">{title}</span>
        <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-600">{progress}% منجز</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-2.5 rounded-full ${progressColor} transition-all duration-1000 ease-out`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

function Sparkles({ size }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    )
}