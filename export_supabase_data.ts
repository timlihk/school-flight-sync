// Export data from Supabase before migration to Railway
// Run this script with: npx tsx export_supabase_data.ts

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ExportData {
  flights: any[];
  transport: any[];
  not_travelling: any[];
  service_providers: any[];
  exportedAt: string;
}

async function exportData() {
  console.log('Starting data export from Supabase...\n');

  const exportData: ExportData = {
    flights: [],
    transport: [],
    not_travelling: [],
    service_providers: [],
    exportedAt: new Date().toISOString()
  };

  try {
    // Export flights
    console.log('Exporting flights...');
    const { data: flights, error: flightsError } = await supabase
      .from('flights')
      .select('*')
      .order('departure_date', { ascending: true });

    if (flightsError) throw flightsError;
    exportData.flights = flights || [];
    console.log(`  ✓ Exported ${exportData.flights.length} flights`);

    // Export transport
    console.log('Exporting transport records...');
    const { data: transport, error: transportError } = await supabase
      .from('transport')
      .select('*');

    if (transportError) throw transportError;
    exportData.transport = transport || [];
    console.log(`  ✓ Exported ${exportData.transport.length} transport records`);

    // Export not_travelling
    console.log('Exporting not_travelling records...');
    const { data: notTravelling, error: notTravellingError } = await supabase
      .from('not_travelling')
      .select('*');

    if (notTravellingError) throw notTravellingError;
    exportData.not_travelling = notTravelling || [];
    console.log(`  ✓ Exported ${exportData.not_travelling.length} not_travelling records`);

    // Export service_providers
    console.log('Exporting service providers...');
    const { data: serviceProviders, error: serviceProvidersError } = await supabase
      .from('service_providers')
      .select('*')
      .order('name', { ascending: true });

    if (serviceProvidersError) throw serviceProvidersError;
    exportData.service_providers = serviceProviders || [];
    console.log(`  ✓ Exported ${exportData.service_providers.length} service providers`);

    // Save to JSON file
    const exportDir = path.join(process.cwd(), 'migration');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonFilePath = path.join(exportDir, `supabase_export_${timestamp}.json`);
    fs.writeFileSync(jsonFilePath, JSON.stringify(exportData, null, 2));
    console.log(`\n✓ Data exported successfully to: ${jsonFilePath}`);

    // Generate SQL INSERT statements
    const sqlFilePath = path.join(exportDir, `supabase_export_${timestamp}.sql`);
    const sqlStatements = generateSQLInserts(exportData);
    fs.writeFileSync(sqlFilePath, sqlStatements);
    console.log(`✓ SQL INSERT statements generated: ${sqlFilePath}`);

    console.log('\nExport Summary:');
    console.log(`  Flights: ${exportData.flights.length}`);
    console.log(`  Transport: ${exportData.transport.length}`);
    console.log(`  Not Travelling: ${exportData.not_travelling.length}`);
    console.log(`  Service Providers: ${exportData.service_providers.length}`);
    console.log(`\nTotal records: ${
      exportData.flights.length +
      exportData.transport.length +
      exportData.not_travelling.length +
      exportData.service_providers.length
    }`);

  } catch (error) {
    console.error('Error during export:', error);
    process.exit(1);
  }
}

function generateSQLInserts(data: ExportData): string {
  let sql = '-- Supabase Data Export to Railway PostgreSQL\n';
  sql += `-- Exported at: ${data.exportedAt}\n\n`;
  sql += '-- Disable triggers during import\n';
  sql += 'SET session_replication_role = replica;\n\n';

  // Flights
  if (data.flights.length > 0) {
    sql += '-- Insert flights\n';
    for (const flight of data.flights) {
      const values = [
        `'${flight.id}'`,
        `'${flight.term_id}'`,
        `'${flight.type}'`,
        `'${flight.airline}'`,
        `'${flight.flight_number}'`,
        `'${flight.departure_airport}'`,
        `'${flight.departure_date}'`,
        `'${flight.departure_time}'`,
        `'${flight.arrival_airport}'`,
        `'${flight.arrival_date}'`,
        `'${flight.arrival_time}'`,
        flight.confirmation_code ? `'${flight.confirmation_code}'` : 'NULL',
        flight.notes ? `'${flight.notes.replace(/'/g, "''")}'` : 'NULL',
        `'${flight.created_at}'`,
        `'${flight.updated_at}'`
      ];
      sql += `INSERT INTO public.flights (id, term_id, type, airline, flight_number, departure_airport, departure_date, departure_time, arrival_airport, arrival_date, arrival_time, confirmation_code, notes, created_at, updated_at) VALUES (${values.join(', ')});\n`;
    }
    sql += '\n';
  }

  // Transport
  if (data.transport.length > 0) {
    sql += '-- Insert transport\n';
    for (const transport of data.transport) {
      const values = [
        `'${transport.id}'`,
        `'${transport.term_id}'`,
        `'${transport.type}'`,
        `'${transport.direction}'`,
        `'${transport.driver_name}'`,
        `'${transport.phone_number}'`,
        `'${transport.license_number}'`,
        `'${transport.pickup_time}'`,
        transport.notes ? `'${transport.notes.replace(/'/g, "''")}'` : 'NULL',
        `'${transport.created_at}'`,
        `'${transport.updated_at}'`
      ];
      sql += `INSERT INTO public.transport (id, term_id, type, direction, driver_name, phone_number, license_number, pickup_time, notes, created_at, updated_at) VALUES (${values.join(', ')});\n`;
    }
    sql += '\n';
  }

  // Not travelling
  if (data.not_travelling.length > 0) {
    sql += '-- Insert not_travelling\n';
    for (const nt of data.not_travelling) {
      const values = [
        `'${nt.id}'`,
        `'${nt.term_id}'`,
        nt.no_flights ? 'TRUE' : 'FALSE',
        nt.no_transport ? 'TRUE' : 'FALSE',
        `'${nt.created_at}'`,
        `'${nt.updated_at}'`
      ];
      sql += `INSERT INTO public.not_travelling (id, term_id, no_flights, no_transport, created_at, updated_at) VALUES (${values.join(', ')});\n`;
    }
    sql += '\n';
  }

  // Service providers
  if (data.service_providers.length > 0) {
    sql += '-- Insert service_providers\n';
    for (const sp of data.service_providers) {
      const values = [
        `'${sp.id}'`,
        `'${sp.name.replace(/'/g, "''")}'`,
        `'${sp.phone_number}'`,
        sp.license_number ? `'${sp.license_number}'` : 'NULL',
        `'${sp.vehicle_type}'`,
        sp.email ? `'${sp.email}'` : 'NULL',
        sp.notes ? `'${sp.notes.replace(/'/g, "''")}'` : 'NULL',
        sp.rating ? sp.rating.toString() : 'NULL',
        sp.is_active ? 'TRUE' : 'FALSE',
        `'${sp.created_at}'`,
        `'${sp.updated_at}'`
      ];
      sql += `INSERT INTO public.service_providers (id, name, phone_number, license_number, vehicle_type, email, notes, rating, is_active, created_at, updated_at) VALUES (${values.join(', ')});\n`;
    }
    sql += '\n';
  }

  sql += '-- Re-enable triggers\n';
  sql += 'SET session_replication_role = DEFAULT;\n';

  return sql;
}

exportData();
