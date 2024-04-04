import { GetWidevineKeyResponse } from "../types/drm.client.type";
import axios from "axios";
import { parse } from "node-html-parser";
import { withRetry } from "../utils/functional.util";

export type BuildLicenseUrlParams = {
  id: string;
  token: string;
  userCode: string;
  applicationCode: string;
};

export const getDrmClient = () => {
  const drmSession = axios.create({
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://cf-embed.play.hotmart.com/",
    },
  });

  const getPSSHKey = async (mpdUrl: string) => {
    const response = await drmSession.get(mpdUrl);
    const root = parse(response.data);
    const pssh = root.querySelector("cenc\\:pssh");
    return pssh?.text;
  };

  const buildLicenseUrl = ({
    id,
    token,
    userCode,
    applicationCode,
  }: BuildLicenseUrlParams) => {
    const baseUrl = `https://api-player-embed.hotmart.com/v2/drm/${id}/license`;
    const params = { token, userCode, applicationCode };

    const url = new URL(baseUrl);
    url.search = new URLSearchParams(params).toString();

    return url.toString();
  };

  const getWidevineKey = async (licenseUrl: string, pssh: string) => {
    console.log("Getting Widevine key", licenseUrl, pssh);
    const cdrmProjectBaseUrl = "https://cdrm-project.com/api";
    const body = {
      cache: false,
      license: licenseUrl,
      pssh,
    };

    const headers = {
      accept: "*/*",
      "accept-language":
        "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,gl;q=0.6,es;q=0.5",
      "cache-control": "no-cache",
      "content-type": "application/octet-stream",
      keysystem: "com.widevine.alpha",
      membership: "369e33ad-8ce9-4e41-9511-fbc8f9775e58",
      origin: "https://cf-embed.play.hotmart.com",
      pragma: "no-cache",
      referer: "https://cf-embed.play.hotmart.com/",
      "sec-ch-ua":
        '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    };

    const { data } = await axios.post<GetWidevineKeyResponse>(
      cdrmProjectBaseUrl,
      body,
      { headers }
    );

    if ("error" in data) throw new Error(data.error);

    return data;
  };

  const getWidevineKey2 = async (licenseUrl: string, pssh: string) => {
    console.log("Getting Widevine key", licenseUrl, pssh);

    const { data } = await axios.post(
      "https://cdrm-project.com/wv",
      {
        license: licenseUrl,
        headers:
          'content-type: application/octet-stream\nkeysystem: com.widevine.alpha\nreferer: "https://cf-embed.play.hotmart.com/"\nuser-agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"',
        pssh: pssh,
        buildInfo: "",
        proxy: "",
        cache: false,
      },
      {
        headers: {
          "Accept-Language":
            "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,gl;q=0.6,es;q=0.5",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          Origin: "https://cdrm-project.com",
          Pragma: "no-cache",
          Referer: "https://cdrm-project.com/",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
          "sec-ch-ua":
            '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
        },
      }
    );

    const root = parse(data);

    const hasError = root.querySelector("h2")?.text === "ERROR";
    if (hasError) throw new Error("Failed to get Widevine key");

    const liTag = root.querySelector("li");

    return liTag?.text as string;
  };

  return {
    getPSSHKey,
    buildLicenseUrl,
    getWidevineKey: withRetry(getWidevineKey2),
  };
};
