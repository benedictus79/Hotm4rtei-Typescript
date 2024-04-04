export type GetWidevineKeyResponse = {
  pssh: string;
  time: string;
  keys: { key: string }[];
} | {
  error: string;
}
