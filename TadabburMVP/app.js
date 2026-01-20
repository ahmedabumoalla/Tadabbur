// المتغيرات العامة
let audioContext;
let analyser;
let microphone;
let videoStream;

async function nextStep(step) {
    // إخفاء جميع الشاشات
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));

    // تنفيذ منطق خاص لكل خطوة
    if (step === 2) {
        await startMicrophone(); // تفعيل المايكروفون الحقيقي
    } else if (step === 3) {
        stopMicrophone(); // إيقاف المايكروفون
        await startCamera(); // تفعيل الكاميرا الحقيقية
    } else if (step === 4) {
        stopCamera(); // إيقاف الكاميرا
    }

    // إظهار الشاشة المطلوبة
    document.getElementById('step' + step).classList.add('active');
}

// دالة تشغيل المايكروفون والموجات الصوتية الحقيقية
async function startMicrophone() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const waveContainer = document.querySelector('.wave-visual');
        
        // مسح الموجات القديمة
        waveContainer.innerHTML = ''; 
        // إنشاء أعمدة موجات جديدة
        for(let i=0; i<5; i++) {
            let bar = document.createElement('span');
            bar.id = 'bar-' + i;
            waveContainer.appendChild(bar);
        }

        animateWave(dataArray);
        document.querySelector('.status-text').innerText = "جاري الاستماع لتلاوتك...";
    } catch (err) {
        console.error("فشل الوصول للمايكروفون", err);
        alert("يرجى السماح بصلاحية المايكروفون لتجربة التلاوة");
    }
}

function animateWave(dataArray) {
    if (!analyser) return;
    requestAnimationFrame(() => animateWave(dataArray));
    analyser.getByteFrequencyData(dataArray);

    // تحريك الأعمدة بناءً على قوة الصوت
    for(let i=0; i<5; i++) {
        const bar = document.getElementById('bar-' + i);
        if(bar) {
            const height = (dataArray[i * 10] / 255) * 50 + 10; // معادلة بسيطة للطول
            bar.style.height = height + 'px';
        }
    }
}

function stopMicrophone() {
    if (audioContext) audioContext.close();
}

// دالة تشغيل الكاميرا لمحاكاة لغة الإشارة
async function startCamera() {
    try {
        const videoBox = document.querySelector('#step3 .placeholder-box');
        videoBox.innerHTML = '<video id="signVideo" autoplay playsinline style="width:100%; height:100%; object-fit:cover; border-radius:15px;"></video>';
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoStream = stream;
        const videoElement = document.getElementById('signVideo');
        videoElement.srcObject = stream;
        
        // إضافة تأثير المربع الذكي (كمحاكاة للذكاء الاصطناعي)
        setTimeout(() => {
            let trackingBox = document.createElement('div');
            trackingBox.style.cssText = "position: absolute; border: 3px solid #FCD34D; width: 100px; height: 100px; top: 30%; left: 35%; border-radius: 10px; transition: all 0.5s; box-shadow: 0 0 15px #FCD34D;";
            videoBox.style.position = 'relative';
            videoBox.appendChild(trackingBox);
            
            // تحريك المربع عشوائياً كأنه يتتبع اليد
            setInterval(() => {
                trackingBox.style.top = (20 + Math.random() * 20) + '%';
                trackingBox.style.left = (30 + Math.random() * 20) + '%';
            }, 800);
            
        }, 1000);

    } catch (err) {
        console.error("فشل الوصول للكاميرا", err);
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
}