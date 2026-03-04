/**
 * CoBill — AI Service (OpenRouter API)
 * Sihirli Taslak: Serbest metinden harcama ayrıştırma
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

    // Markdown code block temizliği: ```json ... ``` veya ``` ... ```
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const match = cleaned.match(codeBlockRegex);
    if (match) {
        cleaned = match[1].trim();
    }

    // İlk '[' ile son ']' arasını çek (AI'ın eklediği açıklama metinlerini at)
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
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
1. SADECE JSON dizisi döndür, başka hiçbir şey yazma.
2. Her harcama şu alanlara sahip olmalı: "amount" (sayı), "title" (string), "category" (string), "date" (YYYY-MM-DD string)
3. Kategori SADECE şu değerlerden biri olabilir: ${JSON.stringify(AI_CATEGORIES)}
4. Eğer tarih belirtilmemişse bugünün tarihi (${today}) kullan.
5. Eğer kategori net değilse "Diğer" kullan.
6. Tutarı her zaman pozitif sayı olarak yaz.

ÖRNEK ÇIKTI:
[{"amount": 500, "title": "Market alışverişi", "category": "Market", "date": "${today}"}]`;

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
    } catch {
        throw new Error('AI yanıtı geçerli JSON değil. Lütfen tekrar deneyin.');
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
