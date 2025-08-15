import { useEffect, useState } from 'react';
import { Plane, Car, Calendar, MapPin, Clock, Phone, User } from 'lucide-react';
import { FlightDetails, TransportDetails, NotTravellingStatus, Term } from '@/types/school';
import { format } from 'date-fns';
import { transformForPrint } from '@/utils/exportUtils';

interface PrintViewProps {
  flights: FlightDetails[];
  transport: TransportDetails[];
  notTravelling: NotTravellingStatus[];
  terms: Term[];
}

export function PrintView({ flights, transport, notTravelling, terms }: PrintViewProps) {
  const [printData, setPrintData] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const data = transformForPrint(flights, transport, notTravelling, terms);
    setPrintData(data);
  }, [flights, transport, notTravelling, terms]);

  const getSchoolDisplayName = (school: string) => {
    return school === 'benenden' ? 'Benenden School' : 'Wycombe Abbey School';
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    return `${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}`;
  };

  useEffect(() => {
    // Auto-trigger print dialog when component mounts
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-view min-h-screen bg-white text-black p-8">
      <style jsx>{`
        @media print {
          .print-view {
            padding: 0;
            margin: 0;
            font-size: 12px;
          }
          .page-break {
            page-break-before: always;
          }
          .no-print {
            display: none;
          }
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
        
        .print-view {
          font-family: 'Times New Roman', serif;
          line-height: 1.4;
        }
        
        .school-section {
          margin-bottom: 2rem;
        }
        
        .term-section {
          margin-bottom: 1.5rem;
          border: 1px solid #ddd;
          padding: 1rem;
        }
        
        .flight-row, .transport-row {
          margin: 0.5rem 0;
          padding: 0.5rem;
          background-color: #f9f9f9;
        }
        
        .icon-text {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          margin-right: 1rem;
        }
      `}</style>

      {/* Header */}
      <header className="text-center mb-8 border-b-2 border-gray-300 pb-4">
        <h1 className="text-2xl font-bold mb-2">School Flight Sync - Family Travel Schedule</h1>
        <p className="text-gray-600">Generated on {format(new Date(), 'dd MMMM yyyy \'at\' HH:mm')}</p>
        <p className="text-sm text-gray-500 mt-2">
          Complete travel arrangements for all family school terms
        </p>
      </header>

      {/* Summary Statistics */}
      <div className="mb-6 p-4 bg-gray-50 border">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <strong>Total Terms:</strong> {terms.length}
          </div>
          <div>
            <strong>Total Flights:</strong> {flights.length}
          </div>
          <div>
            <strong>Transport Arrangements:</strong> {transport.length}
          </div>
          <div>
            <strong>Schools:</strong> {Object.keys(printData).length}
          </div>
        </div>
      </div>

      {/* Content by School */}
      {Object.entries(printData).map(([school, schoolTerms], schoolIndex) => (
        <div key={school} className={`school-section ${schoolIndex > 0 ? 'page-break' : ''}`}>
          <h2 className="text-xl font-bold mb-4 text-center bg-gray-100 p-2 border">
            {getSchoolDisplayName(school)}
          </h2>

          {schoolTerms
            .sort((a, b) => a.term.startDate.getTime() - b.term.startDate.getTime())
            .map(({ term, flights: termFlights, transport: termTransport, notTravelling: termNotTravelling }) => (
            <div key={term.id} className="term-section">
              {/* Term Header */}
              <div className="mb-3">
                <h3 className="text-lg font-semibold">{term.name}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="icon-text">
                    <Calendar className="h-4 w-4" />
                    {formatDateRange(term.startDate, term.endDate)}
                  </span>
                  <span className="icon-text">
                    <span>Academic Year: {term.academicYear}</span>
                  </span>
                </div>
              </div>

              {/* Flight Information */}
              <div className="mb-3">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Plane className="h-4 w-4" />
                  Flight Information
                </h4>
                
                {termNotTravelling?.noFlights ? (
                  <div className="text-sm text-gray-600 italic">
                    Not travelling by flight for this term
                  </div>
                ) : termFlights.length > 0 ? (
                  <div className="space-y-2">
                    {termFlights.map((flight, index) => (
                      <div key={flight.id} className="flight-row">
                        <div className="font-medium mb-1">
                          {flight.type === 'outbound' ? 'Outbound' : 'Return'} Flight
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div><strong>Flight:</strong> {flight.airline} {flight.flightNumber}</div>
                            <div className="icon-text">
                              <MapPin className="h-3 w-3" />
                              {flight.departure.airport} → {flight.arrival.airport}
                            </div>
                          </div>
                          <div>
                            <div className="icon-text">
                              <Clock className="h-3 w-3" />
                              {format(flight.departure.date, 'dd MMM')} at {flight.departure.time}
                            </div>
                            <div className="icon-text">
                              <Clock className="h-3 w-3" />
                              Arrives {format(flight.arrival.date, 'dd MMM')} at {flight.arrival.time}
                            </div>
                            {flight.confirmationCode && (
                              <div><strong>Ref:</strong> {flight.confirmationCode}</div>
                            )}
                          </div>
                        </div>
                        {flight.notes && (
                          <div className="text-sm text-gray-600 mt-1">
                            <strong>Notes:</strong> {flight.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 italic">
                    No flights booked yet
                  </div>
                )}
              </div>

              {/* Transport Information */}
              <div className="mb-3">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Ground Transport
                </h4>

                {termNotTravelling?.noTransport ? (
                  <div className="text-sm text-gray-600 italic">
                    No ground transport needed for this term
                  </div>
                ) : termTransport ? (
                  <div className="transport-row">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div><strong>Type:</strong> {termTransport.type === 'school-coach' ? 'School Coach' : 'Taxi'}</div>
                        <div className="icon-text">
                          <User className="h-3 w-3" />
                          {termTransport.driverName}
                        </div>
                      </div>
                      <div>
                        <div className="icon-text">
                          <Phone className="h-3 w-3" />
                          {termTransport.phoneNumber}
                        </div>
                        <div><strong>License:</strong> {termTransport.licenseNumber}</div>
                        <div className="icon-text">
                          <Clock className="h-3 w-3" />
                          Pickup: {termTransport.pickupTime}
                        </div>
                      </div>
                    </div>
                    {termTransport.notes && (
                      <div className="text-sm text-gray-600 mt-1">
                        <strong>Notes:</strong> {termTransport.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 italic">
                    No transport arranged yet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-600">
        <p>School Flight Sync - Family Travel Management System</p>
        <p>For family use only - Contains private travel information</p>
      </footer>

      {/* Print Controls (hidden when printing) */}
      <div className="no-print fixed bottom-4 right-4 space-x-2">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Print Again
        </button>
        <button
          onClick={() => window.close()}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}