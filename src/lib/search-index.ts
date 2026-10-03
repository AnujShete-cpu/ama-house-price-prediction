export type SearchHit = {
  id: string;
  title: string;
  hint: string;
  href: string;
  group: "Pages" | "Cities" | "Help";
};

export const SEARCH_INDEX: SearchHit[] = [
  { id: "home", title: "Home", hint: "Hero, how it works", href: "/", group: "Pages" },
  { id: "predict", title: "Predict price", hint: "Enter house details", href: "/predict", group: "Pages" },
  { id: "dashboard", title: "Dashboard", hint: "Stats, chart, history", href: "/dashboard", group: "Pages" },
  { id: "about", title: "About this project", hint: "Model, dataset, FAQ", href: "/about", group: "Pages" },
  { id: "login", title: "Login", hint: "Sign in or create account", href: "/login", group: "Pages" },
  { id: "pune", title: "Pune", hint: "Location / area", href: "/predict?city=Pune", group: "Cities" },
  { id: "mumbai", title: "Mumbai", hint: "Location / area", href: "/predict?city=Mumbai", group: "Cities" },
  { id: "thane", title: "Thane", hint: "Location / area", href: "/predict?city=Thane", group: "Cities" },
  { id: "nagpur", title: "Nagpur", hint: "Location / area", href: "/predict?city=Nagpur", group: "Cities" },
  { id: "blr", title: "Bangalore", hint: "Location / area", href: "/predict?city=Bangalore", group: "Cities" },
  { id: "hyd", title: "Hyderabad", hint: "Location / area", href: "/predict?city=Hyderabad", group: "Cities" },
  { id: "del", title: "Delhi NCR", hint: "Location / area", href: "/predict?city=Delhi%20NCR", group: "Cities" },
  { id: "chn", title: "Chennai", hint: "Location / area", href: "/predict?city=Chennai", group: "Cities" },
  { id: "faq-model", title: "Which model is used?", hint: "Linear + random forest ensemble", href: "/about#faq", group: "Help" },
  { id: "faq-data", title: "What dataset is used?", hint: "Indian housing features", href: "/about#dataset", group: "Help" },
  { id: "faq-accuracy", title: "How accurate are estimates?", hint: "Typical band of ±8–12%", href: "/about#faq", group: "Help" },
];

export function searchSite(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return SEARCH_INDEX.slice(0, 8);
  return SEARCH_INDEX.filter((hit) => {
    const blob = `${hit.title} ${hit.hint} ${hit.group}`.toLowerCase();
    return blob.includes(q);
  }).slice(0, 10);
}
