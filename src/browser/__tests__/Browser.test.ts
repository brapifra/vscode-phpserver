import { AnyBrowser } from '../Browser';
import * as open from 'open';

jest.mock('open', () => jest.fn());

const testUrl = 'http://localhost:3000/index.php';

describe('Browser', () => {
  beforeEach(() => (open as jest.Mock).mockClear());

  it('should open the passed url in the default browser', () => {
    expect(open).toBeCalledTimes(0);

    new AnyBrowser().open(testUrl);

    expect(open).toBeCalledTimes(1);
    expect(open).toBeCalledWith(testUrl, { url: true });
  });

  it('should open the passed url in the passed browser', () => {
    const browser = 'firefox';
    expect(open).toBeCalledTimes(0);

    new AnyBrowser(browser).open(testUrl);

    expect(open).toBeCalledTimes(1);
    expect(open).toBeCalledWith(testUrl, { url: true, app: browser });
  });
});
