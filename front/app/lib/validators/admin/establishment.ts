import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { zu } from '~/lib/utils/zod';

export const adminEstablishmentValidationSchema = z
  .object({
    name: zu.string(
      z
        .string({
          coerce: true,
          required_error: 'establishment.name.required',
          invalid_type_error: 'sring.not_a_string',
        })
        .min(1, { message: 'establishment.name.min' })
        .max(255, { message: 'establishment.name.max' }),
    ),
    description: zu.string(
      z
        .string({ coerce: true, invalid_type_error: 'sring.not_a_string' })
        .max(5000, { message: 'establishment.description.max' })
        .optional(),
    ),
    minimumWage: zu.number(
      z
        .number({
          coerce: true,
          required_error: 'number.required',
          invalid_type_error: 'number.not_a_number',
        })
        .min(1000, { message: 'establishment.minimum_wage.min' })
        .safe({ message: 'number.not_safe' }),
    ),
    minimumWorkTimePerWeek: zu.number(
      z
        .number({
          coerce: true,
          required_error: 'number.required',
          invalid_type_error: 'number.not_a_number',
        })
        .int({ message: 'number.must_be_integer' })
        .min(1, { message: 'establishment.minimum_work_time_per_week.min' })
        .max(84, { message: 'establishment.minimum_work_time_per_week.max' })
        .safe({ message: 'number.not_safe' }),
    ),
    contractorCut: zu.number(
      z
        .number({
          coerce: true,
          required_error: 'number.required',
          invalid_type_error: 'number.not_a_number',
        })
        .min(1, { message: 'establishment.contractor_cut.min' })
        .max(99, { message: 'establishment.contractor_cut.max' })
        .safe({ message: 'number.not_safe' }),
    ),
    employeeCut: zu.number(
      z
        .number({
          coerce: true,
          required_error: 'number.required',
          invalid_type_error: 'number.not_a_number',
        })
        .min(1, { message: 'establishment.employee_cut.min' })
        .max(99, { message: 'establishment.employee_cut.max' })
        .safe({ message: 'number.not_safe' }),
    ),
    crewCut: zu.number(
      z
        .number({
          coerce: true,
          required_error: 'number.required',
          invalid_type_error: 'number.not_a_number',
        })
        .min(1, { message: 'establishment.crew_cut.min' })
        .max(99, { message: 'establishment.crew_cut.max' })
        .safe({ message: 'number.not_safe' }),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.contractorCut + data.employeeCut + data.crewCut !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'establishment.cuts.sum_not_100',
        path: ['contractorCut'],
      });
    }
  });

export const adminEstablishmentResolver = zodResolver(adminEstablishmentValidationSchema);

export type AdminEstablishmentFormData = z.infer<typeof adminEstablishmentValidationSchema>;
