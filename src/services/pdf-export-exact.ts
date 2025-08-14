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

export class ExactPDFExportService {
  private doc: jsPDF;
  private currentY: number = 10;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number = 10;
  private columnWidth: number = 90;
  private cardPadding: number = 4;

  constructor() {
    this.doc = new jsPDF('portrait', 'mm', 'a4');
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
  }

  public generateTravelAgenda(data: ExportData): void {
    const { terms, flights, transport, notTravelling, selectedAcademicYear } = data;

    // Add main header matching webpage
    this.addWebHeader(selectedAcademicYear);

    // Group terms by school
    const benendenTerms = terms.filter(t => t.school === 'benenden').sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const wycombeTerms = terms.filter(t => t.school === 'wycombe').sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Determine layout
    const hasBothSchools = benendenTerms.length > 0 && wycombeTerms.length > 0;

    if (hasBothSchools) {
      this.renderTwoColumns(benendenTerms, wycombeTerms, flights, transport, notTravelling);
    } else if (benendenTerms.length > 0) {
      this.renderSingleColumn('Benenden School', benendenTerms, flights, transport, notTravelling);
    } else if (wycombeTerms.length > 0) {
      this.renderSingleColumn('Wycombe Abbey School', wycombeTerms, flights, transport, notTravelling);
    }

    // Save PDF
    const fileName = `travel-agenda-${selectedAcademicYear === 'all' ? 'all-years' : selectedAcademicYear}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    this.doc.save(fileName);
  }

  private addWebHeader(academicYear: string): void {
    // Header background
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(0, 0, this.pageWidth, 30, 'F');
    
    // Border bottom
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    this.doc.line(0, 30, this.pageWidth, 30);

    // Icon circle (plane icon placeholder)
    this.doc.setFillColor(99, 102, 241);
    this.doc.circle(this.pageWidth / 2 - 15, 12, 4, 'F');
    
    // Title
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39);
    this.doc.text('School Flight Sync', this.pageWidth / 2 + 5, 13, { align: 'center' });

    // Subtitle
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128);
    this.doc.text("Manage your daughters' school term dates and travel arrangements", this.pageWidth / 2, 22, { align: 'center' });

    this.currentY = 40;
  }

  private renderTwoColumns(
    benendenTerms: Term[],
    wycombeTerms: Term[],
    flights: FlightDetails[],
    transport: TransportDetails[],
    notTravelling: NotTravellingStatus[]
  ): void {
    const leftX = this.margin;
    const rightX = this.pageWidth / 2 + 5;
    
    let leftY = this.currentY;
    let rightY = this.currentY;

    // Left column - Benenden
    if (benendenTerms.length > 0) {
      leftY = this.renderSchoolSection(
        'Benenden School',
        benendenTerms,
        flights,
        transport,
        notTravelling,
        leftX,
        leftY,
        '#8B4513' // Brown hex
      );
    }

    // Right column - Wycombe
    if (wycombeTerms.length > 0) {
      rightY = this.renderSchoolSection(
        'Wycombe Abbey School',
        wycombeTerms,
        flights,
        transport,
        notTravelling,
        rightX,
        rightY,
        '#191970' // Navy hex
      );
    }
  }

  private renderSingleColumn(
    schoolName: string,
    terms: Term[],
    flights: FlightDetails[],
    transport: TransportDetails[],
    notTravelling: NotTravellingStatus[]
  ): void {
    const centerX = (this.pageWidth - this.columnWidth) / 2;
    const color = schoolName.includes('Benenden') ? '#8B4513' : '#191970';
    
    this.renderSchoolSection(
      schoolName,
      terms,
      flights,
      transport,
      notTravelling,
      centerX,
      this.currentY,
      color
    );
  }

  private hexToRGB(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }

  private renderSchoolSection(
    schoolName: string,
    terms: Term[],
    flights: FlightDetails[],
    transport: TransportDetails[],
    notTravelling: NotTravellingStatus[],
    x: number,
    startY: number,
    colorHex: string
  ): number {
    let y = startY;
    const [r, g, b] = this.hexToRGB(colorHex);

    // School header card
    this.doc.setFillColor(255, 255, 255);
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(x, y, this.columnWidth, 16, 2, 2);
    
    // Gradient background simulation
    this.doc.setFillColor(r, g, b);
    this.doc.setGState(this.doc.GState({ opacity: 0.1 }));
    this.doc.roundedRect(x, y, this.columnWidth, 16, 2, 2, 'F');
    this.doc.setGState(this.doc.GState({ opacity: 1 }));
    
    // School icon
    this.doc.setFillColor(r, g, b);
    this.doc.circle(x + 6, y + 8, 2.5, 'F');
    
    // School name
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39);
    this.doc.text(schoolName, x + 12, y + 7);
    
    // Term count badge
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128);
    this.doc.text(`${terms.length} Terms`, x + 12, y + 12);

    y += 20;

    // Render each term
    for (const term of terms) {
      if (y > this.pageHeight - 80) {
        this.doc.addPage();
        y = 20;
      }

      y = this.renderTermCard(term, flights, transport, notTravelling, x, y);
      y += 4;
    }

    return y;
  }

  private renderTermCard(
    term: Term,
    allFlights: FlightDetails[],
    allTransport: TransportDetails[],
    allNotTravelling: NotTravellingStatus[],
    x: number,
    y: number
  ): number {
    const termFlights = allFlights.filter(f => f.termId === term.id);
    const termTransport = allTransport.filter(t => t.termId === term.id);
    const termNotTravelling = allNotTravelling.find(nt => nt.termId === term.id);
    
    // Calculate card height
    let cardHeight = 18; // Base height
    
    // Add height for flights section
    if (termFlights.length > 0) {
      cardHeight += 8 + (termFlights.length * 8);
    } else if (termNotTravelling?.noFlights) {
      cardHeight += 12;
    }
    
    // Add height for transport section
    if (termTransport.length > 0) {
      cardHeight += 8 + (termTransport.length * 8);
    } else if (termNotTravelling?.noTransport) {
      cardHeight += 12;
    }

    // Card background
    this.doc.setFillColor(255, 255, 255);
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(x, y, this.columnWidth, cardHeight, 2, 2);

    let currentY = y + 5;

    // Calendar icon placeholder
    this.doc.setFillColor(156, 163, 175);
    this.doc.rect(x + 4, currentY - 3, 3, 3, 'F');
    
    // Term name
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(17, 24, 39);
    this.doc.text(term.name, x + 10, currentY);
    
    currentY += 4;
    
    // Date range
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128);
    const dateStr = term.type === 'term' 
      ? `Term: ${format(term.startDate, 'EEE, MMM dd')} - ${format(term.endDate, 'EEE, MMM dd yyyy')}`
      : `${format(term.startDate, 'EEE, MMM dd')} - ${format(term.endDate, 'EEE, MMM dd yyyy')}`;
    this.doc.text(dateStr, x + 10, currentY);
    
    currentY += 6;

    // Flights section
    if (termFlights.length > 0) {
      currentY = this.renderFlights(termFlights, x + 4, currentY);
    } else if (termNotTravelling?.noFlights) {
      currentY = this.renderNotTravelling('flights', x + 4, currentY);
    }

    // Transport section
    if (termTransport.length > 0) {
      currentY = this.renderTransport(termTransport, x + 4, currentY);
    } else if (termNotTravelling?.noTransport) {
      currentY = this.renderNotTravelling('transport', x + 4, currentY);
    }

    return y + cardHeight;
  }

  private renderFlights(flights: FlightDetails[], x: number, y: number): number {
    let currentY = y;

    // Flights header
    this.doc.setFillColor(219, 234, 254);
    this.doc.roundedRect(x, currentY, this.columnWidth - 8, 5, 1, 1, 'F');
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 58, 138);
    this.doc.text('Flights', x + 2, currentY + 3.5);
    
    currentY += 6;

    flights.forEach((flight, index) => {
      // Flight type icon placeholder
      this.doc.setFontSize(7);
      this.doc.setTextColor(59, 130, 246);
      const icon = flight.type === 'outbound' ? 'OUT' : 'RET';
      this.doc.text(icon, x + 2, currentY + 2);
      
      // Flight details - first line
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(17, 24, 39);
      this.doc.text(`${flight.airline} ${flight.flightNumber}`, x + 12, currentY + 2);
      
      // Date and time
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(`${format(flight.departure.date, 'MMM dd')} ${flight.departure.time}`, x + 50, currentY + 2);
      
      currentY += 3;
      
      // Route and confirmation - second line
      this.doc.setFontSize(7);
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(`${flight.departure.airport} to ${flight.arrival.airport}`, x + 12, currentY + 2);
      
      if (flight.confirmationCode) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(flight.confirmationCode, x + 50, currentY + 2);
      }
      
      currentY += 5;
    });

    return currentY;
  }

  private renderTransport(transport: TransportDetails[], x: number, y: number): number {
    let currentY = y;

    // Transport header
    this.doc.setFillColor(220, 252, 231);
    this.doc.roundedRect(x, currentY, this.columnWidth - 8, 5, 1, 1, 'F');
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(21, 128, 61);
    this.doc.text('Transport', x + 2, currentY + 3.5);
    
    currentY += 6;

    transport.forEach(item => {
      // Transport icon placeholder
      this.doc.setFontSize(7);
      this.doc.setTextColor(34, 197, 94);
      this.doc.text('CAR', x + 2, currentY + 2);
      
      // Driver name
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(17, 24, 39);
      this.doc.text(item.driverName, x + 12, currentY + 2);
      
      // Time
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(item.pickupTime, x + 50, currentY + 2);
      
      currentY += 3;
      
      // Phone and license
      this.doc.setFontSize(7);
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(item.phoneNumber, x + 12, currentY + 2);
      
      if (item.licenseNumber) {
        this.doc.text(`Lic: ${item.licenseNumber}`, x + 40, currentY + 2);
      }
      
      currentY += 5;
    });

    return currentY;
  }

  private renderNotTravelling(type: 'flights' | 'transport', x: number, y: number): number {
    let currentY = y;

    // Background for not travelling badge
    this.doc.setFillColor(241, 245, 249);
    this.doc.roundedRect(x + 10, currentY, this.columnWidth - 28, 7, 2, 2, 'F');
    
    // Text
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 116, 139);
    const text = type === 'flights' ? 'No flights needed' : 'No transport needed';
    this.doc.text(text, x + this.columnWidth / 2 - 4, currentY + 4.5, { align: 'center' });
    
    return currentY + 10;
  }
}

export const generateExactPDF = (data: ExportData): void => {
  const pdfService = new ExactPDFExportService();
  pdfService.generateTravelAgenda(data);
};