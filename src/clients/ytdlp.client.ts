import { GetMediaAssetsResponse } from "../types/hotmart.client.type";
import { execSync } from "child_process";
import { getDrmClient } from "./drm.client";

const drmClient = getDrmClient();

export const getYtdlpClient = () => {
  const handleDownload = async (
    assets: GetMediaAssetsResponse,
    path: string,
    filename: string
  ) => {
    const { mediaAssets, query } = assets;
    const drmAsset = mediaAssets.find(
      (asset) => asset.contentType === "application/dash+xml"
    );

    if (drmAsset) {
      const pSSHKey = await drmClient.getPSSHKey(drmAsset.url);

      if (!pSSHKey) throw new Error("Failed to get PSSH key");

      const licenseUrl = drmClient.buildLicenseUrl({
        id: query.id,
        applicationCode: query.applicationCode,
        token: query.jwtToken,
        userCode: query.userCode,
      });

      console.log(path, filename);
      const drmKey = await drmClient.getWidevineKey(licenseUrl, pSSHKey);
      if (!drmKey) throw new Error("Failed to get Widevine key");
      console.log('DRM Key: ', drmKey);
      // const widevineKey = drmKey.keys[0].key;
      const widevineKey = drmKey;

      return () => downloadDrm(drmAsset.url, path, filename, widevineKey);
    }

    return () => download(assets.mediaAssets[0].url, path, filename);
  };

  const download = (url: string, path: string, filename: string) => {
    const command = `yt-dlp "${url}" --referer "https://player.hotmart.com/" --format "bv[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/best" -N 10 --output "${filename}.%(ext)s"`;

    try {
      console.log(
        `Executing command synchronously: ${command} in path: ${path}`
      );
      const output = execSync(command, { cwd: path, encoding: "utf-8" });
      console.log(`Command output: ${output}`);
      return 0; // Assuming successful execution
    } catch (error) {
      console.error(`Error executing command synchronously: ${error}`);
      throw error;
    }
  };

  const downloadDrm = (
    url: string,
    path: string,
    filename: string,
    drmKey: string
  ) => {
    // Reference: https://git.sr.ht/~boringcactus/widevine-l3-decryptor
    const [_, decryptionKey] = drmKey.split(":");
    const command = `ffmpeg -cenc_decryption_key ${decryptionKey} -headers "Referer: https://cf-embed.play.hotmart.com/" -y -i "${url}" -codec copy "${filename}.mp4"`;

    try {
      console.log(
        `Executing command synchronously: ${command} in path: ${path}`
      );
      const output = execSync(command, { cwd: path, encoding: "utf-8" });
      console.log(`Command output: ${output}`);
      return 0; // Assuming successful execution
    } catch (error) {
      console.error(`Error executing command synchronously: ${error}`);
      throw error;
    }
  };

  return {
    handleDownload,
  };
};
