import notableIdMap from "@/generated/notableIdMap.json";
import { ExchangeRates } from "@/server/db/schema";
import { getLatestJewelSnapshotAndLeagues } from "@/server/queries";

export interface JewelPair {
  node: string;
  class: string;
  ascendancy: string;
  flame: number;
  flesh: number;
  flameDisplay: string;
  fleshDisplay: string;
  sum: number;
  flameQuery: string;
  fleshQuery: string;
}

function buildTradeUrl(league: string, jewelType: string, notableName: string) {
  let baseType = "";
  let modId = "";
  if (jewelType === "Forbidden Flesh") {
    baseType = "Cobalt Jewel";
    modId = "explicit.stat_2460506030";
  } else {
    baseType = "Crimson Jewel";
    modId = "explicit.stat_1190333629";
  }
  const notableId = (notableIdMap as Record<string, number>)[notableName];
  if (notableId === undefined) {
    console.error(`No notableid found for node ${notableName}`);
  }
  const tradeQuery = `{"query":{"name":"${jewelType}","type":"${baseType}","stats":[{"type":"and","filters":[{"id":"${modId}","value":{"option":${notableId}},"disabled":false}],"disabled":false}],"status":{"option":"online"}}}
  `;

  const fullUrl = `https://pathofexile.com/trade/search/${league}/?q=${tradeQuery}`;
  return fullUrl;
}

// TODO: move the pairing logic into the stat collection job, so we can just feed the data directly from the DB into the table
export function pairJewels(
  jewels: Awaited<ReturnType<typeof getLatestJewelSnapshotAndLeagues>>[0],
  league: string,
): JewelPair[] {
  if (jewels === undefined) {
    console.error("no snapshot provided");
    return [];
  }

  const jewelPairs: JewelPair[] = [];
  const jewelMap: Record<string, Partial<JewelPair>> = {};
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
      jewelMap[jewel.allocatedNode].fleshDisplay = roundCurrency(
        jewel.windowPrice,
        jewels.exchangeRates,
      );
      jewelMap[jewel.allocatedNode].fleshQuery = buildTradeUrl(
        league,
        jewel.jewelType,
        jewel.allocatedNode,
      );
    } else if (jewel.jewelType === "Forbidden Flame") {
      jewelMap[jewel.allocatedNode].flame = jewel.windowPrice;
      jewelMap[jewel.allocatedNode].flameDisplay = roundCurrency(
        jewel.windowPrice,
        jewels.exchangeRates,
      );
      jewelMap[jewel.allocatedNode].flameQuery = buildTradeUrl(
        league,
        jewel.jewelType,
        jewel.allocatedNode,
      );
    }

    if (
      jewelMap[jewel.allocatedNode].flesh !== undefined &&
      jewelMap[jewel.allocatedNode].flame !== undefined
    ) {
      jewelMap[jewel.allocatedNode].sum =
        jewelMap[jewel.allocatedNode].flesh! +
        jewelMap[jewel.allocatedNode].flame!;
      jewelPairs.push(jewelMap[jewel.allocatedNode] as JewelPair);
    }
  }

  return jewelPairs;
}

// If the rounding rules allow, prefer to display the price as a unit of this
// currency in order of priority
const PREFERRED_CURRENCY = ["mirror", "divine"];

// assumption: valueInChaos is always at least 1. maybe enforce this on the river side
export function roundCurrency(
  valueInChaos: number,
  exchangeRates: Record<string, number>,
) {
  let finalCurrency = "chaos";
  let finalValue = valueInChaos;
  for (let i = 0; i < PREFERRED_CURRENCY.length; i++) {
    const c = PREFERRED_CURRENCY[i];
    const rate = exchangeRates[c];
    if (!rate) continue;
    const nextValue = finalValue / rate;
    if (nextValue >= 1) {
      finalValue = nextValue;
      finalCurrency = c;
    }
  }

  return `${finalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })} ${finalCurrency}`;
}
