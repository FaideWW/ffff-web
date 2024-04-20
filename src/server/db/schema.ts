import { relations } from "drizzle-orm";
import {
  bigint,
  bigserial,
  index,
  integer,
  json,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const jewels = pgTable(
  "jewels",
  {
    id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
    jewelType: text("jewelType").notNull(),
    jewelClass: text("jewelClass").notNull(),
    allocatedNode: text("allocatedNode").notNull(),
    stashId: text("stashId").notNull(),
    league: text("league").notNull(),
    itemId: text("itemId").unique().notNull(),
    listPriceAmount: real("listPriceAmount").notNull(),
    listPriceCurrency: text("listPriceCurrency").notNull(),
    lastChangeId: text("lastChangeId").notNull(),
    recordedAt: timestamp("recordedAt").notNull(),
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
    changeId: text("changeId").unique().notNull(),
    nextChangeId: text("nextChangeId").unique().notNull(),
    stashCount: integer("stashCount").notNull(),
    processedAt: timestamp("processedAt").notNull(),
    timeTaken: integer("timeTaken").notNull(),
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
  exchangeRates: json("exchangeRates").notNull().$type<ExchangeRates>(),
  generatedAt: timestamp("generatedAt").notNull(),
});

export const snapshotSetsRelations = relations(snapshotSets, ({ many }) => ({
  snapshots: many(snapshots),
}));

export const snapshots = pgTable("snapshots", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  setId: bigint("setId", { mode: "number" })
    .notNull()
    .references(() => snapshotSets.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  jewelType: text("jewelType").notNull(),
  jewelClass: text("jewelClass").notNull(),
  allocatedNode: text("allocatedNode").notNull(),
  league: text("league").notNull(),
  minPrice: real("minPrice").notNull(),
  firstQuartilePrice: real("firstQuartilePrice").notNull(),
  medianPrice: real("medianPrice").notNull(),
  thirdQuartilePrice: real("thirdQuartilePrice").notNull(),
  maxPrice: real("maxPrice").notNull(),
  windowPrice: real("windowPrice").notNull(),
  stddev: real("stddev").notNull(),
  numListed: integer("numListed").notNull(),
  generatedAt: timestamp("generatedAt").notNull(),
});

export const snapshotsRelations = relations(snapshots, ({ one }) => ({
  snapshotSets: one(snapshotSets, {
    fields: [snapshots.setId],
    references: [snapshotSets.id],
  }),
}));
