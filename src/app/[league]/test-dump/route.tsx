import { getLatestJewelSnapshotAndLeagues } from "@/server/queries";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { league: string } },
) {
  const res = await getLatestJewelSnapshotAndLeagues(params.league);

  return Response.json(res);
}
