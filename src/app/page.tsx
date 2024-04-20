import { getLatestJewelSnapshot } from "@/server/queries";

// TODO: move the pairing logic into the stat collection job, so we can just feed the data directly from the DB into the table
function pairJewels(
  jewels: Awaited<ReturnType<typeof getLatestJewelSnapshot>>
) {
  if (jewels === undefined) return [];
  interface PairMap {
    node: string;
    class: string;
    flame: number;
    flesh: number;
  }

  const jewelPairs: PairMap[] = [];
  const jewelMap: Record<string, Partial<PairMap>> = {};
  for (let i = 0; i < jewels.snapshots.length; i++) {
    const jewel = jewels.snapshots[i];
    if (!jewelMap[jewel.allocatedNode]) {
      jewelMap[jewel.allocatedNode] = {
        node: jewel.allocatedNode,
        class: jewel.jewelClass,
      };
    }
    if (jewel.jewelType === "Forbidden Flesh") {
      jewelMap[jewel.allocatedNode].flesh = jewel.windowPrice;
    } else if (jewel.jewelType === "Forbidden Flame") {
      jewelMap[jewel.allocatedNode].flame = jewel.windowPrice;
    }

    if (
      jewelMap[jewel.allocatedNode].flesh !== undefined &&
      jewelMap[jewel.allocatedNode].flame !== undefined
    ) {
      jewelPairs.push(jewelMap[jewel.allocatedNode] as PairMap);
    }
  }

  return jewelPairs;
}

export default async function Home() {
  const jewels = await getLatestJewelSnapshot(process.env.DEFAULT_LEAGUE!);
  const pairs = pairJewels(jewels);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Forbidden Flame/Flesh Finder</h1>
      <table>
        <thead>
          <tr>
            <th>Node</th>
            <th>Class</th>
            <th>Flame Price</th>
            <th>Flesh Price</th>
            <th>Trade</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((jewel) => {
            return (
              <tr key={jewel.node}>
                <td>{jewel.node}</td>
                <td>{jewel.class}</td>
                <td>{jewel.flame}</td>
                <td>{jewel.flesh}</td>
                <td>
                  <a href="#">Trade</a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
