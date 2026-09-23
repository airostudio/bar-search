// Ride-hailing options offered once the user picks a specific alternative
// bar. Uber's rider deep link format is official and stable, and works
// worldwide — "pickup=my_location" lets Uber's own app/site resolve the
// user's position, so it works even without our own geolocation. Where
// Uber isn't the dominant operator, we also name the locally dominant app:
// Grab's deep-link scheme is documented and well known, so it gets the
// destination prefilled too; the others are linked to the operator's own
// site (consistent with this app's "deep link, don't guess" approach — see
// lib/links.js) rather than guessing at an unverified deep-link format.

const GRAB_COUNTRIES = new Set(["SG", "MY", "ID", "PH", "TH", "VN", "KH", "MM"]);

const NAMED_APPS = [
  { id: "careem", label: "Careem",    countries: ["AE", "SA", "EG", "JO", "PK", "MA", "QA", "KW", "BH", "OM", "LB", "IQ"], url: "https://www.careem.com/" },
  { id: "ola",    label: "Ola",       countries: ["IN"], url: "https://www.olacabs.com/" },
  { id: "didi",   label: "DiDi",      countries: ["CN", "MX", "CO", "CL", "PE", "CR", "DO", "PA"], url: "https://www.didiglobal.com/" },
  { id: "99",     label: "99",        countries: ["BR"], url: "https://99app.com/" },
  { id: "yandex", label: "Yandex Go", countries: ["RU", "KZ", "BY", "AM", "KG", "UZ", "GE", "AZ"], url: "https://go.yandex/" },
  { id: "bolt",   label: "Bolt",      countries: ["EE", "LV", "LT", "PL", "RO", "HU", "GR", "PT", "ZA", "NG", "KE", "GH", "TN"], url: "https://bolt.eu/" },
  { id: "cabify", label: "Cabify",    countries: ["ES", "AR", "UY", "EC", "PY"], url: "https://cabify.com/" },
];

export function uberDeepLink({ lat, lng, name }) {
  const params = new URLSearchParams({
    action: "setPickup",
    pickup: "my_location",
    "dropoff[latitude]": lat,
    "dropoff[longitude]": lng,
    "dropoff[nickname]": name || "",
  });
  return `https://m.uber.com/ul/?${params}`;
}

export function grabDeepLink({ lat, lng, name }) {
  const params = new URLSearchParams({
    screenType: "BOOKING",
    dropOffLatitude: lat,
    dropOffLongitude: lng,
    dropOffKeyword: name || "",
  });
  return `grab://open?${params}`;
}

export function rideshareSearchUrl(country) {
  return `https://www.google.com/search?q=${encodeURIComponent(`ride hailing taxi app in ${country || ""}`)}`;
}

// Returns [{ id, label, url }] for the destination venue. Always includes
// Uber when we know the destination's coordinates; adds the locally
// dominant app by country when we recognize one; falls back to a plain
// search link if we don't recognize the country at all.
export function rideshareOptions({ countryCode, lat, lng, name, country }) {
  const options = [];
  if (lat != null && lng != null) {
    options.push({ id: "uber", label: "Uber", url: uberDeepLink({ lat, lng, name }) });
    if (GRAB_COUNTRIES.has(countryCode)) {
      options.push({ id: "grab", label: "Grab", url: grabDeepLink({ lat, lng, name }) });
    }
  }

  const named = NAMED_APPS.find((a) => a.countries.includes(countryCode));
  if (named && !options.some((o) => o.id === named.id)) {
    options.push({ id: named.id, label: named.label, url: named.url });
  }

  if (!options.length) {
    options.push({ id: "search", label: "Find a ride-hailing app", url: rideshareSearchUrl(country || countryCode) });
  }

  return options;
}
