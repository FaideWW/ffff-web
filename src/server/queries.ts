import "server-only";
import db from "./db";
import { changesets, snapshotSets } from "./db/schema";
import { desc, sql } from "drizzle-orm";

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
  return res;
}

export interface PerfSample {
  processedAt: Date;
  driftFromHead: number;
  timeTaken: number;
  stashCount: number;
}

// Will return n rows where the rows are sampled from an equal distribution between
// `since` and the current time.
// If fewer than n rows exist in that timespan, all rows are returned
export async function sampleRiverReadPerformance(since: Date, n: number = 100) {
  const distribution = await db.execute(sql`select s.* from (
  select ${changesets.processedAt}, ${changesets.driftFromHead}, ${changesets.timeTaken}, ${changesets.stashCount},
  row_number() over(order by ${changesets.processedAt}) as rn,
  count(*) over() as total_rows
  from ${changesets} 
  where ${changesets.processedAt} > ${since}
) s 
where s.total_rows < ${n} OR mod(s.rn,(s.total_rows / ${n})) = 0`);
  return distribution.rows.map(
    (row) =>
      ({
        processedAt: new Date(row.processedat as string),
        driftFromHead: row.driftfromhead,
        timeTaken: row.timetaken,
        stashCount: row.stashcount,
      }) as PerfSample,
  );
}
