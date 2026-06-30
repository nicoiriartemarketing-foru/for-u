import { isSupabaseConfigured, supabase } from './supabase';

const bucketName = 'foru-studio-content';
const localStorageKey = 'foru:studio-content-assets';

export type StudioContentAsset = {
  id: string;
  title: string;
  label: string | null;
  kind: 'script' | 'video';
  content_text: string | null;
  file_name: string;
  file_type: string | null;
  storage_bucket: string | null;
  storage_path: string | null;
  public_url: string | null;
  source_task_id: string | null;
  source_copy_id: string | null;
  status: string;
  created_at: string;
};

type SaveAssetInput = {
  title: string;
  label?: string;
  kind: 'script' | 'video';
  text?: string;
  blob?: Blob;
  fileName: string;
  fileType?: string;
  sourceTaskId?: string;
  sourceCopyId?: string;
};

function loadLocalAssets(): StudioContentAsset[] {
  try {
    return JSON.parse(localStorage.getItem(localStorageKey) ?? '[]');
  } catch {
    return [];
  }
}

function saveLocalAsset(asset: StudioContentAsset) {
  const assets = loadLocalAssets();
  localStorage.setItem(localStorageKey, JSON.stringify([asset, ...assets].slice(0, 80)));
}

export async function downloadAsset(asset: StudioContentAsset) {
  if (asset.storage_bucket && asset.storage_path && supabase) {
    const { data, error } = await supabase.storage
      .from(asset.storage_bucket)
      .createSignedUrl(asset.storage_path, 60 * 5, { download: asset.file_name });

    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      return;
    }
  }

  if (asset.public_url) {
    window.open(asset.public_url, '_blank', 'noopener,noreferrer');
    return;
  }

  if (asset.content_text) {
    const blob = new Blob([asset.content_text], { type: asset.file_type ?? 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = asset.file_name;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export async function saveStudioContentAsset(input: SaveAssetInput) {
  const createdAt = new Date().toISOString();

  if (!isSupabaseConfigured || !supabase) {
    const localAsset: StudioContentAsset = {
      id: crypto.randomUUID(),
      title: input.title,
      label: input.label ?? null,
      kind: input.kind,
      content_text: input.text ?? null,
      file_name: input.fileName,
      file_type: input.fileType ?? null,
      storage_bucket: null,
      storage_path: null,
      public_url: null,
      source_task_id: input.sourceTaskId ?? null,
      source_copy_id: input.sourceCopyId ?? null,
      status: input.kind === 'video' ? 'download_only' : 'saved_local',
      created_at: createdAt,
    };
    saveLocalAsset(localAsset);

    if (input.blob) {
      const url = URL.createObjectURL(input.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = input.fileName;
      link.click();
      URL.revokeObjectURL(url);
    }

    return { asset: localAsset, savedRemote: false, reason: 'supabase_not_configured' };
  }

  let storagePath: string | null = null;
  let signedUrl: string | null = null;

  if (input.blob) {
    storagePath = `${input.kind}/${Date.now()}-${input.fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, input.blob, {
        contentType: input.fileType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

    signedUrl = data?.signedUrl ?? null;
  }

  const payload = {
    title: input.title,
    label: input.label ?? null,
    kind: input.kind,
    content_text: input.text ?? null,
    file_name: input.fileName,
    file_type: input.fileType ?? null,
    storage_bucket: storagePath ? bucketName : null,
    storage_path: storagePath,
    public_url: signedUrl,
    source_task_id: input.sourceTaskId ?? null,
    source_copy_id: input.sourceCopyId ?? null,
  };

  const { data, error } = await supabase
    .from('studio_content_assets')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { asset: data as StudioContentAsset, savedRemote: true, reason: null };
}

export async function loadStudioContentAssets() {
  const localAssets = loadLocalAssets();

  if (!isSupabaseConfigured || !supabase) {
    return { assets: localAssets, source: 'local' as const, error: null };
  }

  const { data, error } = await supabase
    .from('studio_content_assets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { assets: localAssets, source: 'local' as const, error: error.message };
  }

  return { assets: data as StudioContentAsset[], source: 'remote' as const, error: null };
}
