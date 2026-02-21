import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Query keys
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (status?: string) => [...courseKeys.lists(), status] as const,
  detail: (id: string) => [...courseKeys.all, 'detail', id] as const,
  progress: (enrollmentId: string) => [...courseKeys.all, 'progress', enrollmentId] as const,
};

// ---------- Types ----------

export type CourseEnrollment = {
  id: string;
  enrolledAt: string;
  progressPercent: number;
  completedAt: string | null;
  course: {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    status: string;
  };
};

export type CourseLesson = {
  id: string;
  title: string;
  contentType: string;
  contentUrl: string | null;
  contentText: string | null;
  duration: number | null;
  orderIndex: number;
};

export type CourseModule = {
  id: string;
  title: string;
  orderIndex: number;
  lessons: CourseLesson[];
};

export type CourseDetail = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  modules: CourseModule[];
};

// ---------- Helpers ----------

function toCamelEnrollment(row: any): CourseEnrollment {
  const course = row.courses;
  return {
    id: row.id,
    enrolledAt: row.enrolled_at,
    progressPercent: row.progress_percent ?? 0,
    completedAt: row.completed_at,
    course: {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      status: course.status,
    },
  };
}

function toCamelCourseDetail(row: any): CourseDetail {
  const modules = (row.course_modules ?? [])
    .map((m: any): CourseModule => ({
      id: m.id,
      title: m.title,
      orderIndex: m.order_index,
      lessons: (m.course_lessons ?? [])
        .map((l: any): CourseLesson => ({
          id: l.id,
          title: l.title,
          contentType: l.content_type,
          contentUrl: l.content_url,
          contentText: l.content_text,
          duration: l.duration,
          orderIndex: l.order_index,
        }))
        .sort((a: CourseLesson, b: CourseLesson) => a.orderIndex - b.orderIndex),
    }))
    .sort((a: CourseModule, b: CourseModule) => a.orderIndex - b.orderIndex);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail,
    modules,
  };
}

// ---------- Hooks ----------

/**
 * Fetch all enrolled courses for the current user.
 */
export function useCourses() {
  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: async (): Promise<CourseEnrollment[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          id, enrolled_at, progress_percent, completed_at,
          courses (id, title, description, thumbnail, status)
        `)
        .eq('client_id', user.id);

      if (error) throw error;
      return (data ?? []).map(toCamelEnrollment);
    },
    staleTime: 5 * 60 * 1000, // 5 min
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch a single course with modules + lessons.
 */
export function useCourseDetail(courseId: string) {
  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: async (): Promise<CourseDetail> => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id, title, description, thumbnail,
          course_modules (
            id, title, order_index,
            course_lessons (
              id, title, content_type, content_url, content_text, duration, order_index
            )
          )
        `)
        .eq('id', courseId)
        .single();

      if (error) throw error;
      return toCamelCourseDetail(data);
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!courseId,
  });
}

/**
 * Fetch completed lesson IDs for a given enrollment.
 */
export function useLessonProgress(enrollmentId: string) {
  return useQuery({
    queryKey: courseKeys.progress(enrollmentId),
    queryFn: async (): Promise<Set<string>> => {
      const { data, error } = await supabase
        .from('course_lesson_progress')
        .select('lesson_id')
        .eq('enrollment_id', enrollmentId);

      if (error) throw error;
      return new Set((data ?? []).map((row: any) => row.lesson_id));
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!enrollmentId,
  });
}

/**
 * Mark a lesson as complete.
 * Upserts into course_lesson_progress, then recalculates enrollment progress_percent.
 */
export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enrollmentId,
      lessonId,
      courseId,
    }: {
      enrollmentId: string;
      lessonId: string;
      courseId: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Upsert lesson progress
      const { error: upsertError } = await supabase
        .from('course_lesson_progress')
        .upsert(
          {
            enrollment_id: enrollmentId,
            lesson_id: lessonId,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'enrollment_id,lesson_id' }
        );

      if (upsertError) throw upsertError;

      // 2. Count total lessons for this course
      const { count: totalLessons, error: totalError } = await supabase
        .from('course_lessons')
        .select('id', { count: 'exact', head: true })
        .in(
          'module_id',
          // subquery: all module IDs for this course
          (await supabase
            .from('course_modules')
            .select('id')
            .eq('course_id', courseId)
          ).data?.map((m: any) => m.id) ?? []
        );

      if (totalError) throw totalError;

      // 3. Count completed lessons for this enrollment
      const { count: completedLessons, error: completedError } = await supabase
        .from('course_lesson_progress')
        .select('id', { count: 'exact', head: true })
        .eq('enrollment_id', enrollmentId);

      if (completedError) throw completedError;

      // 4. Calculate and update progress percent
      const progressPercent = totalLessons && totalLessons > 0
        ? Math.round(((completedLessons ?? 0) / totalLessons) * 100)
        : 0;

      const updateData: any = { progress_percent: progressPercent };
      if (progressPercent >= 100) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('course_enrollments')
        .update(updateData)
        .eq('id', enrollmentId);

      if (updateError) throw updateError;

      return { progressPercent };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.progress(variables.enrollmentId) });
    },
  });
}
