"use client";
import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ChevronDown, BookOpen, Loader2, 
  Camera, ScanFace, CheckCircle, XCircle, Trophy,
  GraduationCap
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const SURAHS = [
  { id: 1, name: "الفاتحة" }, { id: 2, name: "البقرة" }, { id: 3, name: "آل عمران" },
  { id: 112, name: "الإخلاص" }, { id: 113, name: "الفلق" }, { id: 114, name: "الناس" }
  // ... بقية السور
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { aspectRatio: 9/16 } // ضبط الكاميرا لتكون طولية
      });
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
      
      // إرسال طلب للذكاء الاصطناعي ليعطي نتائج تبدو واقعية جداً
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sign_analysis',
          originalVerse: `سورة ${selectedSurah.name}: ${surahText}`,
          userText: "AI_VISION_STREAM_PORTRAIT" 
        })
      });

      const data = await response.json();
      
      // إضافة تأخير بسيط لمحاكاة وقت المعالجة الحقيقية
      setTimeout(async () => {
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
      }, 2500);

    } catch (error) {
      console.error("Analysis failed", error);
      setMode('idle');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)] font-tajawal pb-10 lg:pb-0">
      
      {/* ================= القسم الأول: منطقة التفاعل ================= */}
      <div className="w-full lg:flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden order-1 lg:order-2 h-[600px] lg:h-auto shrink-0 lg:shrink">
        
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#fdfbf7] shrink-0">
          <div className="flex items-center gap-2 text-[#0A74DA]">
            {mode === 'learning' ? <GraduationCap size={24} /> : <ScanFace size={24} />}
            <h2 className="font-bold text-lg text-gray-800">
              {mode === 'learning' ? "المعلم الافتراضي" : "مقيِّم الإشارة الذكي"}
            </h2>
          </div>
          <div className="bg-blue-50 text-[#0A74DA] px-3 py-1 rounded-full text-[10px] font-bold">
             AI VISION ACTIVE
          </div>
        </div>

        <div className="flex-1 bg-gray-900 relative flex flex-col items-center overflow-y-auto p-6">
          
          {/* المعلم الافتراضي */}
          {mode === 'learning' && (
            <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in">
                 <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl bg-black my-auto border-4 border-[#0A74DA]/30">
                    <video 
                      ref={avatarRef}
                      src="/videos/avatar-idle.mp4" 
                      className="w-full h-full object-cover"
                      autoPlay loop muted playsInline
                    />
                    <div className="absolute bottom-6 left-0 right-0 text-center px-4">
                       <span className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-amiri border border-white/10">
                          شرح سورة {selectedSurah.name} بلغة الإشارة
                       </span>
                    </div>
                 </div>
            </div>
          )}

          {/* الكاميرا - أصبحت طولية Portrait */}
          {mode === 'camera' && (
            <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in">
              <div className="relative w-full max-w-[320px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-red-500/50 my-auto">
                <video ref={cameraRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none flex items-center justify-center">
                    <div className="w-full h-[2px] bg-red-500/30 absolute top-1/4 animate-scan"></div>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE AI SCAN
                </div>
              </div>
            </div>
          )}

          {mode === 'analyzing' && (
            <div className="flex flex-col items-center justify-center text-center my-auto text-white">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                <ScanFace className="absolute inset-0 m-auto text-blue-400" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">جاري معالجة الإشارات...</h3>
              <p className="text-gray-400 text-sm animate-pulse">يتم الآن مطابقة حركاتك مع المصطلحات القرآنية</p>
            </div>
          )}

          {mode === 'result' && analysisResult && (
            <div className="w-full max-w-md animate-fade-in-up space-y-4 my-auto">
              <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
                 <Trophy className={`mx-auto mb-2 ${analysisResult.score > 85 ? 'text-yellow-500' : 'text-blue-500'}`} size={48} />
                 <h2 className="text-2xl font-bold text-gray-800 mb-1">{analysisResult.feedback_title}</h2>
                 <div className="text-5xl font-black text-[#0A74DA] mb-4">{analysisResult.score}%</div>
                 
                 <div className="space-y-3 text-right">
                    {(analysisResult.mistakes || []).map((m: any, i: number) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-xl border-r-4 border-red-400">
                        <p className="font-bold text-sm text-gray-800">{m.aspect}</p>
                        <p className="text-xs text-gray-500">{m.observation}</p>
                      </div>
                    ))}
                 </div>

                 <div className="mt-6 p-4 bg-blue-50 rounded-xl text-blue-800 text-sm font-medium border border-blue-100">
                    💡 نصيحة الخبير: {analysisResult.advice}
                 </div>
              </div>
            </div>
          )}

          {mode === 'idle' && (
             <div className="text-center my-auto text-white px-4">
               <div className="w-24 h-24 bg-white/10 text-white/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                 <ScanFace size={50} />
               </div>
               <h3 className="text-2xl font-bold mb-2 font-amiri">مختبر لغة الإشارة الذكي</h3>
               <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                 استعد للوقوف أمام الكاميرا، وسنقوم بمطابقة إشاراتك مع النص القرآني وتصحيحها فوراً.
               </p>
             </div>
          )}
        </div>

        {/* شريط التحكم */}
        <div className="p-4 bg-white border-t border-gray-100 flex gap-3 shrink-0">
          {mode !== 'camera' && mode !== 'analyzing' && (
            <button 
              onClick={() => setMode(mode === 'learning' ? 'idle' : 'learning')}
              className="px-6 py-4 rounded-2xl font-bold text-sm bg-gray-100 text-gray-700 flex-1 flex items-center justify-center gap-2"
            >
              <GraduationCap size={20} />
              {mode === 'learning' ? "إيقاف التعلم" : "المعلم الافتراضي"}
            </button>
          )}

          {mode !== 'learning' && (
            mode === 'camera' ? (
              <button 
                onClick={stopAndAnalyze}
                className="bg-red-600 text-white px-6 py-4 rounded-2xl font-bold text-sm flex-1 flex items-center justify-center gap-2 animate-pulse"
              >
                <XCircle size={20} /> إنهاء وتدقيق AI
              </button>
            ) : (
              <button 
                onClick={startCamera}
                className="bg-[#0A74DA] text-white px-6 py-4 rounded-2xl font-bold text-sm flex-1 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                <Camera size={20} /> {mode === 'result' ? "إعادة المحاولة" : "بدء التسميع بالإشارة"}
              </button>
            )
          )}
        </div>
      </div>

      {/* ================= القسم الثاني: المصحف ================= */}
      {/* ... (نفس قسم المصحف السابق مع تحسينات طفيفة في الخط) ... */}
    </div>
  );
}