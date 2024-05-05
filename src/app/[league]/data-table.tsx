"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  RowData,
  SortingState,
  TableMeta,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExchangeRates } from "@/server/db/schema";
import { ChevronDown, ListFilter } from "lucide-react";
import { useState } from "react";

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    exchangeRates: ExchangeRates;
  }
}

const CLASSES = [
  "Duelist",
  "Marauder",
  "Ranger",
  "Scion",
  "Shadow",
  "Templar",
  "Witch",
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta: TableMeta<TData>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: "class",
      value: [],
    },
  ]);
  const table = useReactTable({
    data,
    columns,
    meta,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  });

  const updateClassFilter = (opt: string) => {
    return (checked: boolean) => {
      table.getColumn("class")?.setFilterValue((c: string[]) => {
        let next = c;
        if (checked) {
          next = [...c, opt];
        } else {
          const idx = c.indexOf(opt);
          next = [...c.slice(0, idx), ...c.slice(idx + 1)];
        }

        return next;
      });
    };
  };

  return (
    <div>
      <div className="flex items-start py-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline">
              <ListFilter className="h-4 w-4" />
              Filter by Class
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onSelect={(e) => {
                table.getColumn("class")?.setFilterValue([]);
              }}
            >
              Show all
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {CLASSES.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt}
                checked={(
                  table.getColumn("class")?.getFilterValue() as string[]
                ).includes(opt)}
                onCheckedChange={updateClassFilter(opt)}
                onSelect={(e) => e.preventDefault()}
              >
                {opt}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
