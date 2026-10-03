/* Live, public data for Support Near You. Only the ZIP code leaves the device.
   - ZIP -> place: Zippopotam.us
   - Health centers: HRSA Health Center Service Delivery Sites (federally funded, sliding-fee)
   - Grocery stores & farmers markets that accept SNAP/EBT: USDA SNAP Retailer Locator data */

const HRSA = "https://gisportal.hrsa.gov/server/rest/services/HealthCareFacilities/PrimaryHealthCareFacilities_FS/MapServer/0/query";
const SNAP = "https://services1.arcgis.com/RLQu0rK7h4kbsBq5/arcgis/rest/services/snap_retailer_location_data/FeatureServer/0/query";

export const validZip = (z) => /^\d{5}$/.test(z || "");

export async function lookupZip(zip) {
  const r = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!r.ok) throw new Error("ZIP not found");
  const j = await r.json();
  const p = j.places?.[0];
  if (!p) throw new Error("ZIP not found");
  return { zip, city: p["place name"], state: p["state abbreviation"], stateName: p.state, lat: Number(p.latitude), lon: Number(p.longitude) };
}

function miles(a, b, c, d) {
  const R = 3958.8, t = Math.PI / 180;
  const x = Math.sin(((c - a) * t) / 2) ** 2 + Math.cos(a * t) * Math.cos(c * t) * Math.sin(((d - b) * t) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

async function near(url, where, fields, place, radius, count) {
  const q = new URLSearchParams({
    where, geometry: `${place.lon},${place.lat}`, geometryType: "esriGeometryPoint", inSR: "4326",
    spatialRel: "esriSpatialRelIntersects", distance: String(radius), units: "esriSRUnit_StatuteMile",
    outFields: fields, returnGeometry: "true", outSR: "4326", resultRecordCount: String(count), f: "json",
  });
  const r = await fetch(`${url}?${q}`);
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || "Lookup failed");
  return (j.features || []).map((f) => ({ ...f.attributes, mi: miles(place.lat, place.lon, f.geometry.y, f.geometry.x) })).sort((a, b) => a.mi - b.mi);
}

const titleCase = (s = "") => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bLlc\b/g, "LLC");
const cleanUrl = (u = "") => (!u ? "" : u.startsWith("http") ? u : `https://${u}`);

export async function healthCenters(place) {
  for (const radius of [10, 25]) {
    const rows = await near(HRSA, "HCC_STATUS_DESC='Active' AND HCC_LOC_SETTING_DESC<>'School'",
      "SITE_NM,SITE_PHONE_NUM,SITE_URL,SITE_ADDRESS,SITE_CITY,SITE_STATE_ABBR,SITE_ZIP_CD,GRANTEE_NM", place, radius, 200);
    if (rows.length || radius === 25) {
      return rows.slice(0, 6).map((x) => ({
        name: x.SITE_NM, org: titleCase(x.GRANTEE_NM), phone: x.SITE_PHONE_NUM, url: cleanUrl(x.SITE_URL),
        address: `${x.SITE_ADDRESS}, ${x.SITE_CITY}, ${x.SITE_STATE_ABBR} ${String(x.SITE_ZIP_CD || "").slice(0, 5)}`, mi: x.mi,
      }));
    }
  }
  return [];
}

export async function snapStores(place) {
  for (const radius of [3, 10]) {
    const rows = await near(SNAP, "Store_Type IN ('Supermarket','Super Store','Farmers and Markets')",
      "Store_Name,Store_Street_Address,City,State,Zip_Code,Store_Type", place, radius, 200);
    if (rows.length >= 3 || radius === 10) {
      return rows.slice(0, 6).map((x) => ({
        name: titleCase(x.Store_Name).replace(/\s+\d+$/, ""), type: x.Store_Type === "Farmers and Markets" ? "Farmers market" : "Grocery store",
        address: `${titleCase(x.Store_Street_Address)}, ${titleCase(x.City)}, ${x.State} ${x.Zip_Code}`, mi: x.mi,
      }));
    }
  }
  return [];
}

export const mapsLink = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
export const telLink = (p = "") => "tel:" + p.replace(/[^\d]/g, "");

// Official finders, each opened with her ZIP where the site supports it.
export function resourceGroups(zip) {
  return [
    { id: "food", label: "Food support", icon: "ShoppingBasket", items: [
      { name: "WIC", detail: "Healthy foods, nutrition counseling and breastfeeding help during pregnancy, postpartum and for children under 5.", links: [["How to apply", "https://www.fna.usda.gov/wic/apply"], ["Check eligibility", "https://www.fna.usda.gov/wic/eligibility-tool"]] },
      { name: "SNAP", detail: "Monthly grocery benefits on an EBT card. Apply through your state.", links: [["Your state's SNAP office", "https://www.fna.usda.gov/snap/state-directory"]] },
      { name: "Food banks", detail: "Free groceries through Feeding America's network of local food banks and pantries.", links: [["Find my food bank", "https://www.feedingamerica.org/find-your-local-foodbank"]] },
      { name: "Local food pantries & meals", detail: `Free and reduced-cost programs near ${zip}.`, links: [[`Search near ${zip}`, `https://www.findhelp.org/search_results/${zip}`]] },
    ] },
    { id: "health", label: "Healthcare", icon: "Stethoscope", items: [
      { name: "Community health centers", detail: "Prenatal and postpartum care on a sliding-fee scale, whatever your insurance status. See the live list above.", links: [["HRSA health center finder", "https://findahealthcenter.hrsa.gov/"]] },
      { name: "Medicaid & CHIP", detail: "Covers pregnancy care, and most states now cover 12 months after birth. You can apply any time of year.", links: [["Apply or check coverage", "https://www.healthcare.gov/medicaid-chip/"]] },
    ] },
    { id: "transport", label: "Transportation", icon: "Bus", items: [
      { name: "Rides to appointments", detail: "Medicaid covers free non-emergency rides to medical visits. Call the member number on your Medicaid card to book.", links: [] },
      { name: "211", detail: "Local transportation help and other programs, 24/7.", links: [["Call 211", "tel:211"], ["211.org", "https://www.211.org/"]] },
    ] },
    { id: "mental", label: "Mental wellness", icon: "HeartHandshake", items: [
      { name: "National Maternal Mental Health Hotline", detail: "Free, confidential support 24/7 by call or text, in English and Spanish.", links: [["Call or text 1-833-TLC-MAMA", "tel:18338526262"]] },
      { name: "Postpartum Support International", detail: "HelpLine (call or text) 1-800-944-4773, free online support groups, and a directory of perinatal mental health providers.", links: [["Call the HelpLine", "tel:18009444773"], ["Free online groups", "https://postpartum.net/get-help/psi-online-support-meetings/"], ["Find a provider", "https://psidirectory.com/"]] },
      { name: "988 Suicide & Crisis Lifeline", detail: "If you're in crisis or thinking about harming yourself, call or text 988.", links: [["Call or text 988", "tel:988"]] },
    ] },
    { id: "lactation", label: "Lactation support", icon: "Baby", items: [
      { name: "WIC breastfeeding peer counselors", detail: "Free help from mothers who've been there, through your local WIC clinic.", links: [["Contact WIC", "https://www.fna.usda.gov/wic/apply"]] },
      { name: "La Leche League USA", detail: "Free local and virtual meetings with trained leaders.", links: [["Find a leader near me", "https://lllusa.org/locator/"]] },
    ] },
    { id: "housing", label: "Housing & bills", icon: "Building2", items: [
      { name: "211", detail: "Rent, utility and housing help near you.", links: [["Call 211", "tel:211"], [`Search near ${zip}`, `https://www.findhelp.org/search_results/${zip}`]] },
    ] },
    { id: "supplies", label: "Baby supplies", icon: "Baby", items: [
      { name: "Diaper banks", detail: "Free diapers and wipes through the National Diaper Bank Network.", links: [["Member directory", "https://nationaldiaperbanknetwork.org/member-directory/"], [`Search near ${zip}`, `https://www.findhelp.org/search_results/${zip}`]] },
    ] },
  ];
}
