import { loadTelemetryScript } from ':core/telemetry/initCCA.js';
import { getFavicon } from ':core/type/util.js';
import { store } from ':store/store.js';
import { checkCrossOriginOpenerPolicy } from ':util/checkCrossOriginOpenerPolicy.js';
import { getCoinbaseInjectedProvider } from ':util/provider.js';
import { validatePreferences } from ':util/validatePreferences.js';
import { CoinbaseWalletProvider } from './CoinbaseWalletProvider.js';
import { LogoType, walletLogo } from './assets/wallet-logo.js';
import { AppMetadata, Preference, ProviderInterface } from './core/provider/interface.js';

<<<<<<< HEAD
import { LogoType, walletLogo } from './assets/wallet-logo';
import { CoinbaseWalletProvider } from './CoinbaseWalletProvider';
import { AppMetadata, Preference, ProviderInterface } from './core/provider/interface';
import { LIB_VERSION } from './version';
import { ScopedLocalStorage } from ':core/storage/ScopedLocalStorage';
import { getFavicon } from ':core/type/util';
import { checkCrossOriginOpenerPolicy } from ':util/crossOriginOpenerPolicy';
import { getCoinbaseInjectedProvider } from ':util/provider';
import { validatePreferences } from ':util/validatePreferences';

=======
>>>>>>> upstream/master
// for backwards compatibility
type CoinbaseWalletSDKOptions = Partial<AppMetadata>;

/**
 * CoinbaseWalletSDK
 *
 * @deprecated CoinbaseWalletSDK is deprecated and will likely be removed in a future major version release.
 * It's recommended to use `createCoinbaseWalletSDK` instead.
 */
export class CoinbaseWalletSDK {
  private metadata: AppMetadata;
<<<<<<< HEAD

  constructor(metadata: Readonly<CoinbaseWalletSDKOptions>) {
=======

  constructor(metadata: Readonly<CoinbaseWalletSDKOptions>) {
    void store.persist.rehydrate();

>>>>>>> upstream/master
    this.metadata = {
      appName: metadata.appName || 'Dapp',
      appLogoUrl: metadata.appLogoUrl || getFavicon(),
      appChainIds: metadata.appChainIds || [],
    };
<<<<<<< HEAD
    this.storeLatestVersion();
    this.checkCrossOriginOpenerPolicy();
  }

  public makeWeb3Provider(preference: Preference = { options: 'all' }): ProviderInterface {
    validatePreferences(preference);
=======

    store.config.set({
      metadata: this.metadata,
    });

    void checkCrossOriginOpenerPolicy();
  }

  public makeWeb3Provider(
    preference: Preference = {
      options: 'all',
    }
  ): ProviderInterface {
    validatePreferences(preference);
    if (preference.telemetry !== false) {
      void loadTelemetryScript();
    }
    store.config.set({
      preference,
    });
>>>>>>> upstream/master
    const params = { metadata: this.metadata, preference };
    return getCoinbaseInjectedProvider(params) ?? new CoinbaseWalletProvider(params);
  }

  /**
   * Official Coinbase Wallet logo for developers to use on their frontend
   * @param type Type of wallet logo: "standard" | "circle" | "text" | "textWithLogo" | "textLight" | "textWithLogoLight"
   * @param width Width of the logo (Optional)
   * @returns SVG Data URI
   */
  public getCoinbaseWalletLogo(type: LogoType, width = 240): string {
    return walletLogo(type, width);
  }
<<<<<<< HEAD

  private storeLatestVersion() {
    const versionStorage = new ScopedLocalStorage('CBWSDK');
    versionStorage.setItem('VERSION', LIB_VERSION);
  }

  private checkCrossOriginOpenerPolicy() {
    void checkCrossOriginOpenerPolicy();
  }
=======
>>>>>>> upstream/master
}
