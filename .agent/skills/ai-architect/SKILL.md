---
name: ai-architect
description: Projedeki yapay zeka (AI) servisleri, promptlar, raporlama, API limitleri veya önbellek (caching/signature) işlemleri güncelleneceğinde kullanılır.
---

# AI Servisleri ve Caching Yönetim Yeteneği

CoBill projesinde yapay zeka entegrasyonları stratejik olarak ayrılmıştır. `src/services/aiService.js` veya `Reports.jsx` dosyalarında çalışırken bu kuralları uygula:

## Model Ayrışımı
1. **Magic Draft (Sihirli Taslak):** Serbest metinden masraf çıkarma işi için KESİNLİKLE `qwen/qwen2.5-coder-7b-instruct` modelini kullan. Bu model JSON nesnesi döndürür, harf hatalarını (typo) otomatik düzeltir. Bu koda dokunma.
2. **AI Analizi (Raporlama):** Raporlama kısmında KESİNLİKLE `x-ai/grok-4.1-fast` modelini kullan. Bu model HTML döndürür. Argo kullanmadan "Kıdemli Finansal Analist" (Grup için) veya "VIP Portföy Yöneticisi" (Bireysel için) personasıyla çalışır.

## Akıllı Cache ve Limitler (Reports.jsx)
- **Signature (İmza):** Kullanıcının gereksiz API isteği atmasını engellemek için her harcama listesinin benzersiz bir imzasını (`masrafSayisi_toplamTutar_sonID`) oluştur.
- İmza aynıysa API'ye gitme, `localStorage`'daki HTML'i getir ve kullanıcıya sahte/psikolojik bir başarı mesajı (toast) göster.
- **Limit:** Günlük maksimum 3 grup, 3 bireysel rapor limiti (`localStorage` üzerinden) uygula.