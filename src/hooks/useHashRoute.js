import { useEffect, useState } from "react";

// Interiors route separately from specimens rather than joining the institution
// list: a chamber is a room inside an institution, not another institution, and
// putting one in the rail would misstate the shape of government the rail exists
// to show.
const parse = (hash) => {
  const chamber = hash.match(/^#\/c\/([\w-]+)/);
  if (chamber) return { route: "chamber", id: chamber[1] };

  const match = hash.match(/^#\/i\/([\w-]+)/);
  return match ? { route: "specimen", id: match[1] } : { route: "library", id: null };
};

export function useHashRoute() {
  const [location, setLocation] = useState(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => setLocation(parse(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return location;
}

export const navigate = (to) => {
  window.location.hash = to;
};

export const toLibrary = () => navigate("/");
export const toInstitution = (id) => navigate(`/i/${id}`);
export const toChamber = (id) => navigate(`/c/${id}`);
