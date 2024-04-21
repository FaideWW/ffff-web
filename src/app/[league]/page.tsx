import { getLatestJewelSnapshotAndLeagues } from "@/server/queries";
import JewelTable from "./JewelTable";
import LeagueSelector from "./LeagueDropdown";
import { pairJewels } from "./pairJewels";

export default async function Home({ params }: { params: { league: string } }) {
  const league = decodeURIComponent(params.league);
  const [jewels, leagues] = await getLatestJewelSnapshotAndLeagues(league);
  if (jewels === undefined) {
    console.log("no jewels, returning null");
    return null;
  }
  const pairs = pairJewels(jewels, league);

  const onSelectLeague = (e: React.ChangeEvent) => {
    console.log(e);
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <h1>Forbidden Flame/Flesh Finder</h1>
      <LeagueSelector
        leagues={leagues.map(({ league }) => league)}
        active={league}
      />
      <JewelTable data={pairs} exchangeRates={jewels.exchangeRates} />
    </main>
  );
}
