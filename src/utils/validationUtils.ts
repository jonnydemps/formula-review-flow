import { z } from 'zod';

// File validation schemas
export const fileValidationSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      (file) => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'].includes(file.type),
      'File must be an Excel (.xlsx, .xls) or CSV file'
    )
});

// Formula data validation
export const formulaDataSchema = z.object({
  originalFilename: z.string().min(1, 'Filename is required'),
  customerId: z.string().uuid('Invalid customer ID'),
  filePath: z.string().min(1, 'File path is required')
});

// Quote validation
export const quoteSchema = z.object({
  amount: z.number().min(0, 'Quote amount must be positive').max(999999, 'Quote amount too large'),
  formulaId: z.string().uuid('Invalid formula ID')
});

// User profile validation
export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['customer', 'admin', 'specialist'], { errorMap: () => ({ message: 'Invalid role' }) })
});

// Auth validation
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  role: z.enum(['customer', 'admin', 'specialist'])
});

// Validation helper functions
export const validateFile = (file: File) => {
  try {
    return fileValidationSchema.parse({ file });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
};

export const validateQuote = (data: { amount: number; formulaId: string }) => {
  try {
    return quoteSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
};

export const validateAuth = (data: { email: string; password: string }, isSignUp = false) => {
  try {
    const schema = isSignUp ? signUpSchema : signInSchema;
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    throw error;
  }
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};