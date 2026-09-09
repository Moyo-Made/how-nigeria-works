import { createContext, useContext } from "react";

// One chamber's plan and palette, handed to the geometry that draws it.
//
// Context rather than props because the room is drawn by half a dozen
// components nested several deep, and threading a plan through all of them
// would mean every one of them knowing about a room it does not otherwise care
// which of. The provider sits inside the Canvas, so the R3F tree can read it.
export const ChamberContext = createContext(null);

export const useChamber = () => useContext(ChamberContext);
