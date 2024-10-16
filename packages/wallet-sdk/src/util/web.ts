import { NAME, VERSION } from '../sdk-info';
import { getCrossOriginOpenerPolicy } from './checkCrossOriginOpenerPolicy';
import { standardErrors } from ':core/error';

const POPUP_WIDTH = 420;
const POPUP_HEIGHT = 540;

// Window Management

export function openPopup(url: URL): Window {
  const left = (window.innerWidth - POPUP_WIDTH) / 2 + window.screenX;
  const top = (window.innerHeight - POPUP_HEIGHT) / 2 + window.screenY;

  appendAppInfoQueryParams(url);

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
}

export function closePopup(popup: Window | null) {
  if (popup && !popup.closed) {
    popup.close();
  }
}

function appendAppInfoQueryParams(url: URL) {
  const params = {
    sdkName: NAME,
    sdkVersion: VERSION,
    origin: window.location.origin,
    coop: getCrossOriginOpenerPolicy(),
  };

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value.toString());
  }
}
