// OAuth proxy do GitHub para o Sveltia CMS (Cinnamon Drinks).
//
// Faz a troca `code -> access_token` no servidor (o client_secret nunca
// chega ao browser) e devolve o token à janela do CMS via postMessage,
// seguindo o protocolo de handshake do Decap/Sveltia. Nada é persistido.
//
// Rotas:
//   GET /auth     -> redireciona para o GitHub (com state anti-CSRF)
//   GET /callback -> troca o code, devolve o token via postMessage
//   *             -> 404

export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_OAUTH_SCOPES?: string;
}

const STATE_COOKIE = 'cms_oauth_state';

function stateCookie(value: string, maxAge: number): string {
  return `${STATE_COOKIE}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

// Página devolvida na popup do CMS. O protocolo Decap/Sveltia: a popup
// anuncia que está pronta (`authorizing:github`), espera o opener
// responder e então devolve o resultado para a origem desse opener.
function renderResult(status: 'success' | 'error', payload: unknown): Response {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  const body = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8" /><title>Autenticação — Cinnamon CMS</title></head>
<body>
<script>
  (function () {
    var message = ${JSON.stringify(message)};
    function receive(e) {
      if (!window.opener || !e.origin || e.origin === 'null') return;
      window.opener.postMessage(message, e.origin);
      window.removeEventListener('message', receive, false);
    }
    window.addEventListener('message', receive, false);
    if (window.opener) window.opener.postMessage('authorizing:github', '*');
  })();
</script>
<p>Autenticação concluída. Pode fechar esta janela.</p>
</body>
</html>`;
  return new Response(body, {
    status: status === 'success' ? 200 : 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const redirectUri = `${url.origin}/callback`;

    if (url.pathname === '/auth') {
      const state = crypto.randomUUID();
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: redirectUri,
        scope: env.GITHUB_OAUTH_SCOPES ?? 'repo,user',
        state
      });
      return new Response(null, {
        status: 302,
        headers: {
          Location: `https://github.com/login/oauth/authorize?${params}`,
          'Set-Cookie': stateCookie(state, 600)
        }
      });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const expectedState = readCookie(request.headers.get('Cookie'), STATE_COOKIE);

      if (!code) return renderResult('error', { error: 'missing_code' });
      if (!state || state !== expectedState) {
        return renderResult('error', { error: 'invalid_state' });
      }

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'cinnamon-cms-oauth'
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri
        })
      });
      const data = (await tokenRes.json()) as {
        access_token?: string;
        error?: string;
        error_description?: string;
      };

      if (!data.access_token) {
        return renderResult('error', {
          error: data.error ?? 'token_exchange_failed',
          error_description: data.error_description
        });
      }

      const response = renderResult('success', {
        token: data.access_token,
        provider: 'github'
      });
      response.headers.append('Set-Cookie', stateCookie('', 0));
      return response;
    }

    return new Response('Cinnamon CMS OAuth proxy', { status: 404 });
  }
};
