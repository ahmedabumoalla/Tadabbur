import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { NextResponse } from "next/server";

// إعداد العملاء
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const body = await req.json(); 
    const { userText, originalVerse, type, message } = body;

    let prompt = "";
    let systemInstruction = "";

    // 1. تحليل التلاوة الصوتية
    if (type === 'analysis') {
       // ... (نفس الكود السابق للتحليل الصوتي)
       systemInstruction = `أنت خبير تجويد. قارن التلاوة بالنص. الرد JSON: { "score": number, "mistakes": [], "status": "" }`;
       prompt = `الآية: "${originalVerse}" \n تلاوة: "${userText}"`;
    } 
    // 2. ترجمة النص إلى وصف إشاري (للعرض)
    else if (type === 'sign_translation') {
       // ... (نفس الكود السابق للترجمة)
       systemInstruction = `مترجم لغة إشارة. الرد JSON: { "original": "", "signs": [] }`;
       prompt = `ترجم: "${userText}"`;
    }
    // 3. 🆕🆕🆕 الجديد: تحليل تسميع لغة الإشارة (تقييم المستخدم)
    else if (type === 'sign_analysis') {
      systemInstruction = `
        أنت مدرب خبير في لغة الإشارة للصم ولجنة تحكيم.
        المهمة: سأعطيك الآية التي يحاول المستخدم تسميعها بلغة الإشارة.
        بما أننا في بيئة تجريبية ولا يمكننا رؤية الفيديو فعلياً، قم بـ "محاكاة" عملية تقييم واقعية جداً.
        
        افترض أن المستخدم قام بالأداء، وأعطه تقييماً (بين 70% إلى 95%).
        حدد أخطاء شائعة يقع فيها المبتدئون عند تسميع هذه الآية تحديداً (مثلاً: تعابير الوجه، سرعة اليدين، دقة الإشارة).
        
        الرد يجب أن يكون JSON حصراً بهذا الشكل:
        {
          "score": رقم من 100,
          "feedback_title": "عنوان ملخص للأداء (مثلاً: أداء ممتاز مع ملاحظات بسيطة)",
          "mistakes": [
            { "aspect": "تعبير الوجه", "observation": "كان الوجه جامداً أثناء كلمة العذاب", "correction": "يجب إظهار ملامح الحزن والخشوع" },
            { "aspect": "حركة اليد", "observation": "وصف الخطأ...", "correction": "التصحيح..." }
          ],
          "advice": "نصيحة عامة للتحسين"
        }
      `;
      prompt = `المستخدم يقوم بتسميع الآية: "${originalVerse}" بلغة الإشارة. قم بتحليل الأداء المتوقع وإعطاء النتيجة.`;
    }
    // 4. الشات العادي
    else {
      systemInstruction = `أنت مساعد ذكي إسلامي.`;
      prompt = message || userText;
    }

    // --- التنفيذ (Gemini ثم OpenAI) ---
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" } 
      });
      const result = await model.generateContent(`${systemInstruction}\n\n${prompt}`);
      const text = result.response.text().replace(/```json|```/g, "").trim();
      return NextResponse.json(JSON.parse(text));
    } catch (geminiError) {
      // Fallback to OpenAI logic...
      const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: systemInstruction }, { role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
        response_format: { type: "json_object" }
      });
      return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
    }

  } catch (error) {
    return NextResponse.json({ error: "خطأ في السيرفر" }, { status: 500 });
  }
}