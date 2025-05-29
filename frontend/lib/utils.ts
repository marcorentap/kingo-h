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

export function TimeAgo({ timestamp }: { timestamp: Date }): string {
  const diffMs = Date.now() - timestamp.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  let value: number, unit: string;

  if (diffSec < 60) {
    value = diffSec;
    unit = diffSec === 1 ? "second" : "seconds";
  } else if (diffSec < 3600) {
    value = Math.floor(diffSec / 60);
    unit = value === 1 ? "minute" : "minutes";
  } else if (diffSec < 86400) {
    value = Math.floor(diffSec / 3600);
    unit = value === 1 ? "hour" : "hours";
  } else {
    value = Math.floor(diffSec / 86400);
    unit = value === 1 ? "day" : "days";
  }

  return `${value} ${unit}`;
}
