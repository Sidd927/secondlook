// Product concepts that bridge how people LIST items secondhand and how CPSC WRITES recalls.
// Consumer Reports found recalled Rock 'n Play sleepers listed as "baby sleeper/rocker",
// "baby bouncy", "floor cradle" and "bassinet" — keyword search on the title alone misses them.
// Each concept: `cues` (phrases seen in listings) → `expand` (vocabulary used in recall notices).

export interface Concept {
  id: string;
  label: string;
  cues: string[];
  expand: string[];
  infant?: boolean;
}

export const CONCEPTS: Concept[] = [
  {
    id: "infant-sleeper",
    label: "Infant sleeper / rocker",
    cues: ["sleeper", "rocker", "rock n play", "rock and play", "rock-n-play", "floor cradle", "baby cradle", "soother", "glider", "napper", "nap nanny", "sleep rocker", "rocking sleeper", "incline", "inclined"],
    expand: ["sleeper", "rocker", "soother", "glider", "inclined", "infant", "rock_play", "cradle", "napper"],
    infant: true,
  },
  {
    id: "bassinet",
    label: "Bassinet / cradle",
    cues: ["bassinet", "cradle", "moses basket", "bedside sleeper", "co-sleeper", "cosleeper", "next to me"],
    expand: ["bassinet", "cradle", "sleeper", "bedside"],
    infant: true,
  },
  {
    id: "lounger",
    label: "Infant lounger / nest",
    cues: ["lounger", "baby nest", "dock", "docking station", "dockatot", "dock a tot", "snuggle nest", "newborn pillow", "boppy", "positioner"],
    expand: ["lounger", "nest", "dock", "positioner", "pillow", "newborn"],
    infant: true,
  },
  {
    id: "crib",
    label: "Crib",
    cues: ["crib", "cot", "drop side", "drop-side", "dropside", "convertible crib", "mini crib", "portable crib"],
    expand: ["crib", "drop_side", "slat"],
    infant: true,
  },
  {
    id: "play-yard",
    label: "Play yard",
    cues: ["play yard", "playard", "pack n play", "pack and play", "pack-n-play", "playpen", "play pen", "travel crib", "pack n go"],
    expand: ["play_yard", "playard", "playpen", "pack_play", "travel"],
    infant: true,
  },
  {
    id: "bouncer-swing",
    label: "Bouncer / swing",
    cues: ["bouncer", "bouncy seat", "baby bouncy", "swing", "mamaroo", "jumper", "jumperoo", "activity center", "exersaucer"],
    expand: ["bouncer", "swing", "jumper", "seat", "activity"],
    infant: true,
  },
  {
    id: "high-chair",
    label: "High chair / booster",
    cues: ["high chair", "highchair", "booster seat", "hook on chair", "feeding seat"],
    expand: ["high_chair", "highchair", "booster", "chair"],
    infant: true,
  },
  {
    id: "car-seat",
    label: "Car seat",
    cues: ["car seat", "carseat", "infant seat", "booster car seat", "convertible seat", "travel system"],
    expand: ["car_seat", "seat", "infant", "booster"],
    infant: true,
  },
  {
    id: "stroller",
    label: "Stroller",
    cues: ["stroller", "pram", "jogger", "jogging stroller", "buggy", "travel system", "umbrella stroller"],
    expand: ["stroller", "jogger", "pram"],
    infant: true,
  },
  {
    id: "carrier",
    label: "Baby carrier / sling",
    cues: ["carrier", "sling", "baby wrap", "wrap carrier", "babywearing", "ergo", "baby bjorn", "babybjorn"],
    expand: ["carrier", "sling", "wrap"],
    infant: true,
  },
  {
    id: "bumper",
    label: "Crib bumper",
    cues: ["bumper", "bumper pad", "crib liner", "crib bumper", "rail cover", "slat cover"],
    expand: ["bumper", "liner", "crib"],
    infant: true,
  },
  {
    id: "gate",
    label: "Baby gate",
    cues: ["baby gate", "safety gate", "pet gate", "stair gate"],
    expand: ["gate"],
    infant: true,
  },
  {
    id: "walker",
    label: "Baby walker",
    cues: ["walker", "baby walker", "push walker", "sit to stand"],
    expand: ["walker"],
    infant: true,
  },
  {
    id: "teether",
    label: "Teether / pacifier / rattle",
    cues: ["teether", "teething", "pacifier", "binky", "soother clip", "rattle"],
    expand: ["teether", "pacifier", "rattle", "choking"],
    infant: true,
  },
  {
    id: "dresser",
    label: "Dresser / chest (tip-over)",
    cues: ["dresser", "chest of drawers", "drawer chest", "malm", "nightstand", "wardrobe", "armoire", "bureau", "tallboy"],
    expand: ["dresser", "chest", "drawer", "tip", "tipover", "furniture"],
  },
  {
    id: "bunk-bed",
    label: "Bunk / loft bed",
    cues: ["bunk bed", "loft bed", "bunkbed", "trundle"],
    expand: ["bunk", "loft", "bed", "entrapment"],
  },
  {
    id: "toy",
    label: "Toy",
    cues: ["toy", "doll", "plush", "stuffed", "blocks", "lego", "magnet", "magnetic", "slime", "squishy", "kids toy", "play set"],
    expand: ["toy", "magnet", "choking", "children"],
  },
  {
    id: "ride-on",
    label: "Ride-on / scooter / e-bike",
    cues: ["hoverboard", "scooter", "e-bike", "ebike", "electric bike", "balance board", "ride on", "power wheels", "e-scooter", "bike", "bicycle", "helmet"],
    expand: ["hoverboard", "scooter", "bike", "bicycle", "battery", "helmet", "ride"],
  },
  {
    id: "heater",
    label: "Heater / fire / fuel",
    cues: ["heater", "space heater", "fire pit", "firepit", "fireplace", "torch", "fuel", "gel fuel", "propane"],
    expand: ["heater", "fire", "pit", "fuel", "burn"],
  },
  {
    id: "kitchen",
    label: "Kitchen appliance",
    cues: ["pressure cooker", "instant pot", "air fryer", "blender", "kettle", "slow cooker", "coffee maker", "toaster", "mixer", "multicooker"],
    expand: ["cooker", "fryer", "blender", "kettle", "appliance", "kitchen"],
  },
  {
    id: "battery",
    label: "Battery / charger",
    cues: ["power bank", "battery pack", "charger", "lithium", "portable charger", "power station"],
    expand: ["battery", "charger", "power_bank", "lithium", "overheat"],
  },
  {
    id: "window-covering",
    label: "Window blind / shade",
    cues: ["blind", "blinds", "shade", "roman shade", "curtain cord", "window covering"],
    expand: ["blind", "shade", "window", "cord", "strangulation"],
  },
  {
    id: "lawn-dart",
    label: "Lawn darts",
    cues: ["lawn dart", "lawn darts", "jarts", "yard darts"],
    expand: ["dart"],
  },
];

export function detectConcepts(text: string): Concept[] {
  const t = " " + text.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ") + " ";
  return CONCEPTS.filter((c) =>
    c.cues.some((cue) => t.includes(" " + cue.replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim() + " ")),
  );
}
