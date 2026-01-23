import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. اختبار المفاتيح (للتأكد فقط)
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    return NextResponse.json({ error: "API Keys missing" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { userText, originalVerse, type, message } = body;

    // تحديد ما إذا كان الطلب يتطلب رد JSON مهيكل أم مجرد نص (شات)
    const isJsonMode = ['analysis', 'sign_translation', 'sign_analysis'].includes(type);

    let prompt = "";
    let systemInstruction = "";

    // إعداد النصوص حسب نوع الطلب
    // 1. تحليل التلاوة الصوتية
    // داخل ملف route.ts - قسم POST
// داخل ملف route.ts - استبدل قسم التحليل بهذا الكود:
if (type === 'analysis') {
   systemInstruction = `
     أنت خبير تجويد وقراءات محترف. 
     مهمتك: مطابقة "النص المنطوق" مع "نص المصحف" (إملائياً وتشكيلياً).

     القواعد الذهبية للتحليل:
     1. التحليل الموضعي: حلل فقط الكلمات التي نطق بها المستخدم. إذا توقف المستخدم عند الآية 3، لا تعطه ملاحظات عن الآية 4 أو ما بعدها نهائياً.
     2. الاعتماد الإملائي: قارن الصوت بالنص العربي القياسي (وليس الرسم العثماني المعقد) لتجنب الخلط في الحروف.
     3. الدقة المتناهية: إذا قال "العالمين"، لا تذكر حروفاً غير موجودة فيها (مثل القاف). تأكد من الكلمة حرفاً بحرف.
     4. تقييم الأداء: النتيجة (score) تكون بناءً على جودة ما قرأه فقط.

     هيكل الرد JSON (التزم به حرفياً):
     { 
       "score": نسبة الإتقان لما قُرئ فقط,
       "speed_evaluation": "وصف السرعة",
       "tajweed_note": "ملاحظة تجويدية عامة",
       "mistakes": [
         { "word": "الكلمة الأصلية", "type": "نوع الخطأ", "advice": "نصيحة دقيقة" }
       ]
     }
   `;
   prompt = `النص المرجعي (مصحف): "${originalVerse}" \n النص المنطوق فعلياً: "${userText}" \n ملاحظة: حلل ما سمعه الميكروفون فقط ولا تستبق الأحداث.`;
}

    // --- محاولة الاتصال بـ Gemini ---
    try {
      const genAI = new GoogleGenerativeAI(geminiKey || "");
      
      // ✅ التعديل الأهم: تغيير الموديل إلى gemini-pro لحل مشكلة 404
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro", 
        generationConfig: { 
            responseMimeType: isJsonMode ? "application/json" : "text/plain" 
        } 
      });

      const result = await model.generateContent(`${systemInstruction}\n\n${prompt}`);
      const text = result.response.text();
      console.log("✅ رد Gemini نجح");

      if (isJsonMode) {
          const cleaned = text.replace(/```json|```/g, "").trim();
          return NextResponse.json(JSON.parse(cleaned));
      } else {
          return NextResponse.json({ reply: text });
      }

    } catch (geminiError) {
      console.error("⚠️ Gemini Error (Switching to OpenAI):", geminiError);
      
      // --- البديل: OpenAI ---
      if (!openaiKey) throw new Error("فشل Gemini ولا يوجد مفتاح OpenAI");

      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: systemInstruction }, { role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
        // إزالة القيود الصارمة لتجنب المشاكل
      });

      const content = completion.choices[0].message.content || "{}";
      console.log("✅ رد OpenAI نجح");

      if (isJsonMode) {
          // محاولة تنظيف الرد إذا كان يحتوي على JSON
           const jsonMatch = content.match(/\{[\s\S]*\}/);
           const jsonString = jsonMatch ? jsonMatch[0] : content;
           return NextResponse.json(JSON.parse(jsonString));
      } else {
          return NextResponse.json({ reply: content });
      }
    }

  } catch (error: any) {
    console.error("🔥 Server Error:", error.message);
    return NextResponse.json({ error: "Internal Error", details: error.message }, { status: 500 });
  }
}