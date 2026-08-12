import { useEffect, useState } from "react";

const parse = (hash) => {
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
