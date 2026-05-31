import { useCallback } from 'react';
import { AuditAction, AuditEntry } from '../_types/billing.types';

export function useAuditLogger(
  setEntries: React.Dispatch<React.SetStateAction<AuditEntry[]>>
) {
  const log = useCallback((
    action: AuditAction,
    entity: AuditEntry['entity'],
    entityId: string,
    entityLabel: string,
    details?: string
  ) => {
    const entry: AuditEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Dr. Priya Nair',          // mock current user
      role: 'Physician',               // mock current role
      action, entity, entityId, entityLabel,
      ipAddress: '192.168.1.10',
      details
    };
    setEntries(prev => [entry, ...prev]);
  }, [setEntries]);

  return { log };
}
