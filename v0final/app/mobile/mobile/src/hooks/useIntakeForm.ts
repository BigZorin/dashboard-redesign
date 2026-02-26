import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchIntakeForm, submitIntakeForm, type IntakeFormData } from '../lib/intakeApi';

export const intakeKeys = {
  all: ['intake'] as const,
  form: () => [...intakeKeys.all, 'form'] as const,
};

export function useIntakeForm() {
  return useQuery({
    queryKey: intakeKeys.form(),
    queryFn: fetchIntakeForm,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useSubmitIntakeForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: IntakeFormData) => submitIntakeForm(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: intakeKeys.form() });
    },
  });
}
