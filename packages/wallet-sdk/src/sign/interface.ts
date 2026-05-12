<<<<<<< HEAD
import { RequestArguments } from ':core/provider/interface';

export interface Signer {
  handshake(_: RequestArguments): Promise<void>;
  request(_: RequestArguments): Promise<unknown>;
=======
import { RequestArguments } from ':core/provider/interface.js';

export interface Signer {
  handshake(_: RequestArguments): Promise<void>;
  request<T>(_: RequestArguments): Promise<T>;
>>>>>>> upstream/master
  cleanup: () => Promise<void>;
}
