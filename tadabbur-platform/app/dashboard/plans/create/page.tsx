"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  Target, BookOpen, Repeat, Save, 
  ArrowRight, Check, Loader2, Bookmark 
} from 'lucide-react';

// خيارات الألوان المتاحة
const COLORS = [
  { name: 'أزرق', value: 'bg-blue-500', ring: 'ring-blue-500' },
  { name: 'أخضر', value: 'bg-green-500', ring: 'ring-green-500' },
  { name: 'بنفسجي', value: 'bg-purple-500', ring: 'ring-purple-500' },
  { name: 'برتقالي', value: 'bg-orange-500', ring: 'ring-orange-500' },
  { name: 'وردي', value: 'bg-pink-500', ring: 'ring-pink-500' },
  { name: 'تيركواز', value: 'bg-teal-500', ring: 'ring-teal-500' },
];

// أنواع الخطط
const PLAN_TYPES = [
  { id: 'memorize', title: 'حفظ جديد', icon: <Bookmark />, desc: 'حفظ سور أو أجزاء جديدة' },
  { id: 'revision', title: 'مراجعة وتثبيت', icon: <Repeat />, desc: 'مراجعة ما تم حفظه سابقاً' },
  { id: 'khatam', title: 'ختم القرآن', icon: <BookOpen />, desc: 'تلاوة المصحف كاملاً' },
];

export default function CreatePlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // بيانات النموذج
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState(PLAN_TYPES[0].id);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // إضافة الخطة لقاعدة البيانات
        const { error } = await supabase.from('plans').insert({
          user_id: user.id,
          title: title,
          color: selectedColor,
          progress: 0 
        });

        if (error) throw error;

        // العودة للداشبورد
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('حدث خطأ أثناء إنشاء الخطة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto font-tajawal animate-fade-in-up">
      
      {/* رأس الصفحة */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()} 
          className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition"
        >
          <ArrowRight size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إنشاء خطة جديدة</h1>
          <p className="text-gray-500 text-sm">حدد هدفك وابدأ رحلتك مع القرآن</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. اختيار نوع الخطة */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Target size={18} className="text-[#0A74DA]" />
            نوع الخطة
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLAN_TYPES.map((type) => (
              <div 
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
                  selectedType === type.id 
                    ? 'border-[#0A74DA] bg-blue-50 text-[#0A74DA]' 
                    : 'border-gray-100 hover:border-blue-100 text-gray-600'
                }`}
              >
                <div className={`p-3 rounded-full ${selectedType === type.id ? 'bg-white' : 'bg-gray-100'}`}>
                  {type.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{type.title}</h4>
                  <p className="text-[10px] opacity-70 mt-1">{type.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. تفاصيل الخطة */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-4">اسم الخطة</label>
          {/* 👇👇👇 تم إضافة text-gray-900 هنا لضمان ظهور النص باللون الداكن 👇👇👇 */}
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: حفظ جزء عم، مراجعة سورة البقرة..."
            className="w-full p-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0A74DA] focus:ring-2 focus:ring-blue-100 transition font-medium"
            required
          />
        </div>

        {/* 3. اختيار اللون */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-4">لون الخطة (للتمييز)</label>
          <div className="flex flex-wrap gap-4">
            {COLORS.map((color) => (
              <button
                type="button"
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-10 h-10 rounded-full ${color.value} flex items-center justify-center transition-transform hover:scale-110 ${
                  selectedColor === color.value ? `ring-4 ring-offset-2 ${color.ring}` : ''
                }`}
              >
                {selectedColor === color.value && <Check className="text-white" size={20} />}
              </button>
            ))}
          </div>
        </div>

        {/* زر الحفظ */}
        <button 
          type="submit"
          disabled={loading || !title.trim()}
          className="w-full bg-[#0A74DA] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              جاري إنشاء الخطة...
            </>
          ) : (
            <>
              <Save size={20} />
              حفظ وبدء الخطة
            </>
          )}
        </button>

      </form>
    </div>
  );
}