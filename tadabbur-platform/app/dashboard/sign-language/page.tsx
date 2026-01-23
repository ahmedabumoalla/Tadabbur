"use client";
import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ChevronDown, BookOpen, Loader2, 
  Camera, ScanFace, CheckCircle, XCircle, Trophy,
  GraduationCap
} from 'lucide-react';
// 👇👇👇 تم إضافة هذا السطر لحل المشكلة 👇👇👇
import { supabase } from '@/lib/supabaseClient';

// === بيانات السور (القائمة الكاملة 114 سورة) ===
const SURAHS = [
  { id: 1, name: "الفاتحة" }, { id: 2, name: "البقرة" }, { id: 3, name: "آل عمران" },
  { id: 4, name: "النساء" }, { id: 5, name: "المائدة" }, { id: 6, name: "الأنعام" },
  { id: 7, name: "الأعراف" }, { id: 8, name: "الأنفال" }, { id: 9, name: "التوبة" },
  { id: 10, name: "يونس" }, { id: 11, name: "هود" }, { id: 12, name: "يوسف" },
  { id: 13, name: "الرعد" }, { id: 14, name: "إبراهيم" }, { id: 15, name: "الحجر" },
  { id: 16, name: "النحل" }, { id: 17, name: "الإسراء" }, { id: 18, name: "الكهف" },
  { id: 19, name: "مريم" }, { id: 20, name: "طه" }, { id: 21, name: "الأنبياء" },
  { id: 22, name: "الحج" }, { id: 23, name: "المؤمنون" }, { id: 24, name: "النور" },
  { id: 25, name: "الفرقان" }, { id: 26, name: "الشعراء" }, { id: 27, name: "النمل" },
  { id: 28, name: "القصص" }, { id: 29, name: "العنكبوت" }, { id: 30, name: "الروم" },
  { id: 31, name: "لقمان" }, { id: 32, name: "السجدة" }, { id: 33, name: "الأحزاب" },
  { id: 34, name: "سبأ" }, { id: 35, name: "فاطر" }, { id: 36, name: "يس" },
  { id: 37, name: "الصافات" }, { id: 38, name: "ص" }, { id: 39, name: "الزمر" },
  { id: 40, name: "غافر" }, { id: 41, name: "فصلت" }, { id: 42, name: "الشورى" },
  { id: 43, name: "الزخرف" }, { id: 44, name: "الدخان" }, { id: 45, name: "الجاثية" },
  { id: 46, name: "الأحقاف" }, { id: 47, name: "محمد" }, { id: 48, name: "الفتح" },
  { id: 49, name: "الحجرات" }, { id: 50, name: "ق" }, { id: 51, name: "الذاريات" },
  { id: 52, name: "الطور" }, { id: 53, name: "النجم" }, { id: 54, name: "القمر" },
  { id: 55, name: "الرحمن" }, { id: 56, name: "الواقعة" }, { id: 57, name: "الحديد" },
  { id: 58, name: "المجادلة" }, { id: 59, name: "الحشر" }, { id: 60, name: "الممتحنة" },
  { id: 61, name: "الصف" }, { id: 62, name: "الجمعة" }, { id: 63, name: "المنافقون" },
  { id: 64, name: "التغابن" }, { id: 65, name: "الطلاق" }, { id: 66, name: "التحريم" },
  { id: 67, name: "الملك" }, { id: 68, name: "القلم" }, { id: 69, name: "الحاقة" },
  { id: 70, name: "المعارج" }, { id: 71, name: "نوح" }, { id: 72, name: "الجن" },
  { id: 73, name: "المزمل" }, { id: 74, name: "المدثر" }, { id: 75, name: "القيامة" },
  { id: 76, name: "الإنسان" }, { id: 77, name: "المرسلات" }, { id: 78, name: "النبأ" },
  { id: 79, name: "النازعات" }, { id: 80, name: "عبس" }, { id: 81, name: "التكوير" },
  { id: 82, name: "الإنفطار" }, { id: 83, name: "المطففين" }, { id: 84, name: "الإنشقاق" },
  { id: 85, name: "البروج" }, { id: 86, name: "الطارق" }, { id: 87, name: "الأعلى" },
  { id: 88, name: "الغاشية" }, { id: 89, name: "الفجر" }, { id: 90, name: "البلد" },
  { id: 91, name: "الشمس" }, { id: 92, name: "الليل" }, { id: 93, name: "الضحى" },
  { id: 94, name: "الشرح" }, { id: 95, name: "التين" }, { id: 96, name: "العلق" },
  { id: 97, name: "القدر" }, { id: 98, name: "البينة" }, { id: 99, name: "الزلزلة" },
  { id: 100, name: "العاديات" }, { id: 101, name: "القارعة" }, { id: 102, name: "التكاثر" },
  { id: 103, name: "العصر" }, { id: 104, name: "الهمزة" }, { id: 105, name: "الفيل" },
  { id: 106, name: "قريش" }, { id: 107, name: "الماعون" }, { id: 108, name: "الكوثر" },
  { id: 109, name: "الكافرون" }, { id: 110, name: "النصر" }, { id: 111, name: "المسد" },
  { id: 112, name: "الإخلاص" }, { id: 113, name: "الفلق" }, { id: 114, name: "الناس" }
];

export default function SignLanguagePage() {
  // --- States ---
  const [selectedSurah, setSelectedSurah] = useState(SURAHS[0]);
  const [verses, setVerses] = useState<any[]>([]);
  
  // أوضاع الشاشة
  const [mode, setMode] = useState<'idle' | 'learning' | 'camera' | 'analyzing' | 'result'>('idle');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // مرجع الفيديو
  const cameraRef = useRef<HTMLVideoElement>(null);
  const avatarRef = useRef<HTMLVideoElement>(null);

  // --- 1. جلب الآيات ---
  useEffect(() => {
    const fetchVerses = async () => {
      try {
        const res = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${selectedSurah.id}`);
        const data = await res.json();
        setVerses(data.verses);
      } catch (e) { console.error(e); }
    };
    fetchVerses();
  }, [selectedSurah]);

  // --- 2. تشغيل الكاميرا ---
  const startCamera = async () => {
    setAnalysisResult(null);
    setMode('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // --- 3. إيقاف الكاميرا وإرسال للتحليل ---
  const stopAndAnalyze = async () => {
    if (cameraRef.current && cameraRef.current.srcObject) {
      const tracks = (cameraRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    
    setMode('analyzing');

    try {
      const surahText = verses.map(v => v.text_uthmani).join(" ");
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sign_analysis',
          originalVerse: `سورة ${selectedSurah.name}: ${surahText.substring(0, 50)}...`, 
          userText: "Sign Language Video Stream" 
        })
      });

      const data = await response.json();
      setAnalysisResult(data);
      setMode('result');

      // 👇👇👇 حفظ النتيجة في قاعدة البيانات 👇👇👇
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data.score) {
        await supabase.from('sign_language_sessions').insert({
          user_id: user.id,
          surah_name: selectedSurah.name,
          score: data.score
        });
      }

    } catch (error) {
      console.error("Analysis failed", error);
      alert("حدث خطأ أثناء تحليل لغة الإشارة");
      setMode('idle');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] font-tajawal">
      
      {/* ================= القسم الأيمن: منطقة التفاعل ================= */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden order-1 lg:order-2">
        
        {/* رأس البطاقة */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#fdfbf7] shrink-0">
          <div className="flex items-center gap-2 text-[#0A74DA]">
            {mode === 'learning' ? <GraduationCap size={24} /> : <ScanFace size={24} />}
            <h2 className="font-bold text-lg text-gray-800">
              {mode === 'learning' ? "المعلم الافتراضي" : "مقيِّم لغة الإشارة الذكي"}
            </h2>
          </div>
          <div className="bg-blue-50 text-[#0A74DA] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
             <Sparkles size={12} />
             AI Powered
          </div>
        </div>

        {/* جسم المنطقة */}
        <div className="flex-1 bg-gray-50 relative flex flex-col items-center overflow-y-auto custom-scrollbar p-6">
          
          {/* الحالة: المعلم الافتراضي */}
          {mode === 'learning' && (
            <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in">
              {selectedSurah.id === 1 ? (
                 <div className="relative w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black my-auto border-4 border-[#0A74DA]">
                    <video 
                      ref={avatarRef}
                      src="/videos/avatar-idle.mp4" 
                      className="w-full h-full object-contain"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    />
                    <div className="absolute inset-0 bg-transparent pointer-events-none"></div>
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                       <span className="bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-amiri shadow-lg">
                          يتم الآن شرح سورة {selectedSurah.name}...
                       </span>
                    </div>
                 </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 my-auto">
                  <div className="w-20 h-20 bg-blue-50 text-[#0A74DA] rounded-full flex items-center justify-center mb-4">
                    <Loader2 size={40} className="animate-spin-slow" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">جاري تدريب المعلم</h3>
                  <p className="text-gray-500 max-w-xs">
                    المعلم الافتراضي متاح حالياً لسورة الفاتحة فقط. نعمل على تدريبه لباقي السور.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* الحالة: الكاميرا تعمل */}
          {mode === 'camera' && (
            <div className="w-full max-w-lg aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border-4 border-[#0A74DA] my-auto">
              <video ref={cameraRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A74DA]/20 to-transparent animate-scan h-full w-full pointer-events-none"></div>
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded animate-pulse">REC ●</div>
            </div>
          )}

          {/* الحالة: جاري التحليل */}
          {mode === 'analyzing' && (
            <div className="flex flex-col items-center justify-center text-center my-auto">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-gray-200 border-t-[#0A74DA] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="text-[#0A74DA] animate-pulse" size={32} />
                </div>
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-800">جاري تحليل الأداء...</h3>
            </div>
          )}

          {/* الحالة: عرض النتائج */}
          {mode === 'result' && analysisResult && (
            <div className="w-full max-w-2xl animate-fade-in-up space-y-6 pb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#0A74DA]"></div>
                <div>
                  <h3 className="text-gray-500 text-sm mb-1">نتيجة التسميع</h3>
                  <h2 className="text-2xl font-bold text-gray-800">{analysisResult.feedback_title}</h2>
                </div>
                <div className="relative w-20 h-20 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                     <circle cx="40" cy="40" r="36" stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
                     <circle cx="40" cy="40" r="36" stroke={analysisResult.score > 80 ? "#22c55e" : "#eab308"} strokeWidth="8" fill="transparent" strokeDasharray={226} strokeDashoffset={226 - (226 * analysisResult.score) / 100} />
                   </svg>
                   <span className="absolute text-xl font-bold text-gray-800">{analysisResult.score}%</span>
                </div>
              </div>
              
              <div className="grid gap-4">
                {analysisResult.mistakes.map((mistake: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-50 p-2 rounded-lg text-red-500 mt-1 shrink-0"><XCircle size={20} /></div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{mistake.aspect}</h4>
                        <p className="text-gray-600 text-sm mb-2">{mistake.observation}</p>
                        <div className="bg-green-50 text-green-700 text-xs p-2 rounded-lg flex gap-2">
                           <CheckCircle size={14} className="shrink-0" /> {mistake.correction}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 flex gap-3">
                 <Trophy className="text-[#0A74DA] shrink-0" size={24} />
                 <div>
                    <h4 className="font-bold text-[#0A74DA] mb-1">نصيحة المدرب</h4>
                    <p className="text-sm text-gray-700">{analysisResult.advice}</p>
                 </div>
              </div>
            </div>
          )}

          {/* الحالة الافتراضية */}
          {mode === 'idle' && (
             <div className="text-center my-auto">
               <div className="w-24 h-24 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                 <ScanFace size={48} />
               </div>
               <h3 className="text-xl font-bold text-gray-700 mb-2">منصة لغة الإشارة الذكية</h3>
               <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                 اختر "تعلم" لمشاهدة المعلم الافتراضي، أو "تسميع" لاختبار حفظك.
               </p>
             </div>
          )}

        </div>

        {/* شريط التحكم السفلي */}
        <div className="p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-center gap-4 shrink-0">
          {mode !== 'camera' && mode !== 'analyzing' && (
            <button 
              onClick={() => setMode(mode === 'learning' ? 'idle' : 'learning')}
              className={`px-6 py-4 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-3 flex-1 ${
                mode === 'learning' 
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-white border-2 border-[#0A74DA] text-[#0A74DA] hover:bg-blue-50"
              }`}
            >
              <GraduationCap size={24} />
              {mode === 'learning' ? "إغلاق المعلم" : "المعلم الافتراضي"}
            </button>
          )}

          {mode !== 'learning' && (
            mode === 'camera' ? (
              <button 
                onClick={stopAndAnalyze}
                className="bg-red-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-red-600 transition shadow-lg flex items-center justify-center gap-3 flex-1 animate-pulse"
              >
                <ScanFace size={24} />
                إنهاء وتحليل
              </button>
            ) : (
              <button 
                onClick={startCamera}
                className="bg-[#0A74DA] text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg flex items-center justify-center gap-3 flex-1"
              >
                <Camera size={24} />
                {mode === 'result' ? "إعادة التسميع" : "بدء التسميع"}
              </button>
            )
          )}
        </div>

      </div>

      {/* ================= القسم الأيسر: المصحف ================= */}
      <div className="w-full lg:w-96 flex flex-col gap-4 order-2 lg:order-1 h-full">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 shrink-0">
          <label className="text-sm font-bold text-gray-500 mb-2 block">السورة المراد تسميعها</label>
          <div className="relative">
            <select 
              className="w-full p-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-[#0A74DA] font-amiri text-lg cursor-pointer"
              onChange={(e) => {
                const s = SURAHS.find(s => s.id === parseInt(e.target.value));
                if(s) { setSelectedSurah(s); setMode('idle'); setAnalysisResult(null); }
              }}
              value={selectedSurah.id}
            >
              {SURAHS.map(s => <option key={s.id} value={s.id} className="text-gray-900">{s.name}</option>)}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col relative">
          <div className="p-4 border-b border-gray-100 bg-[#fdfbf7] flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-800 font-amiri flex items-center gap-2">
              <BookOpen size={18} className="text-[#C89B3C]" />
              نص سورة {selectedSurah.name}
            </h3>
            <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-500">{verses.length} آية</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-[#fdfbf7]">
            {selectedSurah.id !== 9 && (
              <div className="text-center mb-6 pt-2">
                <p className="text-2xl font-amiri text-[#0A74DA] opacity-80">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
              </div>
            )}
            <div className="font-amiri text-2xl md:text-3xl leading-[2.5] text-justify text-gray-800" dir="rtl">
              {verses.map((verse, idx) => (
                <span key={verse.id} className="px-1 rounded-lg hover:bg-gray-100/50 transition-colors">
                  {verse.text_uthmani.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ", "")}
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-lg mx-1 border-2 align-middle select-none font-tajawal border-[#C89B3C]/50 text-[#C89B3C]">{idx + 1}</span>{" "}
                </span>
              ))}
            </div>
          </div>
          
          {(mode === 'camera' || mode === 'learning') && (
             <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <p className="bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                   {mode === 'camera' ? "حاول التسميع من الذاكرة" : "ركز مع حركة المعلم"}
                </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}