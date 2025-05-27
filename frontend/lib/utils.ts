import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const pi = Math.PI;
  const phi1 = lat1 * (pi / 180);
  const phi2 = lat2 * (pi / 180);
  const delta_phi = (lat2 - lat1) * (pi / 180);
  const delta_lambda = (lon2 - lon1) * (pi / 180);
  const R = 6371000; // meters

  const a =
    Math.sin(delta_phi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(delta_lambda / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance; // in meters
}
