<<<<<<< HEAD
import { closePopup, openPopup } from './web';
import { standardErrors } from ':core/error';
=======
import { waitFor } from '@testing-library/preact';
import { Mock, vi } from 'vitest';

import { NAME, VERSION } from '../sdk-info.js';
import { getCrossOriginOpenerPolicy } from './checkCrossOriginOpenerPolicy.js';
import { closePopup, openPopup } from './web.js';

vi.mock('./checkCrossOriginOpenerPolicy');
(getCrossOriginOpenerPolicy as Mock).mockReturnValue('null');

// Mock Snackbar class
const mockPresentItem = vi.fn().mockReturnValue(() => {});
const mockClear = vi.fn();
const mockAttach = vi.fn();
const mockInstance = {
  presentItem: mockPresentItem,
  clear: mockClear,
  attach: mockAttach,
};

vi.mock(':sign/walletlink/relay/ui/components/Snackbar/Snackbar.js', () => ({
  Snackbar: vi.fn().mockImplementation(() => mockInstance),
}));

const mockOrigin = 'http://localhost';
>>>>>>> upstream/master

describe('PopupManager', () => {
  beforeAll(() => {
    global.window = Object.create(window);
    Object.defineProperties(window, {
      innerWidth: { value: 1024 },
      innerHeight: { value: 768 },
      screenX: { value: 0 },
      screenY: { value: 0 },
<<<<<<< HEAD
      open: { value: jest.fn() },
      close: { value: jest.fn() },
=======
      open: { value: vi.fn() },
      close: { value: vi.fn() },
      location: { value: { origin: mockOrigin } },
>>>>>>> upstream/master
    });
  });

  afterEach(() => {
<<<<<<< HEAD
    jest.clearAllMocks();
  });

  it('should open a popup with correct settings and focus it', () => {
    const url = new URL('https://example.com');
    (window.open as jest.Mock).mockReturnValue({ focus: jest.fn() });

    const popup = openPopup(url);
=======
    vi.clearAllMocks();
  });

  it('should open a popup with correct settings and focus it', async () => {
    const url = new URL('https://example.com');
    (window.open as Mock).mockReturnValue({ focus: vi.fn() });

    const popup = await openPopup(url);
>>>>>>> upstream/master

    expect(window.open).toHaveBeenNthCalledWith(
      1,
      url,
<<<<<<< HEAD
      'Smart Wallet',
      'width=420, height=540, left=302, top=114'
    );
    expect(popup.focus).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if popup fails to open', () => {
    (window.open as jest.Mock).mockReturnValue(null);

    expect(() => openPopup(new URL('https://example.com'))).toThrow(
      standardErrors.rpc.internal('Pop up window failed to open')
    );
  });

  it('should close an open popup window', () => {
    const mockPopup = { close: jest.fn(), closed: false } as any as Window;
=======
      expect.stringContaining('wallet_'),
      'width=420, height=700, left=302, top=34'
    );
    expect(popup.focus).toHaveBeenCalledTimes(1);

    expect(url.searchParams.get('sdkName')).toBe(NAME);
    expect(url.searchParams.get('sdkVersion')).toBe(VERSION);
    expect(url.searchParams.get('origin')).toBe(mockOrigin);
    expect(url.searchParams.get('coop')).toBe('null');
  });

  it('should not duplicate parameters when opening a popup with existing params', async () => {
    const url = new URL('https://example.com');
    url.searchParams.append('sdkName', NAME);
    url.searchParams.append('sdkVersion', VERSION);
    url.searchParams.append('origin', mockOrigin);
    url.searchParams.append('coop', 'null');

    (window.open as Mock).mockReturnValue({ focus: vi.fn() });

    await openPopup(url);

    const paramCount = url.searchParams.toString().split('&').length;
    expect(paramCount).toBe(4);
  });

  it('should not overwrite coop=same-origin when already present in the URL', async () => {
    const url = new URL('https://example.com');
    url.searchParams.set('coop', 'same-origin');

    (window.open as Mock).mockReturnValue({ focus: vi.fn() });

    await openPopup(url);

    expect(url.searchParams.get('coop')).toBe('same-origin');
    expect(url.searchParams.getAll('coop')).toHaveLength(1);
  });

  it('should show snackbar with retry button when popup is blocked and retry successfully', async () => {
    const url = new URL('https://example.com');
    const mockPopup = { focus: vi.fn() };
    (window.open as Mock).mockReturnValueOnce(null).mockReturnValueOnce(mockPopup);

    const promise = openPopup(url);

    await waitFor(() => {
      expect(mockPresentItem).toHaveBeenCalledWith(
        expect.objectContaining({
          autoExpand: true,
          message: 'Popup was blocked. Try again.',
        })
      );
    });

    const retryButton = mockPresentItem.mock.calls[0][0].menuItems[0];
    retryButton.onClick();

    const popup = await promise;
    expect(popup).toBe(mockPopup);
    expect(mockClear).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledTimes(2);
  });

  it('should show snackbar with retry button when popup is blocked and reject if retry fails', async () => {
    const url = new URL('https://example.com');
    (window.open as Mock).mockReturnValue(null);

    const promise = openPopup(url);

    await waitFor(() => {
      expect(mockPresentItem).toHaveBeenCalledWith(
        expect.objectContaining({
          autoExpand: true,
          message: 'Popup was blocked. Try again.',
        })
      );
    });

    const retryButton = mockPresentItem.mock.calls[0][0].menuItems[0];
    retryButton.onClick();

    await expect(promise).rejects.toThrow('Popup window was blocked');
    expect(mockClear).toHaveBeenCalled();
  });

  it('should close an open popup window', () => {
    const mockPopup = { close: vi.fn(), closed: false } as any as Window;
>>>>>>> upstream/master

    closePopup(mockPopup);

    expect(mockPopup.close).toHaveBeenCalledTimes(1);
  });
});
