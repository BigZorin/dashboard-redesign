import { supabase } from './supabase';

export type PhotoCategory = 'front' | 'side' | 'back';

export type ProgressPhoto = {
  storagePath: string;
  category: PhotoCategory;
  uploadedAt: string;
};

export type ProgressEntry = {
  id: string;
  userId: string;
  date: string;
  weightKg: number | null;
  bodyFatPercentage: number | null;
  photos: ProgressPhoto[];
  notes: string | null;
  createdAt: string;
};

function transformEntry(e: any): ProgressEntry {
  return {
    id: e.id,
    userId: e.user_id,
    date: e.date,
    weightKg: e.weight_kg,
    bodyFatPercentage: e.body_fat_percentage,
    photos: e.photos || [],
    notes: e.notes,
    createdAt: e.created_at,
  };
}

export async function fetchProgressEntries(): Promise<ProgressEntry[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('progress_tracking')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) return [];
  return (data || []).map(transformEntry);
}

export async function getSignedPhotoUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('progress-photos')
    .createSignedUrl(storagePath, 3600); // 1 hour

  if (error) return null;
  return data.signedUrl;
}

export async function uploadProgressPhoto(
  uri: string,
  category: PhotoCategory,
  date: string
): Promise<{ storagePath: string } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}_${category}.${ext}`;
  const storagePath = `${user.id}/${date}/${fileName}`;

  // Read the file and upload
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('progress-photos')
    .upload(storagePath, blob, {
      contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  return { storagePath };
}

export async function createProgressEntry(data: {
  date: string;
  weightKg?: number;
  bodyFatPercentage?: number;
  photos: ProgressPhoto[];
  notes?: string;
}): Promise<ProgressEntry | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if entry exists for this date
  const { data: existing } = await supabase
    .from('progress_tracking')
    .select('id, photos')
    .eq('user_id', user.id)
    .eq('date', data.date)
    .maybeSingle();

  if (existing) {
    // Append photos to existing entry
    const existingPhotos = existing.photos || [];
    const mergedPhotos = [...existingPhotos, ...data.photos];

    const { data: updated, error } = await supabase
      .from('progress_tracking')
      .update({
        photos: mergedPhotos,
        weight_kg: data.weightKg || undefined,
        body_fat_percentage: data.bodyFatPercentage || undefined,
        notes: data.notes || undefined,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return transformEntry(updated);
  }

  // Create new entry
  const { data: entry, error } = await supabase
    .from('progress_tracking')
    .insert({
      user_id: user.id,
      date: data.date,
      weight_kg: data.weightKg || null,
      body_fat_percentage: data.bodyFatPercentage || null,
      photos: data.photos,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return transformEntry(entry);
}

export async function deleteProgressPhoto(entryId: string, storagePath: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Remove from storage
  await supabase.storage.from('progress-photos').remove([storagePath]);

  // Update the entry's photos array
  const { data: entry } = await supabase
    .from('progress_tracking')
    .select('photos')
    .eq('id', entryId)
    .single();

  if (entry) {
    const updatedPhotos = (entry.photos || []).filter(
      (p: any) => p.storagePath !== storagePath
    );
    await supabase
      .from('progress_tracking')
      .update({ photos: updatedPhotos })
      .eq('id', entryId);
  }
}
