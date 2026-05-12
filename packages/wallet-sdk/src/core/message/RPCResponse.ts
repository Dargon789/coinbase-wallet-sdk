<<<<<<< HEAD
import { SerializedEthereumRpcError } from ':core/error';
=======
import { SerializedEthereumRpcError } from '../error/utils.js';

export type RPCResponseNativeCurrency = {
  name?: string;
  symbol?: string;
  decimal?: number;
};
>>>>>>> upstream/master

export type RPCResponse = {
  result:
    | {
        value: unknown; // JSON-RPC result
      }
    | {
        error: SerializedEthereumRpcError;
      };
  data?: {
    // optional data
    chains?: { [key: number]: string };
    capabilities?: Record<`0x${string}`, Record<string, unknown>>;
<<<<<<< HEAD
=======
    nativeCurrencies?: { [key: number]: RPCResponseNativeCurrency };
>>>>>>> upstream/master
  };
};
