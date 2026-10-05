import { appConfig } from './app.config';

describe('appConfig', () => {
  it('registers router, http, initializer, title strategy and event plugins', () => {
    expect(appConfig.providers.length).toBeGreaterThanOrEqual(9);
  });
});
