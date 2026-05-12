// Copyright (c) 2018-2024 Coinbase, Inc. <https://www.coinbase.com/>
<<<<<<< HEAD
import { CoinbaseWalletSDK } from './CoinbaseWalletSDK';
export default CoinbaseWalletSDK;

export type { CoinbaseWalletProvider } from './CoinbaseWalletProvider';
export { CoinbaseWalletSDK } from './CoinbaseWalletSDK';
export type { AppMetadata, Preference, ProviderInterface } from './core/provider/interface';
export { createCoinbaseWalletSDK } from './createCoinbaseWalletSDK';
=======
import { CoinbaseWalletSDK } from './CoinbaseWalletSDK.js';
export default CoinbaseWalletSDK;

export type { AppMetadata, Preference, ProviderInterface } from ':core/provider/interface.js';
export type { CoinbaseWalletProvider } from './CoinbaseWalletProvider.js';
export { CoinbaseWalletSDK } from './CoinbaseWalletSDK.js';
export { createCoinbaseWalletSDK } from './createCoinbaseWalletSDK.js';
export { getCryptoKeyAccount, removeCryptoKey } from './kms/crypto-key/index.js';
>>>>>>> upstream/master
