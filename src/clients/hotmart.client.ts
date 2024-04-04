import {
  AttachmentData,
  CourseData,
  GetMediaAssetsResponse,
  LessonData,
  MediaAsset,
  MediaQuery,
} from "../types/hotmart.client.type";

import axios from "axios";
import { parse } from "node-html-parser";

const hotmartBaseUrl = "https://api-club.cb.hotmart.com/rest/v3";

export const getHotmartClient = (accessToken: string, club: string) => {
  const hotmartSession = axios.create({
    baseURL: hotmartBaseUrl,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      club,
    },
  });

  const getModules = async () => {
    const response = await hotmartSession.get<CourseData>("navigation");
    return response.data;
  };

  const getLesson = async (pageHash: string) => {
    const params = { pageHash };
    const response = await hotmartSession.get<LessonData>(`page/${pageHash}`, {
      params,
    });
    return response.data;
  };

  const getMediaAssets = async (
    mediaSrlUrl: string
  ): Promise<GetMediaAssetsResponse> => {
    const response = await axios.get(mediaSrlUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: `https://${club}.club.hotmart.com/`,
      },
    });

    const root = parse(response.data);
    const script = root.querySelector("script#__NEXT_DATA__");
    if (!script) throw new Error("Script not found");
    const scriptContent = script.innerHTML;
    const scriptData = JSON.parse(scriptContent);

    const mediaAssets = scriptData.props.pageProps.applicationData
      .mediaAssets as MediaAsset[];

    const query: MediaQuery = {
      applicationCode: scriptData.query.applicationCode,
      userCode: scriptData.query.userCode,
      id: scriptData.query.id,
      jwtToken: scriptData.query.jwtToken,
    };

    return {
      mediaAssets,
      query,
    };
  };

  const getAttachment = async (fileMembershipId: string) => {
    const params = { attachmentId: fileMembershipId };
    const response = await hotmartSession.get<AttachmentData>(
      `attachment/${fileMembershipId}/download`,
      {
        params,
      }
    );

    return response.data;
  };

  return {
    getModules,
    getLesson,
    getMediaAssets,
    getAttachment,
  };
};
