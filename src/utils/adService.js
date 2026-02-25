import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';

// Test IDs provided by Google AdMob
const ADMOB_TEST_BANNER_ID = Capacitor.getPlatform() === 'ios'
    ? 'ca-app-pub-3940256099942544/2934735716'
    : 'ca-app-pub-3940256099942544/6300978111';

const ADMOB_TEST_INTERSTITIAL_ID = Capacitor.getPlatform() === 'ios'
    ? 'ca-app-pub-3940256099942544/4411468910'
    : 'ca-app-pub-3940256099942544/1033173712';

let isAdmobInitialized = false;

export async function initializeAdMob() {
    if (!Capacitor.isNativePlatform()) {
        console.log('[AdMob] Not on native platform. AdMob initialization skipped.');
        return;
    }

    try {
        await AdMob.initialize({
            requestTrackingAuthorization: true,
            initializeForTesting: true,
        });
        isAdmobInitialized = true;
        console.log('[AdMob] Initialized successfully.');

        // Force remove any leftover banners from previous app sessions just in case
        try {
            await AdMob.removeBanner();
            console.log('[AdMob] Banner removed explicitly.');
        } catch (e) {
            // Ignore errors if banner wasn't showing
        }
    } catch (e) {
        console.error('[AdMob] Failed to initialize:', e);
    }
}

export async function showInterstitialAd() {
    if (!Capacitor.isNativePlatform() || !isAdmobInitialized) {
        return Promise.resolve(); // Resolves immediately if not on mobile/not initialized
    }

    return new Promise(async (resolve) => {
        let isResolved = false;

        const cleanupAndResolve = () => {
            if (!isResolved) {
                isResolved = true;
                resolve();
            }
        };

        try {
            // Prepare ad
            await AdMob.prepareInterstitial({
                adId: ADMOB_TEST_INTERSTITIAL_ID,
                isTesting: true,
            });

            // Listeners for dismissal or failure to ensure navigation continues
            AdMob.addListener('interstitialDismissed', () => {
                console.log('[AdMob] Interstitial dismissed.');
                cleanupAndResolve();
            });

            AdMob.addListener('interstitialFailedToLoad', (error) => {
                console.warn('[AdMob] Interstitial failed to load:', error);
                cleanupAndResolve();
            });

            // Show ad
            await AdMob.showInterstitial();
            console.log('[AdMob] Interstitial shown.');

            // Fallback timeout just in case events fail to trigger
            setTimeout(() => {
                cleanupAndResolve();
            }, 10000); // 10 seconds max wait for ad to do something

        } catch (e) {
            console.error('[AdMob] Failed to show interstitial:', e);
            cleanupAndResolve();
        }
    });
}
