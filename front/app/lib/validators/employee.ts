import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const createEmployeeValidationSchema = z.object({
  // TOO LAZY TO DO THIS
  weeklySchedule: z.array(z.any()),
  motivation: z
    .string({
      required_error: 'employee.motivation.required',
      invalid_type_error: 'string.not_a_string',
    })
    .min(10, { message: 'employee.motivation.min' })
    .max(1000, { message: 'employee.motivation.max' }),
});

export const createEmployeeResolver = zodResolver(createEmployeeValidationSchema);

export type CreateEmployeeFormData = z.infer<typeof createEmployeeValidationSchema>;

export const validateEmployeeValidationSchema = z.object({
  codeName: z
    .string({
      required_error: 'employee.code_name.required',
      invalid_type_error: 'string.not_a_string',
    })
    .min(1, { message: 'employee.code_name.min' })
    .max(50, { message: 'employee.code_name.max' }),
});

export const validateEmployeeResolver = zodResolver(validateEmployeeValidationSchema);

export type ValidateEmployeeFormData = z.infer<typeof validateEmployeeValidationSchema>;

export const updateEmployeeValidationSchema = z.object({
  description: z
    .string({
      invalid_type_error: 'string.not_a_string',
    })
    .max(1000, { message: 'employee.description.max' })
    .optional(),
});

export const updateEmployeeResolver = zodResolver(updateEmployeeValidationSchema);

export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeValidationSchema>;
