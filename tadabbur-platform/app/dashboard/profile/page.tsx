"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  User, Mail, Camera, Save, Loader2, AlertCircle, CheckCircle, 
  Medal, Star, Trophy, Zap, Target, BookOpen, X 
} from 'lucide-react';

// === تعريف الأوسمة ===
const ALL_BADGES = [
  { id: 'beginner', name: 'بداية الغيث', desc: 'التسجيل في المنصة وبدء الرحلة', icon: <Star size={20} />, target: 0 },
  { id: 'learner', name: 'طالب علم', desc: 'قضاء ساعة كاملة في التعلم', icon: <BookOpen size={20} />, target: 1 }, // 1 hour
  { id: 'hafiz_1', name: 'حفاظ الوحي', desc: 'حفظ 10 آيات بإتقان', icon: <Target size={20} />, target: 10 }, // 10 verses
  { id: 'signer', name: 'صوت الصمت', desc: 'إتمام 5 جلسات لغة إشارة', icon: <Zap size={20} />, target: 5 }, // 5 sessions
  { id: 'master', name: 'ختم القرآن', desc: 'إتمام ختمة كاملة', icon: <Trophy size={20} />, target: 100 }, // 100%
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  
  // بيانات الملف الشخصي
  const [session, setSession] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // إحصائيات لحساب الأوسمة
  const [stats, setStats] = useState({ learning_hours: 0, memorized_verses: 0, sign_sessions: 0 });

  // 1. جلب البيانات عند التحميل
  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      setSession(session);

      // أ) جلب الملف الشخصي
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`full_name, bio, avatar_url`)
        .eq('id', session.user.id)
        .single();

      // ب) جلب الإحصائيات لحساب الأوسمة
      const { data: recitations } = await supabase.from('recitations').select('ai_score').eq('user_id', session.user.id);
      const { data: signs } = await supabase.from('sign_language_sessions').select('score').eq('user_id', session.user.id);
      
      if (!ignore) {
        // تعيين الاسم: نأخذه من قاعدة البيانات، إذا فارغ نأخذه من جوجل، إذا فارغ نتركه فارغاً
        setFullName(profileData?.full_name || session.user.user_metadata.full_name || '');
        setBio(profileData?.bio || '');
        setAvatarUrl(profileData?.avatar_url || session.user.user_metadata.avatar_url || null);

        // حساب الإحصائيات للأوسمة
        const memorized = recitations?.filter(r => r.ai_score >= 85).length || 0;
        const sessions = signs?.length || 0;
        const hours = Math.floor(((recitations?.length || 0) * 3 + sessions * 5) / 60);

        setStats({ memorized_verses: memorized, sign_sessions: sessions, learning_hours: hours });
      }
      setLoading(false);
    }

    getProfile();
    return () => { ignore = true; };
  }, []);

  // 2. تحديث البيانات
  async function updateProfile() {
    try {
      setSaving(true);
      setMessage(null);

      const { error } = await supabase.from('profiles').upsert({
        id: session?.user.id,
        full_name: fullName,
        bio: bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'تم تحديث ملفك الشخصي بنجاح' });
      
      // تحديث الصفحة لتنعكس البيانات في الشريط الجانبي
      setTimeout(() => window.location.reload(), 1500);

    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
    } finally {
      setSaving(false);
    }
  }

  // 3. رفع الصورة
  async function uploadAvatar(event: any) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('اختر صورة أولاً');

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(urlData.publicUrl);
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  // دالة مساعدة لمعرفة هل الوسام مفتوح أم لا
  const isUnlocked = (badgeId: string) => {
    switch (badgeId) {
      case 'beginner': return true; // دائماً مفتوح
      case 'learner': return stats.learning_hours >= 1;
      case 'hafiz_1': return stats.memorized_verses >= 10;
      case 'signer': return stats.sign_sessions >= 5;
      case 'master': return false; // صعب المنال
      default: return false;
    }
  };

  const unlockedCount = ALL_BADGES.filter(b => isUnlocked(b.id)).length;

  if (loading) {
    return <div className="flex h-[calc(100vh-200px)] items-center justify-center"><Loader2 className="animate-spin text-[#0A74DA]" size={40} /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto font-tajawal animate-fade-in-up pb-10">
      
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">الملف الشخصي</h1>
          <p className="text-gray-500 mt-1">أهلاً بك يا {fullName.split(' ')[0] || 'بطل'} في صفحتك الشخصية</p>
        </div>
        
        {/* زر عرض الأوسمة */}
        <button 
          onClick={() => setShowBadgesModal(true)}
          className="bg-gradient-to-l from-yellow-400 to-yellow-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-yellow-200 hover:scale-105 transition flex items-center gap-2"
        >
          <Medal size={20} />
          <span>إنجازاتي ({unlockedCount}/{ALL_BADGES.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === العمود الأيسر: الصورة والملخص === */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center h-fit">
          <div className="relative group mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-50 relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-[#0A74DA]">
                  <User size={48} />
                </div>
              )}
              {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
            </div>
            <label className="absolute bottom-2 right-0 p-2.5 bg-[#0A74DA] text-white rounded-full cursor-pointer hover:bg-blue-600 transition shadow-md border-2 border-white">
              <Camera size={16} />
              <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" disabled={uploading} />
            </label>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-1">{fullName || "مستخدم جديد"}</h2>
          <p className="text-sm text-gray-500 dir-ltr font-medium">{session?.user.email}</p>
          
          {/* شريط الأوسمة المصغر */}
          <div className="flex justify-center gap-2 mt-6 p-3 bg-gray-50 rounded-2xl w-full">
            {ALL_BADGES.map((badge) => (
              <div 
                key={badge.id} 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${isUnlocked(badge.id) ? 'bg-yellow-100 text-yellow-600 border-yellow-200' : 'bg-gray-200 text-gray-400 border-gray-300 grayscale'}`}
                title={badge.name}
              >
                {badge.icon}
              </div>
            ))}
          </div>
        </div>

        {/* === العمود الأيمن: النموذج === */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-50">
            <User size={20} className="text-[#0A74DA]" />
            المعلومات الشخصية
          </h3>

          <div className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={session?.user.email} 
                  disabled 
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 text-gray-500 border border-gray-200 rounded-xl cursor-not-allowed font-medium"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل</label>
              {/* ✅ تم إصلاح اللون: text-gray-900 */}
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0A74DA] focus:ring-2 focus:ring-blue-50 transition font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نبذة عنك</label>
              {/* ✅ تم إصلاح اللون: text-gray-900 */}
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="شاركنا اهتماماتك أو أهدافك في الحفظ..."
                rows={4}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0A74DA] focus:ring-2 focus:ring-blue-50 transition resize-none font-medium leading-relaxed"
              />
            </div>

            {message && (
              <div className={`p-4 rounded-xl flex items-center gap-2 animate-fade-in ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-bold">{message.text}</span>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button 
                onClick={updateProfile}
                disabled={saving}
                className="bg-[#0A74DA] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200 transform hover:-translate-y-0.5"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                <span>حفظ التغييرات</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* === نافذة الأوسمة المنبثقة (Modal) === */}
      {showBadgesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* رأس النافذة */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fdfbf7]">
              <div>
                <h3 className="font-bold text-2xl text-gray-800 flex items-center gap-2">
                  <Trophy className="text-yellow-500" />
                  لوحة الشرف
                </h3>
                <p className="text-sm text-gray-500 mt-1">اجمع الأوسمة من خلال تفاعلك مع المنصة</p>
              </div>
              <button onClick={() => setShowBadgesModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
                <X size={24} />
              </button>
            </div>

            {/* محتوى النافذة */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ALL_BADGES.map((badge) => {
                  const unlocked = isUnlocked(badge.id);
                  return (
                    <div 
                      key={badge.id} 
                      className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                        unlocked 
                          ? 'bg-white border-yellow-200 shadow-sm' 
                          : 'bg-gray-100 border-gray-200 opacity-60 grayscale'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-inner ${
                        unlocked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {badge.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{badge.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{badge.desc}</p>
                        {unlocked && (
                          <span className="inline-block mt-2 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            مكتسب ✅
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ذيل النافذة */}
            <div className="p-4 bg-white border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">استمر في التعلم لفتح المزيد من الأوسمة!</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}