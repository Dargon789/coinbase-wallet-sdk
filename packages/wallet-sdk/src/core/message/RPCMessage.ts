<<<<<<< HEAD
import { Message, MessageID } from './Message';
import { SerializedEthereumRpcError } from ':core/error';
import { RequestArguments } from ':core/provider/interface';

interface RPCMessage extends Message {
  id: MessageID;
=======
import { RequestArguments } from ':core/provider/interface.js';
import { SerializedEthereumRpcError } from '../error/utils.js';
import { Message, MessageID } from './Message.js';

interface RPCMessage extends Message {
  id: MessageID;
  correlationId: string | undefined;
>>>>>>> upstream/master
  sender: string; // hex encoded public key of the sender
  content: unknown;
  timestamp: Date;
}

export type EncryptedData = {
<<<<<<< HEAD
  iv: ArrayBuffer;
=======
  iv: Uint8Array;
>>>>>>> upstream/master
  cipherText: ArrayBuffer;
};

export interface RPCRequestMessage extends RPCMessage {
  content:
    | {
        handshake: RequestArguments;
      }
    | {
        encrypted: EncryptedData;
      };
}

export interface RPCResponseMessage extends RPCMessage {
  requestId: MessageID;
  content:
    | {
        encrypted: EncryptedData;
      }
    | {
        failure: SerializedEthereumRpcError;
      };
}
