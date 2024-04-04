export type Module = {
  id: string;
  code: string;
  name: string;
  moduleOrder: number;
  locked: boolean;
  extra: boolean;
  pages: Page[];
  unlockingOptions: string[];
};

export type Media = {
  fileKey: string;
  code: string;
  offlineSize: number;
  fileOrder: number;
  duration: number;
  type: string;
};

export type Page = {
  hash: string;
  type: string;
  name: string;
  pageOrder: number;
  completed: boolean;
  locked: boolean;
  liberationStart: number;
  liberationEnd: number;
  tags: string[];
  seasonQuiz: boolean;
  firstMediaCode: string;
  mediaDuration: number;
  firstMediaType: string;
  minimumScoreRequired: boolean;
  hasPlayerMedia: boolean;
  medias?: Media[];
  downloadableContent: boolean;
  checkable: boolean;
};

export type CourseData = {
  modules: Module[];
};

type MediaType = "VIDEO" | "AUDIO" | "IMAGE";

type MediaSrc = {
  mediaName: string;
  mediaSize: number;
  mediaDuration: number;
  mediaCode: string;
  mediaType: MediaType;
  mediaSrcUrl: string;
  mediaSrcUrlLegacy: string;
};

type AttachmentSrc = {
  fileMembershipId: string;
  fileName: string;
  fileSize: number;
};

export type LessonData = {
  name: string;
  hash: string;
  type: string;
  rating: number;
  ratingAmount: number;
  completed: boolean;
  moduleCode: string;
  moduleName: string;
  content?: string;
  tags?: string[];
  mediasSrc?: MediaSrc[];
  attachments?: AttachmentSrc[];
};

export type MediaAssetContentType =
  | "application/dash+xml"
  | "application/x-mpegURL";

export type MediaAsset = {
  url: string;
  urlEncrypted?: string;
  objectKey?: string;
  contentType: MediaAssetContentType;
  qualityLabel: string;
  height: number;
};

export type MediaQuery = {
  applicationCode: string;
  userCode: string;
  jwtToken: string;
  id: string;
};

export type AttachmentData = {
  directDownloadUrl?: string;
  lambdaUrl?: string;
};

export type GetMediaAssetsResponse = {
  mediaAssets: MediaAsset[];
  query: MediaQuery;
};