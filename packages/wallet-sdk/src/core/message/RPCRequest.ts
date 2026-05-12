<<<<<<< HEAD
import { RequestArguments } from ':core/provider/interface';
=======
import { RequestArguments } from ':core/provider/interface.js';
>>>>>>> upstream/master

export type RPCRequest = {
  action: RequestArguments; // JSON-RPC call
  chainId: number;
};
