<<<<<<< HEAD
import { Signer } from '../interface';
import { SCWKeyManager } from './SCWKeyManager';
import { Communicator } from ':core/communicator/Communicator';
import { standardErrors } from ':core/error';
import { RPCRequestMessage, RPCResponse, RPCResponseMessage } from ':core/message';
import { AppMetadata, ProviderEventCallback, RequestArguments } from ':core/provider/interface';
import { ScopedLocalStorage } from ':core/storage/ScopedLocalStorage';
import { AddressString } from ':core/type';
import { ensureIntNumber, hexStringFromNumber } from ':core/type/util';
=======
import { CB_WALLET_RPC_URL } from ':core/constants.js';
import { Hex, hexToNumber, isAddressEqual, numberToHex } from 'viem';

import { Communicator } from ':core/communicator/Communicator.js';
import { isActionableHttpRequestError, isViemError, standardErrors } from ':core/error/errors.js';
import { RPCRequestMessage, RPCResponseMessage } from ':core/message/RPCMessage.js';
import { RPCResponse } from ':core/message/RPCResponse.js';
import { AppMetadata, ProviderEventCallback, RequestArguments } from ':core/provider/interface.js';
import { FetchPermissionsResponse } from ':core/rpc/coinbase_fetchSpendPermissions.js';
import { WalletConnectResponse } from ':core/rpc/wallet_connect.js';
import { GetSubAccountsResponse } from ':core/rpc/wallet_getSubAccount.js';
import {
  logHandshakeCompleted,
  logHandshakeError,
  logHandshakeStarted,
  logRequestCompleted,
  logRequestError,
  logRequestStarted,
} from ':core/telemetry/events/scw-signer.js';
import {
  logAddOwnerCompleted,
  logAddOwnerError,
  logAddOwnerStarted,
  logInsufficientBalanceErrorHandlingCompleted,
  logInsufficientBalanceErrorHandlingError,
  logInsufficientBalanceErrorHandlingStarted,
  logSubAccountRequestCompleted,
  logSubAccountRequestError,
  logSubAccountRequestStarted,
} from ':core/telemetry/events/scw-sub-account.js';
import { parseErrorMessageFromAny } from ':core/telemetry/utils.js';
import { Address } from ':core/type/index.js';
import { ensureIntNumber, hexStringFromNumber } from ':core/type/util.js';
import { SDKChain, createClients, getClient } from ':store/chain-clients/utils.js';
import { correlationIds } from ':store/correlation-ids/store.js';
import { store } from ':store/store.js';
import { assertArrayPresence, assertPresence } from ':util/assertPresence.js';
import { assertSubAccount } from ':util/assertSubAccount.js';
>>>>>>> upstream/master
import {
  decryptContent,
  encryptContent,
  exportKeyToHexString,
  importKeyFromHexString,
<<<<<<< HEAD
} from ':util/cipher';
import { fetchRPCRequest } from ':util/provider';
const ACCOUNTS_KEY = 'accounts';
const ACTIVE_CHAIN_STORAGE_KEY = 'activeChain';
const AVAILABLE_CHAINS_STORAGE_KEY = 'availableChains';
const WALLET_CAPABILITIES_STORAGE_KEY = 'walletCapabilities';

type Chain = {
  id: number;
  rpcUrl?: string;
};
=======
} from ':util/cipher.js';
import { fetchRPCRequest } from ':util/provider.js';
import { getCryptoKeyAccount } from '../../kms/crypto-key/index.js';
import { Signer } from '../interface.js';
import { SCWKeyManager } from './SCWKeyManager.js';
import {
  addSenderToRequest,
  appendWithoutDuplicates,
  assertFetchPermissionsRequest,
  assertGetCapabilitiesParams,
  assertParamsChainId,
  fillMissingParamsForFetchPermissions,
  getCachedWalletConnectResponse,
  getSenderFromRequest,
  initSubAccountConfig,
  injectRequestCapabilities,
  makeDataSuffix,
  prependWithoutDuplicates,
  requestHasCapability,
} from './utils.js';
import { createSubAccountSigner } from './utils/createSubAccountSigner.js';
import { findOwnerIndex } from './utils/findOwnerIndex.js';
import { handleAddSubAccountOwner } from './utils/handleAddSubAccountOwner.js';
import { handleInsufficientBalanceError } from './utils/handleInsufficientBalance.js';
>>>>>>> upstream/master

type ConstructorOptions = {
  metadata: AppMetadata;
  communicator: Communicator;
  callback: ProviderEventCallback | null;
};

export class SCWSigner implements Signer {
<<<<<<< HEAD
  private readonly metadata: AppMetadata;
  private readonly communicator: Communicator;
  private readonly keyManager: SCWKeyManager;
  private readonly storage: ScopedLocalStorage;
  private callback: ProviderEventCallback | null;

  private accounts: AddressString[];
  private chain: Chain;

  constructor(params: ConstructorOptions) {
    this.metadata = params.metadata;
    this.communicator = params.communicator;
    this.callback = params.callback;
    this.keyManager = new SCWKeyManager();
    this.storage = new ScopedLocalStorage('CBWSDK', 'SCWStateManager');

    this.accounts = this.storage.loadObject(ACCOUNTS_KEY) ?? [];
    this.chain = this.storage.loadObject(ACTIVE_CHAIN_STORAGE_KEY) || {
      id: params.metadata.appChainIds?.[0] ?? 1,
    };
=======
  private readonly communicator: Communicator;
  private readonly keyManager: SCWKeyManager;
  private callback: ProviderEventCallback | null;

  private accounts: Address[];
  private chain: SDKChain;

  constructor(params: ConstructorOptions) {
    this.communicator = params.communicator;
    this.callback = params.callback;
    this.keyManager = new SCWKeyManager();
>>>>>>> upstream/master

    const { account, chains } = store.getState();
    this.accounts = account.accounts ?? [];
    this.chain = account.chain ?? {
      id: params.metadata.appChainIds?.[0] ?? 1,
    };

    if (chains) {
      createClients(chains);
    }
  }

  async handshake(args: RequestArguments) {
<<<<<<< HEAD
    const handshakeMessage = await this.createRequestMessage({
      handshake: {
        method: args.method,
        params: Object.assign({}, this.metadata, args.params ?? {}),
      },
    });
    const response: RPCResponseMessage =
      await this.communicator.postRequestAndWaitForResponse(handshakeMessage);
=======
    const correlationId = correlationIds.get(args);
    logHandshakeStarted({ method: args.method, correlationId });

    try {
      // Open the popup before constructing the request message.
      // This is to ensure that the popup is not blocked by some browsers (i.e. Safari)
      await this.communicator.waitForPopupLoaded?.();

      const handshakeMessage = await this.createRequestMessage(
        {
          handshake: {
            method: args.method,
            params: args.params ?? [],
          },
        },
        correlationId
      );
      const response: RPCResponseMessage =
        await this.communicator.postRequestAndWaitForResponse(handshakeMessage);
>>>>>>> upstream/master

      // store peer's public key
      if ('failure' in response.content) {
        throw response.content.failure;
      }

<<<<<<< HEAD
    const decrypted = await this.decryptResponseMessage(response);
=======
      const peerPublicKey = await importKeyFromHexString('public', response.sender);
      await this.keyManager.setPeerPublicKey(peerPublicKey);
>>>>>>> upstream/master

      const decrypted = await this.decryptResponseMessage(response);

<<<<<<< HEAD
    const accounts = result.value as AddressString[];
    this.accounts = accounts;
    this.storage.storeObject(ACCOUNTS_KEY, accounts);
    this.callback?.('accountsChanged', accounts);
  }

  async request(request: RequestArguments) {
    if (this.accounts.length === 0) {
      throw standardErrors.provider.unauthorized();
=======
      this.handleResponse(args, decrypted);
      logHandshakeCompleted({ method: args.method, correlationId });
    } catch (error) {
      logHandshakeError({
        method: args.method,
        correlationId,
        errorMessage: parseErrorMessageFromAny(error),
      });
      throw error;
    }
  }

  async request(request: RequestArguments) {
    const correlationId = correlationIds.get(request);
    logRequestStarted({ method: request.method, correlationId });

    try {
      const result = await this._request(request);
      logRequestCompleted({ method: request.method, correlationId });
      return result;
    } catch (error) {
      logRequestError({
        method: request.method,
        correlationId,
        errorMessage: parseErrorMessageFromAny(error),
      });
      throw error;
>>>>>>> upstream/master
    }
  }

  async _request(request: RequestArguments) {
    if (this.accounts.length === 0) {
      switch (request.method) {
        case 'eth_requestAccounts': {
          // Wait for the popup to be loaded before making async calls
          await this.communicator.waitForPopupLoaded?.();
          await initSubAccountConfig();
          // This will populate the store with the sub account
          await this.request({
            method: 'wallet_connect',
            params: [
              {
                version: '1',
                capabilities: {
                  ...(store.subAccountsConfig.get()?.capabilities ?? {}),
                },
              },
            ],
          });

          return this.accounts;
        }
        case 'wallet_switchEthereumChain': {
          assertParamsChainId(request.params);
          this.chain.id = Number(request.params[0].chainId);
          return;
        }
        case 'wallet_connect': {
          // Wait for the popup to be loaded before making async calls
          await this.communicator.waitForPopupLoaded?.();
          await initSubAccountConfig();

          // Check if addSubAccount capability is present and if so, inject the the sub account capabilities
          let capabilitiesToInject: Record<string, unknown> = {};
          if (requestHasCapability(request, 'addSubAccount')) {
            capabilitiesToInject = store.subAccountsConfig.get()?.capabilities ?? {};
          }
          const modifiedRequest = injectRequestCapabilities(request, capabilitiesToInject);
          return this.sendRequestToPopup(modifiedRequest);
        }
        case 'wallet_sendCalls':
        case 'wallet_sign': {
          return this.sendRequestToPopup(request);
        }
        default:
          throw standardErrors.provider.unauthorized();
      }
    }

    if (this.shouldRequestUseSubAccountSigner(request)) {
      const correlationId = correlationIds.get(request);
      logSubAccountRequestStarted({ method: request.method, correlationId });
      try {
        const result = await this.sendRequestToSubAccountSigner(request);
        logSubAccountRequestCompleted({ method: request.method, correlationId });
        return result;
      } catch (error) {
        logSubAccountRequestError({
          method: request.method,
          correlationId,
          errorMessage: parseErrorMessageFromAny(error),
        });
        throw error;
      }
    }

    switch (request.method) {
      case 'eth_requestAccounts':
      case 'eth_accounts': {
        const subAccount = store.subAccounts.get();
        const subAccountsConfig = store.subAccountsConfig.get();
        if (subAccount?.address) {
          // if auto sub accounts are enabled and we have a sub account, we need to return it as a top level account
          // otherwise, we just append it to the accounts array
          this.accounts = subAccountsConfig?.enableAutoSubAccounts
            ? prependWithoutDuplicates(this.accounts, subAccount.address)
            : appendWithoutDuplicates(this.accounts, subAccount.address);
        }

        this.callback?.('connect', { chainId: numberToHex(this.chain.id) });
        return this.accounts;
      }
      case 'eth_coinbase':
        return this.accounts[0];
      case 'net_version':
        return this.chain.id;
      case 'eth_chainId':
        return numberToHex(this.chain.id);
      case 'wallet_getCapabilities':
        return this.handleGetCapabilitiesRequest(request);
      case 'wallet_switchEthereumChain':
        return this.handleSwitchChainRequest(request);
      case 'eth_ecRecover':
      case 'personal_sign':
      case 'wallet_sign':
      case 'personal_ecRecover':
      case 'eth_signTransaction':
      case 'eth_sendTransaction':
      case 'eth_signTypedData_v1':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
      case 'eth_signTypedData':
      case 'wallet_addEthereumChain':
      case 'wallet_watchAsset':
      case 'wallet_sendCalls':
      case 'wallet_showCallsStatus':
      case 'wallet_grantPermissions':
        return this.sendRequestToPopup(request);
      case 'wallet_connect': {
        // Return cached wallet connect response if available
        const cachedResponse = await getCachedWalletConnectResponse();
        if (cachedResponse) {
          return cachedResponse;
        }

        // Wait for the popup to be loaded before making async calls
        await this.communicator.waitForPopupLoaded?.();
        await initSubAccountConfig();
        const subAccountsConfig = store.subAccountsConfig.get();
        const modifiedRequest = injectRequestCapabilities(
          request,
          subAccountsConfig?.capabilities ?? {}
        );

        this.callback?.('connect', { chainId: numberToHex(this.chain.id) });
        return this.sendRequestToPopup(modifiedRequest);
      }
      // Sub Account Support
      case 'wallet_getSubAccounts': {
        const subAccount = store.subAccounts.get();
        if (subAccount?.address) {
          return {
            subAccounts: [subAccount],
          };
        }

        if (!this.chain.rpcUrl) {
          throw standardErrors.rpc.internal('No RPC URL set for chain');
        }
        const response = (await fetchRPCRequest(
          request,
          this.chain.rpcUrl
        )) as GetSubAccountsResponse;
        assertArrayPresence(response.subAccounts, 'subAccounts');
        if (response.subAccounts.length > 0) {
          // cache the sub account
          assertSubAccount(response.subAccounts[0]);
          const subAccount = response.subAccounts[0];
          store.subAccounts.set({
            address: subAccount.address,
            factory: subAccount.factory,
            factoryData: subAccount.factoryData,
          });
        }
        return response;
      }
      case 'wallet_addSubAccount':
        return this.addSubAccount(request);
      case 'coinbase_fetchPermissions': {
        assertFetchPermissionsRequest(request);
        const completeRequest = fillMissingParamsForFetchPermissions(request);
        const permissions = (await fetchRPCRequest(
          completeRequest,
          CB_WALLET_RPC_URL
        )) as FetchPermissionsResponse;
        const requestedChainId = hexToNumber(completeRequest.params?.[0].chainId);
        store.spendPermissions.set(
          permissions.permissions.map((permission) => ({
            ...permission,
            chainId: requestedChainId,
          }))
        );
        return permissions;
      }
      default:
        if (!this.chain.rpcUrl) {
          throw standardErrors.rpc.internal('No RPC URL set for chain');
        }
        return fetchRPCRequest(request, this.chain.rpcUrl);
    }
  }

  private async sendRequestToPopup(request: RequestArguments) {
    // Open the popup before constructing the request message.
    // This is to ensure that the popup is not blocked by some browsers (i.e. Safari)
    await this.communicator.waitForPopupLoaded?.();

<<<<<<< HEAD
    switch (request.method) {
      case 'eth_requestAccounts':
        this.callback?.('connect', { chainId: hexStringFromNumber(this.chain.id) });
        return this.accounts;
      case 'eth_accounts':
        return this.accounts;
      case 'eth_coinbase':
        return this.accounts[0];
      case 'net_version':
        return this.chain.id;
      case 'eth_chainId':
        return hexStringFromNumber(this.chain.id);
      case 'wallet_getCapabilities':
        return this.storage.loadObject(WALLET_CAPABILITIES_STORAGE_KEY);
      case 'wallet_switchEthereumChain':
        return this.handleSwitchChainRequest(request);
      case 'eth_ecRecover':
      case 'personal_sign':
      case 'personal_ecRecover':
      case 'eth_signTransaction':
      case 'eth_sendTransaction':
      case 'eth_signTypedData_v1':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
      case 'eth_signTypedData':
      case 'wallet_addEthereumChain':
      case 'wallet_watchAsset':
      case 'wallet_sendCalls':
      case 'wallet_showCallsStatus':
      case 'wallet_grantPermissions':
        return this.sendRequestToPopup(request);
      default:
        if (!this.chain.rpcUrl) throw standardErrors.rpc.internal('No RPC URL set for chain');
        return fetchRPCRequest(request, this.chain.rpcUrl);
    }
  }

  private async sendRequestToPopup(request: RequestArguments) {
    // Open the popup before constructing the request message.
    // This is to ensure that the popup is not blocked by some browsers (i.e. Safari)
    await this.communicator.waitForPopupLoaded?.();

    const response = await this.sendEncryptedRequest(request);
    const decrypted = await this.decryptResponseMessage(response);
=======
    const response = await this.sendEncryptedRequest(request);
    const decrypted = await this.decryptResponseMessage(response);

    return this.handleResponse(request, decrypted);
  }
>>>>>>> upstream/master

  private async handleResponse(request: RequestArguments, decrypted: RPCResponse) {
    const result = decrypted.result;

    if ('error' in result) throw result.error;

    switch (request.method) {
      case 'eth_requestAccounts': {
        const accounts = result.value as Address[];
        this.accounts = accounts;
        store.account.set({
          accounts,
          chain: this.chain,
        });
        this.callback?.('accountsChanged', accounts);
        break;
      }
      case 'wallet_connect': {
        const response = result.value as WalletConnectResponse;
        const accounts = response.accounts.map((account) => account.address);
        this.accounts = accounts;
        store.account.set({
          accounts,
        });

        const account = response.accounts.at(0);
        const capabilities = account?.capabilities;

        if (capabilities?.subAccounts) {
          const capabilityResponse = capabilities?.subAccounts;
          assertArrayPresence(capabilityResponse, 'subAccounts');
          assertSubAccount(capabilityResponse[0]);
          store.subAccounts.set({
            address: capabilityResponse[0].address,
            factory: capabilityResponse[0].factory,
            factoryData: capabilityResponse[0].factoryData,
          });
        }
        let accounts_ = [this.accounts[0]];

        const subAccount = store.subAccounts.get();
        const subAccountsConfig = store.subAccountsConfig.get();

        if (subAccount?.address) {
          // Sub account should be returned as a top level account if auto sub accounts are enabled
          this.accounts = subAccountsConfig?.enableAutoSubAccounts
            ? prependWithoutDuplicates(this.accounts, subAccount.address)
            : appendWithoutDuplicates(this.accounts, subAccount.address);
        }

        const spendPermissions = response?.accounts?.[0].capabilities?.spendPermissions;

        if (spendPermissions && 'permissions' in spendPermissions) {
          store.spendPermissions.set(spendPermissions?.permissions);
        }

        this.callback?.('accountsChanged', accounts_);
        break;
      }
      case 'wallet_addSubAccount': {
        assertSubAccount(result.value);
        const subAccount = result.value;
        store.subAccounts.set(subAccount);
        const subAccountsConfig = store.subAccountsConfig.get();
        this.accounts = subAccountsConfig?.enableAutoSubAccounts
          ? prependWithoutDuplicates(this.accounts, subAccount.address)
          : appendWithoutDuplicates(this.accounts, subAccount.address);
        this.callback?.('accountsChanged', this.accounts);
        break;
      }
      default:
        break;
    }
    return result.value;
  }

  async cleanup() {
<<<<<<< HEAD
    this.storage.clear();
    await this.keyManager.clear();
    this.accounts = [];
    this.chain = {
      id: this.metadata.appChainIds?.[0] ?? 1,
=======
    const metadata = store.config.get().metadata;
    await this.keyManager.clear();

    // clear the store
    store.account.clear();
    store.subAccounts.clear();
    store.spendPermissions.clear();
    store.chains.clear();

    // reset the signer
    this.accounts = [];
    this.chain = {
      id: metadata?.appChainIds?.[0] ?? 1,
>>>>>>> upstream/master
    };
  }

  /**
   * @returns `null` if the request was successful.
   * https://eips.ethereum.org/EIPS/eip-3326#wallet_switchethereumchain
   */
  private async handleSwitchChainRequest(request: RequestArguments) {
<<<<<<< HEAD
    const params = request.params as [
      {
        chainId: `0x${string}`;
      },
    ];
    if (!params || !params[0]?.chainId) {
      throw standardErrors.rpc.invalidParams();
    }
    const chainId = ensureIntNumber(params[0].chainId);

=======
    assertParamsChainId(request.params);

    const chainId = ensureIntNumber(request.params[0].chainId);
>>>>>>> upstream/master
    const localResult = this.updateChain(chainId);
    if (localResult) return null;

    const popupResult = await this.sendRequestToPopup(request);
    if (popupResult === null) {
      this.updateChain(chainId);
    }
    return popupResult;
<<<<<<< HEAD
=======
  }

  private async handleGetCapabilitiesRequest(request: RequestArguments) {
    assertGetCapabilitiesParams(request.params);

    const requestedAccount = request.params[0];
    const filterChainIds = request.params[1]; // Optional second parameter

    if (!this.accounts.some((account) => isAddressEqual(account, requestedAccount))) {
      throw standardErrors.provider.unauthorized(
        'no active account found when getting capabilities'
      );
    }

    const capabilities = store.getState().account.capabilities;

    // Return empty object if capabilities is undefined
    if (!capabilities) {
      return {};
    }

    // If no filter is provided, return all capabilities
    if (!filterChainIds || filterChainIds.length === 0) {
      return capabilities;
    }

    // Convert filter chain IDs to numbers once for efficient lookup
    const filterChainNumbers = new Set(filterChainIds.map((chainId) => hexToNumber(chainId)));

    // Filter capabilities
    const filteredCapabilities = Object.fromEntries(
      Object.entries(capabilities).filter(([capabilityKey]) => {
        try {
          const capabilityChainNumber = hexToNumber(capabilityKey as `0x${string}`);
          return filterChainNumbers.has(capabilityChainNumber);
        } catch {
          // If capabilityKey is not a valid hex string, exclude it
          return false;
        }
      })
    );

    return filteredCapabilities;
>>>>>>> upstream/master
  }

  private async sendEncryptedRequest(request: RequestArguments): Promise<RPCResponseMessage> {
    const sharedSecret = await this.keyManager.getSharedSecret();
    if (!sharedSecret) {
      throw standardErrors.provider.unauthorized('No shared secret found when encrypting request');
    }

    const encrypted = await encryptContent(
      {
        action: request,
        chainId: this.chain.id,
      },
      sharedSecret
    );
    const correlationId = correlationIds.get(request);
    const message = await this.createRequestMessage({ encrypted }, correlationId);

    return this.communicator.postRequestAndWaitForResponse(message);
  }

  private async createRequestMessage(
<<<<<<< HEAD
    content: RPCRequestMessage['content']
=======
    content: RPCRequestMessage['content'],
    correlationId: string | undefined
>>>>>>> upstream/master
  ): Promise<RPCRequestMessage> {
    const publicKey = await exportKeyToHexString('public', await this.keyManager.getOwnPublicKey());

    return {
      id: crypto.randomUUID(),
      correlationId,
      sender: publicKey,
      content,
      timestamp: new Date(),
    };
  }

  private async decryptResponseMessage(message: RPCResponseMessage): Promise<RPCResponse> {
    const content = message.content;

    // throw protocol level error
    if ('failure' in content) {
      throw content.failure;
    }

    const sharedSecret = await this.keyManager.getSharedSecret();
    if (!sharedSecret) {
      throw standardErrors.provider.unauthorized(
        'Invalid session: no shared secret found when decrypting response'
      );
    }

    const response: RPCResponse = await decryptContent(content.encrypted, sharedSecret);

    const availableChains = response.data?.chains;
    if (availableChains) {
<<<<<<< HEAD
      const chains = Object.entries(availableChains).map(([id, rpcUrl]) => ({
        id: Number(id),
        rpcUrl,
      }));
      this.storage.storeObject(AVAILABLE_CHAINS_STORAGE_KEY, chains);
      this.updateChain(this.chain.id, chains);
=======
      const nativeCurrencies = response.data?.nativeCurrencies;
      const chains: SDKChain[] = Object.entries(availableChains).map(([id, rpcUrl]) => {
        const nativeCurrency = nativeCurrencies?.[Number(id)];
        return {
          id: Number(id),
          rpcUrl,
          ...(nativeCurrency ? { nativeCurrency } : {}),
        };
      });

      store.chains.set(chains);

      this.updateChain(this.chain.id, chains);
      createClients(chains);
>>>>>>> upstream/master
    }

    const walletCapabilities = response.data?.capabilities;
    if (walletCapabilities) {
<<<<<<< HEAD
      this.storage.storeObject(WALLET_CAPABILITIES_STORAGE_KEY, walletCapabilities);
=======
      store.account.set({
        capabilities: walletCapabilities,
      });
    }
    return response;
  }

  private updateChain(chainId: number, newAvailableChains?: SDKChain[]): boolean {
    const state = store.getState();
    const chains = newAvailableChains ?? state.chains;
    const chain = chains?.find((chain) => chain.id === chainId);
    if (!chain) return false;

    if (chain !== this.chain) {
      this.chain = chain;
      store.account.set({
        chain,
      });
      this.callback?.('chainChanged', hexStringFromNumber(chain.id));
    }
    return true;
  }

  private async addSubAccount(request: RequestArguments): Promise<{
    address: Address;
    factory?: Address;
    factoryData?: Hex;
  }> {
    const state = store.getState();
    const subAccount = state.subAccount;
    const subAccountsConfig = store.subAccountsConfig.get();
    if (subAccount?.address) {
      this.accounts = subAccountsConfig?.enableAutoSubAccounts
        ? prependWithoutDuplicates(this.accounts, subAccount.address)
        : appendWithoutDuplicates(this.accounts, subAccount.address);
      this.callback?.('accountsChanged', this.accounts);
      return subAccount;
    }

    // Wait for the popup to be loaded before sending the request
    await this.communicator.waitForPopupLoaded?.();

    if (
      Array.isArray(request.params) &&
      request.params.length > 0 &&
      request.params[0].account &&
      request.params[0].account.type === 'create'
    ) {
      let keys: { type: string; publicKey: string }[];
      if (request.params[0].account.keys && request.params[0].account.keys.length > 0) {
        keys = request.params[0].account.keys;
      } else {
        const config = store.subAccountsConfig.get() ?? {};
        const { account: ownerAccount } = config.toOwnerAccount
          ? await config.toOwnerAccount()
          : await getCryptoKeyAccount();

        if (!ownerAccount) {
          throw standardErrors.provider.unauthorized(
            'could not get subaccount owner account when adding sub account'
          );
        }

        keys = [
          {
            type: ownerAccount.address ? 'address' : 'webauthn-p256',
            publicKey: ownerAccount.address || ownerAccount.publicKey,
          },
        ];
      }
      request.params[0].account.keys = keys;
    }

    const response = await this.sendRequestToPopup(request);
    assertSubAccount(response);
    return response;
  }

  private shouldRequestUseSubAccountSigner(request: RequestArguments) {
    const sender = getSenderFromRequest(request);
    const subAccount = store.subAccounts.get();
    if (sender) {
      return sender.toLowerCase() === subAccount?.address.toLowerCase();
    }
    return false;
  }

  private async sendRequestToSubAccountSigner(request: RequestArguments) {
    const subAccount = store.subAccounts.get();
    const subAccountsConfig = store.subAccountsConfig.get();
    const config = store.config.get();

    assertPresence(
      subAccount?.address,
      standardErrors.provider.unauthorized(
        'no active sub account when sending request to sub account signer'
      )
    );

    // Get the owner account from the config
    const ownerAccount = subAccountsConfig?.toOwnerAccount
      ? await subAccountsConfig.toOwnerAccount()
      : await getCryptoKeyAccount();

    assertPresence(
      ownerAccount?.account,
      standardErrors.provider.unauthorized(
        'no active sub account owner when sending request to sub account signer'
      )
    );

    const sender = getSenderFromRequest(request);
    // if sender is undefined, we inject the active sub account
    // address into the params for the supported request methods
    if (sender === undefined) {
      request = addSenderToRequest(request, subAccount.address);
    }

    const client = getClient(this.chain.id);
    assertPresence(
      client,
      standardErrors.rpc.internal(
        `client not found for chainId ${this.chain.id} when sending request to sub account signer`
      )
    );

    const globalAccountAddress = this.accounts.find(
      (account) => account.toLowerCase() !== subAccount.address.toLowerCase()
    );

    assertPresence(
      globalAccountAddress,
      standardErrors.provider.unauthorized(
        'no global account found when sending request to sub account signer'
      )
    );
    const dataSuffix = makeDataSuffix({
      attribution: config.preference?.attribution,
      dappOrigin: window.location.origin,
    });

    const publicKey =
      ownerAccount.account.type === 'local'
        ? ownerAccount.account.address
        : ownerAccount.account.publicKey;

    let ownerIndex = await findOwnerIndex({
      address: subAccount.address,
      factory: subAccount.factory,
      factoryData: subAccount.factoryData,
      publicKey,
      client,
    });

    if (ownerIndex === -1) {
      const correlationId = correlationIds.get(request);
      logAddOwnerStarted({ method: request.method, correlationId });
      try {
        ownerIndex = await handleAddSubAccountOwner({
          ownerAccount: ownerAccount.account,
          globalAccountRequest: this.sendRequestToPopup.bind(this),
        });
        logAddOwnerCompleted({ method: request.method, correlationId });
      } catch (error) {
        logAddOwnerError({
          method: request.method,
          correlationId,
          errorMessage: parseErrorMessageFromAny(error),
        });
        return standardErrors.provider.unauthorized(
          'failed to add sub account owner when sending request to sub account signer'
        );
      }
    }

    const { request: subAccountRequest } = await createSubAccountSigner({
      address: subAccount.address,
      owner: ownerAccount.account,
      client: client,
      factory: subAccount.factory,
      factoryData: subAccount.factoryData,
      parentAddress: globalAccountAddress,
      attribution: dataSuffix ? { suffix: dataSuffix } : undefined,
      ownerIndex,
    });

    try {
      const result = await subAccountRequest(request);
      return result;
    } catch (error) {
      let errorObject: unknown;

      if (isViemError(error)) {
        errorObject = JSON.parse(error.details);
      } else if (isActionableHttpRequestError(error)) {
        errorObject = error;
      } else {
        throw error;
      }

      if (!(isActionableHttpRequestError(errorObject) && errorObject.data)) {
        throw error;
      }

      if (!errorObject.data) {
        throw error;
      }

      const correlationId = correlationIds.get(request);
      logInsufficientBalanceErrorHandlingStarted({ method: request.method, correlationId });
      try {
        const result = await handleInsufficientBalanceError({
          errorData: errorObject.data,
          globalAccountAddress,
          subAccountAddress: subAccount.address,
          client,
          request,
          subAccountRequest,
          globalAccountRequest: this.request.bind(this),
        });
        logInsufficientBalanceErrorHandlingCompleted({ method: request.method, correlationId });
        return result;
      } catch (handlingError) {
        console.error(handlingError);
        logInsufficientBalanceErrorHandlingError({
          method: request.method,
          correlationId,
          errorMessage: parseErrorMessageFromAny(handlingError),
        });
        throw error;
      }
>>>>>>> upstream/master
    }

    return response;
  }

  private updateChain(chainId: number, newAvailableChains?: Chain[]): boolean {
    const chains =
      newAvailableChains ?? this.storage.loadObject<Chain[]>(AVAILABLE_CHAINS_STORAGE_KEY);
    const chain = chains?.find((chain) => chain.id === chainId);
    if (!chain) return false;

    if (chain !== this.chain) {
      this.chain = chain;
      this.storage.storeObject(ACTIVE_CHAIN_STORAGE_KEY, chain);
      this.callback?.('chainChanged', hexStringFromNumber(chain.id));
    }
    return true;
  }
}
