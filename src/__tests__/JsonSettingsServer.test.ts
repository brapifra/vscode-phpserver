import * as http from 'http';
import VSCodeMementoMock from '../__mocks__/VSCodeMementoMock';
import JsonSettingsServer from '../server/JsonSettingsServer';

describe('JsonSettingsServer', () => {
  let server: JsonSettingsServer;
  let port: number;
  let globalState: VSCodeMementoMock;

  beforeEach(async () => {
    globalState = new VSCodeMementoMock();
    server = new JsonSettingsServer(
      globalState,
      '127.0.0.1',
      0,
      jest.fn()
    );
    await server.start();
    const actualPort = server.getPort();
    if (typeof actualPort === 'undefined') {
      throw new Error('JSON settings server did not start');
    }
    port = actualPort;
  });

  afterEach(() => server.stop());

  function request(
    method: string,
    path: string,
    body?: string,
    headers: Record<string, string> = {}
  ): Promise<{ statusCode: number; body: string }> {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: '127.0.0.1',
          port,
          path,
          method,
          headers,
        },
        (response) => {
          let responseBody = '';
          response.setEncoding('utf8');
          response.on('data', (chunk: string) => (responseBody += chunk));
          response.on('end', () =>
            resolve({
              statusCode: response.statusCode || 0,
              body: responseBody,
            })
          );
        }
      );
      req.on('error', reject);
      if (body) {
        req.write(body);
      }
      req.end();
    });
  }

  it('stores and retrieves JSON values', async () => {
    const value = { model: 'agent-v1', enabled: true };
    const setResponse = await request('PUT', '/api/agent', JSON.stringify(value), {
      'Content-Type': 'application/json',
    });

    expect(setResponse.statusCode).toBe(200);
    expect(JSON.parse(setResponse.body)).toEqual({ key: 'agent', value });

    const getResponse = await request('GET', '/api/agent');
    expect(getResponse.statusCode).toBe(200);
    expect(JSON.parse(getResponse.body)).toEqual({ key: 'agent', value });
  });

  it('stores JSON null as a value', async () => {
    const setResponse = await request('PUT', '/api/nullable', 'null', {
      'Content-Type': 'application/json',
    });
    expect(setResponse.statusCode).toBe(200);

    const getResponse = await request('GET', '/api/nullable');
    expect(getResponse.statusCode).toBe(200);
    expect(JSON.parse(getResponse.body)).toEqual({
      key: 'nullable',
      value: null,
    });
  });

  it('returns 404 for missing keys and unknown routes', async () => {
    const missingKey = await request('GET', '/api/missing');
    expect(missingKey.statusCode).toBe(404);

    const unknownRoute = await request('GET', '/');
    expect(unknownRoute.statusCode).toBe(404);
  });

  it('rejects invalid JSON and unsupported methods', async () => {
    const invalidJson = await request('PUT', '/api/agent', '{', {
      'Content-Type': 'application/json',
    });
    expect(invalidJson.statusCode).toBe(400);

    const unsupportedMethod = await request('POST', '/api/agent');
    expect(unsupportedMethod.statusCode).toBe(405);
  });

  it('rejects non-JSON and oversized values', async () => {
    const nonJson = await request('PUT', '/api/agent', '{}', {
      'Content-Type': 'text/plain',
    });
    expect(nonJson.statusCode).toBe(415);

    const oversized = await request(
      'PUT',
      '/api/agent',
      JSON.stringify('x'.repeat(1024 * 1024)),
      { 'Content-Type': 'application/json' }
    );
    expect(oversized.statusCode).toBe(413);
  });

  it('supports CORS preflight requests', async () => {
    const response = await request('OPTIONS', '/api/agent');
    expect(response.statusCode).toBe(204);
  });
});
