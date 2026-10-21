import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

interface OllamaChatResponse {
  message?: {
    content?: string;
  };
  error?: string;
}

export default class OllamaClient {
  constructor(private host: string, private model: string) {}

  chat(prompt: string): Promise<string> {
    const endpoint = new URL('/api/chat', this.host);
    const transport =
      endpoint.protocol === 'https:'
        ? https
        : endpoint.protocol === 'http:'
        ? http
        : undefined;

    if (!transport) {
      throw new Error('Ollama URL must use http or https');
    }

    const body = JSON.stringify({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    });

    return new Promise((resolve, reject) => {
      const request = transport.request(
        {
          hostname: endpoint.hostname,
          port: endpoint.port,
          path: endpoint.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (response) => {
          let responseBody = '';

          response.setEncoding('utf8');
          response.on('data', (chunk: string) => {
            responseBody += chunk;
          });
          response.on('end', () => {
            if (
              response.statusCode === undefined ||
              response.statusCode < 200 ||
              response.statusCode >= 300
            ) {
              reject(
                new Error(
                  `Ollama returned HTTP ${response.statusCode || 'unknown'}: ${responseBody}`
                )
              );
              return;
            }

            let result: OllamaChatResponse;
            try {
              result = JSON.parse(responseBody);
            } catch (error) {
              reject(new Error('Ollama returned an invalid JSON response'));
              return;
            }

            if (result.error) {
              reject(new Error(`Ollama error: ${result.error}`));
              return;
            }

            if (typeof result.message?.content !== 'string') {
              reject(new Error('Ollama response did not contain a message'));
              return;
            }

            resolve(result.message.content);
          });
        }
      );

      request.setTimeout(600000, () => {
        request.destroy(new Error('Timed out waiting for Ollama'));
      });
      request.on('error', reject);
      request.end(body);
    });
  }
}
