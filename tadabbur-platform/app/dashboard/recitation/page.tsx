"use client";
import { useState, useEffect, useRef } from 'react';
import { 
  Mic, Square, RotateCcw, ChevronLeft, ChevronRight, 
  AlertCircle, CheckCircle2, Volume2, Sparkles, Loader2, 
  Menu, Search, X, BookOpen 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// === بيانات أسماء السور ===
const QURAN_SURAHS = [
  { id: 1, name: "الفاتحة", type: "مكية" }, { id: 2, name: "البقرة", type: "مدنية" }, { id: 3, name: "آل عمران", type: "مدنية" },
  { id: 4, name: "النساء", type: "مدنية" }, { id: 5, name: "المائدة", type: "مدنية" }, { id: 6, name: "الأنعام", type: "مكية" },
  { id: 7, name: "الأعراف", type: "مكية" }, { id: 8, name: "الأنفال", type: "مدنية" }, { id: 9, name: "التوبة", type: "مدنية" },
  { id: 10, name: "يونس", type: "مكية" }, { id: 11, name: "هود", type: "مكية" }, { id: 12, name: "يوسف", type: "مكية" },
  { id: 13, name: "الرعد", type: "مدنية" }, { id: 14, name: "إبراهيم", type: "مكية" }, { id: 15, name: "الحجر", type: "مكية" },
  { id: 16, name: "النحل", type: "مكية" }, { id: 17, name: "الإسراء", type: "مكية" }, { id: 18, name: "الكهف", type: "مكية" },
  { id: 19, name: "مريم", type: "مكية" }, { id: 20, name: "طه", type: "مكية" }, { id: 21, name: "الأنبياء", type: "مكية" },
  { id: 22, name: "الحج", type: "مدنية" }, { id: 23, name: "المؤمنون", type: "مكية" }, { id: 24, name: "النور", type: "مدنية" },
  { id: 25, name: "الفرقان", type: "مكية" }, { id: 26, name: "الشعراء", type: "مكية" }, { id: 27, name: "النمل", type: "مكية" },
  { id: 28, name: "القصص", type: "مكية" }, { id: 29, name: "العنكبوت", type: "مكية" }, { id: 30, name: "الروم", type: "مكية" },
  { id: 31, name: "لقمان", type: "مكية" }, { id: 32, name: "السجدة", type: "مكية" }, { id: 33, name: "الأحزاب", type: "مدنية" },
  { id: 34, name: "سبأ", type: "مكية" }, { id: 35, name: "فاطر", type: "مكية" }, { id: 36, name: "يس", type: "مكية" },
  { id: 37, name: "الصافات", type: "مكية" }, { id: 38, name: "ص", type: "مكية" }, { id: 39, name: "الزمر", type: "مكية" },
  { id: 40, name: "غافر", type: "مكية" }, { id: 41, name: "فصلت", type: "مكية" }, { id: 42, name: "الشورى", type: "مكية" },
  { id: 43, name: "الزخرف", type: "مكية" }, { id: 44, name: "الدخان", type: "مكية" }, { id: 45, name: "الجاثية", type: "مكية" },
  { id: 46, name: "الأحقاف", type: "مكية" }, { id: 47, name: "محمد", type: "مدنية" }, { id: 48, name: "الفتح", type: "مدنية" },
  { id: 49, name: "الحجرات", type: "مدنية" }, { id: 50, name: "ق", type: "مكية" }, { id: 51, name: "الذاريات", type: "مكية" },
  { id: 52, name: "الطور", type: "مكية" }, { id: 53, name: "النجم", type: "مكية" }, { id: 54, name: "القمر", type: "مكية" },
  { id: 55, name: "الرحمن", type: "مدنية" }, { id: 56, name: "الواقعة", type: "مكية" }, { id: 57, name: "الحديد", type: "مدنية" },
  { id: 58, name: "المجادلة", type: "مدنية" }, { id: 59, name: "الحشر", type: "مدنية" }, { id: 60, name: "الممتحنة", type: "مدنية" },
  { id: 61, name: "الصف", type: "مدنية" }, { id: 62, name: "الجمعة", type: "مدنية" }, { id: 63, name: "المنافقون", type: "مدنية" },
  { id: 64, name: "التغابن", type: "مدنية" }, { id: 65, name: "الطلاق", type: "مدنية" }, { id: 66, name: "التحريم", type: "مدنية" },
  { id: 67, name: "الملك", type: "مكية" }, { id: 68, name: "القلم", type: "مكية" }, { id: 69, name: "الحاقة", type: "مكية" },
  { id: 70, name: "المعارج", type: "مكية" }, { id: 71, name: "نوح", type: "مكية" }, { id: 72, name: "الجن", type: "مكية" },
  { id: 73, name: "المزمل", type: "مكية" }, { id: 74, name: "المدثر", type: "مكية" }, { id: 75, name: "القيامة", type: "مكية" },
  { id: 76, name: "الإنسان", type: "مدنية" }, { id: 77, name: "المرسلات", type: "مكية" }, { id: 78, name: "النبأ", type: "مكية" },
  { id: 79, name: "النازعات", type: "مكية" }, { id: 80, name: "عبس", type: "مكية" }, { id: 81, name: "التكوير", type: "مكية" },
  { id: 82, name: "الإنفطار", type: "مكية" }, { id: 83, name: "المطففين", type: "مكية" }, { id: 84, name: "الإنشقاق", type: "مكية" },
  { id: 85, name: "البروج", type: "مكية" }, { id: 86, name: "الطارق", type: "مكية" }, { id: 87, name: "الأعلى", type: "مكية" },
  { id: 88, name: "الغاشية", type: "مكية" }, { id: 89, name: "الفجر", type: "مكية" }, { id: 90, name: "البلد", type: "مكية" },
  { id: 91, name: "الشمس", type: "مكية" }, { id: 92, name: "الليل", type: "مكية" }, { id: 93, name: "الضحى", type: "مكية" },
  { id: 94, name: "الشرح", type: "مكية" }, { id: 95, name: "التين", type: "مكية" }, { id: 96, name: "العلق", type: "مكية" },
  { id: 97, name: "القدر", type: "مكية" }, { id: 98, name: "البينة", type: "مدنية" }, { id: 99, name: "الزلزلة", type: "مدنية" },
  { id: 100, name: "العاديات", type: "مكية" }, { id: 101, name: "القارعة", type: "مكية" }, { id: 102, name: "التكاثر", type: "مكية" },
  { id: 103, name: "العصر", type: "مكية" }, { id: 104, name: "الهمزة", type: "مكية" }, { id: 105, name: "الفيل", type: "مكية" },
  { id: 106, name: "قريش", type: "مكية" }, { id: 107, name: "الماعون", type: "مكية" }, { id: 108, name: "الكوثر", type: "مكية" },
  { id: 109, name: "الكافرون", type: "مكية" }, { id: 110, name: "النصر", type: "مدنية" }, { id: 111, name: "المسد", type: "مكية" },
  { id: 112, name: "الإخلاص", type: "مكية" }, { id: 113, name: "الفلق", type: "مكية" }, { id: 114, name: "الناس", type: "مكية" }
];

const VERSES_PER_PAGE = 6; 

export default function RecitationPage() {
  // --- States ---
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  
  // 1. متغيرات الصوت
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 2. متغيرات التفسير (التفسير الميسر)
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsirData, setTafsirData] = useState<any[]>([]);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  
  // التنقل والبيانات
  const [currentSurah, setCurrentSurah] = useState(QURAN_SURAHS[0]); 
  const [showSurahList, setShowSurahList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // بيانات الآيات
  const [allVerses, setAllVerses] = useState<any[]>([]);
  const [displayedVerses, setDisplayedVerses] = useState<any[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  
  // التصفح
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // التسجيل والتعرف على الصوت
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const [transcript, setTranscript] = useState("");

  // --- 1. جلب الآيات ---
  useEffect(() => {
    const fetchVerses = async () => {
      setIsLoadingVerses(true);
      try {
        const response = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${currentSurah.id}`);
        const data = await response.json();
        
        if (data.verses) {
          setAllVerses(data.verses);
          setTotalPages(Math.ceil(data.verses.length / VERSES_PER_PAGE));
          setCurrentPage(1); 
        }
      } catch (error) {
        console.error("فشل جلب الآيات", error);
      } finally {
        setIsLoadingVerses(false);
      }
    };

    fetchVerses();
  }, [currentSurah]);

  // إيقاف الصوت عند تغيير السورة
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
    }
  }, [currentSurah]);

  // --- 2. تحديث الصفحة الحالية ---
  useEffect(() => {
    const startIndex = (currentPage - 1) * VERSES_PER_PAGE;
    const endIndex = startIndex + VERSES_PER_PAGE;
    if (allVerses.length > 0) {
      setDisplayedVerses(allVerses.slice(startIndex, endIndex));
    }
  }, [allVerses, currentPage]);

  // --- 3. إعداد التعرف على الصوت (Web Speech API) ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'ar-SA'; 

        recognitionRef.current.onresult = (event: any) => {
  let finalTranscript = '';
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      finalTranscript += event.results[i][0].transcript;
    }
  }
  // التحديث هنا يجب أن يكون تراكمياً ومباشراً
  if (finalTranscript) {
    setTranscript(finalTranscript);
  }
};
      }
    }
  }, []);

  // --- Handlers ---

  // دالة تشغيل الصوت (مشاري العفاسي)
  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      const surahId = String(currentSurah.id).padStart(3, '0');
      const audioUrl = `https://server8.mp3quran.net/afs/${surahId}.mp3`;
      
      if (!audioRef.current || audioRef.current.src !== audioUrl) {
        audioRef.current = new Audio(audioUrl);
      }
      
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  // دالة جلب التفسير (المعدلة لاستخدام API QuranEnc)
  const handleShowTafsir = async () => {
    setShowTafsir(true);
    setLoadingTafsir(true);
    try {
      // استخدام API QuranEnc للتفسير الميسر (أكثر موثوقية)
      const res = await fetch(`https://quranenc.com/api/v1/translation/sura/arabic_moyassar/${currentSurah.id}`);
      const data = await res.json();
      
      // حساب أرقام الآيات في الصفحة الحالية
      const startVerse = (currentPage - 1) * VERSES_PER_PAGE + 1;
      const endVerse = currentPage * VERSES_PER_PAGE;

      // تصفية التفسير بناءً على رقم الآية
      // data.result يحتوي على مصفوفة، كل عنصر له خاصية 'aya' (رقم الآية) و 'translation' (التفسير)
      const filteredTafsir = data.result.filter((item: any) => {
        const verseNum = parseInt(item.aya);
        return verseNum >= startVerse && verseNum <= endVerse;
      });
      
      setTafsirData(filteredTafsir);
    } catch (error) {
      console.error("فشل جلب التفسير", error);
    } finally {
      setLoadingTafsir(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      setFeedback(null); 
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      setFeedback(null);
    }
  };

  const startRecording = async () => {
    try {
      setFeedback(null);
      setTranscript("");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      if (recognitionRef.current) recognitionRef.current.start();
      
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("يرجى السماح بالوصول للميكروفون");
    }
  };

  // داخل ملف RecitationPage
// ابحث عن دالة stopRecording وقم بتحديث جزء إرسال البيانات (aiResponse) كالتالي:

  const stopRecording = async () => {
  if (!mediaRecorderRef.current) return;

  setIsRecording(false);
  setIsProcessing(true);

  mediaRecorderRef.current.stop();
  if (recognitionRef.current) {
    recognitionRef.current.stop();
  }

  mediaRecorderRef.current.onstop = async () => {
    // انتظر 1.5 ثانية لضمان امتلاء الـ transcript من الـ Speech API
    setTimeout(async () => {
      const currentTranscript = transcript.trim();
      
      console.log("Captured Text:", currentTranscript);

      if (!currentTranscript) {
        setFeedback({
          score: 0,
          status: "error",
          mistakes: [{ word: "الميكروفون", type: "فشل التقاط", advice: "لم يتم التعرف على صوتك. جرب التحدث ببطء واستخدام متصفح Chrome." }]
        });
        setIsProcessing(false);
        return;
      }
      
      // هنا تضع كود إرسال الطلب للـ API (fetch /api/chat)
    }, 1500);
  };
};

  const filteredSurahs = QURAN_SURAHS.filter(surah => 
    surah.name.includes(searchQuery) || surah.id.toString().includes(searchQuery)
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] font-tajawal relative">
      
      {/* ================= القائمة الجانبية ================= */}
      {showSurahList && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:absolute lg:rounded-3xl" onClick={() => setShowSurahList(false)} />
      )}
      
      <div className={`fixed lg:absolute top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${showSurahList ? 'translate-x-0' : 'translate-x-full'} lg:rounded-r-3xl border-l border-gray-100 flex flex-col`}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#fdfbf7]">
          <h3 className="font-bold text-gray-800 font-amiri text-lg">فهرس السور</h3>
          <button onClick={() => setShowSurahList(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <input 
              type="text" 
              placeholder="ابحث عن سورة..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0A74DA] text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredSurahs.map((surah) => (
            <button 
              key={surah.id}
              onClick={() => { setCurrentSurah(surah); setShowSurahList(false); setFeedback(null); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl mb-1 transition-all ${
                currentSurah.id === surah.id 
                  ? "bg-[#0A74DA] text-white shadow-md" 
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold ${
                  currentSurah.id === surah.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {surah.id}
                </span>
                <span className="font-amiri font-bold text-lg pt-1">{surah.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ================= القسم الأيمن: المصحف ================= */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
        
        {/* الرأس */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fdfbf7]">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setShowSurahList(true)}
              className="p-2 hover:bg-gray-200 rounded-xl transition text-gray-700 bg-white border border-gray-200 shadow-sm"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowSurahList(true)}>
               <h2 className="text-xl font-bold text-[#0A74DA] font-amiri">سورة {currentSurah.name}</h2>
               <p className="text-xs text-gray-500 hidden md:block">{currentSurah.type} • {allVerses.length} آية</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-bold bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
               <span>صفحة {currentPage}</span>
               <span className="text-gray-300">/</span>
               <span>{totalPages || 1}</span>
            </div>
            <div className="flex gap-1">
                {/* زر الاستماع */}
                <button 
                  onClick={toggleAudio}
                  className={`p-2 rounded-lg transition ${isPlaying ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#0A74DA] hover:bg-blue-100'}`} 
                  title={isPlaying ? "إيقاف" : "استماع للقارئ"}
                >
                  {isPlaying ? <Square size={20} fill="currentColor" /> : <Volume2 size={20} />}
                </button>
                
                {/* زر التفسير */}
                <button 
                  onClick={handleShowTafsir}
                  className="p-2 text-[#C89B3C] bg-yellow-50 rounded-lg hover:bg-yellow-100 transition" 
                  title="تفسير الآيات"
                >
                  <BookOpen size={20} />
                </button>
            </div>
          </div>
        </div>

        {/* جسم المصحف */}
        <div className="flex-1 flex flex-col items-center justify-start p-8 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-[#fdfbf7] overflow-y-auto custom-scrollbar">
          
          {isLoadingVerses ? (
            <div className="flex-1 w-full flex items-center justify-center flex-col gap-3">
              <Loader2 className="animate-spin text-[#0A74DA]" size={40} />
              <p className="text-gray-400">جاري تحميل السورة...</p>
            </div>
          ) : (
            <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col">
              
              {/* البسملة */}
              {currentPage === 1 && currentSurah.id !== 9 && (
                <div className="text-center mb-10 pt-4 animate-fade-in">
                  <p className="text-3xl font-amiri text-[#0A74DA] opacity-80">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                </div>
              )}

              {/* الآيات */}
              <div className="flex-1 space-y-0 animate-fade-in-up">
                {displayedVerses.map((verse, idx) => (
                  <p 
                    key={verse.id} 
                    className={`text-center text-3xl md:text-5xl font-amiri transition-all duration-300 cursor-pointer py-4 ${
                      feedback?.mistakes?.some((m: any) => verse.text_uthmani.includes(m.word)) 
                        ? "text-red-600 decoration-red-200 underline decoration-wavy underline-offset-[12px]" 
                        : "text-gray-800 hover:text-[#0A74DA]"
                    }`}
                    style={{ lineHeight: '2' }} 
                  >
                    {currentSurah.id === 1 && idx === 0 
                      ? verse.text_uthmani.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ", "") 
                      : verse.text_uthmani
                    } 
                    
                    <span className="text-xl mr-3 text-[#C89B3C] font-tajawal border border-[#C89B3C] rounded-full w-9 h-9 inline-flex items-center justify-center pt-1.5 align-middle select-none">
                      {(currentPage - 1) * VERSES_PER_PAGE + idx + 1}
                    </span>
                  </p>
                ))}
              </div>
              <div className="h-20"></div>
            </div>
          )}
        </div>

        {/* الشريط السفلي */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center relative z-10 px-6 md:px-10">
          
          <button 
            onClick={handlePrevPage} 
            disabled={currentPage === 1 || isLoadingVerses}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0A74DA] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={24} />
            <span className="font-bold hidden md:inline">السابق</span>
          </button>

          <div className="relative group -mt-12">
            {isRecording && (
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
            )}
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || isLoadingVerses}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 border-white transition-all transform hover:scale-105 ${
                isRecording 
                  ? "bg-red-500 text-white" 
                  : isProcessing 
                    ? "bg-gray-100 text-gray-400 cursor-wait"
                    : "bg-[#0A74DA] text-white hover:bg-blue-600"
              }`}
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={32} />
              ) : isRecording ? (
                <Square size={32} fill="currentColor" />
              ) : (
                <Mic size={32} />
              )}
            </button>
          </div>

          <button 
            onClick={handleNextPage} 
            disabled={currentPage >= totalPages || isLoadingVerses}
            className="flex items-center gap-2 text-gray-600 hover:text-[#0A74DA] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <span className="font-bold hidden md:inline">التالي</span>
            <ChevronLeft size={24} />
          </button>
        </div>

        {isRecording && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-6 py-2 rounded-full text-sm animate-pulse z-20">
            جاري الاستماع...
          </div>
        )}
      </div>

      {/* ================= القسم الأيسر: التحليل ================= */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[200px] flex flex-col justify-center items-center text-center">
          {!feedback && !isProcessing && (
            <div className="text-gray-400 flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 text-[#0A74DA] rounded-full flex items-center justify-center mb-4">
                <Sparkles size={32} />
              </div>
              <h3 className="font-bold text-gray-700 mb-2">المصحف الذكي</h3>
              <p className="text-sm text-gray-500">اقرأ الآيات الظاهرة بصوت واضح، وسأقوم بتحليل تلاوتك.</p>
            </div>
          )}

          {isProcessing && (
             <div className="text-center">
               <Loader2 className="animate-spin text-[#0A74DA] mx-auto mb-4" size={40} />
               <p className="font-bold text-gray-700">جاري تحليل التلاوة...</p>
               <p className="text-xs text-gray-500 mt-2">يتم معالجة الصوت بالذكاء الاصطناعي</p>
             </div>
          )}

          {/* ابحث عن قسم عرض النتيجة (Feedback) واستبدله بهذا التصميم الأكثر حيوية */}
{feedback && (
  <div className="w-full animate-fade-in-up space-y-4">
    {/* دائرة النسبة */}
    <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="64" cy="64" r="60" stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
        <circle 
          cx="64" cy="64" r="60" stroke={feedback.score > 90 ? "#22c55e" : "#eab308"} strokeWidth="8" fill="transparent" 
          strokeDasharray={377} strokeDashoffset={377 - (377 * (feedback.score || 0)) / 100}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-gray-800">{feedback.score}%</span>
        <span className="text-xs text-gray-500">دقة الحفظ</span>
      </div>
    </div>

    {/* بطاقات التقييم الإضافية - الروح الجديدة للتحليل */}
    <div className="grid grid-cols-2 gap-2">
       <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
          <p className="text-[10px] text-blue-600 font-bold mb-1">سرعة التلاوة</p>
          <p className="text-xs text-gray-700 font-medium">{feedback.speed_evaluation || "جاري التقييم..."}</p>
       </div>
       <div className="bg-purple-50 p-2 rounded-xl border border-purple-100">
          <p className="text-[10px] text-purple-600 font-bold mb-1">ملاحظة التجويد</p>
          <p className="text-xs text-gray-700 font-medium">{feedback.tajweed_note || "أداء طيب"}</p>
       </div>
    </div>

    <div className={`p-3 rounded-xl text-sm font-bold ${feedback.score > 90 ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
      {feedback.score > 90 ? "تلاوة ممتازة ومرتلة 🌟" : "تحتاج لتركيز أكثر على المخارج 👍"}
    </div>
  </div>
)}
        </div>

        {feedback && feedback.mistakes && feedback.mistakes.length > 0 && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 overflow-y-auto animate-fade-in-up">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />
              الملاحظات ({feedback.mistakes.length})
            </h3>
            <div className="space-y-3">
              {feedback.mistakes.map((mistake: any, i: number) => (
                <div key={i} className="bg-red-50 p-4 rounded-2xl border border-red-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-amiri font-bold text-lg text-red-700 border-b border-red-200 border-dashed pb-1">
                      {mistake.word}
                    </span>
                    <span className="text-xs bg-white text-red-600 px-2 py-1 rounded-md font-bold shadow-sm">
                      {mistake.type}
                    </span>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600 bg-white/60 p-2 rounded-lg items-center">
                    <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                    <span className="leading-snug">{mistake.advice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= نافذة التفسير المنبثقة ================= */}
      {showTafsir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowTafsir(false)}>
          <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#fdfbf7]">
              <h3 className="font-bold text-gray-800 font-amiri text-xl flex items-center gap-2">
                <BookOpen size={20} className="text-[#C89B3C]" />
                التفسير الميسر - صفحة {currentPage}
              </h3>
              <button onClick={() => setShowTafsir(false)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
              {loadingTafsir ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <Loader2 className="animate-spin text-[#C89B3C] mb-2" size={32} />
                  <p className="text-gray-500">جاري جلب التفسير...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {tafsirData.map((item: any, i: number) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[#0A74DA] font-amiri text-lg mb-2 border-b border-blue-50 pb-2">
                        آية ({item.aya})
                      </p>
                      <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                        {item.translation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}