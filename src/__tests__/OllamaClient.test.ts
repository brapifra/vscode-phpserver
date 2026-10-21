import * as http from 'http';
import OllamaClient from '../OllamaClient';

describe('OllamaClient', () => {
  let server: http.Server;
  let host: string;

  beforeEach(
    () =>
      new Promise<void>((resolve) => {
        server = http.createServer();
        server.listen(0, '127.0.0.1', () => {
          const address = server.address() as { port: number };
          host = `http://127.0.0.1:${address.port}`;
          resolve();
        });
      })
  );

  afterEach(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      })
  );

  it('posts the prompt to Ollama and returns its response', async () => {
    server.removeAllListeners('request');
    server.on('request', (request, response) => {
      let body = '';
      request.on('data', (chunk: string) => (body += chunk));
      request.on('end', () => {
        expect(request.url).toBe('/api/chat');
        expect(JSON.parse(body)).toEqual({
          model: 'qwen3-coder:30b',
          messages: [{ role: 'user', content: 'Review this code' }],
          stream: false,
        });
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ message: { content: 'Looks good.' } }));
      });
    });

    await expect(
      new OllamaClient(host, 'qwen3-coder:30b').chat('Review this code')
    ).resolves.toBe('Looks good.');
  });

  it('reports Ollama HTTP errors', async () => {
    server.removeAllListeners('request');
    server.on('request', (_request, response) => {
      response.statusCode = 404;
      response.end('model not found');
    });

    await expect(new OllamaClient(host, 'missing-model').chat('Hello')).rejects
      .toThrow('Ollama returned HTTP 404: model not found');
  });
});
