"use client";

import { Button } from "@/components/ui/button";
import type { Column, ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { roundCurrency, type JewelPair } from "./pairJewels";

function sortableColumn(text: string, column: Column<JewelPair, unknown>) {
  const SortArrow =
    column.getIsSorted() === false
      ? ChevronsUpDown
      : column.getIsSorted() === "asc"
        ? ChevronUp
        : ChevronDown;
  return (
    <Button
      variant="ghost"
      className="w-full text-left"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {text}
      <SortArrow className="ml-2 h-4 w-4" />
    </Button>
  );
}

export const columns: ColumnDef<JewelPair>[] = [
  {
    accessorKey: "class",
    header: ({ column }) => sortableColumn("Class", column),
    filterFn: (row, columnId: string, filterValue: unknown[]) => {
      if (filterValue.length === 0) {
        return true;
      }
      return filterValue.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "node",
    header: ({ column }) => sortableColumn("Node", column),
  },
  {
    accessorKey: "flame",
    header: ({ column }) => sortableColumn("Forbidden Flame", column),
    cell: ({ table, row }) => {
      return (
        <div>
          {roundCurrency(
            row.getValue("flame"),
            table.options.meta!.exchangeRates,
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "flesh",
    header: ({ column }) => sortableColumn("Forbidden Flesh", column),
    cell: ({ table, row }) => {
      return (
        <div>
          {roundCurrency(
            row.getValue("flesh"),
            table.options.meta!.exchangeRates,
          )}
        </div>
      );
    },
  },
];
