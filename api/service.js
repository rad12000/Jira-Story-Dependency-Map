import nodeFetch from "node-fetch";

const jiraUrl = (() => {
  const urlRegex = /http(s|):\/\/.+[a-zA-Z]$/;
  const url = process.env.JIRA_URL;
  if (!url) {
    throw new Error("FATAL: No JIRA_URL environment variable provided!");
  }

  if (!urlRegex.test(url)) {
    throw new Error(
      `FATAL: Invalid JIRA_URL. Must match the following regex expression: ${urlRegex}`
    );
  }

  return url;
})();
export async function proxyToJira(path, httpMethod) {
  const url = new URL(`${jiraUrl}${path}`);
  return await nodeFetch(url, {
    method: httpMethod,
    headers: {
      Authorization: AuthService.getBearerAuth(),
    },
  });
}

export class AuthService {
  static #accessTokenPath = "/rest/pat/latest/tokens";
  static #accessTokenName = "jira-dependency-mapping";

  /**
   * @typedef {Object} AccessToken
   * @property {number} id
   * @property {string} name
   * @property {string} rawToken
   */
  /**
   * @type {AccessToken | null}
   */
  static #accessToken = null;
  static get accessToken() {
    return this.#accessToken;
  }

  static async createAccessToken() {
    const response = await nodeFetch(
      new URL(`${jiraUrl}${this.#accessTokenPath}`),
      {
        method: "POST",
        body: JSON.stringify({
          name: this.#accessTokenName,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getBasicAuth(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `CRITICAL: got a ${response.status} http status code when attempting to create an access token.`
      );
    }

    const json = await response.json();
    this.#accessToken = json;

    return response;
  }

  static async tidyAccessTokens() {
    const response = await nodeFetch(
      new URL(`${jiraUrl}${this.#accessTokenPath}`),
      {
        method: "GET",
        headers: {
          Authorization: this.getBasicAuth(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `CRITICAL: got a ${response.status} http status code when attempting to retrieve access tokens.`
      );
    }

    /**
     * @type {AccessToken[]}
     */
    const tokens = await response.json();
    const revokeTokenPromises = tokens.reduce((prev, token) => {
      if (token.name !== this.#accessTokenName) return prev;
      prev.push(this.#revokeAccessToken(token));
      return prev;
    }, []);
    await Promise.all(revokeTokenPromises);
  }

  static getBasicAuth() {
    const username = process.env.USERNAME;
    const password = process.env.PASSWORD;

    if (!username || !password) {
      throw new Error(
        "CRITICAL: please make sure both USERNAME and PASSWORD environment variables are set!"
      );
    }

    return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  }

  static setAccessToken(token) {
    this.#accessToken = {
      rawToken: token,
    };
  }

  static getBearerAuth() {
    return `Bearer ${this.#accessToken.rawToken}`;
  }

  /**
   * @param {AccessToken} token
   */
  static async #revokeAccessToken(token) {
    console.log("Revoking access token with an id of " + token.id);
    const response = await nodeFetch(
      new URL(`${jiraUrl}${this.#accessTokenPath}/${token.id}`),
      {
        method: "DELETE",
        headers: {
          Authorization: this.getBasicAuth(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `CRITICAL: got a ${response.status} http status code when attempting to revoke access token.`
      );
    }

    return response;
  }
}
