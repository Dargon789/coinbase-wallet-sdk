import { Preference } from ':core/provider/interface.js';
import { ToSubAccountSigner } from ':store/store.js';

/**
 * Validates user supplied preferences. Throws if keys are not valid.
 * @param preference
 */
export function validatePreferences(preference?: Preference) {
  if (!preference) {
    return;
  }

  if (!['all', 'smartWalletOnly', 'eoaOnly'].includes(preference.options)) {
    throw new Error(`Invalid options: ${preference.options}`);
  }

  if (preference.attribution) {
    if (
      preference.attribution.auto !== undefined &&
      preference.attribution.dataSuffix !== undefined
    ) {
      throw new Error(`Attribution cannot contain both auto and dataSuffix properties`);
    }
  }
}

/**
 * Validates user supplied toSubAccountSigner function. Throws if keys are not valid.
 * @param toSubAccountSigner
 */
export function validateSubAccount(toSubAccountSigner: ToSubAccountSigner) {
  if (typeof toSubAccountSigner !== 'function') {
    throw new Error(`toSubAccountSigner is not a function`);
  }
}
