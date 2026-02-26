import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  role: () => [...userKeys.all, 'role'] as const,
};

export type UserProfile = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  date_of_birth: string | null;
  gender: string | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  goal_weight_kg: number | null;
  activity_level: string | null;
  dietary_preferences: any;
  client_status: string | null;
  rejection_reason: string | null;
};

type UserWithProfile = {
  id: string;
  email: string;
  profile: UserProfile | null;
  role: string;
};

async function fetchUserWithProfile(): Promise<UserWithProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const [profileResult, roleResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single(),
  ]);

  return {
    id: user.id,
    email: user.email || '',
    profile: profileResult.data,
    role: roleResult.data?.role || 'CLIENT',
  };
}

/**
 * Central user hook - fetches user + profile + role in a single query.
 * Cached globally, shared across all screens.
 */
export function useUser() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: fetchUserWithProfile,
    staleTime: 60 * 1000, // 1 minute - profile data changes infrequently
    refetchOnWindowFocus: true,
  });
}

/**
 * Update user profile - invalidates cache so all screens update.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

/**
 * Upload avatar photo and update profile.
 * Uses FileSystem.uploadAsync to stream directly (no base64 issues).
 */
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageUri: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Niet ingelogd');

      // On Android, content:// URIs need to be copied to a file:// path first
      let uploadUri = imageUri;
      if (imageUri.startsWith('content://') || !imageUri.startsWith('file://')) {
        const tmpPath = `${FileSystem.cacheDirectory}avatar_upload_${Date.now()}.jpg`;
        await FileSystem.copyAsync({ from: imageUri, to: tmpPath });
        uploadUri = tmpPath;
      }

      const filePath = `${user.id}/avatar.jpg`;
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/profile-avatars/${filePath}`;

      const result = await FileSystem.uploadAsync(uploadUrl, uploadUri, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'image/jpeg',
          'x-upsert': 'true',
        },
      });

      if (result.status < 200 || result.status >= 300) {
        let msg = `Upload mislukt (${result.status})`;
        try {
          const body = JSON.parse(result.body);
          msg = body.statusCode === '404'
            ? 'Storage bucket niet gevonden — neem contact op met je coach'
            : body.message || body.error || msg;
        } catch {}
        throw new Error(msg);
      }

      // Get public URL with cache buster
      const { data: urlData } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(filePath);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      return avatarUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}
