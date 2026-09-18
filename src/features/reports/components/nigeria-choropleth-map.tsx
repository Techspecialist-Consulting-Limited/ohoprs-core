"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";

import nigeriaLgasGeo from "@/data/nigeria-lgas.geo.json";
import nigeriaStatesGeo from "@/data/nigeria-states.geo.json";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { householdService } from "@/services/household.service";
import type { ReportLgaMetric, ReportStateMetric } from "@/types/report";
import type { HouseholdLookupResult } from "@/types/household";

export type MapMetricKey = "beneficiaryCount" | "estimatedAmountDistributed" | "interventionCount" | "distributionCount";
type LgaMetricKey = "beneficiaryCount" | "estimatedAmountDistributed";

const metricOptions: Array<{ id: MapMetricKey; label: string }> = [
  { id: "beneficiaryCount", label: "Beneficiaries Reached" },
  { id: "estimatedAmountDistributed", label: "Amount Disbursed" },
  { id: "interventionCount", label: "Active Interventions" },
  { id: "distributionCount", label: "Distributions" },
];

const lgaMetricOptions: Array<{ id: LgaMetricKey; label: string }> = [
  { id: "beneficiaryCount", label: "Beneficiaries Reached" },
  { id: "estimatedAmountDistributed", label: "Amount Disbursed" },
];

const stateGeoData = nigeriaStatesGeo as unknown as FeatureCollection<Geometry, Record<string, unknown>>;
const lgaGeoData = nigeriaLgasGeo as unknown as FeatureCollection<Geometry, { state: string; lga: string }>;

function mixColor(from: [number, number, number], to: [number, number, number], t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(from[0] + (to[0] - from[0]) * clamped);
  const g = Math.round(from[1] + (to[1] - from[1]) * clamped);
  const b = Math.round(from[2] + (to[2] - from[2]) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

const EMPTY_COLOR = "rgb(233, 236, 233)";
const LOW_COLOR: [number, number, number] = [211, 236, 214];
const HIGH_COLOR: [number, number, number] = [22, 92, 39];

function formatMetricValue(metric: MapMetricKey | LgaMetricKey, value: number) {
  if (metric === "estimatedAmountDistributed") {
    return formatCurrency(value);
  }
  return formatNumber(value);
}

function resolveStateName(feature: Feature<Geometry, Record<string, unknown>>): string | null {
  const name = feature.properties?.name;
  return typeof name === "string" && name.length > 0 ? name : null;
}

const WIDTH = 480;
const HEIGHT = 480;

export function NigeriaChoroplethMap({
  data,
  lgaData,
  selectedState,
  onSelectState,
}: {
  data: ReportStateMetric[];
  lgaData: ReportLgaMetric[];
  selectedState?: string;
  onSelectState?: (state: string | null) => void;
}) {
  const [metric, setMetric] = useState<MapMetricKey>("beneficiaryCount");
  const [lgaMetric, setLgaMetric] = useState<LgaMetricKey>("beneficiaryCount");
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [hoveredLga, setHoveredLga] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [drillDownState, setDrillDownState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedHousehold, setHighlightedHousehold] = useState<HouseholdLookupResult | null>(null);
  const debouncedSearch = useDebouncedValue(searchTerm, 250);

  const searchQuery = useQuery({
    queryKey: ["household-lookup", debouncedSearch],
    queryFn: () => householdService.searchHouseholds(debouncedSearch),
    enabled: debouncedSearch.trim().length > 1,
  });

  const metricByState = useMemo(() => {
    const map = new Map<string, ReportStateMetric>();
    data.forEach((item) => map.set(item.state, item));
    return map;
  }, [data]);

  const metricByLga = useMemo(() => {
    const map = new Map<string, ReportLgaMetric>();
    lgaData.forEach((item) => map.set(`${item.state}::${item.lga}`, item));
    return map;
  }, [lgaData]);

  const maxStateValue = useMemo(() => Math.max(1, ...data.map((item) => item[metric] as number)), [data, metric]);

  const stateProjection = useMemo(() => geoMercator().fitSize([WIDTH, HEIGHT], stateGeoData), []);
  const statePathGenerator = useMemo(() => geoPath(stateProjection), [stateProjection]);

  const drilledFeatures = useMemo(
    () => (drillDownState ? lgaGeoData.features.filter((feature) => feature.properties.state === drillDownState) : []),
    [drillDownState],
  );

  const lgaProjection = useMemo(() => {
    if (!drilledFeatures.length) {
      return null;
    }
    return geoMercator().fitSize([WIDTH, HEIGHT], { type: "FeatureCollection", features: drilledFeatures });
  }, [drilledFeatures]);

  const lgaPathGenerator = useMemo(() => (lgaProjection ? geoPath(lgaProjection) : null), [lgaProjection]);

  const maxLgaValue = useMemo(() => {
    if (!drilledFeatures.length) {
      return 1;
    }
    const values = drilledFeatures.map(
      (feature) => metricByLga.get(`${feature.properties.state}::${feature.properties.lga}`)?.[lgaMetric] ?? 0,
    );
    return Math.max(1, ...values);
  }, [drilledFeatures, metricByLga, lgaMetric]);

  const hoveredStateMetric = hoveredState ? metricByState.get(hoveredState) : null;
  const hoveredLgaMetric = hoveredLga ? metricByLga.get(hoveredLga) : null;
  const hoveredLgaName = hoveredLga?.split("::")[1] ?? null;

  function handleSelectHousehold(result: HouseholdLookupResult) {
    setHighlightedHousehold(result);
    setDrillDownState(result.state);
    setSearchTerm("");
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
            Find a household
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by household ID, recipient name, or address"
            className="focus-ring h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:border-accent"
          />
        </label>
        {searchTerm.trim().length > 1 && searchQuery.data?.data ? (
          <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
            {searchQuery.data.data.length ? (
              searchQuery.data.data.map((result) => (
                <button
                  key={result.householdId}
                  type="button"
                  onClick={() => handleSelectHousehold(result)}
                  className="flex w-full flex-col items-start gap-0.5 border-b border-border px-4 py-3 text-left text-sm last:border-b-0 hover:bg-surface-muted"
                >
                  <span className="font-semibold text-foreground">{result.unifiedHouseholdId} — {result.designatedRecipientName}</span>
                  <span className="text-xs text-muted">{result.address}, {result.lga}, {result.state}</span>
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-muted">No households match that search.</p>
            )}
          </div>
        ) : null}
      </div>

      {highlightedHousehold ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-foreground">{highlightedHousehold.unifiedHouseholdId} — {highlightedHousehold.designatedRecipientName}</p>
            <p className="text-muted">{highlightedHousehold.address}, {highlightedHousehold.lga}, {highlightedHousehold.state}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/households/${highlightedHousehold.householdId}`} className="font-semibold text-accent hover:underline">
              View Household
            </Link>
            <button type="button" onClick={() => setHighlightedHousehold(null)} className="font-semibold text-muted hover:text-foreground">
              Clear
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {(drillDownState ? lgaMetricOptions : metricOptions).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => (drillDownState ? setLgaMetric(option.id as LgaMetricKey) : setMetric(option.id as MapMetricKey))}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              (drillDownState ? lgaMetric : metric) === option.id
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-surface text-muted hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {drillDownState ? (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-muted px-4 py-2 text-sm">
          <span>
            Showing local government areas in <span className="font-semibold text-foreground">{drillDownState}</span>
          </span>
          <button type="button" onClick={() => setDrillDownState(null)} className="font-semibold text-accent hover:underline">
            Back to National View
          </button>
        </div>
      ) : null}

      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={drillDownState ? `Map of local government areas in ${drillDownState}` : "Map of Nigeria showing intervention coverage by state"}
          className="mx-auto h-auto w-full max-w-4xl"
        >
          {!drillDownState
            ? stateGeoData.features.map((feature: Feature<Geometry, Record<string, unknown>>, index: number) => {
                const stateName = resolveStateName(feature);
                const metricRow = stateName ? metricByState.get(stateName) : undefined;
                const value = metricRow ? (metricRow[metric] as number) : 0;
                const isSelected = selectedState && stateName === selectedState;
                const fill = metricRow && value > 0 ? mixColor(LOW_COLOR, HIGH_COLOR, value / maxStateValue) : EMPTY_COLOR;

                return (
                  <path
                    key={stateName ?? index}
                    d={statePathGenerator(feature) ?? undefined}
                    fill={fill}
                    stroke={isSelected ? "var(--color-accent)" : "var(--color-surface)"}
                    strokeWidth={isSelected ? 2 : 1}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onMouseEnter={(event) => {
                      setHoveredState(stateName);
                      setTooltipPosition({ x: event.clientX, y: event.clientY });
                    }}
                    onMouseMove={(event) => setTooltipPosition({ x: event.clientX, y: event.clientY })}
                    onMouseLeave={() => {
                      setHoveredState(null);
                      setTooltipPosition(null);
                    }}
                    onClick={() => {
                      if (!stateName) {
                        return;
                      }
                      onSelectState?.(selectedState === stateName ? null : stateName);
                    }}
                  />
                );
              })
            : drilledFeatures.map((feature, index) => {
                const lgaName = feature.properties.lga;
                const key = `${feature.properties.state}::${lgaName}`;
                const metricRow = metricByLga.get(key);
                const value = metricRow?.[lgaMetric] ?? 0;
                const isHighlighted = highlightedHousehold?.lga === lgaName && highlightedHousehold.state === drillDownState;
                const fill = value > 0 ? mixColor(LOW_COLOR, HIGH_COLOR, value / maxLgaValue) : EMPTY_COLOR;

                return (
                  <path
                    key={key ?? index}
                    d={lgaPathGenerator?.(feature) ?? undefined}
                    fill={fill}
                    stroke={isHighlighted ? "var(--color-accent)" : "var(--color-surface)"}
                    strokeWidth={isHighlighted ? 2.5 : 1}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onMouseEnter={(event) => {
                      setHoveredLga(key);
                      setTooltipPosition({ x: event.clientX, y: event.clientY });
                    }}
                    onMouseMove={(event) => setTooltipPosition({ x: event.clientX, y: event.clientY })}
                    onMouseLeave={() => {
                      setHoveredLga(null);
                      setTooltipPosition(null);
                    }}
                  />
                );
              })}
        </svg>

        {hoveredState && tooltipPosition && !drillDownState ? (
          <div
            className="pointer-events-none fixed z-50 min-w-[12rem] rounded-2xl border border-border bg-surface p-3 text-xs shadow-lg"
            style={{ left: tooltipPosition.x + 12, top: tooltipPosition.y + 12 }}
          >
            <p className="text-sm font-semibold text-foreground">{hoveredState}</p>
            <p className="mt-1 text-muted">{hoveredStateMetric?.region ?? "Region unknown"}</p>
            <dl className="mt-2 space-y-1">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Beneficiaries</dt>
                <dd className="font-medium text-foreground">{formatNumber(hoveredStateMetric?.beneficiaryCount ?? 0)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Amount Disbursed</dt>
                <dd className="font-medium text-foreground">{formatCurrency(hoveredStateMetric?.estimatedAmountDistributed ?? 0)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Active Interventions</dt>
                <dd className="font-medium text-foreground">{formatNumber(hoveredStateMetric?.interventionCount ?? 0)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Distributions</dt>
                <dd className="font-medium text-foreground">{formatNumber(hoveredStateMetric?.distributionCount ?? 0)}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        {hoveredLga && tooltipPosition && drillDownState ? (
          <div
            className="pointer-events-none fixed z-50 min-w-[12rem] rounded-2xl border border-border bg-surface p-3 text-xs shadow-lg"
            style={{ left: tooltipPosition.x + 12, top: tooltipPosition.y + 12 }}
          >
            <p className="text-sm font-semibold text-foreground">{hoveredLgaName}</p>
            <p className="mt-1 text-muted">{drillDownState}</p>
            <dl className="mt-2 space-y-1">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Beneficiaries</dt>
                <dd className="font-medium text-foreground">{formatNumber(hoveredLgaMetric?.beneficiaryCount ?? 0)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Amount Disbursed</dt>
                <dd className="font-medium text-foreground">{formatCurrency(hoveredLgaMetric?.estimatedAmountDistributed ?? 0)}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-3 text-xs text-muted">
        <span>Low {formatMetricValue(drillDownState ? lgaMetric : metric, 0)}</span>
        <div
          className="h-2 w-32 rounded-full"
          style={{ background: `linear-gradient(to right, ${mixColor(LOW_COLOR, HIGH_COLOR, 0)}, ${mixColor(LOW_COLOR, HIGH_COLOR, 1)})` }}
        />
        <span>High {formatMetricValue(drillDownState ? lgaMetric : metric, drillDownState ? maxLgaValue : maxStateValue)}</span>
      </div>

      {selectedState ? (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-muted px-4 py-2 text-sm">
          <span>
            Filtered to <span className="font-semibold text-foreground">{selectedState}</span>
          </span>
          <div className="flex items-center gap-3">
            {!drillDownState ? (
              <button type="button" onClick={() => setDrillDownState(selectedState)} className="font-semibold text-accent hover:underline">
                View LGAs
              </button>
            ) : null}
            <button type="button" onClick={() => onSelectState?.(null)} className="font-semibold text-accent hover:underline">
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
