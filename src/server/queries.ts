import "server-only";
import db from "./db";
import { snapshotSets } from "./db/schema";
import { desc } from "drizzle-orm";

export async function getLatestJewelSnapshot(league: string) {
  const latestSnapshot = db.query.snapshotSets.findFirst({
    orderBy: [desc(snapshotSets.generatedAt)],
    with: {
      snapshots: {
        where: (model, { eq }) => eq(model.league, league),
      },
    },
  });

  return latestSnapshot;
}
