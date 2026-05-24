import { describe, it, expect } from 'vitest';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  isRoleHigherOrEqual,
  filterNavItemsByRole,
  NAV_ITEMS
} from './roles';

describe('RBAC Roles Logic', () => {
  describe('hasPermission()', () => {
    it('should return true if role has the specific permission', () => {
      expect(hasPermission('ADMIN', 'patients:delete')).toBe(true);
      expect(hasPermission('PHYSICIAN', 'encounters:create')).toBe(true);
      expect(hasPermission('PATIENT', 'patients:read')).toBe(true);
    });

    it('should return false if role lacks the specific permission', () => {
      expect(hasPermission('PATIENT', 'patients:create')).toBe(false);
      expect(hasPermission('NURSE', 'users:read')).toBe(false);
    });
  });

  describe('hasAnyPermission()', () => {
    it('should return true if role has at least one of the permissions', () => {
      expect(hasAnyPermission('MEDICAL_ASSISTANT', ['patients:create', 'patients:update'])).toBe(true);
    });

    it('should return false if role has none of the permissions', () => {
      expect(hasAnyPermission('PATIENT', ['encounters:create', 'encounters:update'])).toBe(false);
    });
  });

  describe('hasAllPermissions()', () => {
    it('should return true if role has all of the permissions', () => {
      expect(hasAllPermissions('PHYSICIAN', ['patients:read', 'encounters:create'])).toBe(true);
    });

    it('should return false if role lacks at least one of the permissions', () => {
      expect(hasAllPermissions('FRONT_DESK', ['patients:read', 'encounters:delete'])).toBe(false);
    });
  });

  describe('isRoleHigherOrEqual()', () => {
    it('should correctly compare roles based on hierarchy', () => {
      expect(isRoleHigherOrEqual('ADMIN', 'PHYSICIAN')).toBe(true);
      expect(isRoleHigherOrEqual('PHYSICIAN', 'PHYSICIAN')).toBe(true);
      expect(isRoleHigherOrEqual('NURSE', 'ADMIN')).toBe(false);
      expect(isRoleHigherOrEqual('FRONT_DESK', 'PATIENT')).toBe(true);
    });
  });

  describe('filterNavItemsByRole()', () => {
    it('should filter nav items correctly for PATIENT', () => {
      const patientItems = filterNavItemsByRole(NAV_ITEMS, 'PATIENT');
      // Patient should not see Admin
      const adminNav = patientItems.find(item => item.title === 'Administration');
      expect(adminNav).toBeUndefined();
      
      // Patient should see Patients -> All Patients (but restricted to self in UI)
      // Actually, Patients needs "patients:read" which PATIENT has.
      const patientsNav = patientItems.find(item => item.title === 'Patients');
      expect(patientsNav).toBeDefined();
    });

    it('should return all nav items for ADMIN', () => {
      const adminItems = filterNavItemsByRole(NAV_ITEMS, 'ADMIN');
      const allTitles = adminItems.map(i => i.title);
      expect(allTitles).toContain('Dashboard');
      expect(allTitles).toContain('Patients');
      expect(allTitles).toContain('Administration');
    });
  });
});
