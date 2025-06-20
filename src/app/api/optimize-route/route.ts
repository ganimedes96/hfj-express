

import { NextResponse } from 'next/server';
import { Client, Language } from "@googlemaps/google-maps-services-js";

// A função agora se chama POST e recebe um objeto Request
export async function POST(request: Request) {
  try {
    // 1. Para pegar o corpo da requisição, usamos await request.json()
    const { origin, packages } = await request.json();

    // 2. Validação dos dados (continua igual)
    if (!origin || !packages || !Array.isArray(packages) || packages.length === 0) {
      return NextResponse.json(
        { message: 'Dados de origem e pacotes são obrigatórios.' },
        { status: 400 }
      );
    }

    const client = new Client({});
    const waypoints = packages.map((p: { address: string, cep: string }) => `${p.address}, ${p.cep}`);

    const response = await client.directions({
      params: {
        origin: origin,
        destination: origin,
        waypoints: waypoints,
        optimize: true,
        key: process.env.Maps_API_KEY as string,
        language: Language.pt_BR,
      },
    });

    const optimizedOrder: number[] = response.data.routes[0].waypoint_order;
    const orderedPackages = optimizedOrder.map(index => packages[index]);

    // 3. Para responder, retornamos um NextResponse.json()
    return NextResponse.json({ orderedPackages });

  } catch (error: unknown) {
    console.error("Erro na API de otimização:", error);
    return NextResponse.json(
      { message: 'Erro interno ao otimizar a rota.' },
      { status: 500 }
    );
  }
}