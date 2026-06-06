export const nigeriaRegions = [
  "North Central",
  "North East",
  "North West",
  "South East",
  "South South",
  "South West",
] as const;

export type NigeriaRegion = (typeof nigeriaRegions)[number];

export const nigeriaRegionStates: Record<NigeriaRegion, string[]> = {
  "North Central": ["Benue", "FCT", "Kogi", "Kwara", "Nasarawa", "Niger", "Plateau"],
  "North East": ["Adamawa", "Bauchi", "Borno", "Gombe", "Taraba", "Yobe"],
  "North West": ["Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Sokoto", "Zamfara"],
  "South East": ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"],
  "South South": ["Akwa Ibom", "Bayelsa", "Cross River", "Delta", "Edo", "Rivers"],
  "South West": ["Ekiti", "Lagos", "Ogun", "Ondo", "Osun", "Oyo"],
};

export const nigeriaStates = Object.values(nigeriaRegionStates).flat();

export function getStatesForRegions(regions: string[]) {
  return regions
    .flatMap((region) => nigeriaRegionStates[region as NigeriaRegion] ?? [])
    .filter((state, index, allStates) => allStates.indexOf(state) === index)
    .sort((left, right) => left.localeCompare(right));
}

export function getRegionForState(state: string) {
  const entry = Object.entries(nigeriaRegionStates).find(([, states]) => states.includes(state));
  return entry?.[0] ?? null;
}
