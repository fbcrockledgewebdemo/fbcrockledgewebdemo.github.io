/**
 * GitHub OAuth proxy for Decap CMS.
 *
 * Configure these Worker variables before deployment:
 * - GITHUB_OAUTH_ID: GitHub OAuth application's client ID
 * - GITHUB_OAUTH_SECRET: GitHub OAuth application's client secret (Secret)
 * - CMS_ORIGIN: The exact public origin of the Decap admin site
 */

const githubAuthorizeUrl = "https://github.com/login/oauth/authorize";
const githubTokenUrl = "https://github.com/login/oauth/access_token";
const stateCookieName = "decap_oauth_state";

function getCookie(request, name) {
  const cookies = request.headers.get("Cookie") || "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? match[1] : null;
}

function createState() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function stateMatches(expected, received) {
  if (!expected || !received || expected.length !== received.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ received.charCodeAt(index);
  }

  return difference === 0;
}

function callbackResponse(status, payload, cmsOrigin) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  const script = [
    "<!doctype html><html><head><meta charset=\"utf-8\"><title>Authorizing…</title></head><body>",
    "<p>Authorizing the content manager…</p>",
    "<script>",
    `window.opener.postMessage(${JSON.stringify("authorizing:github")}, ${JSON.stringify(cmsOrigin)});`,
    `window.opener.postMessage(${JSON.stringify(message)}, ${JSON.stringify(cmsOrigin)});`,
    "window.close();",
    "</script></body></html>",
  ].join("");

  return new Response(script, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": `${stateCookieName}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax`,
    },
  });
}

async function exchangeCodeForToken(code, redirectUri, env) {
  const response = await fetch(githubTokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_OAUTH_ID,
      client_secret: env.GITHUB_OAUTH_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || "GitHub did not return an access token.");
  }

  return data.access_token;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET" } });
    }

    if (url.pathname === "/auth") {
      if (url.searchParams.get("provider") !== "github") {
        return new Response("Invalid provider", { status: 400 });
      }

      const state = createState();
      const redirectUri = `${url.origin}/callback?provider=github`;
      const authorizationUrl = new URL(githubAuthorizeUrl);
      authorizationUrl.searchParams.set("client_id", env.GITHUB_OAUTH_ID);
      authorizationUrl.searchParams.set("redirect_uri", redirectUri);
      authorizationUrl.searchParams.set("scope", "public_repo");
      authorizationUrl.searchParams.set("state", state);

      return new Response(null, {
        status: 302,
        headers: {
          Location: authorizationUrl.toString(),
          "Cache-Control": "no-store",
          "Set-Cookie": `${stateCookieName}=${state}; Path=/; Max-Age=600; Secure; HttpOnly; SameSite=Lax`,
        },
      });
    }

    if (url.pathname === "/callback") {
      if (url.searchParams.get("provider") !== "github") {
        return new Response("Invalid provider", { status: 400 });
      }

      const state = url.searchParams.get("state");
      if (!stateMatches(getCookie(request, stateCookieName), state)) {
        return new Response("Invalid authorization state", { status: 400 });
      }

      const code = url.searchParams.get("code");
      if (!code) {
        return callbackResponse("error", { error: "GitHub did not return an authorization code." }, env.CMS_ORIGIN);
      }

      try {
        const token = await exchangeCodeForToken(code, `${url.origin}/callback?provider=github`, env);
        return callbackResponse("success", { token }, env.CMS_ORIGIN);
      } catch (error) {
        return callbackResponse("error", { error: "Unable to complete GitHub authorization." }, env.CMS_ORIGIN);
      }
    }

    return new Response("Decap CMS authentication service", {
      headers: { "Cache-Control": "no-store" },
    });
  },
};
