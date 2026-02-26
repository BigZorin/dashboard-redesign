import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProgressEntries,
  uploadProgressPhoto,
  createProgressEntry,
  deleteProgressPhoto,
  type PhotoCategory,
  type ProgressPhoto,
} from '../lib/progressApi';

export const progressKeys = {
  all: ['progress'] as const,
  entries: () => [...progressKeys.all, 'entries'] as const,
};

/**
 * Fetch all progress entries for the current user.
 */
export function useProgressEntries() {
  return useQuery({
    queryKey: progressKeys.entries(),
    queryFn: fetchProgressEntries,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Upload photos and create/update a progress entry.
 */
export function useUploadProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      photos: { uri: string; category: PhotoCategory }[];
      date: string;
      weightKg?: number;
      bodyFatPercentage?: number;
      notes?: string;
    }) => {
      // Upload each photo
      const uploadedPhotos: ProgressPhoto[] = [];
      for (const photo of data.photos) {
        const result = await uploadProgressPhoto(photo.uri, photo.category, data.date);
        if (result) {
          uploadedPhotos.push({
            storagePath: result.storagePath,
            category: photo.category,
            uploadedAt: new Date().toISOString(),
          });
        }
      }

      if (uploadedPhotos.length === 0) {
        throw new Error('Geen foto\'s geüpload');
      }

      // Create or update progress entry
      return createProgressEntry({
        date: data.date,
        weightKg: data.weightKg,
        bodyFatPercentage: data.bodyFatPercentage,
        photos: uploadedPhotos,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.entries() });
    },
  });
}

/**
 * Delete a single progress photo.
 */
export function useDeleteProgressPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, storagePath }: { entryId: string; storagePath: string }) =>
      deleteProgressPhoto(entryId, storagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: progressKeys.entries() });
    },
  });
}
