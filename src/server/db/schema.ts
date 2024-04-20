import { relations } from "drizzle-orm";
import {
  bigint,
  bigserial,
  index,
  integer,
  json,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const jewels = pgTable(
  "jewels",
  {
    id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
    jewelType: text("jeweltype").notNull(),
    jewelClass: text("jewelclass").notNull(),
    allocatedNode: text("allocatednode").notNull(),
    stashId: text("stashid").notNull(),
    league: text("league").notNull(),
    itemId: text("itemid").unique().notNull(),
    listPriceAmount: real("listpriceamount").notNull(),
    listPriceCurrency: text("listpricecurrency").notNull(),
    lastChangeId: text("lastchangeid").notNull(),
    recordedAt: timestamp("recordedat").notNull(),
  },
  (jewels) => ({
    jewelsByStash: index("jewels_by_stash").on(jewels.stashId),
    jewelsByLeague: index("jewels_by_league").on(
      jewels.league,
      jewels.recordedAt
    ),
    jewelsByDate: index("jewels_by_date").on(jewels.recordedAt),
  })
);

export const changesets = pgTable(
  "changesets",
  {
    id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
    changeId: text("changeid").unique().notNull(),
    nextChangeId: text("nextchangeid").unique().notNull(),
    stashCount: integer("stashcount").notNull(),
    processedAt: timestamp("processedat").notNull(),
    timeTaken: integer("timetaken").notNull(),
  },
  (changesets) => ({
    changesetsByChangeId: index("changesets_by_changeid").on(
      changesets.changeId
    ),
    changeSetsByDate: index("changesets_by_date").on(changesets.processedAt),
  })
);

export type ExchangeRates = Record<string, Record<string, number>>;

export const snapshotSets = pgTable("snapshot_sets", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  exchangeRates: json("exchangerates").notNull().$type<ExchangeRates>(),
  generatedAt: timestamp("generatedat").notNull(),
});

export const snapshotSetsRelations = relations(snapshotSets, ({ many }) => ({
  snapshots: many(snapshots),
}));

export const snapshots = pgTable("snapshots", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  setId: bigint("setid", { mode: "number" })
    .notNull()
    .references(() => snapshotSets.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  jewelType: text("jeweltype").notNull(),
  jewelClass: text("jewelclass").notNull(),
  allocatedNode: text("allocatednode").notNull(),
  league: text("league").notNull(),
  minPrice: real("minprice").notNull(),
  firstQuartilePrice: real("firstquartileprice").notNull(),
  medianPrice: real("medianprice").notNull(),
  thirdQuartilePrice: real("thirdquartileprice").notNull(),
  maxPrice: real("maxprice").notNull(),
  windowPrice: real("windowprice").notNull(),
  stddev: real("stddev").notNull(),
  numListed: integer("numlisted").notNull(),
  generatedAt: timestamp("generatedat").notNull(),
});

export const snapshotsRelations = relations(snapshots, ({ one }) => ({
  snapshotSets: one(snapshotSets, {
    fields: [snapshots.setId],
    references: [snapshotSets.id],
  }),
}));
