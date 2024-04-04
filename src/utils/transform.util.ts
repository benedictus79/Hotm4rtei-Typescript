export const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, "0");

export const removeInvalidChars = (str: string) =>
  str.replace(/[<>:"/\\|?*]/g, "");

export const createEntityName = (index: number, names: string[], separator = ' - ') => {
  const sanitizedNames = names.map(removeInvalidChars)
  return [zeroPad(index, 3), ...sanitizedNames].join(separator)
}

export const pathJoin = (...paths: string[]) => paths.join('/').replace(/\/+/g, '/')