"use server";

import { ExchangeRates } from "@/server/db/schema";
import { getLatestJewelSnapshotAndLeagues } from "@/server/queries";
import { RowData } from "@tanstack/react-table";
import LeagueSelector from "./LeagueDropdown";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { pairJewels } from "./pairJewels";

export default async function Home({ params }: { params: { league: string } }) {
  const league = decodeURIComponent(params.league);
  const [jewels, leagues] = await getLatestJewelSnapshotAndLeagues(league);
  if (jewels === undefined) {
    console.log("no jewels, returning null");
    return null;
  }
  const pairs = pairJewels(jewels, league);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Forbidden Flame/Flesh Finder
      </h1>
      <LeagueSelector
        leagues={leagues.map(({ league }) => league)}
        active={league}
      />
      <DataTable
        data={pairs}
        columns={columns}
        meta={{ exchangeRates: jewels.exchangeRates }}
      />
    </main>
  );
}
