# CoBill - Akıllı Ortak Hesap ve Harcama Yönetimi 💸

**CoBill**, ev arkadaşları, ofis çalışanları, seyahat grupları ve aileler için geliştirilmiş, harcamaları adil, şeffaf ve stressiz bir şekilde takip etmenizi sağlayan yeni nesil bir ortak bütçe ve harcama yönetim uygulamasıdır. Geleneksel hesaplaşma stresini ortadan kaldırır, kimin kime ne kadar borçlu olduğunu algoritmik olarak sadeleştirir.

---

## 🚀 Öne Çıkan Özellikler

- **Grup ve Üye Yönetimi:** Farklı dinamikler için (Ev, Tatil, Ofis vb.) sınırsız grup oluşturma ve yönetme imkanı.
- **Akıllı Borç Sadeleştirme (Debt Simplification):** Karmaşık borç ağlarını en az işlemle çözmek için optimize edilmiş borç sadeleştirme algoritması.
- **Kategorize Edilmiş Harcamalar:** Market, Fatura, Yemek, Ulaşım vb. harcamaları piktogramlarla kategorize edebilme.
- **Tekrarlayan Masraflar (Abonelikler & Kiralar):** Her ay yenilenen fatura, kira veya Netflix gibi abonelikleri yapılandırma.
- **Gelişmiş PDF Raporlama:** Grupların geçmiş dönem analizlerini dökümlemek için bir tıkla detaylı, profesyonel dizayn edilmiş şeffaf bilançolar (PDF formatında) çıkarma. (Pro)
- **WhatsApp ve E-Posta Hatırlatıcıları:** Kişiye özel hesaplanmış borç miktarlarını tek bir tuşla kopyalama, doğrudan WhatsApp üzerinden SMS atar gibi hatasız hatırlatıcılar gönderebilme.
- **Görsel Analitikler:** Kişi başı ne kadar düştüğünü veya üyelerin mevcut bakiyesini görsel grafiklerle sade bir şekilde izleme.
- **Mobil Odaklı PWA/Native Deneyimi:** PWA, Web veya Capacitor ile paketlenmiş tam teşekküllü Native Android/iOS deneyimi.
- **Modern UI/UX:** Glassmorphism ve Dark Modelu premium mobil arayüz tasarımı, akıcı geçişler ve animasyonlar.

---

## 🛠 Kullanılan Teknolojiler

CoBill, ölçeklenebilir ve performanslı modern teknolojiler üzerine inşa edilmiştir.

### Frontend
- **Framework:** React 18 & Vite
- **Routing:** React Router DOM (v6)
- **Stil & UI:** Tailwind CSS, Glassmorphism CSS değişken mimarisi, Lucide Icons
- **Chart:** Recharts (Görsel veriler için)
- **PDF Optimizasyonu:** jspdf & html2canvas

### Backend & Veri Yapısı (Serverless)
- **Database:** Firebase Firestore (Gerçek zamanlı)
- **Auth:** Firebase Authentication
- **Durum Yönetimi (State):** React Context API tabanlı Custom `USE_APP` modüleri

### Native Entegrasyon
- **Platform:** Capacitor (iOS / Android köprülemesi)
- **Eklentiler & Donanım:** Haptic Engine, Share API (Dosya paylaşımı özelliği)
- **Para Kazanma / Reklam:** Capacitor Community AdMob eklentisi (Banner ve Interstitial)

---

## 💡 Kurulum ve Geliştirme Ortamı

Yerel makinenizde projeyi başlatmak için şu adımları izleyin:

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
Kök dizinde `.env` isimli bir dosya oluşturun ve Firebase ile ilgili yapılandırmanızı girin. 
*(Git'e gönderilmez, güvenlidir)*

```env
VITE_FIREBASE_API_KEY="AIzaSy...your-key"
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project"
VITE_FIREBASE_STORAGE_BUCKET="your-bucket.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:12345...:web:abcde..."
```

### 4. Geliştirme Sunucusunu Başlatma
Hızlı bir şekilde Vite geliştirme sunucusunu çalıştırmak için:
```bash
npm run dev
```

---

## 📱 Native Android / iOS Derlemesi (Capacitor)

Proje önceden Capacitor ile yapılandırılmıştır. Android Studio ile projeyi build'lemek için:

1. Önce production kodlarını derleyin:
   ```bash
   npm run build
   ```
2. Derlenen kodları Android projesine taşıyın ve platform dosyalarını senkronize edin:
   ```bash
   npx cap sync android
   ```
3. Android Studio'yu açın:
   ```bash
   npx cap open android
   ```
   *(Buradan, SDK ayarlarını ve Firebase Google Services JSON işlemlerini yürütüp cihazınıza yükleyebilirsiniz.)*

---

## 📐 Tasarım Kararları (Architecture Choices)
| Kavram | Çözüm Yaklaşımı | 
| ----------- | ----------- |
| **Bölüşüm Matematiksel Modeli** | Karmaşık O(n!) borçların bir ağ gibi örülmesini engellemek için "Debt Simplification Algorithm" kullanıldı. Tüm alacaklar ve verecekler tek bir havuza toplanıp en az işlem hamlesine (Greedy Approach) çevrildi. |
| **Premium Tema Özelliği** | Uygulamanın içerisinde kullanıcıyı yormayan ama görsel zenginlik katan Altın/Amber ve Glass (Buzlu Cam) efektif komponentler (ör: Pro Modals, Highlight Cards) eklendi. |
| **AdMob Yapılandırması** | Kullanıcı deneyimini tamamen ele geçirmemek üzerine Interstitial (geçiş ekranı) reklamları her 3 safya dolaşımında bir çıkacak şekilde optimize edildi, native bannerlar sadece gerekli state/animasyon bloklarında görünür kılındı. Ayrıca, Gradle optimize proGuard configrationları yapılandırıldı. |

---

## ✨ Katkıda Bulunma (Contributing)
Proje şu anda özel kullanımda olup pull request'lere (PR) tabidir. Katkıda bulunmak isteyenler için:
1. Repoyu Fork'layın
2. Yeni bir dal (branch) açın (`git checkout -b feature/YeniOzellik`)
3. Değişiklikleri pushlayın (`git push origin feature/YeniOzellik`)
4. Bir Pull Request açınız!

## 📄 Lisans
Bu proje özel mülkiyet altındadır (Proprietary). Tüm hakları **Fatih Dişçi** tarafına aittir. Kopyalanması ve izinsiz yayılması kısıtlanmıştır.
