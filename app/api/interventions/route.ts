import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const interventions = await prisma.intervention.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(interventions)
  } catch (error) {
    console.error("Erreur GET interventions:", error)
    return NextResponse.json(
      { error: "Erreur lors du chargement des interventions" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const intervention = await prisma.intervention.create({
      data: {
        id: data.id || `intervention-${Date.now()}`,
        date: String(data.date),
        engin: String(data.engin),
        categorie: String(data.categorie),
        lubrifiant: String(data.lubrifiant),
        compteurHoraire: Number(data.compteurHoraire) || 0,
        type: String(data.type),
        quantite: Number(data.quantite) || 0,
        responsable: String(data.responsable),
        observation: data.observation ? String(data.observation) : "",
      },
    })

    return NextResponse.json(intervention)
  } catch (error) {
    console.error("Erreur POST interventions:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de l'intervention" },
      { status: 500 }
    )
  }
}