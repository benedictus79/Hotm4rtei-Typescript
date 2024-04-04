export type GetAccessTokenBody = {
  username: string;
  password: string;
};

export type GetAccessTokenResponse = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  jti: string;
};

export type ResourceItem = {
  type: string;
  resource: {
    productId: number;
    subdomain: string;
    webinarKeys: string[];
    status: "ACTIVE" | "OVERDUE";
    userAreaId: number;
  };
  roles: string[];
}

export type CheckAccessTokenResponse = {
  use_name: string;
  scope: string[];
  resources: ResourceItem[];
  exp: number;
  authorities: string[];
  jti: string;
  client_id: string;
};