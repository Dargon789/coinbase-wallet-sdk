<<<<<<< HEAD
import { Message } from './Message';
=======
import { Message } from './Message.js';
>>>>>>> upstream/master

export interface ConfigMessage extends Message {
  event: ConfigEvent;
}

export type ConfigEvent =
  | 'PopupLoaded'
  | 'PopupUnload'
  | 'selectSignerType'
  | 'WalletLinkSessionRequest'
  | 'WalletLinkUpdate';

export type SignerType = 'scw' | 'walletlink';
