// src/app/api/debug-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Leemos la variable de entorno directamente, igual que en la otra API.
  const apiKey = process.env.APIFLASH_ACCESS_KEY;

  // Creamos un objeto con la información de diagnóstico.
  const responseData = {
    message: "Verificación de la variable de entorno APIFLASH_ACCESS_KEY",
    isKeyPresent: !!apiKey, // Convierte el valor a un booleano (true si existe, false si no)
    keyLength: apiKey ? apiKey.length : 0, // Muestra la longitud de la clave encontrada
    keyPreview: apiKey ? `...${apiKey.slice(-4)}` : 'Variable no encontrada',
  };

  // Devolvemos esta información como un JSON.
  return NextResponse.json(responseData);
}