import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { Term, FlightDetails, TransportDetails, NotTravellingStatus } from '@/types/school';

interface ExportData {
  terms: Term[];
  flights: FlightDetails[];
  transport: TransportDetails[];
  notTravelling: NotTravellingStatus[];
  selectedAcademicYear: string;
}

export class VisualPDFExportService {
  private doc: jsPDF;
  private currentY: number = 15;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number = 15;
  private columnWidth: number = 85;

  constructor() {
    this.doc = new jsPDF('portrait', 'mm', 'a4');
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
  }

  public generateTravelAgenda(data: ExportData): void {
    const { terms, flights, transport, notTravelling, selectedAcademicYear } = data;

    // Add main header (matching webpage)
    this.addMainHeader(selectedAcademicYear);

    // Group terms by school
    const benendenTerms = terms.filter(t => t.school === 'benenden').sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const wycombeTerms = terms.filter(t => t.school === 'wycombe').sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Determine layout based on schools present
    const hasBothSchools = benendenTerms.length > 0 && wycombeTerms.length > 0;
    const isSingleColumn = !hasBothSchools;

    if (hasBothSchools) {
      // Two column layout
      this.renderTwoColumnLayout(benendenTerms, wycombeTerms, flights, transport, notTravelling);
    } else if (benendenTerms.length > 0) {
      // Single column - Benenden only
      this.renderSingleColumnLayout('Benenden School', benendenTerms, flights, transport, notTravelling);
    } else if (wycombeTerms.length > 0) {
      // Single column - Wycombe only
      this.renderSingleColumnLayout('Wycombe Abbey School', wycombeTerms, flights, transport, notTravelling);
    }

    // Save the PDF
    const fileName = `travel-agenda-${selectedAcademicYear === 'all' ? 'all-years' : selectedAcademicYear}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    this.doc.save(fileName);
  }

  private addMainHeader(academicYear: string): void {
    // Main title background (light gray)
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(0, 0, this.pageWidth, 35, 'F');

    // Title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 41, 59);
    this.doc.text('School Flight Sync', this.pageWidth / 2, 15, { align: 'center' });

    // Subtitle
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 116, 139);
    const subtitle = academicYear === 'all' ? 'All Academic Years' : `Academic Year ${academicYear}`;
    this.doc.text(subtitle, this.pageWidth / 2, 22, { align: 'center' });

    // Tagline
    this.doc.setFontSize(9);
    this.doc.text("Manage your daughters' school term dates and travel arrangements", this.pageWidth / 2, 28, { align: 'center' });

    this.currentY = 45;
  }

  private renderTwoColumnLayout(
    benendenTerms: Term[],
    wycombeTerms: Term[],
    flights: FlightDetails[],
    transport: TransportDetails[],
    notTravelling: NotTravellingStatus[]
  ): void {
    const leftColumnX = this.margin;
    const rightColumnX = this.pageWidth / 2 + 5;
    
    // Track Y positions for each column
    let leftY = this.currentY;
    let rightY = this.currentY;

    // Render Benenden School in left column
    if (benendenTerms.length > 0) {
      leftY = this.renderSchoolColumn(
        'Benenden School',
        benendenTerms,
        flights,
        transport,
        notTravelling,
        leftColumnX,
        leftY,
        139, 69, 19 // Brown color
      );
    }

    // Render Wycombe Abbey in right column
    if (wycombeTerms.length > 0) {
      rightY = this.renderSchoolColumn(
        'Wycombe Abbey School',
        wycombeTerms,
        flights,
        transport,
        notTravelling,
        rightColumnX,
        rightY,
        25, 25, 112 // Navy color
      );
    }
  }

  private renderSingleColumnLayout(
    schoolName: string,
    terms: Term[],
    flights: FlightDetails[],
    transport: TransportDetails[],
    notTravelling: NotTravellingStatus[]
  ): void {
    const centerX = (this.pageWidth - this.columnWidth) / 2;
    const color = schoolName.includes('Benenden') ? [139, 69, 19] : [25, 25, 112];
    
    this.renderSchoolColumn(
      schoolName,
      terms,
      flights,
      transport,
      notTravelling,
      centerX,
      this.currentY,
      color[0], color[1], color[2]
    );
  }

  private renderSchoolColumn(
    schoolName: string,
    terms: Term[],
    flights: FlightDetails[],
    transport: TransportDetails[],
    notTravelling: NotTravellingStatus[],
    x: number,
    startY: number,
    r: number, g: number, b: number
  ): number {
    let y = startY;

    // School header card
    this.doc.setFillColor(255, 255, 255);
    this.doc.setDrawColor(226, 232, 240);
    this.doc.roundedRect(x, y, this.columnWidth, 20, 3, 3);
    
    // School icon circle
    this.doc.setFillColor(r, g, b);
    this.doc.circle(x + 8, y + 10, 3, 'F');
    
    // School name
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 41, 59);
    this.doc.text(schoolName, x + 15, y + 8);
    
    // Term count
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 116, 139);
    this.doc.text(`${terms.length} Terms`, x + 15, y + 14);

    y += 25;

    // Render each term card
    for (const term of terms) {
      // Check if we need a new page
      if (y > this.pageHeight - 60) {
        this.doc.addPage();
        y = 20;
      }

      y = this.renderTermCard(term, flights, transport, notTravelling, x, y);
      y += 5; // Gap between cards
    }

    return y;
  }

  private renderTermCard(
    term: Term,
    flights: FlightDetails[],
    transport: TransportDetails[],
    notTravelling: NotTravellingStatus[],
    x: number,
    y: number
  ): number {
    const cardHeight = this.calculateTermCardHeight(term, flights, transport, notTravelling);
    
    // Card background
    this.doc.setFillColor(255, 255, 255);
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(x, y, this.columnWidth, cardHeight, 2, 2);

    // Term header
    let currentY = y + 6;
    
    // Term name
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 41, 59);
    this.doc.text(term.name, x + 5, currentY);
    
    currentY += 5;
    
    // Term dates
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 116, 139);
    const dateRange = `${format(term.startDate, 'MMM dd')} - ${format(term.endDate, 'MMM dd, yyyy')}`;
    this.doc.text(dateRange, x + 5, currentY);
    
    currentY += 6;

    // Get term data
    const termFlights = flights.filter(f => f.termId === term.id);
    const termTransport = transport.filter(t => t.termId === term.id);
    const termNotTravelling = notTravelling.find(nt => nt.termId === term.id);

    // Flights section
    if (termFlights.length > 0 || termNotTravelling?.noFlights) {
      currentY = this.renderFlightSection(termFlights, termNotTravelling?.noFlights || false, x + 5, currentY);
      currentY += 4;
    }

    // Transport section
    if (termTransport.length > 0 || termNotTravelling?.noTransport) {
      currentY = this.renderTransportSection(termTransport, termNotTravelling?.noTransport || false, x + 5, currentY);
    }

    return y + cardHeight;
  }

  private renderFlightSection(flights: FlightDetails[], notTravelling: boolean, x: number, y: number): number {
    let currentY = y;

    // Section header
    this.doc.setFillColor(239, 246, 255);
    this.doc.roundedRect(x, currentY, this.columnWidth - 10, 5, 1, 1, 'F');
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 58, 138);
    this.doc.text('FLIGHTS', x + 2, currentY + 3.5);
    
    currentY += 7;

    if (notTravelling) {
      // Not travelling badge
      this.doc.setFillColor(241, 245, 249);
      this.doc.roundedRect(x + 2, currentY, this.columnWidth - 14, 6, 1, 1, 'F');
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 116, 139);
      this.doc.text('Not travelling', x + (this.columnWidth - 10) / 2, currentY + 4, { align: 'center' });
      currentY += 8;
    } else if (flights.length > 0) {
      // Render each flight
      flights.forEach(flight => {
        // Flight card background
        this.doc.setFillColor(248, 250, 252);
        this.doc.roundedRect(x + 2, currentY, this.columnWidth - 14, 12, 1, 1, 'F');
        
        // Flight type (Outbound/Return)
        this.doc.setFontSize(7);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(59, 130, 246);
        this.doc.text(flight.type === 'outbound' ? 'OUTBOUND' : 'RETURN', x + 4, currentY + 3);
        
        // Airline and flight number
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(30, 41, 59);
        this.doc.text(`${flight.airline} ${flight.flightNumber}`, x + 4, currentY + 6);
        
        // Route
        this.doc.setFontSize(7);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 116, 139);
        this.doc.text(`${flight.departure.airport} -> ${flight.arrival.airport}`, x + 4, currentY + 9);
        
        // Date and time
        const dateTime = `${format(flight.departure.date, 'MMM dd')} ${flight.departure.time}`;
        this.doc.text(dateTime, x + 40, currentY + 6);
        
        // Confirmation code
        if (flight.confirmationCode) {
          this.doc.setFont('helvetica', 'bold');
          this.doc.text(flight.confirmationCode, x + 40, currentY + 9);
        }
        
        currentY += 14;
      });
    }

    return currentY;
  }

  private renderTransportSection(transport: TransportDetails[], notTravelling: boolean, x: number, y: number): number {
    let currentY = y;

    // Section header
    this.doc.setFillColor(240, 253, 244);
    this.doc.roundedRect(x, currentY, this.columnWidth - 10, 5, 1, 1, 'F');
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(21, 128, 61);
    this.doc.text('TRANSPORT', x + 2, currentY + 3.5);
    
    currentY += 7;

    if (notTravelling) {
      // Not travelling badge
      this.doc.setFillColor(241, 245, 249);
      this.doc.roundedRect(x + 2, currentY, this.columnWidth - 14, 6, 1, 1, 'F');
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 116, 139);
      this.doc.text('Not travelling', x + (this.columnWidth - 10) / 2, currentY + 4, { align: 'center' });
      currentY += 8;
    } else if (transport.length > 0) {
      // Render each transport
      transport.forEach(item => {
        // Transport card background
        this.doc.setFillColor(248, 250, 252);
        this.doc.roundedRect(x + 2, currentY, this.columnWidth - 14, 10, 1, 1, 'F');
        
        // Driver name
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(30, 41, 59);
        this.doc.text(item.driverName, x + 4, currentY + 3);
        
        // Type and time
        this.doc.setFontSize(7);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 116, 139);
        const typeText = item.type === 'pickup' ? 'Pickup' : 'Drop-off';
        this.doc.text(`${typeText} at ${item.pickupTime}`, x + 4, currentY + 6);
        
        // Phone and license
        this.doc.text(item.phoneNumber, x + 4, currentY + 9);
        if (item.licenseNumber) {
          this.doc.text(`Lic: ${item.licenseNumber}`, x + 40, currentY + 9);
        }
        
        currentY += 12;
      });
    }

    return currentY;
  }

  private calculateTermCardHeight(
    term: Term,
    flights: FlightDetails[],
    transport: TransportDetails[],
    notTravelling: NotTravellingStatus[]
  ): number {
    let height = 20; // Base height for header

    const termFlights = flights.filter(f => f.termId === term.id);
    const termTransport = transport.filter(t => t.termId === term.id);
    const termNotTravelling = notTravelling.find(nt => nt.termId === term.id);

    // Flights section
    if (termFlights.length > 0 || termNotTravelling?.noFlights) {
      height += 7; // Section header
      if (termNotTravelling?.noFlights) {
        height += 8; // Not travelling badge
      } else {
        height += termFlights.length * 14; // Each flight card
      }
      height += 4; // Gap
    }

    // Transport section
    if (termTransport.length > 0 || termNotTravelling?.noTransport) {
      height += 7; // Section header
      if (termNotTravelling?.noTransport) {
        height += 8; // Not travelling badge
      } else {
        height += termTransport.length * 12; // Each transport card
      }
    }

    return Math.min(height, 100); // Cap max height
  }
}

export const generateVisualPDF = (data: ExportData): void => {
  const pdfService = new VisualPDFExportService();
  pdfService.generateTravelAgenda(data);
};