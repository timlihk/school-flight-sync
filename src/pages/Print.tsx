import { useEffect, useState } from 'react';
import { PrintView } from '@/components/ui/print-view';
import { useFlights } from '@/hooks/use-flights';
import { useTransport } from '@/hooks/use-transport';
import { useNotTravelling } from '@/hooks/use-not-travelling';
import { mockTerms } from '@/data/mock-terms';
import { Loader2 } from 'lucide-react';

export default function Print() {
  const { flights, loading: flightsLoading } = useFlights();
  const { transport, isLoading: transportLoading } = useTransport();
  const { notTravelling, loading: notTravellingLoading } = useNotTravelling();
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for all data to load before showing print view
    if (!flightsLoading && !transportLoading && !notTravellingLoading) {
      setIsReady(true);
    }
  }, [flightsLoading, transportLoading, notTravellingLoading]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading travel data for printing...</p>
        </div>
      </div>
    );
  }

  return (
    <PrintView
      flights={flights}
      transport={transport}
      notTravelling={notTravelling}
      terms={mockTerms}
    />
  );
}