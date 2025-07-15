export interface LocationItem {
    placeName: string;
    placeId: string;
    parentName: string;
    parentId: string;
}

export function getLocationParts(location?: LocationItem[]): { name: string, id: string }[] {
    if (!location || location.length === 0) return [];
    // Build a map from place-id to its parent-id and place-name
    const placeIdToParentId: Record<string, string> = {};
    const placeIdToName: Record<string, string> = {};
    const parentIdSet = new Set<string>();
    location.forEach(item => {
        placeIdToParentId[item.placeId] = item.parentId;
        placeIdToName[item.placeId] = item.placeName;
        placeIdToName[item.parentId] = item.parentName;
        parentIdSet.add(item.parentId);
    });
    // Find the most specific place (not referenced as a parent-id anywhere)
    let start = location.find(item => !parentIdSet.has(item.placeId));
    if (!start) start = location[0]; // fallback
    // Reconstruct the chain
    const parts = [{ name: placeIdToName[start.placeId], id: start.placeId }];
    let current = start.placeId;
    while (placeIdToParentId[current]) {
        const next = placeIdToParentId[current];
        parts.push({ name: placeIdToName[next], id: next });
        current = next;
    }
    return parts.reverse(); // most general first
}
