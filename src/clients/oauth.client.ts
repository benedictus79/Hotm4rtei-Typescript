import {
  CheckAccessTokenResponse,
  GetAccessTokenBody,
  GetAccessTokenResponse,
} from "../types/oauth.client.type";

import axios from "axios";

const oauthBaseUrl =
  "https://sec-proxy-content-distribution.hotmart.com/club/security/oauth";

export const getOauthClient = () => {
  const oauthSession = axios.create({
    baseURL: oauthBaseUrl,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const getAccessToken = async (body: GetAccessTokenBody) => {
    const data = { ...body, grant_type: "password" };
    const response = await oauthSession.post<GetAccessTokenResponse>(
      "token",
      data
    );
    return response.data;
  };

  const checkAccessToken = async (accessToken: string) => {
    const params = { token: accessToken };
    const response = await oauthSession.get<CheckAccessTokenResponse>(
      "check_token",
      { params }
    );
    return response.data;
  };

  return {
    getAccessToken,
    checkAccessToken,
  };
};
