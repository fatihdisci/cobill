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

### 💰 Bireysel Masraf Takibi (Personal Finance Tracker) — **YENİ ✨**
- **Kişisel Cüzdan:** Grup bağımsız tamamen özel bireysel harcamaları izleme, aylık özet, kategori filtreleme.
- **Bireysel Harcama Formu:** Para birimi seçimi, büyük tutar giriş alanı, kategori chip butonları ve tarih seçici ile hızlı veri girişi.
- **Tekrarlayan Bireysel Masraf:** Her ay otomatik eklenmesi için gün seçici ile tekrarlayan abonelik (Spotify vb.) tanımlama.
- **Bireysel Raporlar:** Kategori bazlı dağılım (yüzde ve progress bar), toplam harcama istatistikleri ve gelişmiş zaman filtreleri.

### 🤖 AI Destekli Analiz & Sihirli Taslak — **YENİ ✨**
- **Sihirli Taslak (Magic Draft):** "Dün markete 1500 TL ödedim" gibi serbest metinleri OpenRouter API (Qwen modeli) aracılığıyla analiz edip saniyeler içinde forma dönüştürür.
- **VIP Finans Analisti (Grok 4.1 Fast):** Bireysel harcamalarınızı analiz eder, nerede savurganlık yaptığınızı objektif bir şekilde açıklayıp tasarruf fırsatları sunar.
- **Akıllı Grup Raporları:** Grupta kimin ne kadar ödediğini analiz eden kurumsal düzeyde HTML çıktılı raporlama.

### 🎨 Premium UI / UX Tasarım
- **Glassmorphism UI:** Modern buzlu cam efekti premium arayüz tasarımı, akıcı geçişler ve gradient butonlar.
- **Tam Uyumlu Koyu Mod (Dark Mode):** Tüm sayfalar, tablolar ve menüler için tek tek optimize edilmiş şık ve göz yormayan derin `.dark` tema seçeneği.
- **Mobil Interactive Tab Bar:** Aktif menü sekmesinin organik bir şekilde genişlediği `[ O Cüzdan | 👥 | 💸 | 📊 | 👤 ]` tasarım.
- **Premium PNG Avatarlar:** Kullanıcıların kendilerini ifade edebilmesi için yüksek çözünürlüklü özel çizim profil avatarları (Atlas, Sofia, Leo vb.). Hem açık hem koyu temada muhteşem bir görünüm sunar.

### 🛡️ Güvenlik ve Uyumluluk
- **🔄 Gerçek Zamanlı Senkronizasyon:** Firebase Firestore `onSnapshot` dinleyicileri ile anlık güncelleme.
- **✉️ Güvenli Davet Mekanizması:** E-posta ile davet sistemi, kabul/red hakkı kullanıcıda.
- **👻 Hayalet Kullanıcı (Ghost User):** Uygulama bütünselliğini korumak adına GDPR/App Store hesap silme gereksinimlerini sağlayan akıllı anonimleştirme altyapısı. Kullanıcı hesabını tamamen silse bile eski grup geçmişinde hesaplamalar çökmez.

### 🌎 Çoklu Dil Desteği (i18n)
- **Türkçe ve İngilizce (TR/EN):** Giriş alanları, menüler ve bildirimler (`react-i18next` altyapısı) geneli çoklu dil desteğine kavuşturuldu.

---

## 📱 Ekran Yapısı

| Sayfa | Rota | Açıklama |
|-------|------|----------|
| Dashboard | `/` | Genel özet (mevcut aktif projeden kaldırıldı/revize edildi) |
| Cüzdan | `/wallet` | Bireysel harcamalar, aylık özet, filtreleme bölümü |
| Gruplar | `/groups` | Grup listesi + aktivite feed + harcama özeti grafikleri |
| Grup Detay | `/group/:id` | Grubun masrafları, borç durumu, gelişmiş üye kontrolleri |
| Ödemeler | `/settlements` | Grup bazlı karşılıklı borç ödeme takibi ve onay mekanizması |
| Raporlar | `/reports` | Hem takım hem de bireysel formatlı AI incelemeleri ve PDF/Excel Raporları |
| Profil | `/profile` | Kullanıcı resmi (Avatar Seçimi), Tema ve Dil Ayarları, Şifre/Hesap yönetimi |

---

## 🛠 Kullanılan Teknolojiler

### Frontend
- **Framework:** React 18 & Vite
- **Routing:** React Router DOM (v6)
- **Stil & UI:** Vanilla CSS (Glassmorphism, CSS Custom Properties), Lucide Icons
- **Çoklu Dil (i18n):** `react-i18next`
- **Charting / Export:** Chart.js, react-chartjs-2, jspdf, html2canvas

### Backend (Serverless)
- **Database:** Firebase Firestore (Real-time updates & Complex Queries)
- **Auth:** Firebase Authentication (Send Password Reset Email feature & Verify Before Update Flow vs.)
- **AI Integrasyonu:** OpenRouter API (Grok & Qwen modelleri)

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

## 📦 Yayına Alma & Derlemeler (Builds)

Uygulamanın web versiyonu doğrudan **GitHub Pages** altyapısıyla otomatik build/deploy alabilme esnekliğine sahiptir. 

Native buildleri (Android/iOS) almak için:
```bash
npm run build
npx cap sync android
npx cap open android
```

---

## 📄 Lisans

Bu proje **Fatih Dişçi** tarafına aittir. Kopyalanması ve izinsiz kullanılması kısıtlanmıştır.
