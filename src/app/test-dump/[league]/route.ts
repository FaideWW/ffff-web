import { getLatestJewelSnapshot } from "@/server/queries";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { league: string } },
) {
  const data = await getLatestJewelSnapshot(params.league);
  return Response.json(data);
}
