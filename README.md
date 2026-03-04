# CoBill — Akıllı Ortak Hesap ve Bireysel Harcama Yönetimi 💸

**CoBill**, ev arkadaşları, ofis çalışanları, seyahat grupları ve aileler için geliştirilmiş, harcamaları adil, şeffaf ve stressiz bir şekilde takip etmenizi sağlayan yeni nesil bir **ortak bütçe ve bireysel harcama yönetim uygulamasıdır**. Geleneksel hesaplaşma stresini ortadan kaldırır, kimin kime ne kadar borçlu olduğunu algoritmik olarak sadeleştirir.

🌐 **Canlı Demo:** [https://fatihdisci.github.io/cobill/](https://fatihdisci.github.io/cobill/)

---

## 🚀 Öne Çıkan Özellikler

### 👥 Grup Masraf Takibi
- **Grup ve Üye Yönetimi:** Farklı dinamikler için (Ev, Tatil, Ofis vb.) sınırsız grup oluşturma ve yönetme imkanı.
- **Akıllı Borç Sadeleştirme (Debt Simplification):** Karmaşık borç ağlarını en az işlemle çözmek için optimize edilmiş Greedy algoritması.
- **Kategorize Edilmiş Harcamalar:** Market, Fatura, Yemek, Ulaşım vb. harcamaları piktogramlarla kategorize edebilme.
- **Tekrarlayan Masraflar (Abonelikler & Kiralar):** Her ay yenilenen fatura, kira veya Netflix gibi abonelikleri yapılandırma.
- **WhatsApp ve E-Posta Hatırlatıcıları:** Kişiye özel hesaplanmış borç miktarlarını tek bir tuşla kopyalama, doğrudan WhatsApp üzerinden hatırlatıcı gönderebilme.

### 🤖 AI Destekli Bütçe Analizleri (Grok 4.1 Fast) — **YENİ ✨**
- **VIP Bireysel Finans Analisti:** Bireysel raporlarınız için, banka VIP portföy yöneticisi kimliğiyle çalışan yapay zeka. Harcamalarınızı analiz eder, nerede savurganlık yaptığınızı objektif bir şekilde açıklayıp tasarruf fırsatları sunar.
- **Akıllı Grup Raporları:** Grup içindeki kimin ne kadar ödediğini, ortak bütçenin nerede şiştiğini detaylı ve kurumsal düzeyde analiz eden raporlama.
- **Şık Rapor Modalı:** Camsı ekran tasarımı (Glassmorphism), hiyerarşik format (başlıklar, maddeleme), önemli rakamlarda vurgular ve konuya özel emojilerle zenginleştirilmiş etkileyici HTML çıktısı.
- **Aksiyon Butonları:** Çıkarılan analiz ve raporları doğrudan panoya kopyalama ve tek tuşla **WhatsApp üzerinden paylaşım** imkanı.

### 🤖 Sihirli Taslak (Magic Draft) — **GELİŞTİRİLDİ ✨**
- **AI Destekli Harcama Ekleme:** "Dün markete 1500 TL, sinemaya 120 TL ödedim" gibi serbest metinleri OpenRouter API (Qwen modeli) aracılığıyla saniyeler içinde analiz edip yapılandırılmış formlara dönüştürür.
- **Akıllı Tarih ve Yazım Düzeltme (Typo Correction):** Hatalı ve devrik metin girişlerini algılar, harf (typo) hatalarını düzeltir. "Dün", "3 gün önce" gibi ifadeleri matematiksel olarak geçerli tarihlere çevirir.
- **Kusursuz Veri Ayrıştırma (Robust Parsing):** Yapay zekanın fazla gevezelik ettiği veya `<think>` gibi bloklar (örn. `fim_middle`) koyduğu zamanlarda bile metinden doğrudan saf JSON'ı ayıklar ve stabil bir deneyim sunar.

### 💰 Bireysel Masraf Takibi (Personal Finance Tracker)
- **Kişisel Cüzdan:** Aylık toplam harcama özeti, kategoriye göre filtreleme ve silme işlemleri.
- **Bireysel Harcama Formu:** Para birimi seçimi, büyük tutar giriş alanı, kategori chip butonları ve tarih seçici ile hızlı veri girişi.
- **Tekrarlayan Bireysel Masraf:** Her ay otomatik eklenmesi için gün seçici ile tekrarlayan harcama tanımlama.
- **Kategoriler:** 🛒 Market, 📋 Fatura, 📚 Eğitim, 🎬 Eğlence, 🚕 Ulaşım, 📦 Diğer.
- **Bireysel Raporlar:** Kategori bazlı dağılım (yüzde ve progress bar), toplam harcama ve masraf sayısı istatistikleri.
- **Tarih Filtreleme:** Ayrıntılı tarih aralığı, ay/yıl seçimi ve hızlı periyot filtreleriyle esnek raporlama.

### 📊 Raporlar ve Analitikler
- **Segmented Control:** "Grup Raporları" ve "Bireysel Raporlar" arasında tek tıkla geçiş.
- **Görsel Analitikler:** Harcama dağılımı donut chart (tüm kullanıcılar için ücretsiz), kişi başı bar chart, kategori breakdown.
- **PDF ve Excel Dışa Aktarma:** Profesyonel dizayn edilmiş şeffaf bilançolar ve ekstre indirme imkanı.
- **Evrensel Filtreleme:** Uygulama genelinde standartlaşan, her sayfadan erişilebilen zaman bazlı gelişmiş filtreleme modülü.

### 🌎 Çoklu Dil Desteği (i18n)
- **Türkçe ve İngilizce (TR/EN):** Uygulamanın tüm yönleri, Login/Register sayfaları dahil olmak üzere çoklu dil desteğine kavuşturuldu.

### 🎨 Navigasyon ve UI
- **Yüzen Buton (FAB):** Mobil arayüzde ekranın sağ altına sabitlenmiş, kolay erişimli animasyonlu "+" butonu.
- **Floating Action Menu:** FAB'a basınca "Bireysel Harcama", "Grup Masrafı" ve "Sihirli Taslak" seçeneklerinin akıcı şekilde açılması.
- **Mobil Tab Bar:** `[ 💳 Cüzdan | 👥 Gruplar | 💸 Ödemeler | 📊 Raporlar | 👤 Profil ]` yapısı.
- **Glassmorphism UI:** Modern buzlu cam efekti premium arayüz tasarımı, akıcı geçişler ve gradient butonlar.

### 🔐 Güvenlik ve Senkronizasyon
- **🔄 Gerçek Zamanlı Senkronizasyon:** Firebase Firestore `onSnapshot` dinleyicileri ile anlık güncelleme.
- **✉️ Güvenli Davet Mekanizması:** E-posta ile davet, kabul/red hakkı kullanıcıda.
- **🛡️ Masraf Silme Yetkilendirmesi:** Yalnızca ekleyen veya grup admini silebilir.
- **🔔 Anlık Bildirimler:** Capacitor Local Notifications entegrasyonu.

---

## 📱 Ekran Yapısı

| Sayfa | Rota | Açıklama |
|-------|------|----------|
| Dashboard | `/` | Genel özet (eski ana sayfa) |
| Gruplar | `/groups` | Grup listesi + stat kartlar + aktivite feed + harcama grafiği (Ücretsiz) |
| Grup Detay | `/group/:id` | Grubun masrafları, borç durumu, üyeler |
| Masraf Ekle | `/add-expense` | Grup masrafı ekleme formu |
| Cüzdan | `/wallet` | Bireysel harcamalar, aylık özet, filtreleme |
| Bireysel Harcama Ekle | `/add-personal` | Bireysel masraf formu |
| Ödemeler | `/settlements` | Borç ödeme takibi |
| Raporlar | `/reports` | Grup ve bireysel AI Analizler ve görsel rapor verileri |
| Profil | `/profile` | Kullanıcı ayarları, şifre sıfırlama, çıkış |
| Ayarlar | `/settings` | Uygulama ayarları, dil (Language) seçimi, bildirim tercihleri |

---

## 🛠 Kullanılan Teknolojiler

### Frontend
- **Framework:** React 18 & Vite
- **Routing:** React Router DOM (v6)
- **Stil & UI:** Vanilla CSS (Glassmorphism mimarisi, CSS Custom Properties), Lucide Icons
- **Çoklu Dil (i18n):** `react-i18next`
- **Chart:** Recharts
- **PDF:** jspdf & html2canvas

### Backend & Veri Yapısı (Serverless)
- **Database:** Firebase Firestore (Real-time)
- **Auth:** Firebase Authentication (Email/Password)
- **AI Integrasyonu:** OpenRouter API (Grok, Qwen)

### Firestore Koleksiyonları
| Koleksiyon | Açıklama |
|------------|----------|
| `users` | Kullanıcı profil bilgileri ve ayarları |
| `groups` | Grup meta verisi ve üye listesi |
| `expenses` | Grup masrafları |
| `settlements` | Borç ödemeleri |
| `invitations` | Grup davetleri (pending/accepted/rejected) |
| `personal_expenses` | Bireysel harcamalar |

### Native Entegrasyon
- **Platform:** Capacitor (iOS / Android)
- **Eklentiler:** Haptic Engine, Share API, AdMob (Banner & Interstitial)

---

## 💡 Kurulum ve Geliştirme

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/fatihdisci/cobill.git
cd cobill
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Çevre Değişkenleri (.env)
Kök dizinde `.env` dosyası oluşturun:

```env
VITE_FIREBASE_API_KEY="AIzaSy...your-key"
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project"
VITE_FIREBASE_STORAGE_BUCKET="your-bucket.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:12345...:web:abcde..."
VITE_OPENROUTER_API_KEY="sk-or-v1-..."
```

### 4. Geliştirme Sunucusunu Başlatma
```bash
npm run dev
```

---

## 📱 Native Android / iOS Derlemesi

```bash
npm run build
npx cap sync android
npx cap open android
```

---

## 📐 Mimari Kararlar

| Kavram | Çözüm |
|--------|-------|
| **Borç Sadeleştirme** | Greedy Approach: tüm alacak/verecekler havuzlanıp en az işleme indirgenir |
| **Premium Modeli** | UI'dan gelen `isPro` bayrağı ile feature gating; AI raporları ve PDF dışa aktarım erişimi |
| **Reklam Stratejisi** | Interstitial reklamlar sayfa geçişlerinde; Pro kullanıcılar muaf |
| **Real-Time Sync** | Firestore `onSnapshot` dinleyicileri + cleanup; bellek sızıntısı önlemi |
| **Yetkilendirme** | `expense.paidBy === currentUser || group.createdBy === currentUser` kuralı |

---

## 🚧 Tamamlanması Gereken Özellikler

### Yakında Gelecek
| Özellik | Durum | Açıklama |
|---------|-------|----------|
| **Bireysel Ekstre PDF** | ✅ Tamamlandı | Bireysel harcama dökümleri PDF olarak indirilip paylaşılabilir |
| **Tekrarlayan Masraf Otomasyonu** | ✅ Tamamlandı | Vadesi gelen tekrarlayan masraflar otomatik olarak listeye dahil edilir |
| **🤖 AI Harcama Analizi** | ✅ Tamamlandı | Harcama patternlerini analiz ederek tasarruf önerileri ve grup dengesi raporlama (Grok ile) |
| **Çoklu Dil Desteği (i18n)** | ✅ Tamamlandı | Uygulama geneli Türkçe/İngilizce destekli altyapı oluşturuldu |
| **Bildirim Tercihleri** | 🔘 UI Var | Ayarlar sayfasında bildirim toggle'ları mevcut, backend bağlantısı yapılacak |
| **Tema/Dark Mode Geçişi** | 🔘 CSS Hazır | CSS değişken altyapısı dark mode'a uygun, toggle mekanizması eklenecek |
| **Gerçek Ödeme Entegrasyonu** | 🔲 Planlandı | Borç ödemelerinde gerçek para transferi (Stripe/İyzico) entegrasyonu |

### Gelecek Planları
- **📈 Bütçe Limitleri:** Kategoriye göre aylık bütçe belirleme ve aşım uyarısı
- **📱 Push Notification Backend:** Firebase Cloud Messaging ile gerçek push bildirim altyapısı
- **📸 Fiş/Fatura Fotoğrafı:** OCR kullanımıyla doğrudan faturadan otomatik masraf oluşturma
- **🌍 Çoklu Para Birimi Dönüşümü:** Gerçek zamanlı kur ile otomatik çevrim

---

## ✨ Katkıda Bulunma

1. Repoyu Fork'layın
2. Yeni bir dal açın (`git checkout -b feature/YeniOzellik`)
3. Değişiklikleri pushlayın (`git push origin feature/YeniOzellik`)
4. Pull Request açın!

## 📄 Lisans

Bu proje özel mülkiyet altındadır (Proprietary). Tüm hakları **Fatih Dişçi** tarafına aittir. Kopyalanması ve izinsiz yayılması kısıtlanmıştır.
