# CoBill — Akıllı Ortak Hesap ve Bireysel Harcama Yönetimi 💸

**CoBill**, ev arkadaşları, ofis çalışanları, seyahat grupları ve aileler için geliştirilmiş, harcamaları adil, şeffaf ve stressiz bir şekilde takip etmenizi sağlayan yeni nesil bir **ortak bütçe ve bireysel harcama yönetim uygulamasıdır**. Geleneksel hesaplaşma stresini ortadan kaldırır, kimin kime ne kadar borçlu olduğunu algoritmik olarak sadeleştirir.

🌐 **Canlı Demo:** [https://fatihdisci.github.io/cobill/](https://fatihdisci.github.io/cobill/)

---

## 🚀 Öne Çıkan Özellikler

### 👥 Grup Masraf Takibi
- **Grup ve Üye Yönetimi:** Farklı dinamikler için (Ev, Tatil, Ofis vb.) sınırsız grup oluşturma ve yönetme imkanı.
- **Akıllı Borç Sadeleştirme (Debt Simplification):** Karmaşık borç ağlarını en az işlemle çözmek için optimize edilmiş Greedy algoritması.
- **Kategorize Edilmiş Harcamalar:** Market, Fatura, Yemek, Ulaşım vb. harcamaları piktogramlarla kategorize edebilme.
- **WhatsApp ve E-Posta Hatırlatıcıları:** Kişiye özel hesaplanmış borç miktarlarını tek bir tuşla kopyalama, doğrudan WhatsApp üzerinden hatırlatıcı gönderebilme.

### 💰 Bireysel Masraf Takibi (Personal Finance Tracker)
- **Kişisel Cüzdan:** Aylık toplam harcama özeti, kategoriye göre filtreleme ve silme işlemleri.
- **Bireysel Harcama Formu:** Para birimi seçimi, büyük tutar giriş alanı, kategori chip butonları ve tarih seçici ile hızlı veri girişi.
- **İstemci Taraflı Tekrarlayan Masraflar:** Her ay otomatik hatırlatılan ve onayınızla yenilenen tekrarlayan harcama (Abonelikler) mimarisi.
- **Bireysel Raporlar & Ekstre:** Kategori bazlı dağılım istatistikleri ve aylık harcama ekstresini PDF olarak dışa aktarma (Pro).

### 💎 Premium (Pro) ve Onboarding Akışı
- **Yüksek Dönüşümlü Paywall:** Psikolojik fiyatlandırma (Price Anchoring) teknikleriyle dizayn edilmiş 3 katmanlı fiyat planı.
- **Zarif Hoş Geldiniz Ekranı:** Başarılı satın alma sonrası kullanıcıyı tebrik eden ve abonelik ücretini otomatik takip etmeyi teklif eden akıllı "Opt-in" kurgusu.
- **Kesintisiz Reklamsız Deneyim:** Pro karta geçiş yapıldığında sistem çapında reklam kurgusunun kaldırılması.

### 🎨 Navigasyon ve UI
- **Merkezi FAB (Floating Action Button):** Mobil navigasyonda ortada konumlanmış + butonu ile hızlı masraf ekleme.
- **Bottom Sheet Menüsü:** FAB'a basınca "Bireysel Harcama" veya "Grup Masrafı" seçenekli akıcı alt menü.
- **Mobil Tab Bar:** `[ 💳 Cüzdan | 👥 Gruplar | ➕ FAB | 📊 Raporlar | 👤 Profil ]` yapısı.
- **Glassmorphism UI:** Modern buzlu cam efekli premium arayüz tasarımı, akıcı geçişler ve animasyonlar. Standardize edilmiş Splash Screen logoları.

### 🔐 Güvenlik ve Senkronizasyon
- **🔄 Gerçek Zamanlı Senkronizasyon:** Firebase Firestore `onSnapshot` dinleyicileri ile anlık güncelleme.
- **✉️ Güvenli Davet Mekanizması:** E-posta ile davet, kabul/red hakkı kullanıcıda.
- **🛡️ Masraf Silme Yetkilendirmesi:** Yalnızca ekleyen veya grup admini silebilir.

---

## 📱 Ekran Yapısı

| Sayfa | Rota | Açıklama |
|-------|------|----------|
| Dashboard | `/` | Genel özet (eski ana sayfa) |
| Gruplar | `/groups` | Grup listesi + stat kartlar + aktivite feed + harcama grafiği |
| Grup Detay | `/group/:id` | Grubun masrafları, borç durumu, üyeler |
| Masraf Ekle | `/add-expense` | Grup masrafı ekleme formu |
| Cüzdan | `/wallet` | Bireysel harcamalar, aylık özet, filtreleme |
| Bireysel Harcama Ekle | `/add-personal` | Bireysel masraf formu |
| Ödemeler | `/settlements` | Borç ödeme takibi |
| Raporlar | `/reports` | Grup ve bireysel raporlar, PDF Çıktısı (Pro) |
| Profil | `/profile` | Kullanıcı ayarları |
| Ayarlar | `/settings` | Uygulama ayarları |

---

## 🛠 Kullanılan Teknolojiler

### Frontend
- **Framework:** React 18 & Vite
- **Routing:** React Router DOM (v6)
- **Stil & UI:** Vanilla CSS (Glassmorphism mimarisi, CSS Custom Properties), Lucide Icons
- **Chart:** Recharts
- **PDF:** jspdf & html2canvas

### Backend & Veri Yapısı (Serverless)
- **Database:** Firebase Firestore (Real-time)
- **Auth:** Firebase Authentication (Email/Password)
- **State Management:** React Context API + useReducer

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
```

### 4. Geliştirme Sunucusunu Başlatma
```bash
npm run dev
```

---

## 📐 Mimari Kararlar

| Kavram | Çözüm |
|--------|-------|
| **Borç Sadeleştirme** | Greedy Approach: tüm alacak/verecekler havuzlanıp en az işleme indirgenir |
| **Premium Modeli** | UI'dan gelen `isPro` bayrağı ile feature gating; Opt-in abonelik otomatik masrafı eklentisi |
| **Reklam Stratejisi** | Interstitial reklamlar sayfa geçişlerinde tetiklenir; Pro kullanıcılar muaf tutulur |
| **Real-Time Sync** | Firestore `onSnapshot` dinleyicileri + cleanup ile %100 canlı ve bellek sızıntısız data akışı |
| **Tekrarlayan Masraf** | İstemci tarafında `nextRecurringDate` kontrolü ile çalışan uyarı (Prompt) ve kopyalama (Clone) mantığı |

---

## 🚧 Tamamlanması Gereken Özellikler (Roadmap)

### Kısa Vadeli Eksikler (WIP)
| Özellik | Durum | Açıklama |
|---------|-------|----------|
| **Gerçek Ödeme Entegrasyonu** | ⏳ Hazırlanıyor | ProUpgradeModal mock statüsünde, RevenueCat veya Native IAP (In-App Purchase) entegrasyonu bağlanacak |
| **Bildirim Tercihleri** | 🔘 UI Var | Ayarlar sayfasında bildirim toggle'ları mevcut, backend bağlantısı yapılacak |
| **Tema/Dark Mode Geçişi** | 🔘 CSS Hazır | CSS değişken altyapısı dark mode'a uygun, toggle mekanizması eklenecek |
| **Çoklu Dil Desteği (i18n)** | 🔲 Planlandı | Şu an Türkçe çalışıyor, İngilizce vb. diller eklenecek |

### Gelecek Vizyonu
- **🤖 AI Harcama Analizi:** Harcama paternlerini analiz ederek tasarruf önerileri veren Gemini / OpenAI entegrasyonu
- **📈 Gelişmiş Bütçe Limitleri:** Kategori tabanlı dinamik bütçe uyarıları
- **📱 Push Notification Backend:** Firebase Cloud Messaging ile gerçek server-side push bildirimler
- **📸 Fiş/Fatura Tarama (OCR):** Kameradan okutulan fişlerin otomatik masrafa dönüşmesi
- **🌍 Çoklu Para Birimi Otomasyonu:** Grup masraflarında API destekli anlık kur çevirimi
- **🔗 Banka Hesabı (Open Banking):** Hesap hareketlerinin doğrudan uygulamaya senkronizasyonu

---

## ✨ Katkıda Bulunma

1. Repoyu Fork'layın
2. Yeni bir dal açın (`git checkout -b feature/YeniOzellik`)
3. Değişiklikleri pushlayın (`git push origin feature/YeniOzellik`)
4. Pull Request açın!

## 📄 Lisans

Bu proje özel mülkiyet altındadır (Proprietary). Tüm hakları **Fatih Dişçi** tarafına aittir. Kopyalanması ve izinsiz yayılması kısıtlanmıştır.
