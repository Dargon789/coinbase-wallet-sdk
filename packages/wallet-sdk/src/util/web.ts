<<<<<<< HEAD
import { standardErrors } from ':core/error';

const POPUP_WIDTH = 420;
const POPUP_HEIGHT = 540;

// Window Management

export function openPopup(url: URL): Window {
  const left = (window.innerWidth - POPUP_WIDTH) / 2 + window.screenX;
  const top = (window.innerHeight - POPUP_HEIGHT) / 2 + window.screenY;

  const popup = window.open(
    url,
    'Smart Wallet',
    `width=${POPUP_WIDTH}, height=${POPUP_HEIGHT}, left=${left}, top=${top}`
  );
  popup?.focus();
  if (!popup) {
    throw standardErrors.rpc.internal('Pop up window failed to open');
  }
  return popup;
=======
import { standardErrors } from ':core/error/errors.js';
import { logSnackbarActionClicked, logSnackbarShown } from ':core/telemetry/events/snackbar.js';
import { RETRY_SVG_PATH } from ':sign/walletlink/relay/ui/WalletLinkRelayUI.js';
import { Snackbar } from ':sign/walletlink/relay/ui/components/Snackbar/Snackbar.js';
import { NAME, VERSION } from '../sdk-info.js';
import { getCrossOriginOpenerPolicy } from './checkCrossOriginOpenerPolicy.js';

const POPUP_WIDTH = 420;
const POPUP_HEIGHT = 700;

const RETRY_BUTTON = {
  isRed: false,
  info: 'Retry',
  svgWidth: '10',
  svgHeight: '11',
  path: RETRY_SVG_PATH,
  defaultFillRule: 'evenodd',
  defaultClipRule: 'evenodd',
} as const;

const POPUP_BLOCKED_MESSAGE = 'Popup was blocked. Try again.';

let snackbar: Snackbar | null = null;

export function openPopup(url: URL): Promise<Window> {
  const left = (window.innerWidth - POPUP_WIDTH) / 2 + window.screenX;
  const top = (window.innerHeight - POPUP_HEIGHT) / 2 + window.screenY;
  appendAppInfoQueryParams(url);

  function tryOpenPopup(): Window | null {
    const popupId = `wallet_${crypto.randomUUID()}`;
    const popup = window.open(
      url,
      popupId,
      `width=${POPUP_WIDTH}, height=${POPUP_HEIGHT}, left=${left}, top=${top}`
    );

    popup?.focus();

    if (!popup) {
      return null;
    }

    return popup;
  }

  let popup = tryOpenPopup();

  // If the popup was blocked, show a snackbar with a retry button
  if (!popup) {
    const sb = initSnackbar();
    return new Promise<Window>((resolve, reject) => {
      logSnackbarShown({ snackbarContext: 'popup_blocked' });
      sb.presentItem({
        autoExpand: true,
        message: POPUP_BLOCKED_MESSAGE,
        menuItems: [
          {
            ...RETRY_BUTTON,
            onClick: () => {
              logSnackbarActionClicked({
                snackbarContext: 'popup_blocked',
                snackbarAction: 'confirm',
              });
              popup = tryOpenPopup();
              if (popup) {
                resolve(popup);
              } else {
                reject(standardErrors.rpc.internal('Popup window was blocked'));
              }
              sb.clear();
            },
          },
        ],
      });
    });
  }

  return Promise.resolve(popup);
>>>>>>> upstream/master
}

export function closePopup(popup: Window | null) {
  if (popup && !popup.closed) {
    popup.close();
  }
}

<<<<<<< HEAD
/**
 * TODO: consolidate all UI related helper functions,
 * ones making window.xxx() document.yyy() calls.
 * e.g. WLMobileRelayUI, WalletLinkRelay, ...
 */
=======
function appendAppInfoQueryParams(url: URL) {
  const params = {
    sdkName: NAME,
    sdkVersion: VERSION,
    origin: window.location.origin,
    coop: getCrossOriginOpenerPolicy(),
  };

  for (const [key, value] of Object.entries(params)) {
    if (!url.searchParams.has(key)) {
      url.searchParams.append(key, value.toString());
    }
  }
}

export function initSnackbar() {
  if (!snackbar) {
    const root = document.createElement('div');
    root.className = '-cbwsdk-css-reset';
    document.body.appendChild(root);
    snackbar = new Snackbar();
    snackbar.attach(root);
  }
  return snackbar;
}
>>>>>>> upstream/master
