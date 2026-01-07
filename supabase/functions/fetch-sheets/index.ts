import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHEET_ID = '1COUt-Jf3vzSE8hOs268MzJAO12PGrchX-TPuW6LXIGg';

interface SheetRow {
  [key: string]: string;
}

const parseAmount = (value: string): number => {
  if (!value) return 0;
  const cleaned = value.toString().replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const parseBoolean = (value: string): boolean => {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return lower === 'yes' || lower === 'true' || lower === '1';
};

const fetchSheetData = async (apiKey: string, sheetName: string): Promise<SheetRow[]> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;
  
  console.log(`Fetching sheet: ${sheetName}`);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error fetching ${sheetName}:`, errorText);
    throw new Error(`Failed to fetch ${sheetName}: ${response.status}`);
  }
  
  const data = await response.json();
  const rows = data.values || [];
  
  if (rows.length < 2) {
    console.log(`Sheet ${sheetName} has no data rows`);
    return [];
  }
  
  const headers = rows[0].map((h: string) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const dataRows = rows.slice(1);
  
  console.log(`Fetched ${dataRows.length} rows from ${sheetName}`);
  
  return dataRows.map((row: string[]) => {
    const obj: SheetRow = {};
    headers.forEach((header: string, index: number) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    
    if (!apiKey) {
      console.error('GOOGLE_SHEETS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching all sheets...');

    // Fetch all sheets in parallel
    const [incomeRaw, expenseRaw, agencyIncomeRaw, agencyExpenseRaw] = await Promise.all([
      fetchSheetData(apiKey, 'Income'),
      fetchSheetData(apiKey, 'Expense'),
      fetchSheetData(apiKey, 'Agency-Income'),
      fetchSheetData(apiKey, 'Agency-Expenses'),
    ]);

    // Parse personal income
    const personalIncome = incomeRaw.map(row => ({
      date: row.date || '',
      name: row.name || '',
      category: row.category || '',
      amount: parseAmount(row.amount),
      paymentMethod: row.payment_method || row.paymentmethod || '',
      reason: row.reason || '',
    }));

    // Parse personal expense
    const personalExpense = expenseRaw.map(row => ({
      date: row.date || '',
      name: row.name || '',
      category: row.category || '',
      amount: parseAmount(row.amount),
      paymentMethod: row.payment_method || row.paymentmethod || '',
      reason: row.reason || '',
    }));

    // Parse agency income
    const agencyIncome = agencyIncomeRaw.map(row => ({
      date: row.date || '',
      clientName: row.client_name || row.clientname || '',
      service: row.service || '',
      amount: parseAmount(row.amount),
      recurring: parseBoolean(row.recurring),
      paymentMode: row.payment_mode || row.paymentmode || '',
      reason: row.reason || '',
      nextPaymentDate: row.next_payment_date || row.nextpaymentdate || null,
    }));

    // Parse agency expense
    const agencyExpense = agencyExpenseRaw.map(row => ({
      date: row.date || '',
      category: row.category || '',
      paidTo: row.paid_to || row.paidto || '',
      amount: parseAmount(row.amount),
      recurring: parseBoolean(row.recurring),
      paymentMode: row.payment_mode || row.paymentmode || '',
      reason: row.reason || '',
      nextPaymentDate: row.next_payment_date || row.nextpaymentdate || null,
    }));

    const responseData = {
      personalIncome,
      personalExpense,
      agencyIncome,
      agencyExpense,
      lastUpdated: new Date().toISOString(),
    };

    console.log('Successfully fetched all data:', {
      personalIncome: personalIncome.length,
      personalExpense: personalExpense.length,
      agencyIncome: agencyIncome.length,
      agencyExpense: agencyExpense.length,
    });

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-sheets function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to fetch data from Google Sheets'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
