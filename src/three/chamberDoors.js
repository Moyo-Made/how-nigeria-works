// Where each room's doors are, for anything else that has to know: the dais,
// which must not bury one, and the light that picks them out. The Senate's
// stand on the floor of the room clear of the dais (g10, r05). The House's are
// behind the ends of the lower parapet with officers' chairs in front of them
// (g08), so they open onto the lower landing rather than the floor.
export function doors({ BAND_Y: B, DAIS_MID, elevation }) {
  return elevation === "house"
    ? { x: 0.62 * B, width: 0.2 * B, height: 0.29 * B, base: DAIS_MID }
    : { x: 0.99 * B, width: 1.4, height: 2.3, base: 0 };
}
