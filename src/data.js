// Amara Health — prototype content.
// Educational sample content for an interactive demo. Not medical advice.

const IMG = "https://amara1000.netlify.app/assets/img/";
export const img = (name, size = 800) => `${IMG}${name}${size ? `-${size}` : ""}.jpg`;

export const DISCLAIMER =
  "Amara provides educational nutrition guidance and does not replace advice from your healthcare professional.";

export const NUTRIENTS = {
  Iron: { color: "#C7613A", why: "Your blood volume grows by almost half in pregnancy, and iron helps carry oxygen to you and your baby. Needs rise to about 27 mg a day." },
  Protein: { color: "#3E4A2E", why: "Protein builds your baby's tissues and supports your own changing body, especially in the second and third trimesters." },
  Folate: { color: "#7A8A5A", why: "Folate supports your baby's brain and spinal cord development and helps your body make new cells. Needs rise to about 600 mcg a day." },
  Calcium: { color: "#B08A3E", why: "Calcium helps build your baby's bones and teeth while protecting your own. Aim for about 1,000 mg a day." },
  Fiber: { color: "#8C6A4F", why: "Fiber keeps digestion moving, which can help with pregnancy constipation, and keeps energy steady." },
  "Omega-3": { color: "#4F6B7A", why: "Omega-3 fats (DHA) support your baby's brain and eye development." },
  "Vitamin A": { color: "#D08A3A", why: "Vitamin A from foods supports vision, immunity and cell growth." },
  "Vitamin C": { color: "#E0B14C", why: "Vitamin C helps your body absorb plant-based iron, so pairing matters." },
  Potassium: { color: "#6F7F55", why: "Potassium supports fluid balance and healthy blood pressure." },
  Hydration: { color: "#5C8A94", why: "Fluids support your growing blood volume, amniotic fluid and digestion." },
  Energy: { color: "#A88B5A", why: "Steady carbohydrates fuel busy days, especially when you're tired." },
  "Healthy fats": { color: "#7D8F4E", why: "Healthy fats help you absorb vitamins A, D, E and K and keep you full." },
  Choline: { color: "#9C7B54", why: "Choline supports your baby's brain development; eggs are one of the richest sources." },
};

export const CUISINES = [
  { id: "west-african", name: "West African", img: "g-west-african-stew", pos: "50% 40%" },
  { id: "caribbean", name: "Caribbean", img: "g-caribbean-kitchen", pos: "40% 50%" },
  { id: "southern", name: "Southern / Soul Food", img: "g-leafy-greens", pos: "50% 50%" },
  { id: "east-african", name: "East African", img: "g-east-african-kitchen", pos: "50% 40%" },
  { id: "south-asian", name: "South Asian", img: "g-traditional-ingredients", pos: "50% 50%" },
  { id: "latin-american", name: "Latin American", img: "g-tortillas", pos: "50% 45%" },
  { id: "mediterranean", name: "Mediterranean", img: "g-meal-bowl", pos: "50% 50%" },
  { id: "east-asian", name: "East Asian", img: "g-east-asian-kitchen", pos: "50% 40%" },
  { id: "middle-eastern", name: "Middle Eastern", img: "g-middle-eastern-kitchen", pos: "50% 40%" },
];

export const FOODS = [
  {
    id: "waakye", name: "Waakye", cuisine: "west-african", origin: "Ghana", meal: "Lunch & dinner",
    img: "g-west-african-stew", pos: "60% 55%",
    nutrients: ["Protein", "Iron", "Folate", "Fiber"],
    stages: ["Pregnancy", "Postpartum"], symptoms: ["Tired"], budget: true, time: 60, diet: ["Vegetarian base"],
    context: "Rice and beans cooked together with dried sorghum leaves, which give waakye its deep red-brown color. A beloved Ghanaian breakfast and street food, usually served with shito, gari, egg, fish or stew.",
    why: "The beans bring plant protein, iron and folate, while the rice adds steady energy. Together they make a complete, filling base that's easy to build on.",
    considerations: ["Shito is rich and spicy. If heartburn or nausea is bothering you, try a little on the side.", "Make sure any eggs are cooked until the yolk is firm.", "Refrigerate leftover rice within 2 hours of cooking."],
    pairings: ["Boiled egg for extra protein and choline", "Tomato stew: its vitamin C helps you absorb the iron in the beans", "Fried or grilled fish, or avocado on the side"],
    swaps: ["Brown rice for more fiber", "Kidney beans or black-eyed peas, whichever you have"],
    makeItWork: "Short on time? Cook a big pot on Sunday. Waakye keeps 3 days in the fridge and reheats well with a splash of water.",
  },
  {
    id: "jollof", name: "Jollof rice", cuisine: "west-african", origin: "West Africa", meal: "Lunch & dinner",
    img: "g-community-meal", pos: "50% 75%",
    nutrients: ["Energy", "Vitamin C", "Vitamin A"],
    stages: ["Pregnancy", "Postpartum"], symptoms: ["Hungry"], budget: true, time: 50, diet: ["Vegetarian base"],
    context: "Rice simmered in a rich tomato, pepper and onion base. Every West African family, and every country, has its own version, and its own opinion about which one is best.",
    why: "Tomatoes and peppers bring vitamin C and vitamin A, and the rice gives you steady energy. Jollof becomes a balanced plate with the right partners.",
    considerations: ["Stock cubes add a lot of salt. Using half, plus extra herbs, keeps the flavor.", "Cool and refrigerate leftovers within 2 hours."],
    pairings: ["Chicken, fish or beans for protein", "Steamed vegetables or a side salad", "Plantain for potassium"],
    swaps: ["Stir in mixed vegetables while it cooks", "Try half brown rice for extra fiber"],
    makeItWork: "Jollof is already a good base. Add one protein and one vegetable and you have a complete pregnancy plate.",
  },
  {
    id: "black-eyed-peas", name: "Black-eyed peas", cuisine: "southern", origin: "West Africa & the American South", meal: "Any meal",
    img: "g-ingredients", pos: "55% 60%",
    nutrients: ["Folate", "Iron", "Protein", "Fiber"],
    stages: ["Pregnancy", "Planning", "Postpartum"], symptoms: ["Tired"], budget: true, time: 30, diet: ["Vegetarian", "Vegan"],
    context: "Carried from West Africa to the American South, black-eyed peas star in red-red, akara and the New Year's Hoppin' John. They mean luck, and they mean home.",
    why: "One cup cooked gives you more than half of your daily folate in pregnancy, plus iron, protein and fiber.",
    considerations: ["Canned is great. Rinse to cut the salt.", "If beans cause gas, start with smaller portions and add more over time."],
    pairings: ["Collard greens and tomatoes (vitamin C boosts iron absorption)", "Rice or cornbread", "Plantain in red-red"],
    swaps: ["Pinto, kidney or butter beans work the same way"],
    makeItWork: "Keep two cans in the pantry. Warm them with onion, tomato and spices for a 10-minute protein.",
  },
  {
    id: "collards", name: "Collard greens", cuisine: "southern", origin: "The American South", meal: "Sides",
    img: "g-leafy-greens", pos: "40% 50%",
    nutrients: ["Calcium", "Folate", "Vitamin A", "Fiber"],
    stages: ["Pregnancy", "Postpartum"], symptoms: [], budget: true, time: 45, diet: ["Vegetarian", "Vegan"],
    context: "Slow-cooked greens are at the heart of the Southern table, with roots in West African cooking. The broth, called pot likker, is treasured too.",
    why: "Collards are one of the best plant sources of calcium, with folate and vitamin A as well.",
    considerations: ["Smoked meats add salt. Smoked turkey with no added salt, or extra onion and vinegar, keeps the flavor.", "Wash well and cook until tender."],
    pairings: ["Black-eyed peas or beans", "Cornbread", "Sweet potato"],
    swaps: ["Kale, mustard or turnip greens", "Frozen chopped collards save time"],
    makeItWork: "Frozen collards with garlic and a splash of vinegar cook in 15 minutes.",
  },
  {
    id: "plantain", name: "Plantain", cuisine: "caribbean", origin: "Caribbean & West Africa", meal: "Any meal",
    img: "g-caribbean-kitchen", pos: "8% 70%",
    nutrients: ["Potassium", "Vitamin A", "Vitamin C", "Fiber"],
    stages: ["Pregnancy", "Postpartum"], symptoms: ["Nauseous", "Hungry"], budget: true, time: 15, diet: ["Vegetarian", "Vegan"],
    context: "Kelewele in Ghana, dodo in Nigeria, maduros and tostones across the Caribbean and Latin America. Sweet when ripe, savory when green.",
    why: "Plantain gives you potassium, fiber and, when ripe, vitamin A. It's gentle and satisfying when your appetite is unpredictable.",
    considerations: ["Fried plantain is delicious, and boiled or roasted are lighter options for heartburn days."],
    pairings: ["Eggs or beans for protein", "Red-red stew", "Avocado"],
    swaps: ["Sweet potato", "Green banana"],
    makeItWork: "Air-fry or oven-roast ripe plantain slices in 12 minutes.",
  },
  {
    id: "egusi", name: "Egusi soup", cuisine: "west-african", origin: "Nigeria", meal: "Dinner",
    img: "g-west-african-stew", pos: "35% 55%",
    nutrients: ["Protein", "Iron", "Healthy fats", "Vitamin A"],
    stages: ["Pregnancy", "Postpartum"], symptoms: [], budget: false, time: 75, diet: [],
    context: "Ground melon seeds simmered with leafy greens, peppers and palm oil, often with meat or fish. Served with pounded yam, eba or fufu.",
    why: "The seeds bring protein and healthy fats, the greens bring iron and folate, and red palm oil is naturally rich in vitamin A carotenoids.",
    considerations: ["Cook all meat and fish thoroughly.", "It's rich, so smaller portions can feel better if you have heartburn."],
    pairings: ["Extra spinach or bitter leaf", "A side of fruit for vitamin C"],
    swaps: ["Spinach when bitter leaf is hard to find", "Chicken or mushrooms instead of beef"],
    makeItWork: "Egusi freezes beautifully. Cook once, portion and freeze for tired weeks.",
  },
  {
    id: "sweet-potato", name: "Sweet potato", cuisine: "southern", origin: "Global", meal: "Any meal",
    img: "g-ingredients", pos: "85% 85%",
    nutrients: ["Vitamin A", "Fiber", "Potassium", "Vitamin C"],
    stages: ["Pregnancy", "Postpartum", "Planning"], symptoms: ["Nauseous", "Hungry"], budget: true, time: 40, diet: ["Vegetarian", "Vegan"],
    context: "From candied yams in the South to roasted street-side sweet potatoes across Africa and Asia, this root shows up on tables everywhere.",
    why: "Sweet potato gives you beta-carotene, which your body turns into vitamin A as it needs it, along with fiber and potassium.",
    considerations: ["Vitamin A from foods like sweet potato is safe in pregnancy. High-dose vitamin A supplements are not, so check your prenatal vitamin with your provider."],
    pairings: ["Black beans", "Greens", "Greek yogurt"],
    swaps: ["Butternut squash", "Pumpkin"],
    makeItWork: "Microwave a whole sweet potato for 6 to 8 minutes for an easy, filling base.",
  },
  {
    id: "lentils", name: "Lentils", cuisine: "south-asian", origin: "South Asia, the Middle East & Ethiopia", meal: "Lunch & dinner",
    img: "g-traditional-ingredients", pos: "60% 60%",
    nutrients: ["Folate", "Iron", "Protein", "Fiber"],
    stages: ["Pregnancy", "Planning", "Postpartum"], symptoms: ["Tired"], budget: true, time: 25, diet: ["Vegetarian", "Vegan"],
    context: "Dal in South Asia, mujadara in the Middle East, misir wot in Ethiopia. Lentils are comfort food for much of the world.",
    why: "One cup of cooked lentils has about 18 g of protein, roughly a quarter of your daily iron needs in pregnancy, and more than half of your folate.",
    considerations: ["Squeeze in lemon or add tomatoes. Vitamin C helps you absorb the iron.", "Try to have tea and coffee between meals instead of with them, since they can reduce iron absorption."],
    pairings: ["Rice or flatbread", "Spinach", "Tomato and lemon"],
    swaps: ["Split peas", "Chickpeas"],
    makeItWork: "Red lentils cook in 15 minutes with no soaking.",
  },
  {
    id: "salmon", name: "Salmon", cuisine: "east-asian", origin: "Global", meal: "Dinner",
    img: "g-east-asian-kitchen", pos: "50% 85%",
    nutrients: ["Omega-3", "Protein", "Vitamin D"],
    stages: ["Pregnancy", "Postpartum"], symptoms: [], budget: false, time: 20, diet: ["Pescatarian"],
    context: "Grilled, baked, in teriyaki or in a stew. Salmon fits into almost any cuisine.",
    why: "Salmon is a 'best choice' low-mercury fish rich in DHA omega-3s for your baby's brain and eyes.",
    considerations: ["The FDA suggests 8 to 12 ounces a week of low-mercury fish during pregnancy.", "Cook to 145°F (63°C). Skip raw salmon and refrigerated smoked salmon unless it's cooked in a dish."],
    pairings: ["Rice and greens", "Sweet potato", "Okra or a tomato salad"],
    swaps: ["Sardines (budget-friendly)", "Canned pink salmon", "Tilapia or cod"],
    makeItWork: "Canned salmon makes quick patties or rice bowls.",
  },
  {
    id: "callaloo", name: "Callaloo", cuisine: "caribbean", origin: "Jamaica, Trinidad & the Caribbean", meal: "Breakfast & sides",
    img: "g-greens-together", pos: "50% 60%",
    nutrients: ["Iron", "Calcium", "Vitamin A", "Folate"],
    stages: ["Pregnancy", "Postpartum"], symptoms: ["Tired"], budget: true, time: 20, diet: ["Vegetarian", "Vegan"],
    context: "In Jamaica, callaloo is steamed amaranth greens with onion, tomato and scotch bonnet. In Trinidad, it's a silky soup with dasheen leaves, okra and coconut milk.",
    why: "These leafy greens bring iron, calcium, vitamin A and folate, all key nutrients in pregnancy.",
    considerations: ["Salted fish adds a lot of salt. Soaking or boiling it first helps.", "Cook the greens until tender."],
    pairings: ["Boiled green banana or dumplings", "Ackee and saltfish", "Tomatoes for vitamin C"],
    swaps: ["Spinach or amaranth from international markets"],
    makeItWork: "Canned callaloo exists and cooks in minutes.",
  },
  {
    id: "okra", name: "Okra", cuisine: "southern", origin: "West Africa, the South, South Asia", meal: "Sides & soups",
    img: "g-tortillas", pos: "20% 80%",
    nutrients: ["Folate", "Vitamin C", "Fiber"],
    stages: ["Pregnancy"], symptoms: [], budget: true, time: 25, diet: ["Vegetarian", "Vegan"],
    context: "Okra soup in West Africa, gumbo in Louisiana, bhindi masala in India. It's one vegetable with many homes.",
    why: "Okra gives you folate, vitamin C and soluble fiber.",
    considerations: ["Roasting reduces the slippery texture if that bothers you."],
    pairings: ["Rice", "Fish or shrimp (cooked)", "Tomatoes"],
    swaps: ["Green beans", "Zucchini"],
    makeItWork: "Frozen cut okra is ready to toss into stews.",
  },
  {
    id: "greek-yogurt", name: "Greek yogurt", cuisine: "mediterranean", origin: "Mediterranean", meal: "Breakfast & snacks",
    img: "g-meal-bowl", pos: "30% 40%",
    nutrients: ["Protein", "Calcium"],
    stages: ["Pregnancy", "Postpartum"], symptoms: ["Nauseous", "Hungry"], budget: true, time: 2, diet: ["Vegetarian"],
    context: "Strained yogurt is part of daily life across Greece, Turkey and the Middle East, as labneh, tzatziki or a simple bowl with honey.",
    why: "A cup of Greek yogurt gives you about 20 g of protein plus calcium. It's cool and easy when nausea makes cooking hard.",
    considerations: ["Choose pasteurized yogurt.", "Plain yogurt with fruit lets you control the sugar."],
    pairings: ["Berries or mango", "Oats", "Cucumber and herbs as a dip"],
    swaps: ["Kefir", "Fortified soy yogurt"],
    makeItWork: "Keep single cups at work for a no-prep protein snack.",
  },
  {
    id: "avocado", name: "Avocado", cuisine: "latin-american", origin: "Mexico & Central America", meal: "Any meal",
    img: "g-meal-bowl", pos: "85% 55%",
    nutrients: ["Folate", "Potassium", "Healthy fats", "Fiber"],
    stages: ["Pregnancy", "Planning", "Postpartum"], symptoms: ["Nauseous"], budget: false, time: 2, diet: ["Vegetarian", "Vegan"],
    context: "Avocado is the base of guacamole and a staple from Mexico to Ghana, where it's often eaten with bread or gari.",
    why: "Avocado gives you folate, potassium and healthy fats that help you absorb fat-soluble vitamins.",
    considerations: ["Wash the skin before cutting."],
    pairings: ["Beans and tortillas", "Eggs", "Waakye"],
    swaps: ["Nut butter for healthy fats"],
    makeItWork: "Mash with lime and salt for a 2-minute topping.",
  },
  {
    id: "mchicha", name: "Mchicha", cuisine: "east-african", origin: "Tanzania & Kenya", meal: "Lunch & dinner",
    img: "g-east-african-kitchen", pos: "45% 75%",
    nutrients: ["Iron", "Calcium", "Folate", "Vitamin A"],
    stages: ["Pregnancy", "Postpartum"], symptoms: ["Tired"], budget: true, time: 20, diet: ["Vegetarian", "Vegan"],
    context: "Tender amaranth greens cooked with onion and tomato, sometimes finished with ground peanuts or coconut milk. Usually served with ugali.",
    why: "Amaranth greens bring iron, calcium, folate and vitamin A, and peanuts add protein.",
    considerations: ["Tomatoes add vitamin C, which helps your body absorb the greens' iron."],
    pairings: ["Ugali", "Maharage (beans)", "Fresh fish, cooked through"],
    swaps: ["Spinach or kale"],
    makeItWork: "Mchicha cooks in about 10 minutes once the onions are soft.",
  },
  {
    id: "ugali", name: "Ugali", cuisine: "east-african", origin: "East Africa", meal: "Lunch & dinner",
    img: "g-east-african-kitchen", pos: "75% 80%",
    nutrients: ["Energy", "Fiber"],
    stages: ["Pregnancy", "Postpartum"], symptoms: ["Hungry", "Nauseous"], budget: true, time: 15, diet: ["Vegetarian", "Vegan"],
    context: "A firm maize porridge at the heart of meals across Tanzania, Kenya and Uganda, eaten by hand with greens, beans and stews.",
    why: "Ugali gives you steady energy and pairs naturally with iron- and protein-rich sides.",
    considerations: ["Whole-grain maize flour adds more fiber."],
    pairings: ["Mchicha", "Maharage", "Fish stew"],
    swaps: ["Brown rice", "Millet"],
    makeItWork: "Ugali takes 15 minutes and costs very little.",
  },
];

export const RECIPES = [
  {
    id: "red-red", name: "Red-red with plantain", cuisine: "West African", img: "g-west-african-stew", pos: "40% 60%",
    time: 25, cost: "$", costEst: "about $2 a serving", difficulty: "Easy",
    tags: ["Under 30 min", "Budget friendly", "High iron", "Vegetarian", "One pot", "Freezer friendly"],
    highlights: ["Iron", "Folate", "Protein", "Vitamin A"],
    context: "A Ghanaian favorite named for its red palm oil and red plantain.",
    ingredients: ["2 cans black-eyed peas, rinsed", "1 onion, diced", "2 tomatoes, chopped", "2 tbsp red palm oil", "1 tsp ginger", "Pinch of chili", "2 ripe plantains"],
    steps: ["Warm the palm oil and soften the onion for 4 minutes.", "Add the ginger, chili and tomatoes and simmer for 6 minutes.", "Stir in the peas with a splash of water and simmer for 10 minutes.", "Meanwhile, roast or pan-fry the plantain slices until golden.", "Serve the beans with the plantain alongside."],
    swaps: ["Vegetable oil plus 1 tsp paprika instead of palm oil", "Sweet potato instead of plantain"],
  },
  {
    id: "waakye-bowl", name: "Weeknight waakye bowl", cuisine: "West African", img: "g-west-african-stew", pos: "70% 50%",
    time: 35, cost: "$", costEst: "about $2.50 a serving", difficulty: "Easy",
    tags: ["Budget friendly", "High iron", "High protein", "Family friendly"],
    highlights: ["Protein", "Iron", "Folate", "Fiber"],
    context: "A shortcut version of Ghana's beloved rice and beans.",
    ingredients: ["1 cup rice", "1 can black-eyed peas", "2 dried sorghum leaves or 1/2 tsp baking soda (optional, for color)", "2 eggs", "Tomato stew or salsa", "1/2 avocado"],
    steps: ["Simmer the rice with the sorghum leaves in 2 cups of water.", "Fold in the peas for the last 5 minutes.", "Hard-boil the eggs for 10 minutes.", "Serve with tomato stew, egg and avocado."],
    swaps: ["Fish instead of eggs", "Brown rice"],
  },
  {
    id: "mchicha-peanut", name: "Mchicha with peanuts & ugali", cuisine: "East African", img: "g-east-african-kitchen", pos: "50% 70%",
    time: 25, cost: "$", costEst: "about $1.80 a serving", difficulty: "Easy",
    tags: ["Under 30 min", "Budget friendly", "High iron", "Vegetarian", "Family friendly"],
    highlights: ["Iron", "Calcium", "Folate", "Protein"],
    context: "A Tanzanian family staple. Juanita grew up on it.",
    ingredients: ["1 big bunch amaranth or spinach", "1 onion", "2 tomatoes", "3 tbsp ground peanuts or peanut butter", "1 cup maize flour"],
    steps: ["Bring 2 cups of water to a boil and whisk in the maize flour. Stir firmly for 10 minutes for ugali.", "Soften the onion, then add the tomatoes.", "Add the chopped greens and cook for 5 minutes.", "Stir in the peanuts with a splash of water and serve with the ugali."],
    swaps: ["Coconut milk instead of peanuts (if allergic)", "Rice instead of ugali"],
  },
  {
    id: "dal", name: "15-minute red lentil dal", cuisine: "South Asian", img: "g-traditional-ingredients", pos: "50% 60%",
    time: 15, cost: "$", costEst: "about $1.20 a serving", difficulty: "Easy",
    tags: ["Under 15 min", "Budget friendly", "High iron", "Vegetarian", "One pot", "Freezer friendly", "Postpartum"],
    highlights: ["Folate", "Iron", "Protein", "Fiber"],
    context: "Comfort food across South Asia. Every family has its own tadka.",
    ingredients: ["1 cup red lentils", "1 tsp turmeric", "1 tsp cumin seeds", "2 garlic cloves", "1 tomato", "Lemon", "Rice or roti to serve"],
    steps: ["Simmer the lentils with turmeric in 3 cups of water for 12 minutes.", "Sizzle the cumin and garlic in a little oil, then add the tomato.", "Stir into the lentils and finish with lemon juice."],
    swaps: ["Add frozen spinach for extra iron", "Coconut milk for creaminess"],
  },
  {
    id: "congee", name: "Gentle ginger congee", cuisine: "East Asian", img: "g-east-asian-kitchen", pos: "70% 70%",
    time: 30, cost: "$", costEst: "about $1 a serving", difficulty: "Easy",
    tags: ["Nausea friendly", "Budget friendly", "One pot", "Postpartum"],
    highlights: ["Energy", "Hydration", "Protein"],
    context: "Rice porridge eaten across East and Southeast Asia, and often the first food after illness or childbirth.",
    ingredients: ["1/2 cup rice", "5 cups broth or water", "Thumb of ginger, sliced", "1 egg or shredded cooked chicken", "Scallions"],
    steps: ["Simmer the rice and ginger in the broth for 25 minutes, stirring now and then.", "Stir in a beaten egg until fully cooked, or add the chicken.", "Top with scallions."],
    swaps: ["Use a rice cooker's porridge setting", "Tofu instead of egg"],
  },
  {
    id: "collards-turkey", name: "Collards with smoked turkey", cuisine: "Southern / Soul Food", img: "g-leafy-greens", pos: "50% 50%",
    time: 45, cost: "$$", costEst: "about $3 a serving", difficulty: "Easy",
    tags: ["High iron", "Family friendly", "Freezer friendly", "One pot"],
    highlights: ["Calcium", "Folate", "Vitamin A", "Protein"],
    context: "The Sunday-dinner side, slow-cooked and full of flavor.",
    ingredients: ["2 bunches collards", "1 smoked turkey wing", "1 onion", "2 garlic cloves", "1 tbsp apple cider vinegar", "Pinch of red pepper"],
    steps: ["Simmer the turkey wing with the onion and garlic for 20 minutes.", "Add the sliced collards and cook for 25 minutes until tender.", "Finish with vinegar and pepper."],
    swaps: ["Smoked paprika and mushrooms for a vegetarian pot", "Frozen collards"],
  },
  {
    id: "black-bean-tacos", name: "Sweet potato & black bean tacos", cuisine: "Latin American", img: "g-tortillas", pos: "60% 75%",
    time: 25, cost: "$", costEst: "about $2 a serving", difficulty: "Easy",
    tags: ["Under 30 min", "Budget friendly", "High protein", "Vegetarian", "Family friendly"],
    highlights: ["Fiber", "Vitamin A", "Folate", "Iron"],
    context: "Corn tortillas carry thousands of years of Mesoamerican food history.",
    ingredients: ["1 sweet potato, diced", "1 can black beans", "Corn tortillas", "1/2 avocado", "Lime", "Cotija or a dollop of yogurt"],
    steps: ["Roast the sweet potato at 425°F for 20 minutes.", "Warm the beans with cumin.", "Fill the tortillas and top with avocado, lime and cheese."],
    swaps: ["Choose pasteurized cheese", "Plantain instead of sweet potato"],
  },
  {
    id: "overnight-oats", name: "Overnight oats, three ways", cuisine: "Everyday", img: "g-meal-bowl", pos: "50% 30%",
    time: 5, cost: "$", costEst: "about $1 a serving", difficulty: "Easy",
    tags: ["Under 15 min", "Budget friendly", "Nausea friendly", "Vegetarian"],
    highlights: ["Fiber", "Calcium", "Protein"],
    context: "The Working Mamas room's favorite make-ahead breakfast.",
    ingredients: ["1/2 cup oats", "1/2 cup milk or soy milk", "1/2 cup Greek yogurt", "Fruit: mango, banana or berries", "Optional: peanut butter, chia"],
    steps: ["Stir everything together in a jar.", "Refrigerate overnight.", "Grab and go."],
    swaps: ["Fortified cereal for extra iron"],
  },
];

export const RECIPE_FILTERS = ["Under 15 min", "Under 30 min", "Budget friendly", "High iron", "High protein", "Nausea friendly", "Freezer friendly", "One pot", "Vegetarian", "Postpartum", "Family friendly"];

// "What can I eat?" natural-language answers
export const QA = [
  {
    match: ["sushi", "raw fish", "sashimi"],
    q: "Can I eat sushi?",
    answer: "Cooked and vegetarian rolls, yes. Raw fish, it's best to wait.",
    why: "Raw or undercooked seafood can carry bacteria and parasites that are riskier during pregnancy.",
    considerations: ["Choose rolls with cooked fish (eel, cooked shrimp, crab) or vegetables.", "Stick to low-mercury fish like salmon or shrimp. Skip high-mercury fish like king mackerel, swordfish and bigeye tuna."],
    alternatives: ["California roll with cooked crab", "Cucumber or avocado maki", "Cooked salmon rice bowl"],
    nutrients: ["Omega-3", "Protein"],
    source: "FDA/EPA Advice about Eating Fish; ACOG",
  },
  {
    match: ["hibiscus", "sobolo", "bissap", "sorrel", "flor de jamaica"],
    q: "Is hibiscus tea okay?",
    answer: "Research is limited, so many providers suggest avoiding large amounts during pregnancy.",
    why: "There isn't much human research on hibiscus in pregnancy, and some animal studies suggest effects on hormones. That's why most guidance leans cautious.",
    considerations: ["Sobolo, bissap and sorrel are culturally important. Ask your provider whether an occasional small glass is fine for you.", "Store-bought versions can be high in sugar."],
    alternatives: ["Ginger tea (moderate amounts)", "Rooibos", "Water infused with citrus and mint"],
    nutrients: ["Hydration"],
    source: "NIH National Center for Complementary and Integrative Health",
  },
  {
    match: ["nausea", "nauseous", "sick", "morning sickness", "throw up", "vomit"],
    q: "What can I eat when I'm nauseous?",
    answer: "Small, frequent meals of foods that feel easy, often bland, cool or dry, can help.",
    why: "An empty stomach can make nausea worse. Eating a little every few hours keeps things steady.",
    considerations: ["Crackers before getting out of bed help some people.", "Ginger may ease nausea for some.", "If you can't keep fluids down for a day, or you're losing weight, call your provider."],
    alternatives: ["Plain rice, congee or ugali", "Plantain or toast", "Cold yogurt or fruit", "Ginger tea"],
    nutrients: ["Hydration", "Energy"],
    source: "ACOG: Morning Sickness: Nausea and Vomiting of Pregnancy",
  },
  {
    match: ["don't eat meat", "dont eat meat", "vegetarian", "vegan", "no meat", "plant based", "plant-based"],
    q: "I don't eat meat. How do I get iron?",
    answer: "Yes, you can meet your needs with beans, lentils, greens and fortified foods, paired with vitamin C.",
    why: "Your iron needs rise to about 27 mg a day in pregnancy. Plant iron is absorbed better alongside vitamin C.",
    considerations: ["Have tea and coffee between meals rather than with them.", "Ask your provider whether to check your iron levels or adjust your prenatal vitamin."],
    alternatives: ["Lentils or black-eyed peas with tomato", "Mchicha or callaloo with lemon", "Fortified cereal with orange"],
    nutrients: ["Iron", "Vitamin C", "Protein"],
    source: "NIH Office of Dietary Supplements: Iron",
  },
  {
    match: ["jollof"],
    q: "Is jollof rice okay during pregnancy?",
    answer: "Yes. Jollof is a great base. Add a protein and a vegetable to round it out.",
    why: "The tomato and pepper base gives you vitamins A and C, and the rice gives steady energy.",
    considerations: ["Go easy on stock cubes, which are high in salt.", "Refrigerate leftovers within 2 hours."],
    alternatives: ["Jollof with grilled fish and vegetables", "Jollof with beans and plantain"],
    nutrients: ["Energy", "Vitamin C", "Vitamin A"],
    source: "USDA Dietary Guidelines; FoodSafety.gov",
  },
  {
    match: ["coffee", "caffeine", "tea"],
    q: "How much coffee can I have?",
    answer: "Up to about 200 mg of caffeine a day, roughly one 12-oz coffee, is generally considered okay.",
    why: "Moderate caffeine hasn't been shown to cause problems, but higher amounts may.",
    considerations: ["Remember that tea, soda and chocolate count too.", "Having coffee between meals instead of with them helps iron absorption."],
    alternatives: ["Half-caf", "Rooibos", "Warm milk with spices"],
    nutrients: ["Hydration"],
    source: "ACOG: Moderate Caffeine Consumption During Pregnancy",
  },
  {
    match: ["cheese", "queso", "brie", "feta"],
    q: "Can I eat soft cheese?",
    answer: "Yes, if it's made with pasteurized milk.",
    why: "Unpasteurized soft cheeses can carry listeria, which is more dangerous during pregnancy.",
    considerations: ["Check the label for 'made with pasteurized milk', especially for queso fresco."],
    alternatives: ["Pasteurized queso fresco", "Hard cheeses like cheddar", "Greek yogurt"],
    nutrients: ["Calcium", "Protein"],
    source: "CDC: Listeria and Pregnancy",
  },
];

export const ROOMS = [
  { id: "around-the-table", name: "Around the Table", emoji: "🍲", desc: "Share the meals, traditions, recipes, and stories nourishing your family.", members: 1840, here: 48, featured: true },
  { id: "working-mamas", name: "Working Mamas", emoji: "💼", desc: "Juggling work, prenatal visits and dinner.", members: 1260, here: 32 },
  { id: "first-time", name: "First-Time Mamas", emoji: "🌿", desc: "No question is too small.", members: 2310, here: 41 },
  { id: "dinner", name: "What's for Dinner?", emoji: "🥘", desc: "Tonight's plans, shortcuts and wins.", members: 1475, here: 27 },
  { id: "culture", name: "Culture & Motherhood", emoji: "🌍", desc: "Traditions, grandmothers' wisdom and raising kids across cultures.", members: 980, here: 15 },
  { id: "second-tri", name: "Second Trimester Circle", emoji: "🤰", desc: "Weeks 14–27, together.", members: 1120, here: 22 },
  { id: "postpartum", name: "Postpartum Table", emoji: "💛", desc: "Healing, feeding and the fourth trimester.", members: 860, here: 12 },
  { id: "budget", name: "Nourishing on a Budget", emoji: "💰", desc: "Stretching groceries without stretching yourself.", members: 1390, here: 19 },
  { id: "late-night", name: "Late Night Mama Chat", emoji: "🌙", desc: "Awake at 3am? So are we.", members: 740, here: 9 },
  { id: "feeding", name: "Feeding & Baby Nutrition", emoji: "🍼", desc: "Breastfeeding, formula and first foods.", members: 1010, here: 14 },
  { id: "plant-based", name: "Vegetarian & Plant-Based Mamas", emoji: "🥬", desc: "Plant-powered pregnancy and beyond.", members: 520, here: 6 },
];

export const PEOPLE = {
  aisha: { name: "Aisha", tone: "#C7613A", week: "19 weeks" },
  nia: { name: "Nia", tone: "#7A8A5A", week: "31 weeks" },
  maya: { name: "Maya", tone: "#3E4A2E", week: "24 weeks" },
  adwoa: { name: "Adwoa", tone: "#B08A3E", week: "22 weeks" },
  camila: { name: "Camila", tone: "#8C6A4F", week: "Postpartum, 6 weeks" },
  priya: { name: "Priya", tone: "#5C7A6B", week: "16 weeks" },
  keisha: { name: "Keisha", tone: "#9C5A44", week: "27 weeks" },
  rd: { name: "Dana Okafor, RD", tone: "#2B3320", role: "expert", title: "Registered Dietitian" },
  mod: { name: "Amara Moderator", tone: "#4E5640", role: "mod" },
  anon: { name: "Anonymous mama", tone: "#9AA087", anon: true },
};

export const POSTS = [
  {
    id: "p1", room: "around-the-table", by: "adwoa", time: "12m",
    text: "My mom keeps telling me to eat kontomire during pregnancy 😂 Anyone else?",
    reactions: { "💛": 24, "😂": 31, "🙌": 6 },
    replies: [
      { by: "keisha", text: "Mine says the same about collards! Grandma knowledge hits different." },
      { by: "rd", text: "Your mom is onto something. Kontomire (cocoyam leaves) gives you folate, vitamin A and some iron. Cook it well, and tomatoes or pepper alongside help with iron absorption." },
      { by: "priya", text: "For me it's methi (fenugreek) leaves. Every auntie has an opinion 🙈" },
    ],
  },
  {
    id: "p2", room: "working-mamas", by: "aisha", time: "38m",
    text: "Working moms: what are your easiest breakfasts lately?",
    reactions: { "💛": 18, "🙌": 9 },
    replies: [
      { by: "nia", text: "Overnight oats have been saving me." },
      { by: "maya", text: "I've been doing boiled eggs + plantain." },
    ],
  },
  {
    id: "p3", room: "second-tri", by: "anon", time: "1h",
    text: "Anyone else suddenly struggling with meat during pregnancy?",
    reactions: { "💛": 42, "🫂": 15 },
    replies: [
      { by: "camila", text: "Yes! Beans and eggs carried me through second tri." },
      { by: "mod", text: "Food aversions are really common. Our Food Library has a 'Protein without meat' collection if you want ideas 💛" },
    ],
  },
  {
    id: "p4", room: "around-the-table", by: "keisha", time: "2h",
    text: "Any Caribbean mamas have an easy callaloo recipe? Moved away from home and miss it so much.",
    reactions: { "💛": 15 },
    replies: [{ by: "camila", text: "Canned callaloo + onion + thyme + scotch bonnet (just a touch). 10 minutes!" }],
    recipe: "callaloo",
  },
  {
    id: "p5", room: "dinner", by: "priya", time: "3h",
    text: "What's everybody making when you're too tired to cook?",
    reactions: { "💛": 22, "😴": 19 },
    replies: [{ by: "nia", text: "Rice cooker congee. Literally press a button." }],
  },
  {
    id: "p6", room: "second-tri", by: "keisha", time: "4h",
    text: "My aunt says drinking a lot of castor oil will make the baby come faster later on. Is that a thing?",
    reactions: { "💛": 3 },
    flagged: true,
    replies: [{ by: "mod", text: "Thanks for asking here 💛 Please talk with your provider before trying anything to start labor. Castor oil can cause dehydration and isn't recommended without medical guidance." }],
  },
];

export const LIVE_CHAT = [
  { by: "aisha", text: "Does anyone have breakfast ideas I can make before work? I'm 19 weeks and exhausted 😭" },
  { by: "nia", text: "Overnight oats have been saving me." },
  { by: "maya", text: "I've been doing boiled eggs + plantain." },
  { kind: "tip", text: "Pairing plant-based iron sources with foods containing vitamin C can help support iron absorption." },
  { by: "keisha", text: "Smoothie with spinach, mango and yogurt. Drink it on the train 🚆" },
  { by: "rd", text: "Great ideas here. For anyone dealing with persistent fatigue, it's also worth discussing iron levels with your prenatal care provider." },
];

export const CHAT_REPLIES = [
  { by: "aisha", text: "Ooh adding that to my list, thank you 🙏" },
  { by: "nia", text: "Same energy. We're getting through this together 💛" },
  { by: "adwoa", text: "Yes!! Love this room." },
];

export const EVENTS = [
  { id: "e1", title: "Iron in pregnancy: ask a dietitian", host: "Dana Okafor, RD", when: "Thu, Oct 8 · 7:00 PM ET", kind: "Live Q&A", img: "g-pregnancy-kitchen", pos: "50% 40%", going: 86 },
  { id: "e2", title: "Around the Table: Sunday cook-along (jollof!)", host: "The Village", when: "Sun, Oct 11 · 4:00 PM ET", kind: "Cook-along", img: "g-west-african-stew", pos: "50% 40%", going: 142 },
  { id: "e3", title: "Second Trimester Circle meetup", host: "Moderated by Amara", when: "Tue, Oct 13 · 8:00 PM ET", kind: "Virtual circle", img: "g-community-meal", pos: "50% 40%", going: 38 },
  { id: "e4", title: "Postpartum nourishment with grandmother wisdom", host: "Culture & Motherhood", when: "Sat, Oct 17 · 11:00 AM ET", kind: "Story circle", img: "g-grandmother-teaching", pos: "50% 30%", going: 64 },
];

export const RESOURCES = [
  { id: "food", label: "Food support", icon: "ShoppingBasket", items: [
    { name: "WIC", detail: "Healthy foods, nutrition support and breastfeeding help for pregnant and postpartum women and young children.", action: "Check eligibility" },
    { name: "SNAP", detail: "Monthly grocery benefits. Pregnancy can affect eligibility and benefit amount.", action: "Learn how to apply" },
    { name: "Local food banks", detail: "Find free groceries near you through Feeding America's food bank finder.", action: "Find nearby" },
  ]},
  { id: "health", label: "Healthcare", icon: "Stethoscope", items: [
    { name: "Community health centers", detail: "Prenatal care on a sliding-fee scale, whatever your insurance status.", action: "Find a health center" },
    { name: "Medicaid in pregnancy", detail: "Many states extend coverage through 12 months postpartum.", action: "Check your state" },
  ]},
  { id: "transport", label: "Transportation", icon: "Bus", items: [
    { name: "Rides to appointments", detail: "Medicaid often covers non-emergency rides to prenatal visits.", action: "See options" },
  ]},
  { id: "mental", label: "Mental wellness", icon: "HeartHandshake", items: [
    { name: "National Maternal Mental Health Hotline", detail: "Free, confidential support 24/7 by call or text, in English and Spanish: 1-833-TLC-MAMA (1-833-852-6262).", action: "Call or text" },
    { name: "Postpartum Support International", detail: "HelpLine 1-800-944-4773, plus peer support groups.", action: "Get support" },
  ]},
  { id: "lactation", label: "Lactation support", icon: "Baby", items: [
    { name: "WIC breastfeeding peer counselors", detail: "Mothers who've been there, available by phone.", action: "Connect" },
    { name: "La Leche League", detail: "Free local and virtual meetings.", action: "Find a meeting" },
  ]},
  { id: "housing", label: "Housing", icon: "Building2", items: [
    { name: "211", detail: "Call or text 211 for local housing, utility and rent help.", action: "Call 211" },
  ]},
  { id: "supplies", label: "Baby supplies", icon: "Baby", items: [
    { name: "Diaper banks", detail: "Free diapers and wipes in many communities.", action: "Find nearby" },
  ]},
  { id: "orgs", label: "Maternal support organizations", icon: "HandHeart", items: [
    { name: "Community doulas", detail: "Many programs offer doula support at low or no cost.", action: "Explore" },
  ]},
];

// Afya scripted guidance
export const AFYA_PROMPTS = [
  "I've been exhausted lately. What should I eat?",
  "Give me three quick Ghanaian-inspired dinners.",
  "What foods can help me get more iron?",
  "I have $40 for groceries this week.",
  "I've been nauseous all morning.",
  "What should I ask my doctor about my iron levels?",
  "I don't feel like cooking.",
];

export const RED_FLAGS = ["bleeding", "blood", "severe headache", "vision", "blurry", "chest pain", "can't breathe", "cant breathe", "fainted", "faint", "baby isn't moving", "baby not moving", "less movement", "fever", "severe pain", "swelling in my face", "suicid", "hurt myself", "harm myself", "contractions"];

export const CHECKIN = [
  { id: "Energized", emoji: "☀️" },
  { id: "Tired", emoji: "🌙" },
  { id: "Nauseous", emoji: "🌊" },
  { id: "Hungry", emoji: "🍽️" },
  { id: "Not sure", emoji: "🤍" },
];

export const CHECKIN_FOCUS = {
  Energized: { nutrient: "Protein", title: "Make the most of a good day.", body: "When you have energy, a little batch-cooking now (a pot of beans or a tray of roasted sweet potatoes) makes tired days easier.", cta: "Find freezer-friendly meals", to: ["recipes", { filter: "Freezer friendly" }] },
  Tired: { nutrient: "Iron", title: "Your iron needs increase during pregnancy.", body: "Your blood volume grows by almost half, so you need more iron to carry oxygen to you and your baby. Feeling tired is common, and iron-rich foods are one piece of the puzzle.", cta: "Find iron-rich foods", to: ["library", { nutrient: "Iron" }] },
  Nauseous: { nutrient: "Hydration", title: "Gentle foods, small and often.", body: "An empty stomach can make nausea worse. Try small bites every few hours, plus sips of fluid between meals.", cta: "See nausea-friendly foods", to: ["library", { symptom: "Nauseous" }] },
  Hungry: { nutrient: "Protein", title: "Your body is building.", body: "Hunger often rises in the second trimester. Protein and fiber together keep you fuller for longer.", cta: "Find filling meals", to: ["recipes", { filter: "High protein" }] },
  "Not sure": { nutrient: "Folate", title: "Small, steady choices add up.", body: "No need to overthink today. One leafy green and one protein you enjoy is a great start.", cta: "Explore foods from home", to: ["library", {}] },
};

export const PLATE_BASES = [
  { id: "jollof", name: "Jollof rice", nutrients: ["Energy", "Vitamin C"] },
  { id: "waakye", name: "Waakye", nutrients: ["Protein", "Iron", "Fiber"] },
  { id: "ugali", name: "Ugali", nutrients: ["Energy"] },
  { id: "rice-peas", name: "Rice & peas", nutrients: ["Protein", "Fiber"] },
  { id: "tortillas", name: "Corn tortillas", nutrients: ["Energy", "Fiber"] },
  { id: "dal-rice", name: "Dal & rice", nutrients: ["Protein", "Folate", "Iron"] },
];

export const PLATE_OPTIONS = {
  Protein: [
    { name: "Chicken", adds: ["Protein"], note: "Lean protein and easily absorbed (heme) iron." },
    { name: "Fish", adds: ["Protein", "Omega-3"], note: "Low-mercury fish adds DHA for your baby's brain." },
    { name: "Beans", adds: ["Protein", "Iron", "Folate", "Fiber"], note: "Plant protein plus folate and iron." },
    { name: "Eggs", adds: ["Protein", "Choline"], note: "Eggs are a top source of choline. Cook them until firm." },
  ],
  Vegetable: [
    { name: "Spinach", adds: ["Iron", "Folate"], note: "Leafy greens bring folate and iron." },
    { name: "Okra", adds: ["Folate", "Fiber"], note: "Folate and soluble fiber." },
    { name: "Mixed vegetables", adds: ["Fiber", "Vitamin A"], note: "Color means variety." },
    { name: "Collard greens", adds: ["Calcium", "Folate"], note: "A great plant source of calcium." },
  ],
  "Vitamin C": [
    { name: "Tomatoes", adds: ["Vitamin C"], note: "Helps you absorb plant iron." },
    { name: "Peppers", adds: ["Vitamin C"], note: "Bell peppers are packed with vitamin C." },
    { name: "Orange", adds: ["Vitamin C"], note: "A simple side that boosts iron absorption." },
    { name: "Mango", adds: ["Vitamin C", "Vitamin A"], note: "Sweet, cooling and full of vitamin C." },
  ],
};

export const GROCERY_BASE = [
  { name: "Dried or canned beans", group: "Protein", cost: 4, nutrients: ["Iron", "Folate", "Protein"], tags: [] },
  { name: "Eggs (dozen)", group: "Protein", cost: 4, nutrients: ["Protein", "Choline"], tags: ["eggs"] },
  { name: "Chicken thighs", group: "Protein", cost: 8, nutrients: ["Protein", "Iron"], tags: ["meat"] },
  { name: "Canned sardines or salmon", group: "Protein", cost: 4, nutrients: ["Omega-3", "Protein"], tags: ["fish"] },
  { name: "Greek yogurt (large tub)", group: "Dairy", cost: 5, nutrients: ["Protein", "Calcium"], tags: ["dairy"] },
  { name: "Frozen spinach", group: "Produce", cost: 3, nutrients: ["Iron", "Folate"], tags: [] },
  { name: "Sweet potatoes", group: "Produce", cost: 4, nutrients: ["Vitamin A", "Fiber"], tags: [] },
  { name: "Bananas", group: "Produce", cost: 2, nutrients: ["Potassium"], tags: [] },
  { name: "Tomatoes", group: "Produce", cost: 3, nutrients: ["Vitamin C"], tags: [] },
  { name: "Bell peppers", group: "Produce", cost: 3, nutrients: ["Vitamin C"], tags: [] },
  { name: "Plantains", group: "Produce", cost: 3, nutrients: ["Potassium", "Vitamin A"], tags: [] },
  { name: "Onions & garlic", group: "Produce", cost: 3, nutrients: [], tags: [] },
  { name: "Rice (5 lb)", group: "Pantry", cost: 5, nutrients: ["Energy"], tags: [] },
  { name: "Red lentils", group: "Pantry", cost: 3, nutrients: ["Iron", "Folate", "Protein"], tags: [] },
  { name: "Oats", group: "Pantry", cost: 3, nutrients: ["Fiber"], tags: [] },
  { name: "Fortified cereal", group: "Pantry", cost: 4, nutrients: ["Iron", "Folate"], tags: [] },
  { name: "Frozen mixed vegetables", group: "Produce", cost: 3, nutrients: ["Fiber", "Vitamin A"], tags: [] },
  { name: "Oranges", group: "Produce", cost: 4, nutrients: ["Vitamin C"], tags: [] },
];

export const ONBOARD_CUISINES = ["West African", "Ghanaian", "Nigerian", "Caribbean", "Southern / Soul Food", "East African", "South Asian", "Latin American", "Mexican", "Mediterranean", "East Asian", "Middle Eastern", "Ethiopian", "Filipino", "Haitian"];
export const DIET_PATTERNS = ["No restrictions", "Vegetarian", "Vegan", "Pescatarian", "Halal", "Kosher", "Dairy-free"];
export const ALLERGIES = ["Peanuts", "Tree nuts", "Shellfish", "Fish", "Eggs", "Dairy", "Soy", "Wheat / gluten", "None"];
export const CONCERNS = ["Iron & energy", "Nausea", "Heartburn", "Constipation", "Cravings", "Gestational diabetes", "Blood pressure", "Eating enough", "Food aversions"];

export const MAYA = {
  name: "Maya",
  stage: "Pregnant",
  week: 24,
  cuisines: ["West African", "Ghanaian", "Caribbean"],
  loves: ["Plantain", "Jollof rice", "Beans", "Spinach", "Chicken"],
  avoids: ["Very spicy food (heartburn)"],
  diet: "No restrictions",
  allergies: ["None"],
  budget: "$50–75 a week",
  cookTime: "Under 30 minutes",
  cookFreq: "4–5 nights a week",
  household: 2,
  kitchen: "Full kitchen",
  concerns: ["Iron & energy", "Eating enough"],
  symptoms: ["Fatigue"],
  goals: ["Get enough iron", "Keep eating foods from home", "Simple weeknight meals"],
};
