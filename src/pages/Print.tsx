import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PrintView } from '@/components/ui/print-view';
import { useFlights } from '@/hooks/use-flights';
import { useTransport } from '@/hooks/use-transport';
import { useNotTravelling } from '@/hooks/use-not-travelling';
import { mockTerms } from '@/data/mock-terms';
import { Loader2 } from 'lucide-react';
import { PrintOptions } from '@/components/ui/print-options-dialog';

export default function Print() {
  const [searchParams] = useSearchParams();
  const { flights, loading: flightsLoading } = useFlights();
  const { transport, isLoading: transportLoading } = useTransport();
  const { notTravelling, loading: notTravellingLoading } = useNotTravelling();
  
  const [isReady, setIsReady] = useState(false);
  const [printOptions, setPrintOptions] = useState<PrintOptions | undefined>();

  useEffect(() => {
    // Parse print options from URL query parameters
    const schools = searchParams.get('schools');
    const year = searchParams.get('year');
    const layout = searchParams.get('layout');

    // Always create print options with defaults if not specified
    const options: PrintOptions = {
      schools: {
        benenden: schools ? schools.includes('benenden') : true,
        wycombe: schools ? schools.includes('wycombe') : true,
      },
      year: year || '2025-2026',
      layout: (layout === 'side-by-side' ? 'side-by-side' : 'separate') as 'separate' | 'side-by-side'
    };
    setPrintOptions(options);
  }, [searchParams]);

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
      printOptions={printOptions}
    />
  );
}