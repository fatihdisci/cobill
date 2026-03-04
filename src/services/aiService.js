/**
 * CoBill — AI Service (OpenRouter API)
 * Sihirli Taslak: Serbest metinden harcama ayrıştırma
 * AI Rapor: Harcama verilerinden akıllı analiz üretme
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'qwen/qwen2.5-coder-7b-instruct';

// Kategori sabitleri — prompt ve UI tarafında birebir kullanılır
export const AI_CATEGORIES = ['Market', 'Fatura', 'Eğitim', 'Eğlence', 'Ulaşım', 'Diğer'];

// Throttle: Son istek zamanını takip eder (3 saniye bekleme)
let lastRequestTime = 0;
const THROTTLE_MS = 3000;

/**
 * AI yanıtından JSON dizisini güvenli şekilde çıkarır.
 * Markdown ```json bloklarını, açıklama metinlerini ve fazla boşlukları temizler.
 */
function cleanJsonResponse(raw) {
    if (!raw || typeof raw !== 'string') return null;

    let cleaned = raw.trim();
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Qwen ve benzeri modellerin sona eklediği "Fill-in-the-middle" veya kod tamamlama kalıntılarını kes
    const fimIndex = cleaned.indexOf('<|fim_middle|>');
    if (fimIndex !== -1) {
        cleaned = cleaned.substring(0, fimIndex).trim();
    }
    const eofIndex = cleaned.indexOf('<|endoftext|>');
    if (eofIndex !== -1) {
        cleaned = cleaned.substring(0, eofIndex).trim();
    }

    // Markdown code block temizliği: ```json ... ``` veya ``` ... ```
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const match = cleaned.match(codeBlockRegex);
    if (match) {
        cleaned = match[1].trim();
    }

    // İlk '{' ile son '}' arasını çek (Eğer AI dizi değil nesne döndürdüyse)
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return cleaned.substring(firstBrace, lastBrace + 1);
    }

    // İlk '[' ile son ']' arasını çek (AI'ın eklediği açıklama metinlerini at)
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        return cleaned.substring(firstBracket, lastBracket + 1);
    }

    return cleaned;
}

/**
 * AI yanıtından HTML string'ini güvenli şekilde çıkarır.
 * Markdown ```html bloklarını ve fazla boşlukları temizler.
 */
function cleanHtmlResponse(raw) {
    if (!raw || typeof raw !== 'string') return null;

    let cleaned = raw.trim();

    // Markdown code block temizliği: ```html ... ``` veya ``` ... ```
    const codeBlockRegex = /```(?:html)?\s*([\s\S]*?)```/;
    const match = cleaned.match(codeBlockRegex);
    if (match) {
        cleaned = match[1].trim();
    }

    // Eğer <h3> veya <p> ile başlamıyorsa, ilk HTML tag'ine kadar kes
    const firstTag = cleaned.indexOf('<');
    if (firstTag > 0) {
        cleaned = cleaned.substring(firstTag);
    }

    return cleaned;
}

/**
 * Serbest metni OpenRouter API ile ayrıştırır.
 * @param {string} text - Kullanıcının girdiği serbest metin
 * @returns {Promise<Array<{amount: number, title: string, category: string, date: string}>>}
 */
export async function parseMagicDraft(text) {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('API anahtarı bulunamadı. Lütfen .env dosyasına VITE_OPENROUTER_API_KEY ekleyin.');
    }

    // Throttle kontrolü
    const now = Date.now();
    if (now - lastRequestTime < THROTTLE_MS) {
        throw new Error('Lütfen birkaç saniye bekleyip tekrar deneyin.');
    }
    lastRequestTime = now;

    const today = new Date().toISOString().split('T')[0];

    const systemPrompt = `Sen bir harcama ayrıştırıcısın. Kullanıcının serbest metin olarak girdiği harcamaları JSON dizisine dönüştür.

KURALLAR:
1. SADECE bir JSON nesnesi (object) döndür, başka hiçbir şey yazma. JSON kök elementi "expenses" dizisi olmalıdır.
2. Her harcama şu alanlara sahip olmalı: "amount" (sayı), "title" (string), "category" (string), "date" (YYYY-MM-DD string)
3. Kategori SADECE şu değerlerden biri olabilir: ${JSON.stringify(AI_CATEGORIES)}
4. Eğer tarih belirtilmemişse bugünün tarihi (${today}) kullan.
5. Eğer kategori net değilse "Diğer" kullan.
6. Tutarı her zaman pozitif sayı olarak yaz.
7. Bugünün tarihi: ${today}. Kullanıcının 'dün', 'geçen hafta', '3 gün önce' gibi ifadelerini bu tarihe göre matematiksel olarak hesapla ve o tarihi (YYYY-MM-DD) kullan.

ÖRNEK YAPI:
{
  "expenses": [
    { "amount": 0, "title": "...", "category": "Diğer", "date": "YYYY-MM-DD" }
  ]
}`;

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'CoBill Magic Draft',
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text },
            ],
            temperature: 0.1, // Düşük sıcaklık = daha tutarlı JSON çıktısı
            max_tokens: 1024,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(`API hatası (${response.status}): ${errorBody || 'Bilinmeyen hata'}`);
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;

    if (!rawContent) {
        throw new Error('API boş yanıt döndü.');
    }

    const cleanedJson = cleanJsonResponse(rawContent);
    if (!cleanedJson) {
        throw new Error('AI yanıtı ayrıştırılamadı.');
    }

    let parsed;
    try {
        parsed = JSON.parse(cleanedJson);
        if (parsed.expenses) {
            parsed = parsed.expenses;
        }
    } catch {
        console.error("RAW AI OUTPUT:", rawContent);
        console.error("CLEANED JSON:", cleanedJson);
        throw new Error('AI yanıtı geçerli JSON değil. (Konsola bakınız)');
    }

    if (!Array.isArray(parsed)) {
        // Tek nesne döndüyse diziye çevir
        parsed = [parsed];
    }

    // Her öğeyi doğrula ve normalize et
    return parsed.map(item => ({
        amount: Math.abs(parseFloat(item.amount)) || 0,
        title: String(item.title || '').trim() || 'Harcama',
        category: AI_CATEGORIES.includes(item.category) ? item.category : 'Diğer',
        date: isValidDate(item.date) ? item.date : today,
    })).filter(item => item.amount > 0);
}

/**
 * Tarih string'inin geçerli bir YYYY-MM-DD formatında olup olmadığını kontrol eder.
 */
function isValidDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
}

/**
 * Harcama verilerinden yapay zeka destekli bütçe analizi üretir.
 * @param {Array} expenses - Harcama dizisi
 * @param {'personal'|'group'} reportType - Rapor tipi
 * @param {Object} contextData - Ek bağlam (grup adı, üye sayısı vb.)
 * @returns {Promise<string>} HTML formatında rapor
 */
export async function generateAIReport(expenses, reportType, contextData = {}) {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('API anahtarı bulunamadı. Lütfen .env dosyasına VITE_OPENROUTER_API_KEY ekleyin.');
    }

    // Throttle kontrolü
    const now = Date.now();
    if (now - lastRequestTime < THROTTLE_MS) {
        throw new Error('Lütfen birkaç saniye bekleyip tekrar deneyin.');
    }
    lastRequestTime = now;

    if (!expenses || expenses.length === 0) {
        throw new Error('Analiz edilecek harcama bulunamadı.');
    }

    // Token tasarrufu: Sadece gerekli alanları map'le, en fazla 30 harcama gönder
    const slicedExpenses = expenses.slice(0, 30);
    const lightExpenses = slicedExpenses.map(e => ({
        tutar: e.amount,
        kategori: e.category || 'Diğer',
        tarih: e.date ? new Date(e.date).toISOString().split('T')[0] : '?',
        baslik: e.title || e.description || '?',
        ...(reportType === 'group' && e.paidBy ? { odeyen: contextData.memberNames?.[e.paidBy] || e.paidBy } : {}),
    }));

    const totalAmount = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const contextInfo = reportType === 'group'
        ? `GRUP raporu. Grup: "${contextData.groupName || 'Grup'}". ${contextData.memberCount || '?'} üye. Toplam: ${totalAmount.toFixed(0)} ${contextData.currency || 'TRY'}.`
        : `BİREYSEL rapor. Toplam: ${totalAmount.toFixed(0)} TRY.`;

    const systemPrompt = reportType === 'personal'
        ? `Sen bir bankanın VIP portföy yöneticisisin. Sana gönderilen kullanıcının harcamalarını analiz et, bütçeyi domine eden kategorileri ve savurganlık yerine tasarruf potansiyeli olan alanları son derece ağırbaşlı bir dille uzun uzun açıkla. SADECE HTML formatında yanıt vereceksin.

KESİN KURALLAR:
1. Sokak ağzı, argo, laubali veya yargılayıcı kelimeler KESİNLİKLE YASAKTIR. Son derece kurumsal ve ağırbaşlı bir dil kullan.
2. ASLA kendini tanıtma ve giriş/kapanış cümleleri (Teşekkürler vb.) yazma.
3. Rapor KISA OLMAMALIDIR. Harcama alışkanlıklarını neden-sonuç ilişkisi kurarak detaylı paragraflar halinde açıkla.
4. Metni düz paragraflar yerine; <h4> alt başlıkları, <ul> ve <li> maddelemeleriyle parçala.
5. Önemli rakamların ve kritik tespitlerin etrafına <strong> etiketi koy.
6. Her ana bölümün altına (<h3> başlıklarının temsil ettiği alan bittikten sonra) tam olarak şu kodu ekle: <hr style='border: 0; height: 1px; background: var(--border-primary); margin: 20px 0;'>
7. İçgörülerin/paragrafların başına konuya uygun emojiler (🚀, 💡, ⚠️, 💰 vb.) ekleyerek görsel bir hiyerarşi oluştur.
8. Markdown (\`\`\`html vb.) KULLANMA, sadece saf HTML string döndür.
9. Türkçe yaz.

Rapor tam olarak şu 3 ana bölümden oluşacak:

<h3>📊 Bireysel Finansal Özet</h3>
Toplam harcamanın genel durumu ve harcama disiplini analizi.

<h3>🔍 Harcama Alışkanlıkları ve Kategori Analizi</h3>
Bütçeyi domine eden kategorilerin, rutin giderlerin ve büyük ölçekli harcamaların detaylı incelemesi.

<h3>🎯 Kişisel Bütçe Optimizasyonu</h3>
Yaşam standardını koruyarak uygulanabilecek 3-4 adet stratejik ve yapıcı tasarruf hamlesi.

${contextInfo}`
        : `Sen uluslararası düzeyde hizmet veren, son derece saygılı, objektif ve detaycı bir Kıdemli Finansal Analistsin. Amacın, sana gönderilen verileri yüzeysel okumak değil; bütçe sağlığını, harcama dağılımlarını ve olası dengesizlikleri tane tane, uzun ve profesyonel bir dille raporlamaktır. SADECE HTML formatında yanıt vereceksin.

KESİN KURALLAR:
1. Sokak ağzı, argo, laubali veya yargılayıcı kelimeler (örn: "savurganlık", "freeloader", "bedavacı", "aptal") KESİNLİKLE YASAKTIR. Son derece kurumsal ve ağırbaşlı bir dil kullan.
2. ASLA kendini tanıtma ("Ben bir danışmanım", "Size yardımcı olayım" vs. deme).
3. ASLA giriş veya kapanış cümlesi yazma ("İşte raporunuz", "Teşekkür ederim", "Saygılarımla" YASAKTIR).
4. Rapor KISA OLMAMALIDIR. Her bir durumu, harcama kalemini ve kişi bazlı dengesizliği neden-sonuç ilişkisiyle, tane tane ve detaylı paragraflar halinde açıkla.
5. Metni düz paragraflar yerine; <h4> alt başlıkları, <ul> ve <li> maddelemeleriyle parçala.
6. Önemli rakamların ve kritik tespitlerin etrafına <strong> etiketi koy.
7. Her ana bölümün altına (<h3> başlıklarının temsil ettiği alan bittikten sonra) tam olarak şu kodu ekle: <hr style='border: 0; height: 1px; background: var(--border-primary); margin: 20px 0;'>
8. İçgörülerin/paragrafların başına konuya uygun emojiler (🚀, 💡, ⚠️, 💰 vb.) ekleyerek görsel bir hiyerarşi oluştur.
9. Markdown (\`\`\`html vb.) KULLANMA, sadece saf HTML string döndür.
10. Türkçe yaz.

Rapor tam olarak şu 3 ana bölümden oluşacak:

<h3>📊 Yönetici Özeti</h3>
Toplam harcama durumunun, aktif dönemin ve genel bütçe sağlığının detaylı, profesyonel bir özeti.

<h3>🔍 Harcama Dağılımı ve Finansal Analiz</h3>
Kategorilerin ve kişi bazlı harcamaların detaylı incelemesi. Hangi kalemlerin bütçede ağırlık yarattığı, ödeme yükünün katılımcılar arasında nasıl dağıldığı objektif ve rakamsal verilerle, uzun uzun anlatılmalı.

<h3>🎯 Optimizasyon ve Stratejik Eylem Planı</h3>
Bütçe verimliliğini artırmak ve grup içi finansal adaleti sağlamak adına yapıcı, nazik, net ve uygulanabilir 3-4 adet stratejik tavsiye.

${contextInfo}`;

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'CoBill AI Report',
        },
        body: JSON.stringify({
            model: 'x-ai/grok-4.1-fast',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(lightExpenses) },
            ],
            temperature: 0.6,
            max_tokens: 3000,
            presence_penalty: 0.3,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(`API hatası (${response.status}): ${errorBody || 'Bilinmeyen hata'}`);
    }

    const data = await response.json();

    if (data.error) {
        console.error('OpenRouter Hata Detayı:', data.error);
        throw new Error(`OpenRouter Hatası: ${data.error.message || 'Bilinmeyen hata'}`);
    }

    if (!data.choices || data.choices.length === 0) {
        console.error('OpenRouter boş choices döndü:', data);
        throw new Error('API geçerli bir sonuç döndürmedi.');
    }

    const rawContent = data.choices[0]?.message?.content;
    const finishReason = data.choices[0]?.finish_reason;

    // finish_reason 'length' olsa bile gelen kısmi içeriği kabul et (graceful degradation)
    if (!rawContent || rawContent.trim().length === 0) {
        console.error('OpenRouter boş içerik döndü:', data.choices[0]);
        throw new Error(`API boş yanıt döndü. (finish_reason: ${finishReason || 'Bilinmiyor'})`);
    }

    if (finishReason === 'length') {
        console.warn('AI raporu token limitine takıldı, kısmi içerik kullanılacak.');
    }

    const cleanedHtml = cleanHtmlResponse(rawContent);
    if (!cleanedHtml) {
        console.error('Temizlenmiş HTML boş:', rawContent);
        throw new Error('AI rapor yanıtı HTML olarak ayrıştırılamadı.');
    }

    return cleanedHtml;
}