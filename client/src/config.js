export const API_BASE_URL = "https://skynets.onrender.com/api";
export const AUTH_STORAGE_KEY = "taskProAuth";

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "duhjiytxk";
export const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

// --- EKLENEN KISIMLAR ---
export const PRIORITY_COLORS = {
  low: "#8FA1D0",
  medium: "#E09CB5",
  high: "#BEDBB0",
  without: "rgba(255, 255, 255, 0.1)",
};

export const LABELS = [
  { color: "#8FA1D0", name: "Low" },
  { color: "#E09CB5", name: "Medium" },
  { color: "#BEDBB0", name: "High" },
  { color: "#5C5C5C", name: "Without" },
];
