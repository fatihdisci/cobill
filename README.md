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
- **Kişisel Cüzdan:** Aylık toplam harcama özeti, kategoriye göre filtreleme ve silme işlemleri.
- **Bireysel Harcama Formu:** Para birimi seçimi, büyük tutar giriş alanı, kategori chip butonları ve tarih seçici ile hızlı veri girişi.
- **Tekrarlayan Bireysel Masraf:** Her ay otomatik eklenmesi için gün seçici ile tekrarlayan harcama tanımlama.
- **Kategoriler:** 🛒 Market, 📋 Fatura, 📚 Eğitim, 🎬 Eğlence, 🚕 Ulaşım, 📦 Diğer.
- **Bireysel Raporlar:** Kategori bazlı dağılım (yüzde ve progress bar), toplam harcama ve masraf sayısı istatistikleri.
- **Ekstre İndirme:** Aylık harcama ekstresi PDF olarak dışa aktarma. (Pro)

### 📊 Raporlar ve Analitikler
- **Segmented Control:** "Grup Raporları" ve "Bireysel Raporlar" arasında tek tıkla geçiş.
- **Görsel Analitikler:** Harcama dağılımı donut chart, kişi başı bar chart, kategori breakdown.
- **PDF ve Excel Dışa Aktarma:** Profesyonel dizayn edilmiş şeffaf bilançolar. (Pro)

### 🎨 Navigasyon ve UI
- **Merkezi FAB (Floating Action Button):** Mobil navigasyonda ortada konumlanmış + butonu ile hızlı masraf ekleme.
- **Bottom Sheet Menüsü:** FAB'a basınca "Bireysel Harcama" veya "Grup Masrafı" seçenekli akıcı alt menü.
- **Mobil Tab Bar:** `[ 💳 Cüzdan | 👥 Gruplar | ➕ FAB | 📊 Raporlar | 👤 Profil ]` yapısı.
- **Glassmorphism UI:** Modern buzlu cam efekli premium arayüz tasarımı, akıcı geçişler ve animasyonlar.

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
| Raporlar | `/reports` | Grup ve bireysel raporlar (Pro) |
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

### Firestore Koleksiyonları
| Koleksiyon | Açıklama |
|------------|----------|
| `users` | Kullanıcı profil bilgileri |
| `groups` | Grup meta verisi ve üye listesi |
| `expenses` | Grup masrafları |
| `settlements` | Borç ödemeleri |
| `invitations` | Grup davetleri (pending/accepted/rejected) |
| `personal_expenses` | **YENİ** — Bireysel harcamalar |

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
| **Premium Modeli** | UI'dan gelen `isPro` bayrağı ile feature gating; ProUpgradeModal ile upsell |
| **Reklam Stratejisi** | Interstitial reklamlar sayfa geçişlerinde; Pro kullanıcılar muaf |
| **Real-Time Sync** | Firestore `onSnapshot` dinleyicileri + cleanup; bellek sızıntısı önlemi |
| **Yetkilendirme** | `expense.paidBy === currentUser || group.createdBy === currentUser` kuralı |
| **Davet Sistemi** | Firestore `invitations` koleksiyonu + pending/accepted/rejected durum makinesi |
| **Bireysel Masraf** | Ayrı `personal_expenses` koleksiyonu, userId bazlı real-time dinleyici |

---

## 🚧 Tamamlanması Gereken Özellikler

Aşağıdaki özellikler temel altyapısı hazır ancak henüz tam olarak implement edilmemiş veya placeholder olarak bırakılmıştır:

### Yakında Gelecek
| Özellik | Durum | Açıklama |
|---------|-------|----------|
| **Bireysel Ekstre PDF** | 🔘 Placeholder | Cüzdan sayfasındaki "Ekstre İndir" butonu şu an alert gösteriyor, gerçek PDF oluşturma henüz eklenmedi |
| **Tekrarlayan Masraf Otomasyonu** | 🔘 Veri Modeli Hazır | `isRecurring` ve `recurringDay` alanları kaydediliyor ancak arka planda otomatik ekleme (cron/Cloud Function) henüz aktif değil |
| **Bildirim Tercihleri** | 🔘 UI Var | Ayarlar sayfasında bildirim toggle'ları mevcut, backend bağlantısı yapılacak |
| **Tema/Dark Mode Geçişi** | 🔘 CSS Hazır | CSS değişken altyapısı dark mode'a uygun, toggle mekanizması eklenecek |
| **Gerçek Ödeme Entegrasyonu** | 🔲 Planlandı | Borç ödemelerinde gerçek para transferi (Stripe/İyzico) entegrasyonu |
| **Çoklu Dil Desteği (i18n)** | 🔲 Planlandı | Şu an sadece Türkçe, İngilizce ve diğer diller eklenecek |
| **Pro Abonelik Satın Alma** | 🔘 Modal Hazır | ProUpgradeModal gösteriliyor ancak gerçek ödeme sistemi bağlanacak |

### Gelecek Planları
- **📈 Bütçe Limitleri:** Kategoriye göre aylık bütçe belirleme ve aşım uyarısı
- **🤖 AI Harcama Analizi:** Harcama patternlerini analiz ederek tasarruf önerileri
- **📱 Push Notification Backend:** Firebase Cloud Messaging ile gerçek push bildirim altyapısı
- **🔗 Banka Hesabı Bağlama:** Open Banking API ile otomatik masraf çekme
- **👥 Grup İçi Oylama:** Ortak harcamalar için gruplarda oylama mekanizması
- **📸 Fiş/Fatura Fotoğrafı:** OCR ile otomatik masraf oluşturma
- **🌍 Çoklu Para Birimi Dönüşümü:** Gerçek zamanlı kur ile otomatik çevrim

---

## ✨ Katkıda Bulunma

1. Repoyu Fork'layın
2. Yeni bir dal açın (`git checkout -b feature/YeniOzellik`)
3. Değişiklikleri pushlayın (`git push origin feature/YeniOzellik`)
4. Pull Request açın!

## 📄 Lisans

Bu proje özel mülkiyet altındadır (Proprietary). Tüm hakları **Fatih Dişçi** tarafına aittir. Kopyalanması ve izinsiz yayılması kısıtlanmıştır.
