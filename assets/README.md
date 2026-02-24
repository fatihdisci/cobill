# Asset Dimensions for Capacitor

To ensure your splash screens and icons look crisp across all devices, they must meet the following minimum resolution requirements before running the generator:

1. **`icon.png` (Uygulama İkonu):**
   - Minimum: **1024x1024px**
   - Görsel şeffaf (transparent) olabilir veya arkaplanlı olabilir. Ana odak noktasının ortada olduğundan emin olun (Kenarlara çok yaklaşmayın, cihazlar kırpabilir veya yuvarlatabilir).

2. **`splash.png` (Açılış Ekranı):**
   - Minimum: **2732x2732px**
   - Bu görsele logonuzu ortalayarak yerleştirin. `capacitor.config.ts`'de belirlediğimiz siyah arkaplan (`#000000`) dışında kalan ekranı kaplayacaktır, tüm cihazlara (tablet, telefon vs.) uyacak şekilde güvenli alanları (safe inset) ortada bırakın.

Görsellerinizi bu klasöre belirtilen isim ve formatta koyduktan sonra, şu komutu terminal üzerinden çalıştırarak Android klasörüne native formatta dağıtabilirsiniz:

```bash
npx capacitor-assets generate --android
```
