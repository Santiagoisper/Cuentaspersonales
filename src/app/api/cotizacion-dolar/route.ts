import { NextResponse } from "next/server";

interface ExchangeRateData {
  rates: {
    ARS: number;
  };
}

// In-memory cache
let cachedCotizacion: { value: number; timestamp: number } | null = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export async function GET() {
  try {
    const now = Date.now();

    // Check if we have a recent cached value (less than 1 hour old)
    if (cachedCotizacion && now - cachedCotizacion.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        cotizacion: cachedCotizacion.value,
        cached: true,
        timestamp: new Date(cachedCotizacion.timestamp).toISOString()
      });
    }

    // Fetch exchange rate from public API
    // Note: dolarhoy.com API is not accessible directly, using exchangerate-api as alternative
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate: ${response.statusText}`);
    }

    const data = (await response.json()) as ExchangeRateData;
    const cotizacion = Math.round(data.rates.ARS * 100) / 100; // Round to 2 decimals

    // Cache the value in memory
    cachedCotizacion = {
      value: cotizacion,
      timestamp: now
    };

    return NextResponse.json({
      cotizacion,
      cached: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching dolar cotizacion:", error);

    // Return fallback value
    return NextResponse.json({
      cotizacion: 1450,
      error: error instanceof Error ? error.message : "Unknown error",
      cached: false
    }, { status: 200 }); // Return 200 to not break the frontend
  }
}
