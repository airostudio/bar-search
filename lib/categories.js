// Venue taxonomy. `adult: true` categories sit behind the 18+ age gate and the
// "include adult venues" toggle. `placesQuery` is the phrase sent to the
// Google Places API when live search is enabled.
export const CATEGORIES = [
  { id: "bar",             label: "Bar",                icon: "🍸", placesQuery: "bar" },
  { id: "pub",             label: "Pub",                icon: "🍺", placesQuery: "pub" },
  { id: "cocktail_bar",    label: "Cocktail Bar",       icon: "🍹", placesQuery: "cocktail bar" },
  { id: "wine_bar",        label: "Wine Bar",           icon: "🍷", placesQuery: "wine bar" },
  { id: "sports_bar",      label: "Sports Bar",         icon: "🏈", placesQuery: "sports bar" },
  { id: "rooftop_bar",     label: "Rooftop Bar",        icon: "🌆", placesQuery: "rooftop bar" },
  { id: "beach_bar",       label: "Beach Bar",          icon: "🏖️", placesQuery: "beach bar" },
  { id: "karaoke_bar",     label: "Karaoke Bar",        icon: "🎤", placesQuery: "karaoke bar" },
  { id: "nightclub",       label: "Nightclub",          icon: "🪩", placesQuery: "night club" },
  { id: "lgbtq_bar",       label: "LGBTQ+ Bar",         icon: "🏳️‍🌈", placesQuery: "gay bar" },
  { id: "hookah_lounge",   label: "Hookah Lounge",      icon: "💨", placesQuery: "hookah lounge" },
  { id: "gentlemens_club", label: "Gentlemen's Club",   icon: "🔞", adult: true, placesQuery: "strip club" },
  { id: "hostess_bar",     label: "Hostess Bar",        icon: "🥂", adult: true, placesQuery: "hostess bar" },
  { id: "host_bar",        label: "Host Bar",           icon: "🕴️", adult: true, placesQuery: "host club" },
  { id: "cabaret",         label: "Cabaret / Burlesque", icon: "🎭", adult: true, placesQuery: "cabaret club" },
  { id: "adult_lounge",    label: "Adult Lounge",       icon: "🌙", adult: true, placesQuery: "adult entertainment lounge" },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const ADULT_CATEGORY_IDS = new Set(
  CATEGORIES.filter((c) => c.adult).map((c) => c.id)
);
