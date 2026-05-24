import { describe, it, expect } from 'vitest';
import { patientSchema } from './patient';
import { Gender } from '@prisma/client';

describe('Patient Validation Schema', () => {
  const validPatient = {
    firstName: 'John',
    lastName: 'Doe',
    gender: Gender.MALE,
    dateOfBirth: '1990-01-01',
    ssn: '123-45-6789',
    addresses: [
      {
        line1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
      }
    ],
    telecoms: [
      {
        value: '555-1234',
      }
    ]
  };

  it('should validate a correct patient payload', () => {
    const result = patientSchema.safeParse(validPatient);
    expect(result.success).toBe(true);
  });

  it('should fail if missing required fields (firstName, lastName)', () => {
    const invalidPatient = { ...validPatient, firstName: undefined, lastName: undefined };
    const result = patientSchema.safeParse(invalidPatient);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = result.error.format();
      expect(formatted.firstName?._errors).toBeDefined();
      expect(formatted.lastName?._errors).toBeDefined();
    }
  });

  it('should fail on invalid SSN format', () => {
    const invalidPatient = { ...validPatient, ssn: 'ABC-DE-FGHI' }; // non-numeric
    const result = patientSchema.safeParse(invalidPatient);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = result.error.format();
      expect(formatted.ssn?._errors[0]).toContain('Valid SSN format required');
    }
  });

  it('should fail if addresses or telecoms are missing', () => {
    const invalidPatient = { ...validPatient, addresses: [], telecoms: [] };
    const result = patientSchema.safeParse(invalidPatient);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = result.error.format();
      expect(formatted.addresses?._errors[0]).toContain('At least one address is required');
      expect(formatted.telecoms?._errors[0]).toContain('At least one contact method is required');
    }
  });

  it('should pass if SSN is empty string', () => {
    const emptySsnPatient = { ...validPatient, ssn: '' };
    const result = patientSchema.safeParse(emptySsnPatient);
    expect(result.success).toBe(true);
  });
});
