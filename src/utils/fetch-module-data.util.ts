import { createEntityName, pathJoin } from "./transform.util";

import { CourseData } from "../types/hotmart.client.type";
import fs from "fs";
import { getHotmartClient } from "../clients/hotmart.client";
import { getYtdlpClient } from "../clients/ytdlp.client";

const ytdlpClient = getYtdlpClient();

type ModuleData = Awaited<ReturnType<typeof fetchModuleData>>;

export const fetchModuleData = async (
  modules: CourseData,
  hotmartClient: ReturnType<typeof getHotmartClient>
) => {
  const data = await Promise.all(
    modules.modules.map(async (module) => {
      const pages = await Promise.all(
        module.pages.map(async (page) => {
          const lessonDetails = await hotmartClient.getLesson(page.hash);

          const attachments = lessonDetails.attachments?.map((attachment) => ({
            ...attachment,
            attachmentGetter: () =>
              hotmartClient.getAttachment(attachment.fileMembershipId),
          }));

          const mediasSrcs = lessonDetails.mediasSrc?.map((media) => ({
            ...media,
            mediaAssetGetter: () =>
              hotmartClient.getMediaAssets(media.mediaSrcUrl),
          }));

          return { ...page, mediasSrcs, attachments };
        })
      );
      return { ...module, pages };
    })
  );

  return data;
};

const limitLength = (name: string, maxLength: number = 50) => {
  return name.length > maxLength ? name.substring(0, maxLength) : name;
};

export const createCourseFolders = async (
  modules: ModuleData,
  basePath: string
) => {
  for (const module of modules) {
    const moduleName = createEntityName(module.moduleOrder, [module.name]);

    for (const page of module.pages) {
      let pageName = createEntityName(page.pageOrder, [page.name]);
      let pagePath = pathJoin(basePath, moduleName, pageName);
      pagePath = limitLength(pagePath, 250);

      for (const [index, mediaSrc] of page.mediasSrcs?.entries() || []) {
        const lessonName = createEntityName(index + 1, ["Aula"]);

        if (fs.existsSync(pagePath)) {
          const files = fs.readdirSync(pagePath);
          const lessonExists = files.some((file) => file.includes(lessonName));
          if (lessonExists) {
            console.log(`${moduleName}/${pageName}/${lessonName} já existe`);
            continue;
          }
        }

        const mediaAssets = await mediaSrc.mediaAssetGetter();
        const downloadFn = await ytdlpClient.handleDownload(
          mediaAssets,
          pagePath,
          lessonName
        );

        fs.mkdirSync(pagePath, { recursive: true });
        downloadFn();
      }

      for (const [index, attachment] of page.attachments?.entries() || []) {
        const attachmentName = createEntityName(index + 1, ["Anexo"]);
        console.log(`${moduleName}/${pageName}/${attachmentName}`);
      }
    }
  }
};
