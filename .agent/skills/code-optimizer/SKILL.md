---
name: code-optimizer
description: Projede genel bir hata ayıklama (debugging), kod temizliği (refactoring), kullanılmayan import/değişken temizliği ve performans optimizasyonu yapılacağı zaman devreye girer.
---

# Kod Optimizasyonu ve Debugging Yeteneği

CoBill projesini temizlerken ve optimize ederken aşağıdaki kurallara KESİNLİKLE uymalısın. Sistemin çalışan mantığını asla bozma.

## ⚠️ Dokunulmazlık Kuralları (KRİTİK)
1. **Yapay Zeka Promptları:** `src/services/aiService.js` içindeki Qwen (Magic Draft) ve Grok (Raporlama) promptlarına, yapılarına ve kurallarına KESİNLİKLE DOKUNMA.
2. **Mock User (Demo) Mantığı:** `AppContext.jsx` ve diğer sayfalardaki `test-user-id` veya `demo-user-id` gibi demo kullanıcı mantıklarını (if/else şartlarını) SİLME. Bunlar test süreçleri için gereklidir.
3. **Ghost User:** `dbService.js` içindeki `anonymizeUser` mantığını değiştirme.

## 🧹 Temizlik ve Optimizasyon Görevleri
1. **Ölü Kodlar:** Kullanılmayan (unused) tüm importları, değişkenleri ve Lucide ikonlarını tespit edip sil.
2. **Konsol Temizliği:** Hata yakalama (`catch (error) { console.error(...) }`) dışındaki tüm gereksiz `console.log`, `console.warn` vb. satırları kaldır.
3. **i18n Kontrolü:** Bileşenlerde kullanılan `t('anahtar')` değerlerinin `tr` ve `en` JSON dosyalarında karşılığı olup olmadığını kontrol et. Eksikse uyarı ver veya ekle.
4. **React Uyarıları:** Varsa eksik `key` proplarını listelerdeki (`map`) elemanlara ekle.
5. **Dosya Boyutu:** Aşırı uzun ve karmaşık bileşenler varsa (Örn: `Profile.jsx`), mantığı bozmadan yardımcı fonksiyonları (helpers) dışarı taşıyabileceğini düşün.

İşlemleri yaparken dosyaları parça parça ele al ve her dosya için "Şu dosyada x importunu sildim, y hatasını giderdim" şeklinde Türkçe rapor ver.