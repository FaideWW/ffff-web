import "server-only";
import db from "./db";
import { snapshotSets } from "./db/schema";
import { desc } from "drizzle-orm";

export async function getLatestJewelSnapshotAndLeagues(league: string) {
  const res = await db.batch([
    db.query.snapshotSets.findFirst({
      orderBy: [desc(snapshotSets.generatedAt)],
      where: (model, { eq }) => eq(model.league, league),
      with: {
        snapshots: true,
      },
    }),
    db.query.snapshotSets.findMany({
      columns: { league: true },
    }),
  ]);
  // const latestSnapshot = db.query.snapshotSets.findFirst({
  //   orderBy: [desc(snapshotSets.generatedAt)],
  //   with: {
  //     snapshots: {
  //       where: (model, { eq }) => eq(model.league, league),
  //     },
  //   },
  // });

  return res;
}
