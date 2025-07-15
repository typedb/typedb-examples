export interface LocationItem {
    "place-name": string;
    "place-id": string;
    "parent-name": string;
    "parent-id": string;
}

export function getLocationParts(location?: LocationItem[]): { name: string, id: string }[] {
    if (!location || location.length === 0) return [];
    // Build a map from place-id to its parent-id and place-name
    const placeIdToParentId: Record<string, string> = {};
    const placeIdToName: Record<string, string> = {};
    const parentIdSet = new Set<string>();
    location.forEach(item => {
        placeIdToParentId[item["place-id"]] = item["parent-id"];
        placeIdToName[item["place-id"]] = item["place-name"];
        placeIdToName[item["parent-id"]] = item["parent-name"];
        parentIdSet.add(item["parent-id"]);
    });
    // Find the most specific place (not referenced as a parent-id anywhere)
    let start = location.find(item => !parentIdSet.has(item["place-id"]));
    if (!start) start = location[0]; // fallback
    // Reconstruct the chain
    const parts = [{ name: placeIdToName[start["place-id"]], id: start["place-id"] }];
    let current = start["place-id"];
    while (placeIdToParentId[current]) {
        const next = placeIdToParentId[current];
        parts.push({ name: placeIdToName[next], id: next });
        current = next;
    }
    return parts.reverse(); // most general first
}
