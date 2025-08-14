import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Term, FlightDetails, TransportDetails, NotTravellingStatus } from '@/types/school';

interface ExportData {
  terms: Term[];
  flights: FlightDetails[];
  transport: TransportDetails[];
  notTravelling: NotTravellingStatus[];
  selectedAcademicYear: string;
}

export class PDFExportService {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF('portrait', 'mm', 'a4');
    this.pageHeight = this.doc.internal.pageSize.height;
  }

  public generateTravelAgenda(data: ExportData): void {
    const { terms, flights, transport, notTravelling, selectedAcademicYear } = data;

    // Add header
    this.addHeader(selectedAcademicYear);
    
    // Add summary
    this.addSummary(terms, flights, transport);
    
    // Group terms by school
    const benendenTerms = terms.filter(t => t.school === 'benenden').sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const wycombeTerms = terms.filter(t => t.school === 'wycombe').sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Add Benenden School section
    if (benendenTerms.length > 0) {
      this.addSchoolSection('Benenden School', benendenTerms, flights, transport, notTravelling);
    }

    // Add Wycombe Abbey School section
    if (wycombeTerms.length > 0) {
      this.addSchoolSection('Wycombe Abbey School', wycombeTerms, flights, transport, notTravelling);
    }

    // Add footer
    this.addFooter();

    // Save the PDF
    const fileName = `travel-agenda-${selectedAcademicYear === 'all' ? 'all-years' : selectedAcademicYear}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    this.doc.save(fileName);
  }

  private addHeader(academicYear: string): void {
    // Title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('School Travel Arrangements', this.margin, this.currentY);
    
    this.currentY += 12;
    
    // Subtitle
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(128, 139, 150);
    const subtitle = academicYear === 'all' ? 'All Academic Years' : `Academic Year ${academicYear}`;
    this.doc.text(subtitle, this.margin, this.currentY);
    
    this.currentY += 8;
    
    // Date generated
    this.doc.setFontSize(10);
    this.doc.setTextColor(149, 165, 166);
    this.doc.text(`Generated on ${format(new Date(), 'EEEE, MMMM dd, yyyy')}`, this.margin, this.currentY);
    
    this.currentY += 15;
    
    // Add decorative line
    this.doc.setDrawColor(52, 73, 94);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, 190, this.currentY);
    
    this.currentY += 10;
  }

  private addSummary(terms: Term[], flights: FlightDetails[], transport: TransportDetails[]): void {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Summary', this.margin, this.currentY);
    
    this.currentY += 10;

    // Summary statistics
    const benendenTerms = terms.filter(t => t.school === 'benenden').length;
    const wycombeTerms = terms.filter(t => t.school === 'wycombe').length;
    const totalFlights = flights.length;
    const totalTransport = transport.length;

    const summaryData = [
      ['Benenden School Terms', benendenTerms.toString()],
      ['Wycombe Abbey School Terms', wycombeTerms.toString()],
      ['Total Flight Bookings', totalFlights.toString()],
      ['Total Transport Arrangements', totalTransport.toString()]
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Category', 'Count']],
      body: summaryData,
      theme: 'striped',
      headStyles: { 
        fillColor: [52, 73, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  private addSchoolSection(
    schoolName: string,
    terms: Term[],
    flights: FlightDetails[],
    transport: TransportDetails[],
    notTravelling: NotTravellingStatus[]
  ): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 60) {
      this.doc.addPage();
      this.currentY = 20;
    }

    // School header
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    // Set color based on school - brown for Benenden, navy for Wycombe
    if (schoolName.includes('Benenden')) {
      this.doc.setTextColor(139, 69, 19);
    } else {
      this.doc.setTextColor(25, 25, 112);
    }
    this.doc.text(schoolName, this.margin, this.currentY);
    
    this.currentY += 12;

    // Add terms table
    terms.forEach((term, index) => {
      this.addTermSection(term, flights, transport, notTravelling, index === 0);
    });
  }

  private addTermSection(
    term: Term,
    flights: FlightDetails[],
    transport: TransportDetails[],
    notTravelling: NotTravellingStatus[],
    isFirst: boolean
  ): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 100) {
      this.doc.addPage();
      this.currentY = 20;
    }

    if (!isFirst) {
      this.currentY += 8;
    }

    // Term header
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text(term.name, this.margin, this.currentY);
    
    this.currentY += 6;
    
    // Term details
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(128, 139, 150);
    this.doc.text(
      `${format(term.startDate, 'EEEE, MMMM dd, yyyy')} - ${format(term.endDate, 'EEEE, MMMM dd, yyyy')}`,
      this.margin,
      this.currentY
    );
    
    this.currentY += 8;

    // Get relevant data
    const termFlights = flights.filter(f => f.termId === term.id);
    const termTransport = transport.filter(t => t.termId === term.id);
    const termNotTravelling = notTravelling.find(nt => nt.termId === term.id);

    // Create table data
    const tableData: string[][] = [];

    // Add flights
    if (termFlights.length > 0) {
      termFlights.forEach(flight => {
        tableData.push([
          'FLIGHT',
          `${flight.airline} ${flight.flightNumber}`,
          `${flight.departure.airport} -> ${flight.arrival.airport}`,
          `${format(flight.departure.date, 'MMM dd')} ${flight.departure.time}`,
          flight.confirmationCode || 'N/A'
        ]);
      });
    }

    // Add transport
    if (termTransport.length > 0) {
      termTransport.forEach(transportItem => {
        tableData.push([
          'TRANSPORT',
          transportItem.driverName,
          `${transportItem.type === 'pickup' ? 'Pickup' : 'Drop-off'} at ${transportItem.pickupTime}`,
          transportItem.phoneNumber,
          transportItem.licenseNumber
        ]);
      });
    }

    // Add "not travelling" status
    if (termNotTravelling) {
      if (termNotTravelling.noFlights) {
        tableData.push(['STATUS', 'No flights required', '-', '-', '-']);
      }
      if (termNotTravelling.noTransport) {
        tableData.push(['STATUS', 'No transport required', '-', '-', '-']);
      }
    }

    // If no data, show placeholder
    if (tableData.length === 0) {
      tableData.push(['STATUS', 'No arrangements needed', '-', '-', '-']);
    }

    // Create table
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Type', 'Details', 'Route/Time', 'Info', 'Reference']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [236, 240, 241],
        textColor: [44, 62, 80],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: { 
        fontSize: 9,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 40 },
        2: { cellWidth: 45 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25 }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 5;
  }

  private addFooter(): void {
    const totalPages = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor(189, 195, 199);
      this.doc.setLineWidth(0.3);
      this.doc.line(this.margin, this.pageHeight - 15, 190, this.pageHeight - 15);
      
      // Footer text
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(149, 165, 166);
      
      // Left side - app name
      this.doc.text('School Flight Sync', this.margin, this.pageHeight - 10);
      
      // Right side - page number
      this.doc.text(`Page ${i} of ${totalPages}`, 190 - 20, this.pageHeight - 10);
      
      // Center - generation info
      const centerText = 'Generated for travel planning purposes';
      const textWidth = this.doc.getTextWidth(centerText);
      this.doc.text(centerText, (210 - textWidth) / 2, this.pageHeight - 10);
    }
  }
}

export const generateTravelPDF = (data: ExportData): void => {
  const pdfService = new PDFExportService();
  pdfService.generateTravelAgenda(data);
};