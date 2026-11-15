import * as FileSystem from 'expo-file-system';

function getExtension(uri: string) {
  try {
    const path = uri.split('?')[0];
    const part = path.split('.').pop();
    if (!part) return 'jpg';
    const clean = part.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(clean)) return clean;
    return 'jpg';
  } catch {
    return 'jpg';
  }
}

/** Copia a imagem para a pasta persistente do app (documentDirectory) e retorna a nova URI. */
export async function persistImageAsync(uri: string, prefix = 'img') {
  const ext = getExtension(uri);
  const filename = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;  
  const dest = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

/** Checa se a URI já está em documentDirectory; se não estiver, persiste. */
export async function ensurePersistentUri(uri: string, prefix = 'img') {
  const doc = FileSystem.documentDirectory ?? '';
  if (uri.startsWith(doc)) return uri;
  return persistImageAsync(uri, prefix);
}