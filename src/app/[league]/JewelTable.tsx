"use client";

import { jewels } from "@/server/db/schema";
import { JewelPair } from "./pairJewels";
import { useMemo, useState } from "react";

// If the rounding rules allow, prefer to display the price as a unit of this
// currency in order of priority
const PREFERRED_CURRENCY = ["mirror", "divine"];

// assumption: valueInChaos is always at least 1. maybe enforce this on the river side
function roundCurrency(
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

interface TableProps {
  data: JewelPair[];
  exchangeRates: Record<string, number>;
}

export default function JewelTable({ data, exchangeRates }: TableProps) {
  const [sortOrder, setSortOrder] = useState<
    Array<{ facet: keyof JewelPair; asc: boolean }>
  >([
    { facet: "class", asc: true },
    { facet: "sum", asc: false },
  ]);
  const sortedJewels = useMemo(() => {
    return data.toSorted((a, b) => {
      let diff = 0;
      let orderIdx = 0;
      while (diff === 0 && orderIdx < sortOrder.length) {
        const { facet, asc } = sortOrder[orderIdx];
        const facetA = a[facet];
        const facetB = b[facet];
        if (typeof facetA === "string" && typeof facetB === "string") {
          diff = asc
            ? facetA.localeCompare(facetB)
            : facetB.localeCompare(facetA);
        } else if (typeof facetA === "number" && typeof facetB === "number") {
          diff = asc ? facetA - facetB : facetB - facetA;
        }
        orderIdx++;
      }

      return diff;
    });
  }, [data, sortOrder]);

  const addSort = (facet: keyof JewelPair, defaultAsc: boolean) => {
    setSortOrder((arr) => {
      const idx = arr.findIndex((x) => x.facet === facet);
      if (idx === -1) {
        return [{ facet, asc: defaultAsc }, ...arr];
      } else if (idx === 0) {
        return [{ facet, asc: !arr[0].asc }, ...arr.slice(1)];
      }

      return [
        { facet, asc: defaultAsc },
        ...arr.slice(0, idx),
        ...arr.slice(idx + 1),
      ];
    });
  };

  console.log(sortOrder);

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          <th></th>
          <th colSpan={2} onClick={() => addSort("sum", false)}>
            Price
          </th>
        </tr>
        <tr>
          <th onClick={() => addSort("class", true)}>Class</th>
          <th onClick={() => addSort("node", true)}>Node</th>
          <th onClick={() => addSort("flame", false)}>Forbidden Flame</th>
          <th onClick={() => addSort("flesh", false)}>Forbidden Flesh</th>
        </tr>
      </thead>
      <tbody>
        {sortedJewels.map((jewel) => {
          const flamePrice = roundCurrency(jewel.flame, exchangeRates);
          const fleshPrice = roundCurrency(jewel.flesh, exchangeRates);
          const totalPrice = roundCurrency(jewel.sum, exchangeRates);
          return (
            <tr key={jewel.node}>
              <td>{jewel.class}</td>
              <td>{jewel.node}</td>
              <td>
                {flamePrice}(
                <a href={jewel.flameQuery} target="_blank">
                  Trade
                </a>
                ){" "}
              </td>
              <td>
                {fleshPrice}(
                <a href={jewel.fleshQuery} target="_blank">
                  Trade
                </a>
                ){" "}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
