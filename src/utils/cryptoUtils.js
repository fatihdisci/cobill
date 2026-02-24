/**
 * CoBill — Kripto Servisi
 * Kişisel veri olan IBAN bilgilerinin Firestore'da şifreli saklanmasını sağlar.
 * Güçlü bir şifreleme anahtarı (Secret Key) çevresel değişkenden alınmalıdır.
 * Şimdilik local geliştirme ortamında çalışacak basit bir şifreleme ve XOR mantığı kullanılabilir 
 * (Tarayıcı ortamında Web Crypto asenkron çalıştığından state yönetimini bozmamak adına basit tutulmuştur).
 */

const SECRET_KEY = "cobill-secure-key-2026";

// Basit bir XOR şifrelemesi ve base64 kodlaması kullanarak simetrik şifreleme yapar
export const encryptIBAN = (text) => {
    if (!text || typeof text !== 'string') return text;
    // Zaten şifreli bir metinse (örneğin daha önceden U2Fs... ile başlıyorsa çift şifreleme yapmamak için kontrol edilebilir)
    if (text.startsWith('ENC:')) return text;

    let cipher = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
        cipher += String.fromCharCode(charCode);
    }
    return 'ENC:' + btoa(cipher);
};

export const decryptIBAN = (cipherText) => {
    if (!cipherText || typeof cipherText !== 'string') return cipherText;

    // Eğer şifrelenmemiş (eski veriler veya plaintext) ise olduğu gibi döndür
    if (!cipherText.startsWith('ENC:')) return cipherText;

    try {
        const base64Str = cipherText.replace('ENC:', '');
        const cipher = atob(base64Str);
        let plainText = '';

        for (let i = 0; i < cipher.length; i++) {
            const charCode = cipher.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
            plainText += String.fromCharCode(charCode);
        }
        return plainText;
    } catch (e) {
        console.error("IBAN Çözme (Decryption) hatası:", e);
        return cipherText; // Hata durumunda bozuk metni dön ki fark edilsin
    }
};
