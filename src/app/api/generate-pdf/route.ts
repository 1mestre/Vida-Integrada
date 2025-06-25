// src/app/api/generate-pdf/route.ts
// VERSIÓN DE DIAGNÓSTICO FINALLLLAZO
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const accessKey = process.env.APIFLASH_ACCESS_KEY;

    // Creamos un objeto con la información de diagnóstico.
    const responseData = {
      message: "Diagnóstico desde /api/generate-pdf",
      isKeyPresent: !!accessKey, // Convierte a booleano: true si existe, false si no.
      keyLength: accessKey ? accessKey.length : 0,
      keyPreview: accessKey ? `...${accessKey.slice(-4)}` : 'Variable NO encontrada en esta ruta.',
    };

    // Devolvemos esta información de diagnóstico como un JSON.
    return NextResponse.json(responseData, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
