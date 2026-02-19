export const detectRegion = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (timezone.includes("Lagos")) return "NG";
  if (timezone.includes("New_York")) return "US";
  if (timezone.includes("London")) return "GB";
  if (timezone.includes("Riyadh")) return "SA";
  if (timezone.includes("Dubai")) return "AE";

  return "NG"; // fallback
};
