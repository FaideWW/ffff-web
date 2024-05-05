"use client";

import { useRouter } from "next/navigation";

export default function LeagueSelector({
  leagues,
  active,
}: {
  leagues: string[];
  active: string;
}) {
  const router = useRouter();
  const onSelectLeague = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLeague = e.target.value;
    router.push(`/${nextLeague}`);
  };
  return (
    <select onChange={onSelectLeague} defaultValue={active}>
      {leagues.map((league) => {
        return (
          <option key={league} value={league}>
            {league}
          </option>
        );
      })}
    </select>
  );
}
