---
name: i18n-manager
description: Arayüze yeni bir buton, metin, sayfa, uyarı mesajı (toast) veya özellik eklendiğinde devreye girer. Projenin çoklu dil yapısını yönetir.
---

# Çoklu Dil (i18n) Yönetim Yeteneği

CoBill projesi global bir projedir ve `react-i18next` kullanmaktadır. Yeni bir UI elemanı eklerken aşağıdaki adımları KESİNLİKLE uygula:

## Uygulama Kuralları
1. **Hardcode Yasak:** Component içlerine ASLA doğrudan Türkçe veya İngilizce sabit metin yazma. Her zaman `t('key')` kancasını (`useTranslation`) kullan.
2. **Çift Taraflı Güncelleme:** Yeni bir anahtar (key) belirlediğinde, bunu *aynı anda* iki dosyaya birden eklemek ZORUNDASIN:
   - `src/locales/tr/translation.json` (Türkçe karşılığı)
   - `src/locales/en/translation.json` (İngilizce karşılığı)
3. **Profesyonel Çeviri:** İngilizce çevirileri yaparken Google Translate ağzı kullanma, modern UI/UX terminolojisine uygun (örn: "Masraf Ekle" -> "Add Expense") çeviriler yap.