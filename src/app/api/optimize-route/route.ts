import { NextResponse } from 'next/server';
import { Client, Language } from "@googlemaps/google-maps-services-js";

// Função auxiliar para dividir um array em lotes
function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const { origin, packages } = await request.json();

    if (!origin || !packages || !Array.isArray(packages) || packages.length === 0) {
      return NextResponse.json({ message: 'Dados de origem e pacotes são obrigatórios.' }, { status: 400 });
    }

    const client = new Client({});
    const waypoints = packages.map((p: { address: string, cep: string }) => `${p.address}, ${p.cep}`);

    const response = await client.directions({
      params: {
        origin: origin,
        destination: origin,
        waypoints: waypoints,
        optimize: true,
        key: process.env.MAPS_API_KEY as string,
        language: Language.pt_BR,
      },
    });

    const optimizedOrder: number[] = response.data.routes[0].waypoint_order;
    const orderedPackages = optimizedOrder.map(index => packages[index]);

    // NOVO: Dividir a rota ordenada em lotes de 9 (limite do maps)
    const routeBatches = chunkArray(orderedPackages, 9);

    // Retornamos tanto a lista completa quanto os lotes
    return NextResponse.json({ orderedPackages, routeBatches });

  } catch (error: unknown) {
    console.error("Erro na API de otimização:", error);
    return NextResponse.json({ message: 'Erro interno ao otimizar a rota.' }, { status: 500 });
  }
}