const amazonURL = (query) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;

export const VITAMINS = {
  iron: {
    label: "Iron",
    why: "Iron carries oxygen to you and your baby. Low iron causes fatigue, increases preterm birth risk, and affects your baby's brain development. Black mothers are twice as likely to be iron-deficient during pregnancy.",
    foods: [
      { emoji: "🥩", name: "Beef / Goat / Oxtail", amount: "3oz", nutrient: "3mg" },
      { emoji: "🫘", name: "Lentils / Dal / Mujaddara", amount: "1 cup", nutrient: "6.6mg" },
      { emoji: "🥬", name: "Spinach / Callaloo / Saag", amount: "1 cup cooked", nutrient: "6.4mg" },
      { emoji: "🫘", name: "Blackeyed Peas", amount: "1 cup", nutrient: "4.3mg" },
      { emoji: "🐟", name: "Sardines", amount: "3oz", nutrient: "2.5mg" },
      { emoji: "🥣", name: "Fortified oatmeal", amount: "1 cup", nutrient: "3.4mg" },
    ],
    tip: "Eat iron-rich foods with Vitamin C (orange juice, bell pepper, tomato) — it can triple absorption.",
    supplements: [
      { brand: "Slow Fe Iron", form: "Tablet (slow release)", dose: "1/day", price: "$10–14", url: amazonURL("Slow Fe iron supplement 45mg") },
      { brand: "Nature Made Iron 65mg", form: "Tablet", dose: "1/day", price: "$8–12", url: amazonURL("Nature Made Iron 65mg tablet") },
      { brand: "Floradix Iron + Herbs", form: "Liquid", dose: "10mL 2×/day", price: "$22–28", url: amazonURL("Floradix liquid iron supplement") },
      { brand: "Garden of Life Raw Iron", form: "Capsule (whole food)", dose: "1/day", price: "$18–24", url: amazonURL("Garden of Life Raw Iron capsule") },
    ],
  },
  folate: {
    label: "Folate",
    why: "Folate prevents neural tube defects in the first weeks of pregnancy — often before you even know you're pregnant. It also supports healthy placenta development and reduces risk of premature birth.",
    foods: [
      { emoji: "🫘", name: "Lentils / Black beans / Dal", amount: "1 cup", nutrient: "180–358mcg" },
      { emoji: "🥬", name: "Spinach / Collards", amount: "1 cup", nutrient: "263mcg" },
      { emoji: "🫘", name: "Blackeyed Peas", amount: "1 cup", nutrient: "210mcg" },
      { emoji: "🥚", name: "Eggs", amount: "2 eggs", nutrient: "44mcg" },
      { emoji: "🥬", name: "Callaloo / Collard Greens", amount: "1 cup", nutrient: "88mcg" },
      { emoji: "🫘", name: "Chana / Chickpeas", amount: "1 cup", nutrient: "160mcg" },
    ],
    tip: "Look for methylfolate on the label — it's the active form your body uses directly, especially important if you have the MTHFR gene variant (common in Latina women).",
    supplements: [
      { brand: "Thorne Methylfolate", form: "Capsule", dose: "1/day (1mg)", price: "$16–20", url: amazonURL("Thorne methylfolate 1mg capsule") },
      { brand: "Nature's Way Folate", form: "Capsule", dose: "1/day (800mcg)", price: "$10–14", url: amazonURL("Nature's Way folate 800mcg") },
      { brand: "Solgar Metafolin", form: "Tablet", dose: "1/day", price: "$14–18", url: amazonURL("Solgar folate metafolin 800mcg") },
    ],
  },
  calcium: {
    label: "Calcium",
    why: "Calcium builds your baby's bones and teeth. If you don't get enough, your body pulls calcium from your own bones — which increases your long-term risk of osteoporosis. Most Black and Latina mothers are lactose-sensitive.",
    foods: [
      { emoji: "🥬", name: "Collard Greens / Callaloo / Saag", amount: "1 cup", nutrient: "268mg" },
      { emoji: "🐟", name: "Canned sardines (with bones)", amount: "3oz", nutrient: "325mg" },
      { emoji: "🧀", name: "Paneer / Cheese", amount: "1oz", nutrient: "200mg" },
      { emoji: "🥛", name: "Fortified oat / almond / soy milk", amount: "1 cup", nutrient: "300mg" },
      { emoji: "🫘", name: "White beans / Tofu", amount: "1 cup", nutrient: "130mg" },
      { emoji: "🌿", name: "Okra / Bok choy", amount: "1 cup", nutrient: "82mg" },
    ],
    tip: "Take calcium and iron supplements at different times of day — they compete for absorption.",
    supplements: [
      { brand: "Citracal Petites", form: "Tablet (citrate)", dose: "2 tabs 2×/day", price: "$14–18", url: amazonURL("Citracal calcium citrate petites") },
      { brand: "Bluebonnet Calcium Citrate + D3", form: "Capsule", dose: "3/day", price: "$18–24", url: amazonURL("Bluebonnet calcium citrate magnesium D3") },
    ],
  },
  vitaminD: {
    label: "Vitamin D",
    why: "Vitamin D helps your body absorb calcium and supports immune function. Darker skin produces less Vitamin D from sunlight — so Black, brown, and South Asian mothers are at especially high risk of deficiency.",
    foods: [
      { emoji: "🐟", name: "Salmon / Mackerel", amount: "3oz", nutrient: "570 IU" },
      { emoji: "🐟", name: "Catfish / Sardines", amount: "3oz", nutrient: "193–425 IU" },
      { emoji: "🥚", name: "Egg yolks", amount: "2 eggs", nutrient: "82 IU" },
      { emoji: "🥛", name: "Fortified milk / plant milk", amount: "1 cup", nutrient: "100–120 IU" },
      { emoji: "🍄", name: "UV-exposed mushrooms", amount: "3oz", nutrient: "400 IU" },
    ],
    tip: "Most prenatal vitamins only have 400 IU — studies suggest 1000–2000 IU is safer for most pregnant women. Ask your provider.",
    supplements: [
      { brand: "Nordic Naturals D3", form: "Softgel (2000 IU)", dose: "1/day", price: "$12–16", url: amazonURL("Nordic Naturals vitamin D3 2000 IU softgel") },
      { brand: "Carlson D Drops", form: "Liquid drops (1000 IU)", dose: "1 drop/day", price: "$14–18", url: amazonURL("Carlson vitamin D drops 1000 IU") },
      { brand: "Thorne D/K2", form: "Liquid drops", dose: "2 drops/day", price: "$16–22", url: amazonURL("Thorne vitamin D K2 liquid drops") },
    ],
  },
  omega3: {
    label: "Omega-3",
    why: "DHA (an omega-3) is critical for your baby's brain and eye development — especially in the third trimester and during breastfeeding. Low DHA is linked to postpartum depression and preterm birth.",
    foods: [
      { emoji: "🐟", name: "Salmon (wild)", amount: "3oz", nutrient: "1800mg DHA" },
      { emoji: "🐟", name: "Sardines / Mackerel", amount: "3oz", nutrient: "1100mg" },
      { emoji: "🐟", name: "Catfish / Tilapia", amount: "3oz", nutrient: "280mg" },
      { emoji: "🌰", name: "Walnuts", amount: "1oz", nutrient: "2500mg ALA" },
      { emoji: "🌱", name: "Flaxseed (ground)", amount: "2 tbsp", nutrient: "3500mg ALA" },
    ],
    tip: "ALA from plant sources (walnuts, flax) converts poorly to DHA. If you don't eat fatty fish 2x/week, a supplement is recommended.",
    supplements: [
      { brand: "Nordic Naturals Prenatal DHA", form: "Softgel", dose: "2/day (830mg DHA)", price: "$28–36", url: amazonURL("Nordic Naturals prenatal DHA 830mg") },
      { brand: "Garden of Life Prenatal DHA", form: "Softgel (algae-based)", dose: "1/day", price: "$22–28", url: amazonURL("Garden of Life prenatal DHA algae") },
      { brand: "Barlean's Omega Swirl (lemon)", form: "Liquid", dose: "1 tbsp/day", price: "$18–24", url: amazonURL("Barlean's omega swirl lemon") },
    ],
  },
  prenatal: {
    label: "Prenatal",
    why: "A good prenatal covers your bases — but not all prenatals are equal. Look for methylfolate (not just folic acid), iron ≥27mg, DHA, and Vitamin D ≥1000 IU. Avoid any with artificial dyes.",
    foods: [],
    tip: "Take your prenatal with food to reduce nausea. If it still bothers you, try taking it at night or switching to a gummy form.",
    supplements: [
      { brand: "Ritual Essential Prenatal", form: "Capsule (delayed release)", dose: "2/day", price: "$35/mo", url: amazonURL("Ritual Essential Prenatal vitamin"), note: "Best for sensitive stomachs. Minty scent." },
      { brand: "Garden of Life mykind Prenatal", form: "Tablet (whole food)", dose: "3/day", price: "$28/mo", url: amazonURL("Garden of Life mykind prenatal organic"), note: "Certified organic, vegan, no synthetics." },
      { brand: "Nature Made Prenatal + DHA", form: "Softgel", dose: "1/day", price: "$18/mo", url: amazonURL("Nature Made prenatal multivitamin DHA"), note: "Most affordable. Widely available at CVS, Walmart, Target." },
    ],
  },
};

export const STORE_LINKS = [
  { name: "CVS",        url: "https://www.google.com/maps/search/CVS+pharmacy+near+me" },
  { name: "Walgreens",  url: "https://www.google.com/maps/search/Walgreens+near+me" },
  { name: "Walmart",    url: "https://www.google.com/maps/search/Walmart+near+me" },
  { name: "Target",     url: "https://www.google.com/maps/search/Target+near+me" },
  { name: "Whole Foods",url: "https://www.google.com/maps/search/Whole+Foods+near+me" },
  { name: "Pharmacy",   url: "https://www.google.com/maps/search/pharmacy+near+me" },
];
