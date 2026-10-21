import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { Memento } from 'vscode';
import { parse as parseUrl } from 'url';

const STORAGE_PREFIX = 'jsonSettingsServer.';
const MAX_BODY_SIZE = 1024 * 1024;

class BodyTooLargeError extends Error {}

export default class JsonSettingsServer {
  private server?: Server;

  constructor(
    private globalState: Memento,
    private host: string,
    private port: number,
    private onError: (error: Error) => void
  ) {}

  start(): Promise<void> {
    if (this.server) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const server = createServer((request, response) => {
        this.handleRequest(request, response).catch((error: Error) => {
          const statusCode = error instanceof BodyTooLargeError ? 413 : 500;
          this.sendError(response, statusCode, error.message);
        });
      });

      const onStartupError = (error: Error) => {
        server.removeListener('listening', onListening);
        this.server = undefined;
        reject(error);
      };
      const onListening = () => {
        server.removeListener('error', onStartupError);
        this.server = server;
        server.on('error', this.onError);
        resolve();
      };

      server.once('error', onStartupError);
      server.once('listening', onListening);
      server.listen(this.port, this.host);
    });
  }

  stop(): void {
    if (!this.server) {
      return;
    }

    this.server.close();
    this.server = undefined;
  }

  getPort(): number | undefined {
    const address = this.server?.address();
    return address && typeof address !== 'string' ? address.port : undefined;
  }

  dispose(): void {
    this.stop();
  }

  private async handleRequest(
    request: IncomingMessage,
    response: ServerResponse
  ): Promise<void> {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
      response.statusCode = 204;
      response.end();
      return;
    }

    const pathname = parseUrl(request.url || '/').pathname || '/';
    const match = /^\/api\/([A-Za-z0-9._-]{1,128})$/.exec(pathname);
    if (!match) {
      this.sendError(response, 404, 'Not found');
      return;
    }

    const key = match[1];
    if (request.method === 'GET') {
      const value = this.globalState.get<unknown>(STORAGE_PREFIX + key);
      if (typeof value === 'undefined') {
        this.sendError(response, 404, 'Key not found');
        return;
      }

      this.sendJson(response, 200, { key, value });
      return;
    }

    if (request.method !== 'PUT') {
      response.setHeader('Allow', 'GET, PUT, OPTIONS');
      this.sendError(response, 405, 'Method not allowed');
      return;
    }

    const contentType = request.headers['content-type'] || '';
    if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
      this.sendError(response, 415, 'Content-Type must be application/json');
      return;
    }

    const body = await this.readBody(request);
    let value: unknown;
    try {
      value = JSON.parse(body);
    } catch (_error) {
      this.sendError(response, 400, 'Request body must contain valid JSON');
      return;
    }

    await this.globalState.update(STORAGE_PREFIX + key, value);
    this.sendJson(response, 200, { key, value });
  }

  private readBody(request: IncomingMessage): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let body = '';
      let size = 0;
      let tooLarge = false;

      request.on('data', (chunk: Buffer) => {
        if (tooLarge) {
          return;
        }
        size += chunk.length;
        if (size > MAX_BODY_SIZE) {
          tooLarge = true;
          reject(new BodyTooLargeError('Request body exceeds the 1 MB limit'));
          return;
        }
        body += chunk.toString('utf8');
      });
      request.on('end', () => resolve(body));
      request.on('error', reject);
    });
  }

  private sendJson(
    response: ServerResponse,
    statusCode: number,
    value: unknown
  ): void {
    response.statusCode = statusCode;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(value));
  }

  private sendError(
    response: ServerResponse,
    statusCode: number,
    message: string
  ): void {
    this.sendJson(response, statusCode, { error: message });
  }
}
