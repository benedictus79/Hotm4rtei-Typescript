import {
  createCourseFolders,
  fetchModuleData,
} from "./utils/fetch-module-data.util";

import fs from "fs";
import { getDrmClient } from "./clients/drm.client";
import { getHotmartClient } from "./clients/hotmart.client";
import { getOauthClient } from "./clients/oauth.client";
import { getYtdlpClient } from "./clients/ytdlp.client";

const oauthClient = getOauthClient();
const ytdlp = getYtdlpClient();

const main = async () => {
  const accessToken = await oauthClient.getAccessToken({
    username: "",
    password: "",
  });

  const checkToken = await oauthClient.checkAccessToken(
    accessToken.access_token
  );

  const hotmartClient = getHotmartClient(
    accessToken.access_token,
    ""
    // checkToken.resources[3].resource.subdomain
  );

  const modules = await hotmartClient.getModules();
  fs.writeFileSync("modules.json", JSON.stringify(modules, null, 2));

  const data = await fetchModuleData(modules, hotmartClient);
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));

  createCourseFolders(
    data,
    ""
  );
};

main();
