import { sampleRiverReadPerformance } from "@/server/queries";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Fragment } from "react";

const MINUTES = 60 * 1000;
const HOURS = 60 * MINUTES;
const DAYS = 24 * HOURS;

const PerfCharts = dynamic(() => import("./PerfCharts"), { ssr: false });

function getDateFromQuery(queryDate: string | string[] | undefined) {
  let dateStr = queryDate;
  if (Array.isArray(dateStr)) {
    dateStr = dateStr[0];
  }
  if (dateStr === undefined) {
    dateStr = "6h";
  }

  let date = new Date(dateStr);
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date;
  }

  // If the query param wasn't a parseable date, test the format NNd/NNh/NNm

  let ago = HOURS * 3;
  const dateFormatRegex = /(\d+)([dhm])/i;
  const match = dateStr.match(dateFormatRegex);
  if (match !== null) {
    const value = parseInt(match[1]);
    let units = null;
    switch (match[2].toLowerCase()) {
      case "m":
        units = MINUTES;
        break;
      case "h":
        units = HOURS;
        break;
      case "d":
        units = DAYS;
        break;
    }

    if (units !== null) {
      ago = value * units;
    }
  }

  return new Date(Date.now() - ago);
}

const presetDurations = ["30m", "60m", "3h", "6h", "1d"];

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const startTime = getDateFromQuery(searchParams.since);
  const data = await sampleRiverReadPerformance(startTime, 500);

  return (
    <div>
      <div className="flex justify-end gap-1 mx-10 my-4">
        {presetDurations.map((d, i) => (
          <Fragment key={d}>
            <Link href={`?since=${d}`}>{d}</Link>
            {i < presetDurations.length - 1 ? "|" : null}
          </Fragment>
        ))}
      </div>
      <PerfCharts data={data} since={startTime} />
    </div>
  );
}
