import { useEffect } from 'react';
import { Claim } from '../_types/billing.types';
import { useToast } from './ToastContext';

export function EraStatusPoller({
  claims,
  setClaims
}: {
  claims: Claim[];
  setClaims: React.Dispatch<React.SetStateAction<Claim[]>>;
}) {
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      // Find a submitted claim that's still pending ERA
      const pendingClaims = claims.filter(c => c.status === 'Submitted' && c.eraStatus === 'pending');
      if (pendingClaims.length > 0) {
        // Randomly pick one
        const target = pendingClaims[Math.floor(Math.random() * pendingClaims.length)];
        const newStatus = Math.random() > 0.5 ? '277-acknowledged' : '835-received';
        
        setClaims(prev => prev.map(c => 
          c.id === target.id ? { ...c, eraStatus: newStatus as any } : c
        ));

        toast({
          type: 'info',
          message: `${target.payer} updated: ${target.patient} → ${newStatus === '277-acknowledged' ? '277 Ack' : 'Payment received'}`,
          duration: 4000
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [claims, setClaims, toast]);

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm ml-auto">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-xs text-gray-500 font-medium">Live payer sync</span>
    </div>
  );
}
