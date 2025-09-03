import * as Intercom from '@intercom/messenger-js-sdk';
import { render } from '@testing-library/react';
import * as useUser from 'app-zephyr-domains/user';
import { IntercomLauncher } from '../IntercomLauncher';
import * as utils from '../utils';

jest.mock('@intercom/messenger-js-sdk', () => ({
  __esModule: true,
  default: jest.fn(),
  update: jest.fn(),
  shutdown: jest.fn(),
}));

jest.mock('app-zephyr-domains/user', () => ({
  useCurrentUser: jest.fn(),
}));

jest.mock('app-zephyr-environment', () => ({
  envValue: {
    value: {
      intercomAppId: 'test-app-id',
    },
  },
}));

describe('IntercomChat', () => {
  const mockIntercomDefault = Intercom.default as jest.Mock;
  const mockIntercomUpdate = Intercom.update as jest.Mock;
  const mockIntercomShutdown = Intercom.shutdown as jest.Mock;
  const mockUseCurrentUser = useUser.useCurrentUser as jest.Mock;

  beforeEach(() => {
    mockIntercomDefault.mockClear();
    mockIntercomUpdate.mockClear();
    mockIntercomShutdown.mockClear();
    jest.resetModules();
  });

  const renderComponent = () => render(<IntercomLauncher />);

  it('should not call Intercom if loading', () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: true });

    renderComponent();
    expect(mockIntercomDefault).not.toHaveBeenCalled();
    expect(mockIntercomUpdate).not.toHaveBeenCalled();
  });

  it('should not call Intercom if no user', () => {
    mockUseCurrentUser.mockReturnValue({ user: null, isLoading: false });

    renderComponent();
    expect(mockIntercomDefault).not.toHaveBeenCalled();
  });

  it('should call Intercom.default once on first load', () => {
    mockUseCurrentUser.mockReturnValue({
      isLoading: false,
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'john doe',
        portrait: 'https://example.com/avatar.png',
        role: 'admin',
        username: 'john-doe',
        company: 'Acme Corp',
        personalEmail: 'personal@example.com',
      },
    });

    renderComponent();

    expect(mockIntercomDefault).toHaveBeenCalledTimes(1);
    const callArgs = mockIntercomDefault.mock.calls[0][0];
    expect(callArgs.app_id).toBe('test-app-id');
    expect(callArgs.name).toBe('John Doe');
    expect(callArgs.custom_attributes.personalEmail).toBe('personal@example.com');
  });

  it('should call Intercom.shutdown on unmount', () => {
    mockUseCurrentUser.mockReturnValue({
      isLoading: false,
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'john doe',
        portrait: null,
      },
    });

    const { unmount } = render(<IntercomLauncher />);
    expect(mockIntercomDefault).toHaveBeenCalled();

    unmount();
    expect(mockIntercomShutdown).toHaveBeenCalledTimes(1);
  });

  it('should render nothing', () => {
    mockUseCurrentUser.mockReturnValue({ isLoading: false, user: null });

    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it('should not crash when running in SSR (no window)', () => {
    const originalWindow = global.window;

    mockUseCurrentUser.mockReturnValue({
      isLoading: false,
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'john doe',
        portrait: 'pic.png',
      },
    });

    expect(() => renderComponent()).not.toThrow();

    global.window = originalWindow;
  });

  it('should handle getSafeIntercomProps error gracefully', () => {
    const spy = jest.spyOn(utils, 'getSafeIntercomProps').mockImplementation(() => {
      throw new Error('boom');
    });

    mockUseCurrentUser.mockReturnValue({
      isLoading: false,
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'john',
        portrait: '',
      },
    });

    expect(() => renderComponent()).not.toThrow();
    spy.mockRestore();
  });

  it('should handle Intercom initialization errors gracefully', () => {
    mockIntercomDefault.mockImplementation(() => {
      throw new Error('Intercom initialization failed');
    });

    (useUser.useCurrentUser as jest.Mock).mockReturnValue({
      isLoading: false,
      user: { id: '123', email: 'test@example.com', name: 'Test User' },
    });

    expect(() => renderComponent()).not.toThrow();
    expect(mockIntercomDefault).toHaveBeenCalledTimes(1);
  });
});
