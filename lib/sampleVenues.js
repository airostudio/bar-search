// DEMO DATASET — illustrative venues (names are fictional) placed at real
// city coordinates, so the site is fully browsable with no API key.
// Set GOOGLE_PLACES_API_KEY in .env to switch to live, real-world results
// for every country. See README.md.

const v = (id, name, category, city, countryCode, lat, lng, rating, price, description) => ({
  id, name, category, city, countryCode, lat, lng, rating, price, description, demo: true,
});

export const SAMPLE_VENUES = [
  // Americas
  v("us-nyc-1", "The Copper Still", "cocktail_bar", "New York", "US", 40.7233, -73.9874, 4.7, 3, "Speakeasy-style cocktail den in the Lower East Side."),
  v("us-nyc-2", "End Zone Tavern", "sports_bar", "New York", "US", 40.7527, -73.9819, 4.3, 2, "Wall-to-wall screens, wings, and game-day crowds."),
  v("us-lv-1", "Velvet Mirage", "gentlemens_club", "Las Vegas", "US", 36.1147, -115.1728, 4.2, 4, "Upscale gentlemen's club just off the Strip."),
  v("us-no-1", "Brass Note Cabaret", "cabaret", "New Orleans", "US", 29.9584, -90.0644, 4.6, 3, "Burlesque and live brass on Frenchmen Street."),
  v("ca-tor-1", "Maple & Rye", "bar", "Toronto", "CA", 43.6487, -79.3817, 4.5, 2, "Canadian whisky bar with 200+ bottles."),
  v("mx-cdmx-1", "Cantina La Luna", "bar", "Mexico City", "MX", 19.4326, -99.1332, 4.4, 2, "Classic cantina with mezcal flights in Centro."),
  v("br-rio-1", "Boteco do Mar", "beach_bar", "Rio de Janeiro", "BR", -22.9838, -43.2045, 4.5, 2, "Caipirinhas on the sand at Ipanema."),
  v("br-sp-1", "Neon Paulista", "nightclub", "São Paulo", "BR", -23.5614, -46.6559, 4.3, 3, "Warehouse club on Rua Augusta, open till sunrise."),
  v("ar-ba-1", "Bodega Tango Roja", "wine_bar", "Buenos Aires", "AR", -34.5997, -58.3819, 4.6, 2, "Malbec-first wine bar in Palermo."),
  v("co-med-1", "Cielo Rooftop", "rooftop_bar", "Medellín", "CO", 6.2088, -75.5679, 4.5, 3, "Rooftop views over El Poblado."),
  v("cl-scl-1", "Barrio Piscola", "pub", "Santiago", "CL", -33.4372, -70.6344, 4.2, 1, "Neighborhood pub famous for piscolas."),
  v("pe-lim-1", "La Catedral del Pisco", "cocktail_bar", "Lima", "PE", -12.1211, -77.0297, 4.7, 2, "Pisco sours in a Barranco townhouse."),

  // Europe
  v("gb-lon-1", "The Hound & Crown", "pub", "London", "GB", 51.5136, -0.1365, 4.4, 2, "Victorian pub in Soho with cask ales."),
  v("gb-lon-2", "Aurora Show Lounge", "cabaret", "London", "GB", 51.5101, -0.1340, 4.3, 3, "Late-night cabaret and drag revue."),
  v("ie-dub-1", "Whelan's Corner", "pub", "Dublin", "IE", 53.3438, -6.2673, 4.6, 2, "Trad sessions nightly off Grafton Street."),
  v("fr-par-1", "Le Chat Noir Moderne", "cabaret", "Paris", "FR", 48.8841, 2.3324, 4.4, 3, "Modern cabaret at the foot of Montmartre."),
  v("fr-par-2", "Bar à Vin Rive Gauche", "wine_bar", "Paris", "FR", 48.8530, 2.3387, 4.6, 3, "Natural wines and small plates in the Latin Quarter."),
  v("de-ber-1", "Klub Spektrum", "nightclub", "Berlin", "DE", 52.5111, 13.4399, 4.5, 2, "Techno institution in a converted power plant."),
  v("de-mun-1", "Alte Braustube", "pub", "Munich", "DE", 48.1374, 11.5755, 4.5, 2, "Bavarian beer hall with litre steins."),
  v("nl-ams-1", "Canal House Taproom", "bar", "Amsterdam", "NL", 52.3740, 4.8897, 4.4, 2, "Dutch craft beer on the Prinsengracht."),
  v("es-mad-1", "Vermutería El Sol", "bar", "Madrid", "ES", 40.4168, -3.7038, 4.5, 1, "Vermouth on tap and conservas since forever."),
  v("es-ibz-1", "Sunset Salinas", "beach_bar", "Ibiza", "ES", 38.8443, 1.3968, 4.4, 3, "Balearic beats at golden hour."),
  v("it-rom-1", "Enoteca Trastevere", "wine_bar", "Rome", "IT", 41.8897, 12.4694, 4.6, 2, "Candle-lit enoteca on a cobbled lane."),
  v("pt-lis-1", "Fado & Gin", "cocktail_bar", "Lisbon", "PT", 38.7139, -9.1334, 4.5, 2, "Gin library with live fado in Bairro Alto."),
  v("cz-prg-1", "U Zlatého Soudku", "pub", "Prague", "CZ", 50.0875, 14.4213, 4.6, 1, "Tank pilsner poured three ways."),
  v("pl-waw-1", "Wódka i Śledź", "bar", "Warsaw", "PL", 52.2319, 21.0067, 4.4, 1, "Vodka-and-herring bar, open late."),
  v("gr-ath-1", "Acropolis View 360", "rooftop_bar", "Athens", "GR", 37.9769, 23.7268, 4.5, 3, "Rooftop cocktails facing the Parthenon."),
  v("tr-ist-1", "Nargile Sarayı", "hookah_lounge", "Istanbul", "TR", 41.0138, 28.9497, 4.4, 2, "Ottoman-style hookah lounge near the Grand Bazaar."),
  v("se-sto-1", "Isbaren Norr", "bar", "Stockholm", "SE", 59.3327, 18.0656, 4.3, 3, "Sub-zero ice bar, parkas provided."),
  v("is-rey-1", "Norðurljós Bar", "bar", "Reykjavík", "IS", 64.1466, -21.9426, 4.5, 3, "Craft brennivín cocktails under the northern lights."),

  // Asia
  v("jp-tok-1", "Club Ginza Étoile", "hostess_bar", "Tokyo", "JP", 35.6717, 139.7650, 4.3, 4, "Classic Ginza hostess club with private booths."),
  v("jp-tok-2", "Host Club Prince", "host_bar", "Tokyo", "JP", 35.6938, 139.7034, 4.1, 4, "Kabukichō host club — champagne calls nightly."),
  v("jp-tok-3", "Golden Gai Hideout", "bar", "Tokyo", "JP", 35.6942, 139.7047, 4.7, 2, "Six-seat counter bar in Golden Gai."),
  v("jp-osa-1", "Karaoke Dotonbori Star", "karaoke_bar", "Osaka", "JP", 34.6687, 135.5013, 4.4, 2, "Private karaoke rooms above the canal."),
  v("kr-seo-1", "Gangnam Noraebang Deluxe", "karaoke_bar", "Seoul", "KR", 37.4979, 127.0276, 4.5, 2, "Luxury noraebang with tambourines included."),
  v("kr-seo-2", "Itaewon Alley Pub", "pub", "Seoul", "KR", 37.5345, 126.9946, 4.3, 2, "Craft beer alley staple in Itaewon."),
  v("cn-hk-1", "Lan Kwai Fong Social", "bar", "Hong Kong", "HK", 22.2810, 114.1551, 4.2, 3, "Cocktails at the heart of LKF."),
  v("sg-sin-1", "Clarke Quay Copperhead", "cocktail_bar", "Singapore", "SG", 1.2906, 103.8465, 4.5, 3, "Riverside slings and tiki flights."),
  v("th-bkk-1", "Sky Orchid Rooftop", "rooftop_bar", "Bangkok", "TH", 13.7245, 100.5322, 4.6, 3, "Open-air rooftop 60 floors above Silom."),
  v("th-bkk-2", "Soi Cowboy Neon Club", "adult_lounge", "Bangkok", "TH", 13.7373, 100.5600, 3.9, 2, "Neon-lit adult nightlife on Soi Cowboy."),
  v("th-pat-1", "Walking Street A-Go-Go", "adult_lounge", "Pattaya", "TH", 12.9256, 100.8709, 3.8, 2, "Go-go bar on Walking Street."),
  v("ph-mnl-1", "Makati Muse KTV", "hostess_bar", "Manila", "PH", 14.5547, 121.0244, 4.0, 3, "KTV hostess lounge in Makati."),
  v("vn-hcm-1", "Bùi Viện Beer Corner", "pub", "Ho Chi Minh City", "VN", 10.7679, 106.6917, 4.2, 1, "Street-side bia hơi on the backpacker strip."),

  // Thailand
  v("th-cnx-1", "Nimman Night Bazaar Bar", "bar", "Chiang Mai", "TH", 18.7961, 98.9686, 4.3, 1, "Craft beer and street-food bites near the Night Bazaar."),
  v("th-cnx-2", "Old City Rooftop", "rooftop_bar", "Chiang Mai", "TH", 18.7883, 98.9853, 4.4, 2, "Sunset views over Chiang Mai's moat and temples."),
  v("th-phu-1", "Patong Tide Bar", "beach_bar", "Phuket", "TH", 7.8965, 98.2962, 4.2, 2, "Beachfront buckets and fire shows on Patong Beach."),
  v("th-phu-2", "Bangla Neon Club", "nightclub", "Phuket", "TH", 7.8994, 98.2969, 4.0, 2, "Dance floor chaos on Bangla Road."),
  v("th-phu-3", "Patong After Dark", "adult_lounge", "Phuket", "TH", 7.8978, 98.2971, 3.8, 2, "Go-go bar strip off Bangla Road."),
  v("th-krb-1", "Ao Nang Chill Bar", "beach_bar", "Krabi", "TH", 8.0316, 98.8236, 4.4, 1, "Laid-back reggae bar facing the limestone cliffs."),
  v("th-ksm-1", "Chaweng Beach Club", "nightclub", "Koh Samui", "TH", 9.5375, 100.0617, 4.3, 3, "Beachfront club with fire dancers and DJs."),
  v("th-kph-1", "Haad Rin Moon Bar", "beach_bar", "Koh Phangan", "TH", 9.6725, 100.0672, 4.2, 1, "Full Moon Party headquarters on Haad Rin beach."),

  // Cambodia
  v("kh-pnh-1", "Riverside Sundowner", "bar", "Phnom Penh", "KH", 11.5694, 104.9282, 4.3, 1, "Tonlé Sap sunset views on Sisowath Quay."),
  v("kh-pnh-2", "Rooftop 240", "rooftop_bar", "Phnom Penh", "KH", 11.5625, 104.9160, 4.4, 2, "Skyline cocktails above Street 240."),
  v("kh-srp-1", "Pub Street Tavern", "pub", "Siem Reap", "KH", 13.3617, 103.8556, 4.3, 1, "50-cent draft beer on Siem Reap's Pub Street."),
  v("kh-srp-2", "Angkor Night Bazaar Bar", "bar", "Siem Reap", "KH", 13.3600, 103.8494, 4.2, 1, "Cocktails and live cover bands near the Night Market."),
  v("kh-shv-1", "Serendipity Beach Bar", "beach_bar", "Sihanoukville", "KH", 10.6104, 103.5297, 4.1, 1, "Hammocks and bonfires on Serendipity Beach."),
  v("kh-kpt-1", "Kampot River Lounge", "bar", "Kampot", "KH", 10.6167, 104.1833, 4.4, 1, "Riverside bar known for pepper-infused cocktails."),

  // Vietnam
  v("vn-han-1", "Tạ Hiện Beer Corner", "pub", "Hanoi", "VN", 21.0335, 105.8514, 4.4, 1, "Plastic-stool beer street in the Old Quarter."),
  v("vn-han-2", "West Lake Rooftop", "rooftop_bar", "Hanoi", "VN", 21.0480, 105.8342, 4.5, 2, "Sunset over West Lake with craft cocktails."),
  v("vn-dan-1", "My Khe Beach Bar", "beach_bar", "Da Nang", "VN", 16.0544, 108.2464, 4.3, 2, "Beach loungers and cocktails on My Khê Beach."),
  v("vn-hoi-1", "Lantern Alley Cocktails", "cocktail_bar", "Hoi An", "VN", 15.8801, 108.3380, 4.6, 2, "Riverside cocktails under Hội An's lanterns."),
  v("vn-nha-1", "Skylight Nha Trang", "rooftop_bar", "Nha Trang", "VN", 12.2451, 109.1943, 4.4, 3, "43rd-floor rooftop bar over the bay."),
  v("vn-vut-1", "Vung Tau Seaside Bar", "beach_bar", "Vung Tau", "VN", 10.3460, 107.0843, 4.1, 1, "Grilled seafood and beer facing the South China Sea."),

  v("id-bali-1", "Seminyak Tide Bar", "beach_bar", "Bali", "ID", -8.6913, 115.1571, 4.5, 2, "Sunset arak cocktails on Seminyak beach."),
  v("in-mum-1", "Bandra Bootleg", "cocktail_bar", "Mumbai", "IN", 19.0596, 72.8295, 4.4, 3, "Prohibition-themed bar in Bandra West."),
  v("ae-dxb-1", "Marina Pearl Lounge", "hookah_lounge", "Dubai", "AE", 25.0805, 55.1403, 4.4, 3, "Shisha and mocktails over the marina."),

  // Africa & Oceania
  v("za-cpt-1", "Long Street Jol", "nightclub", "Cape Town", "ZA", -33.9249, 18.4173, 4.3, 2, "Long Street dancefloor classic."),
  v("ng-lag-1", "Victoria Island Vibes", "nightclub", "Lagos", "NG", 6.4281, 3.4219, 4.4, 3, "Afrobeats till dawn on VI."),
  v("ke-nbo-1", "Westlands Whistle", "bar", "Nairobi", "KE", -1.2649, 36.8035, 4.3, 2, "Nyama choma and cold Tuskers in Westlands."),
  v("eg-cai-1", "Nile Moon Shisha", "hookah_lounge", "Cairo", "EG", 30.0459, 31.2243, 4.2, 2, "Nile-side shisha boat lounge."),
  v("au-syd-1", "The Rocks Alehouse", "pub", "Sydney", "AU", -33.8593, 151.2086, 4.5, 2, "Heritage sandstone pub near the Harbour Bridge."),
  v("au-mel-1", "Laneway Lumière", "cocktail_bar", "Melbourne", "AU", -37.8163, 144.9650, 4.7, 3, "Hidden laneway bar behind an unmarked door."),
  v("nz-akl-1", "Viaduct Quay Tap", "sports_bar", "Auckland", "NZ", -36.8429, 174.7628, 4.2, 2, "All Blacks games on the big screens."),
];
