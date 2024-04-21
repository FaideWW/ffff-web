import Home from "@/app/[league]/page";
import { redirect } from "next/navigation";

export default async function Page() {
  redirect(`/${process.env.DEFAULT_LEAGUE}`);
  // return <Home params={{ league: process.env.DEFAULT_LEAGUE! }} />;
}
