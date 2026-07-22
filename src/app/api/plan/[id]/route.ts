import { NextRequest, NextResponse } from "next/server";
import { getMealPlanFromDb } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plan = await getMealPlanFromDb(params.id);
    if (!plan) {
      return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch plan" }, { status: 500 });
  }
}
