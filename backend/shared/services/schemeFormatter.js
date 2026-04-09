// Static messages (no GPT needed) — welcome and language selection

function getWelcomeMessage() {
  return `🇮🇳 *YojanaKhoj* — योजना खोज | Apni Yojana Khojo

नमस्ते! / Hello! / வணக்கம்!
మీకు స్వాగతం! / ನಮಸ್ಕಾರ! / স্বাগতম!

अपनी भाषा चुनें / Choose your language:

1️⃣  हिंदी
2️⃣  English
3️⃣  తెలుగు
4️⃣  मराठी
5️⃣  தமிழ்
6️⃣  বাংলা
7️⃣  ಕನ್ನಡ
8️⃣  ગુજરાતી
9️⃣  ਪੰਜਾਬੀ
🔟  ଓଡ଼ିଆ

बस नंबर भेजें / Just send the number (1–10)`;
}

// Shown when language is detected as already a known language name
function getLanguageConfirmation(languageName, languageCode) {
  const greetings = {
    hi: `बढ़िया! 😊 मैं आपको सरकारी योजनाएं ढूंढने में मदद करूंगा। बस 4-5 सवालों के जवाब दीजिए।\n\nपहले बताइए — आप किस राज्य में रहते हैं?`,
    en: `Great! 😊 I'll help you find government schemes you qualify for. Just answer 4-5 simple questions.\n\nFirst — which state do you live in?`,
    te: `చాలా బాగుంది! 😊 మీకు వర్తించే ప్రభుత్వ పథకాలు కనుగొనడంలో నేను సహాయం చేస్తాను.\n\nమొదట — మీరు ఏ రాష్ట్రంలో నివసిస్తున్నారు?`,
    mr: `छान! 😊 मी तुम्हाला सरकारी योजना शोधण्यात मदत करेन.\n\nआधी सांगा — तुम्ही कोणत्या राज्यात राहता?`,
    ta: `நல்லது! 😊 நான் உங்களுக்கு அரசு திட்டங்கள் கண்டுபிடிக்க உதவுவேன்.\n\nமுதலில் — நீங்கள் எந்த மாநிலத்தில் வசிக்கிறீர்கள்?`,
    bn: `দারুণ! 😊 আমি আপনাকে সরকারি প্রকল্প খুঁজে পেতে সাহায্য করব।\n\nপ্রথমে বলুন — আপনি কোন রাজ্যে থাকেন?`,
    kn: `ಒಳ್ಳೆಯದು! 😊 ನಾನು ನಿಮಗೆ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.\n\nಮೊದಲು — ನೀವು ಯಾವ ರಾಜ್ಯದಲ್ಲಿ ವಾಸಿಸುತ್ತೀರಿ?`,
    gu: `સરસ! 😊 હું તમને સરકારી યોજનાઓ શોધવામાં મદદ કરીશ.\n\nપહેલા — તમે કયા રાજ્યમાં રહો છો?`,
    pa: `ਵਧੀਆ! 😊 ਮੈਂ ਤੁਹਾਨੂੰ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਲੱਭਣ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ।\n\nਪਹਿਲਾਂ — ਤੁਸੀਂ ਕਿਸ ਰਾਜ ਵਿੱਚ ਰਹਿੰਦੇ ਹੋ?`,
    or: `ଭଲ! 😊 ମୁଁ ଆପଣଙ୍କୁ ସରକାରୀ ଯୋଜନା ଖୋଜିବାରେ ସାହାଯ୍ୟ କରିବି।\n\nପ୍ରଥମ — ଆପଣ କେଉଁ ରାଜ୍ୟରେ ରୁହନ୍ତି?`,
  };
  return greetings[languageCode] || greetings['en'];
}

// Shown while matching is running (takes 10-20s with GPT)
function getMatchingMessage(languageCode) {
  const msgs = {
    hi: `⏳ आपकी जानकारी के आधार पर 20+ सरकारी योजनाएं जांच रहा हूं...\n\nकृपया 15-20 सेकंड प्रतीक्षा करें 🙏`,
    en: `⏳ Checking your eligibility across 20+ government schemes...\n\nPlease wait 15–20 seconds 🙏`,
    te: `⏳ 20+ ప్రభుత్వ పథకాలలో మీ అర్హత తనిఖీ చేస్తున్నాను...\n\nదయచేసి 15-20 సెకన్లు వేచి ఉండండి 🙏`,
    mr: `⏳ 20+ सरकारी योजनांमध्ये तुमची पात्रता तपासत आहे...\n\nकृपया 15-20 सेकंद थांबा 🙏`,
    ta: `⏳ 20+ அரசு திட்டங்களில் உங்கள் தகுதியை சரிபார்க்கிறேன்...\n\nதயவுசெய்து 15-20 விநாடிகள் காத்திருங்கள் 🙏`,
    bn: `⏳ 20+ সরকারি প্রকল্পে আপনার যোগ্যতা যাচাই করছি...\n\nঅনুগ্রহ করে 15-20 সেকেন্ড অপেক্ষা করুন 🙏`,
    kn: `⏳ 20+ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳಲ್ಲಿ ನಿಮ್ಮ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...\n\nದಯವಿಟ್ಟು 15-20 ಸೆಕೆಂಡ್ ಕಾಯಿರಿ 🙏`,
    gu: `⏳ 20+ સરકારી યોજનાઓમાં તમારી પાત્રતા ચકાસવામાં આવી રહી છે...\n\nકૃપા કરી 15-20 સેકન્ડ રાહ જુઓ 🙏`,
    pa: `⏳ 20+ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਵਿੱਚ ਤੁਹਾਡੀ ਯੋਗਤਾ ਜਾਂਚ ਰਿਹਾ ਹਾਂ...\n\nਕਿਰਪਾ ਕਰਕੇ 15-20 ਸਕਿੰਟ ਉਡੀਕ ਕਰੋ 🙏`,
    or: `⏳ 20+ ସରକାରୀ ଯୋଜନାରେ ଆପଣଙ୍କ ଯୋଗ୍ୟତା ଯାଞ୍ଚ ହେଉଛି...\n\nଦୟାକରି 15-20 ସେକେଣ୍ଡ ଅପେକ୍ଷା କରନ୍ତୁ 🙏`,
  };
  return msgs[languageCode] || msgs['en'];
}

function getErrorMessage(languageCode) {
  const msgs = {
    hi: `❌ कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें या RESTART लिखें।`,
    en: `❌ Something went wrong. Please try again or type RESTART.`,
    te: `❌ ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి లేదా RESTART అని టైప్ చేయండి.`,
    mr: `❌ काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा किंवा RESTART लिहा.`,
    ta: `❌ ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும் அல்லது RESTART என டைப் செய்யவும்.`,
    bn: `❌ কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন বা RESTART লিখুন।`,
    kn: `❌ ಏನೋ ತಪ್ಪಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ RESTART ಎಂದು ಟೈಪ್ ಮಾಡಿ.`,
    gu: `❌ કંઈક ખોटو થઈ ગyuu. ફરીથી પ્રयास करो અथवা RESTART लखो.`,
    pa: `❌ ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ RESTART ਲਿਖੋ।`,
    or: `❌ କିଛି ଭୁଲ ହୋଇଗଲା। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ ଅଥବା RESTART ଲେଖନ୍ତୁ।`,
  };
  return msgs[languageCode] || msgs['en'];
}

function getInvalidLanguageMessage() {
  return `Please send a number between 1 and 10.\nकृपया 1 से 10 के बीच नंबर भेजें।`;
}

module.exports = {
  getWelcomeMessage,
  getLanguageConfirmation,
  getMatchingMessage,
  getErrorMessage,
  getInvalidLanguageMessage,
};
