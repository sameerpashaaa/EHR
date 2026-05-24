import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseSymptoms, getDifferentialDiagnosis } from './clinicalEngine';
import prisma from './prisma';

vi.mock('./prisma', () => ({
  default: {
    clinicalDiagnosis: {
      findMany: vi.fn(),
    },
  },
}));

describe('Clinical Engine Unit Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('parseSymptoms()', () => {
    it('should correctly extract exact english symptoms using fallback when db fails', async () => {
      // Mock db failure to test fallback behavior
      vi.mocked(prisma.clinicalDiagnosis.findMany).mockRejectedValue(new Error('DB connection failed'));
      
      const text = "I have a severe headache and some fever";
      const symptoms = await parseSymptoms(text);
      expect(symptoms).toContain('headache');
      expect(symptoms).toContain('fever');
    });

    it('should correctly map localized Hindi keywords to English using db fallback', async () => {
      vi.mocked(prisma.clinicalDiagnosis.findMany).mockRejectedValue(new Error('DB connection failed'));
      const text = "Mujhe bukhar aur sirdard hai";
      const symptoms = await parseSymptoms(text);
      expect(symptoms).toContain('fever');
      expect(symptoms).toContain('headache');
    });

    it('should correctly map localized Telugu keywords to English using db fallback', async () => {
      vi.mocked(prisma.clinicalDiagnosis.findMany).mockRejectedValue(new Error('DB connection failed'));
      const text = "Naaku jwaram mariyu thala noppi undi";
      const symptoms = await parseSymptoms(text);
      expect(symptoms).toContain('fever');
      expect(symptoms).toContain('headache');
      expect(symptoms).toContain('pain'); // 'noppi'
    });

    it('should extract symptoms correctly when DB succeeds', async () => {
      // Mock DB success
      vi.mocked(prisma.clinicalDiagnosis.findMany).mockResolvedValue([
        { symptoms: ['chest pain', 'fatigue', 'cold'] } as any
      ]);
      const text = "Doctor, mujhe kal raat se severe chest pain aur thakan hai, plus cold.";
      const symptoms = await parseSymptoms(text);
      expect(symptoms).toContain('chest pain');
      expect(symptoms).toContain('fatigue'); // 'thakan'
      expect(symptoms).toContain('cold');
    });
  });

  describe('getDifferentialDiagnosis()', () => {
    it('should return empty array for no symptoms', async () => {
      const result = await getDifferentialDiagnosis([]);
      expect(result).toHaveLength(0);
    });

    it('should identify Upper Respiratory Tract Infection (URI) using fallback DB', async () => {
      vi.mocked(prisma.clinicalDiagnosis.findMany).mockRejectedValue(new Error('DB connection failed'));
      const symptoms = ['cold', 'cough', 'fever', 'sore throat'];
      const result = await getDifferentialDiagnosis(symptoms);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].diagnosis.name).toBe('Upper Respiratory Tract Infection');
    });

    it('should calculate diagnosis scores from DB results when DB succeeds', async () => {
      vi.mocked(prisma.clinicalDiagnosis.findMany).mockResolvedValue([
        {
          id: 'test-acs',
          name: 'Acute Coronary Syndrome',
          prevalence: 'common',
          symptoms: ['chest pain', 'sweating'],
          redFlags: ['sweating']
        } as any
      ]);
      const symptoms = ['chest pain', 'sweating', 'pain'];
      const result = await getDifferentialDiagnosis(symptoms);
      
      expect(result.length).toBeGreaterThan(0);
      const acsMatch = result.find(r => r.diagnosis.id === 'test-acs');
      expect(acsMatch).toBeDefined();
      expect(acsMatch?.score).toBeGreaterThan(30);
    });

    it('should accurately calculate scores and matched symptoms using fallback DB', async () => {
      vi.mocked(prisma.clinicalDiagnosis.findMany).mockRejectedValue(new Error('DB connection failed'));
      const symptoms = ['wheezing', 'breathlessness'];
      const result = await getDifferentialDiagnosis(symptoms);
      
      const asthmaMatch = result.find(r => r.diagnosis.id === 'asthma');
      expect(asthmaMatch).toBeDefined();
      expect(asthmaMatch?.matchedSymptoms).toContain('wheezing');
      expect(asthmaMatch?.matchedSymptoms).toContain('breathlessness');
    });
  });

});
