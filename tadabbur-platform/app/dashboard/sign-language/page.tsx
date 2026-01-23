"use client";
import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ChevronDown, BookOpen, Loader2, 
  Camera, ScanFace, CheckCircle, XCircle, Trophy,
  GraduationCap
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// === بيانات السور ===
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
  const [selectedSurah, setSelectedSurah] = useState(SURAHS[0]);
  const [verses, setVerses] = useState<any[]>([]);
  const [mode, setMode] = useState<'idle' | 'learning' | 'camera' | 'analyzing' | 'result'>('idle');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  const cameraRef = useRef<HTMLVideoElement>(null);
  const avatarRef = useRef<HTMLVideoElement>(null);

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
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)] font-tajawal pb-10 lg:pb-0">
      
      {/* ================= القسم الأول: منطقة التفاعل (تظهر أولاً في الجوال) ================= */}
      <div className="w-full lg:flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden order-1 lg:order-2 h-[500px] lg:h-auto shrink-0 lg:shrink">
        
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
          
          {mode === 'learning' && (
            <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in">
              {selectedSurah.id === 1 ? (
                 <div className="relative w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black my-auto border-4 border-[#0A74DA]">
                    <video 
                      ref={avatarRef}
                      src="/videos/avatar-idle.mp4" 
                      className="w-full h-full object-contain"
                      autoPlay loop muted playsInline
                    />
                    <div className="absolute bottom-6 left-0 right-0 text-center px-2">
                       <span className="bg-black/60 backdrop-blur-md text-white px-6 py-2 rounded-full text-xs md:text-sm font-amiri shadow-lg">
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
                  <p className="text-gray-500 max-w-xs text-sm">
                    المعلم الافتراضي متاح حالياً لسورة الفاتحة فقط.
                  </p>
                </div>
              )}
            </div>
          )}

          {mode === 'camera' && (
            <div className="w-full max-w-lg aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border-4 border-[#0A74DA] my-auto">
              <video ref={cameraRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
              <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] px-2 py-1 rounded animate-pulse">REC ●</div>
            </div>
          )}

          {mode === 'analyzing' && (
            <div className="flex flex-col items-center justify-center text-center my-auto">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-[#0A74DA] rounded-full animate-spin"></div>
              <h3 className="mt-6 text-lg font-bold text-gray-800">جاري تحليل الأداء...</h3>
            </div>
          )}

          {mode === 'result' && analysisResult && (
            <div className="w-full max-w-2xl animate-fade-in-up space-y-4 pb-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-xs mb-1">نتيجة التسميع</h3>
                  <h2 className="text-lg font-bold text-gray-800">{analysisResult.feedback_title}</h2>
                </div>
                <div className="relative w-14 h-14 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                     <circle cx="28" cy="28" r="24" stroke="#f3f4f6" strokeWidth="4" fill="transparent" />
                     <circle cx="28" cy="28" r="24" stroke={analysisResult.score > 80 ? "#22c55e" : "#eab308"} strokeWidth="4" fill="transparent" strokeDasharray={150} strokeDashoffset={150 - (150 * analysisResult.score) / 100} />
                   </svg>
                   <span className="absolute text-sm font-bold text-gray-800">{analysisResult.score}%</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {(analysisResult.mistakes || []).map((mistake: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-sm">
                    <h4 className="font-bold text-gray-800 mb-1">{mistake.aspect}</h4>
                    <p className="text-gray-600 mb-2 text-xs">{mistake.observation}</p>
                    <div className="bg-green-50 text-green-700 text-[10px] p-2 rounded-lg flex gap-2">
                       <CheckCircle size={12} className="shrink-0" /> {mistake.correction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'idle' && (
             <div className="text-center my-auto px-4">
               <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                 <ScanFace size={40} />
               </div>
               <h3 className="text-lg font-bold text-gray-700 mb-2">منصة لغة الإشارة الذكية</h3>
               <p className="text-sm text-gray-500 max-w-xs mx-auto">
                 اختر "تعلم" لمشاهدة المعلم الافتراضي، أو "تسميع" لاختبار حفظك.
               </p>
             </div>
          )}
        </div>

        {/* شريط التحكم السفلي */}
        <div className="p-4 bg-white border-t border-gray-100 flex flex-row justify-center gap-3 shrink-0">
          {mode !== 'camera' && mode !== 'analyzing' && (
            <button 
              onClick={() => setMode(mode === 'learning' ? 'idle' : 'learning')}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 flex-1 ${
                mode === 'learning' ? "bg-gray-100 text-gray-700" : "bg-white border-2 border-[#0A74DA] text-[#0A74DA]"
              }`}
            >
              <GraduationCap size={20} />
              {mode === 'learning' ? "إغلاق" : "تعلم"}
            </button>
          )}

          {mode !== 'learning' && (
            mode === 'camera' ? (
              <button 
                onClick={stopAndAnalyze}
                className="bg-red-500 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition shadow-sm flex items-center justify-center gap-2 flex-1 animate-pulse"
              >
                <ScanFace size={20} /> إنهاء وتحليل
              </button>
            ) : (
              <button 
                onClick={startCamera}
                className="bg-[#0A74DA] text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-blue-600 transition shadow-sm flex items-center justify-center gap-2 flex-1"
              >
                <Camera size={20} /> {mode === 'result' ? "إعادة" : "تسميع"}
              </button>
            )
          )}
        </div>
      </div>

      {/* ================= القسم الثاني: المصحف (يظهر ثانياً في الجوال) ================= */}
      <div className="w-full lg:w-96 flex flex-col gap-4 order-2 lg:order-1 h-[500px] lg:h-auto shrink-0">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 shrink-0">
          <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">اختر السورة</label>
          <div className="relative">
            <select 
              className="w-full p-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-[#0A74DA] font-amiri text-lg cursor-pointer"
              onChange={(e) => {
                const s = SURAHS.find(s => s.id === parseInt(e.target.value));
                if(s) { setSelectedSurah(s); setMode('idle'); setAnalysisResult(null); }
              }}
              value={selectedSurah.id}
            >
              {SURAHS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col relative min-h-0">
          <div className="p-4 border-b border-gray-100 bg-[#fdfbf7] flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-800 font-amiri flex items-center gap-2 text-base">
              <BookOpen size={16} className="text-[#C89B3C]" /> نص سورة {selectedSurah.name}
            </h3>
            <span className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-500 font-bold">{verses.length} آية</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-[#fdfbf7]">
            {selectedSurah.id !== 9 && (
              <div className="text-center mb-4">
                <p className="text-xl font-amiri text-[#0A74DA] opacity-80">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
              </div>
            )}
            <div className="font-amiri text-2xl leading-[2.2] text-justify text-gray-800" dir="rtl">
              {verses.map((verse, idx) => (
                <span key={verse.id} className="px-1">
                  {verse.text_uthmani.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ", "")}
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-base mx-1 border align-middle font-tajawal border-[#C89B3C]/50 text-[#C89B3C]">{idx + 1}</span>{" "}
                </span>
              ))}
            </div>
          </div>
          
          {(mode === 'camera' || mode === 'learning') && (
             <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-10 flex items-center justify-center px-4">
                <p className="bg-black/70 text-white px-4 py-2 rounded-full text-xs text-center">
                   {mode === 'camera' ? "تسميع غيبي - النص محجوب" : "تابع حركة المعلم بدقة"}
                </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}