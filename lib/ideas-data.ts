/* Client-safe content-ideation data + pure generator — no server imports.
 * This module is bundled for the browser, so it must stay free of node:*
 * imports and side effects. Everything here is deterministic given a seed:
 * generateWeek(trade, town, seed) always returns the same 7 ideas for the
 * same inputs, and a different seed picks a fresh spread of templates. */

export const TRADES = [
  "Roofing",
  "Plumbing",
  "HVAC",
  "Landscaping",
  "Grease & cleanup",
  "Other",
] as const;
export type Trade = (typeof TRADES)[number];

export const PILLARS = [
  "Before & after",
  "How-to tip",
  "Myth-busting",
  "Behind the scenes",
  "Local & community",
  "Customer win",
  "Seasonal & timely",
  "Safety tip",
  "Education & FAQ",
] as const;
export type Pillar = (typeof PILLARS)[number];

export const PLATFORMS = [
  "Instagram Reels",
  "Facebook",
  "Google Business Profile",
] as const;
export type Platform = (typeof PLATFORMS)[number];

export const CTAS = ["Call/text us", "Book a free estimate", "DM us 'HELP'"] as const;
export type Cta = (typeof CTAS)[number];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type IdeaTemplate = {
  pillar: Pillar;
  platform: Platform;
  headline: string;
  hook: string;
  caption: string;
};

export type Idea = {
  day: string;
  platform: Platform;
  headline: string;
  hook: string;
  caption: string;
  cta: Cta;
};

type TradeCatalog = Record<Pillar, IdeaTemplate[]>;

/* ------------------------------------------------------------------ */
/* Template catalog — {town} placeholders are filled at generation     */
/* ------------------------------------------------------------------ */

const ROOFING: TradeCatalog = {
  "Before & after": [
    {
      pillar: "Before & after",
      platform: "Instagram Reels",
      headline: "Same roof, 12 hours apart.",
      hook: "Watch a 20-year-old roof come off and go back on — in under a minute.",
      caption:
        "Full tear-off and reinstall in {town}. New architectural shingles, new flashing, new ridge vent. The whole street stopped to watch — and the homeowner finally sleeps through rain.",
    },
    {
      pillar: "Before & after",
      platform: "Facebook",
      headline: "The before we never get tired of showing.",
      hook: "This roof leaked in three places. Here's the same house, four days later.",
      caption:
        "Missing shingles, rusted flashing, a chimney cricket that was never sealed. Our crew replaced it top to bottom and left the yard spotless. If your roof looks like the 'before,' get eyes on it now.",
    },
    {
      pillar: "Before & after",
      platform: "Google Business Profile",
      headline: "Transformation of the week in {town}.",
      hook: "Brown, mossy, sagging → crisp and new. Scroll to see the difference.",
      caption:
        "Just wrapped this re-roof in {town}. New decking where needed, synthetic underlayment, and gutters cleaned on the way out. Photos from the job below — swipe through.",
    },
  ],
  "How-to tip": [
    {
      pillar: "How-to tip",
      platform: "Instagram Reels",
      headline: "3 signs your roof is done.",
      hook: "Don't climb up there. Look at the ground first.",
      caption:
        "Granules in the gutters, curling shingle tabs, and daylight in the attic — that's your roof talking. Check these before a small leak becomes a new ceiling. Save this reel for your next inspection.",
    },
    {
      pillar: "How-to tip",
      platform: "Facebook",
      headline: "How to spot storm damage without a ladder.",
      hook: "You don't need to walk the roof to know it took a hit.",
      caption:
        "After a storm: check gutters and downspouts for granules, look for dents in flashing and vents, and check the ground for shingle pieces. Spot any of it? Call us — a 20-minute inspection beats a surprise leak.",
    },
    {
      pillar: "How-to tip",
      platform: "Google Business Profile",
      headline: "What a roof inspection actually looks like.",
      hook: "We show up, and for the next 30 minutes we're up there looking for trouble.",
      caption:
        "A real inspection: flashings, penetrations, valleys, attic ventilation, and shingle condition. In {town} we see a lot of wear from wind and heat — so we document everything and send you photos. Free estimate, no pressure.",
    },
  ],
  "Myth-busting": [
    {
      pillar: "Myth-busting",
      platform: "Instagram Reels",
      headline: "Myth: a new roof can go over the old one.",
      hook: "It's cheaper, right? Here's why it isn't.",
      caption:
        "Layering hides rot, traps moisture, and shortens the life of the new shingles. A proper tear-off costs a little more and saves you from paying twice. If a quote skips the tear-off, ask why.",
    },
    {
      pillar: "Myth-busting",
      platform: "Facebook",
      headline: "No, you don't have to wait for leaks to re-roof.",
      hook: "By the time water shows up inside, the damage bill has tripled.",
      caption:
        "Moss, curling tabs, granule loss — those are your warning signs months ahead of the leak. Replacing on your schedule beats replacing after the rain finds your drywall. In {town}, that usually means before the wet season.",
    },
    {
      pillar: "Myth-busting",
      platform: "Google Business Profile",
      headline: "Myth: all roofers are the same — cheapest wins.",
      hook: "The cheapest bid today can be the most expensive roof you ever buy.",
      caption:
        "The low bid often skips underlayment, uses off-brand shingles, or rushes the flashing work. Ask any roofer for references, photos, and a written warranty — then compare the whole package, not just the price.",
    },
  ],
  "Behind the scenes": [
    {
      pillar: "Behind the scenes",
      platform: "Instagram Reels",
      headline: "5:30 AM at a {town} re-roof.",
      hook: "Most of {town} is still asleep when we start.",
      caption:
        "Crew call: tarp down, dump trailer spotted, safety lines up. By the time the coffee's done, the tear-off is moving. This is what 'we'll handle it' actually looks like.",
    },
    {
      pillar: "Behind the scenes",
      platform: "Facebook",
      headline: "What a full roof replacement setup looks like.",
      hook: "The tarps, the trailer, the magnets — none of it is an accident.",
      caption:
        "We cover the gardens, magnet-sweep every nail, and leave the yard cleaner than we found it. Behind every roof we put on is a checklist that keeps your home safe while we work.",
    },
    {
      pillar: "Behind the scenes",
      platform: "Google Business Profile",
      headline: "Meet the crew on your roof this week.",
      hook: "These are the hands that'll rebuild your roof.",
      caption:
        "Certified installers, weekly safety briefings, and a supervisor on every job in {town}. We post the crew so you know exactly who's working on your home. Say hi if you see the trucks.",
    },
  ],
  "Local & community": [
    {
      pillar: "Local & community",
      platform: "Instagram Reels",
      headline: "Spotted in {town}: our truck, your neighbor's roof.",
      hook: "If you live on Elm Street, you've seen this view.",
      caption:
        "Week three of the {town} roofing circuit — three re-roofs, one street. We're local, we're licensed, and we show up. Got shingles that look like your neighbor's old ones? Give us a shout.",
    },
    {
      pillar: "Local & community",
      platform: "Facebook",
      headline: "Supporting {town} one roof at a time.",
      hook: "We live here. We coach here. We roof here.",
      caption:
        "We sponsor the little league team, hire local crews, and answer our own phone. When you hire a local roofer, the money stays in {town}. Thanks for keeping us busy, neighbors.",
    },
    {
      pillar: "Local & community",
      platform: "Google Business Profile",
      headline: "Proud to be a {town} business.",
      hook: "Local license, local crew, local roots.",
      caption:
        "We're not a franchise that sends a van from two counties away. We're your neighbors, and we've been re-roofing {town} homes for years. Drop a review if we've worked on your home — it genuinely helps a local crew.",
    },
  ],
  "Customer win": [
    {
      pillar: "Customer win",
      platform: "Instagram Reels",
      headline: "Customer review: 'It rained and nothing leaked.'",
      hook: "That's the review that makes our week.",
      caption:
        "Mrs. Alvarez's roof was 22 years old and leaking over the kitchen. Six days later: new shingles, clean gutters, dry ceiling. She left us a five-star review — and a plate of cookies. This is why we do it.",
    },
    {
      pillar: "Customer win",
      platform: "Facebook",
      headline: "From 'we have a leak' to 'it's done, thank you' in 48 hours.",
      hook: "When water is dripping, nobody wants to wait two weeks.",
      caption:
        "Emergency tarp Monday, full repair Wednesday. The Davises were back to normal before the weekend. If you're sitting under a leak right now, don't wait — we keep emergency slots in {town}.",
    },
    {
      pillar: "Customer win",
      platform: "Google Business Profile",
      headline: "Another {town} homeowner, another happy ending.",
      hook: "You can't buy this kind of review.",
      caption:
        "'Professional, punctual, and the yard was spotless.' — Tom R., {town}. We post these because they're real. Every review is a real family whose roof we fixed. Need yours next? Book a free estimate.",
    },
  ],
  "Seasonal & timely": [
    {
      pillar: "Seasonal & timely",
      platform: "Instagram Reels",
      headline: "Hail season is here — check your roof this week.",
      hook: "That hailstorm last month may have cost you more than you think.",
      caption:
        "Hail bruises shingles without always breaking them — and the damage only shows later. In {town}, spring storms mean roof checks. Walk the yard for granules, then call us for a free inspection.",
    },
    {
      pillar: "Seasonal & timely",
      platform: "Facebook",
      headline: "Fall checklist for {town} roofs.",
      hook: "Before the rain returns, do these three things.",
      caption:
        "Clear the gutters, trim branches off the roofline, and check for lifted or curled shingles. Ten minutes now saves you a headache in November. And if anything looks off, we'll come take a look.",
    },
    {
      pillar: "Seasonal & timely",
      platform: "Google Business Profile",
      headline: "Snow's coming. Is your roof ready?",
      hook: "Warm attics + snow on top = ice dams.",
      caption:
        "Ice dams form when heat escapes through the roof and melts snow from underneath. Good ventilation and sealed penetrations stop it before it starts. In {town}, prep now and thank yourself in January. Free estimate — book online.",
    },
  ],
  "Safety tip": [
    {
      pillar: "Safety tip",
      platform: "Instagram Reels",
      headline: "Never power-wash your roof.",
      hook: "It's satisfying to watch. It's also how roofs die early.",
      caption:
        "Pressure washing blasts granules off shingles and turns a 25-year roof into a 12-year roof. Use a soft wash or just let us handle it. Save this before you rent that pressure washer.",
    },
    {
      pillar: "Safety tip",
      platform: "Facebook",
      headline: "If you're going to check your roof, please stay safe.",
      hook: "Every year, folks end up in the ER for a roof check.",
      caption:
        "Never walk a wet roof. Never lean a ladder against the gutter. If you need a look, call us — our crew is trained, insured, and happy to do it for free. Your health is worth more than a shingle.",
    },
    {
      pillar: "Safety tip",
      platform: "Google Business Profile",
      headline: "Why you shouldn't DIY a roof repair.",
      hook: "One wrong step on a 6/12 pitch is a hospital bill.",
      caption:
        "Roof work is one of the most dangerous jobs in construction — and homeowners attempt it every weekend. We're licensed, insured, and trained for it. Let us take the risk, not you. Free estimate in {town}.",
    },
  ],
  "Education & FAQ": [
    {
      pillar: "Education & FAQ",
      platform: "Instagram Reels",
      headline: "Shingle colors matter more than you think.",
      hook: "That 'cheapest color' may cost you in AC bills.",
      caption:
        "Light shingles reflect heat; dark shingles absorb it. In {town} summers, the right color can move the needle on upstairs temperatures. Ask us what works for your roof's pitch and exposure — we'll tell you straight.",
    },
    {
      pillar: "Education & FAQ",
      platform: "Facebook",
      headline: "5 questions to ask before hiring a roofer.",
      hook: "Ask these before you sign anything.",
      caption:
        "Are you licensed and insured? Who's the manufacturer-certified installer? What's the written warranty? What happens if it rains mid-job? Can I see recent {town} work? Get the answers in writing — every one of our quotes comes with them.",
    },
    {
      pillar: "Education & FAQ",
      platform: "Google Business Profile",
      headline: "What's actually in a roof estimate?",
      hook: "A quote is more than a price — here's how to read one.",
      caption:
        "Material grade, underlayment, flashing, ventilation, tear-off, and disposal — each line tells you what you're buying. We itemize everything so you can compare apples to apples. Have a quote from someone else? Bring it in — we'll show you the difference.",
    },
  ],
};

const PLUMBING: TradeCatalog = {
  "Before & after": [
    {
      pillar: "Before & after",
      platform: "Instagram Reels",
      headline: "Before: a water heater from 2004. After: hot water on demand.",
      hook: "Watch the 18-year-old tank leave the building.",
      caption:
        "Rusty tank, sediment six inches deep, and lukewarm mornings — swapped for a new high-efficiency unit in one afternoon. The {town} homeowner didn't even have to be home. Drain the old, install the new, haul it away.",
    },
    {
      pillar: "Before & after",
      platform: "Facebook",
      headline: "The pipe that started a bathroom remodel.",
      hook: "This leak hid inside the wall for months.",
      caption:
        "That musty smell? A pinhole leak in the copper, right behind the shower. We found it, fixed it, and while the wall was open the homeowner decided on a full refresh. Start with the leak — the remodel can come later.",
    },
    {
      pillar: "Before & after",
      platform: "Google Business Profile",
      headline: "Kitchen before/after: no more 'sink full of standing water.'",
      hook: "Drain fixed in 40 minutes. You can't even tell we were here.",
      caption:
        "Slow kitchen drain that backed up every week — camera inspection showed a grease clog in the line. Cleared, camera-checked, and the disposal re-mounted. Another happy {town} kitchen.",
    },
  ],
  "How-to tip": [
    {
      pillar: "How-to tip",
      platform: "Instagram Reels",
      headline: "Where that smell is coming from (and it's not the sink).",
      hook: "If your bathroom smells like a sewer, check this first.",
      caption:
        "The P-trap — that curved pipe under the sink — goes dry when it's unused, and sewer gas comes right up. Run water in every drain monthly, or pour a cup of water down infrequently-used drains. 30 seconds, no plumber needed.",
    },
    {
      pillar: "How-to tip",
      platform: "Facebook",
      headline: "How to shut off your water in an emergency.",
      hook: "When the pipe bursts, you have about 60 seconds to act.",
      caption:
        "Find the main shutoff now — usually where the water enters the house, often near the water heater or a front wall. Label it, test it once a year, and show your family. If you can't find yours, we'll show you on a service visit.",
    },
    {
      pillar: "How-to tip",
      platform: "Google Business Profile",
      headline: "The right way to plunge a toilet (yes, there's a right way).",
      hook: "You're probably doing it wrong.",
      caption:
        "Seal the flange, slow pushes first, then fast ones — never violent yanks, which blow out the wax ring. If a plunger doesn't clear it, stop: a camera will show us what's really going on before it gets worse.",
    },
  ],
  "Myth-busting": [
    {
      pillar: "Myth-busting",
      platform: "Instagram Reels",
      headline: "Myth: lemons keep your garbage disposal clean.",
      hook: "It smells fresh for a day. The blades are still dirty.",
      caption:
        "Lemons deodorize — they don't clean. Ice cubes and coarse salt actually knock the gunk off the impellers. And never, ever put grease down the drain while you're at it.",
    },
    {
      pillar: "Myth-busting",
      platform: "Facebook",
      headline: "Myth: a 'flushable' wipe is fine for your pipes.",
      hook: "The package says flushable. The sewer line disagrees.",
      caption:
        "Wipes don't break down — they tangle with everything else and build blockages that eventually hit the main line. We clear {town} homes of this exact clog every month. Trash can, not toilet. It's that simple.",
    },
    {
      pillar: "Myth-busting",
      platform: "Google Business Profile",
      headline: "Myth: you need a plumber for every slow drain.",
      hook: "Some slow drains are a 10-minute fix you can do yourself.",
      caption:
        "If one sink is slow, the aerator or trap is likely clogged — removable by hand. If *every* drain is slow, that's the main line and you need a camera, not a bottle of chemicals. We'll tell you which one you've got.",
    },
  ],
  "Behind the scenes": [
    {
      pillar: "Behind the scenes",
      platform: "Instagram Reels",
      headline: "What's inside your walls — a day in the life of a {town} plumber.",
      hook: "Most people never see what we see.",
      caption:
        "Demo day: we opened the wall, found the 60-year-old galvanized pipe, and replaced it with modern copper. Half the job is detective work — tracing where water has been quietly ruining things. That's what the camera is for.",
    },
    {
      pillar: "Behind the scenes",
      platform: "Facebook",
      headline: "The van is our office. Here's what's in it.",
      hook: "If you see us parked on your street, this is the arsenal.",
      caption:
        "Two of everything, a camera rig, a locating wand, and parts for 90% of the repairs we get called for. That's why we can usually fix it in one visit instead of 'we'll need to order the part.'",
    },
    {
      pillar: "Behind the scenes",
      platform: "Google Business Profile",
      headline: "Behind the scenes: a sewer line replacement in {town}.",
      hook: "This is why your neighbor's yard had a trench.",
      caption:
        "When tree roots invade the clay line, the fix is a replacement. We dig, pipe, backfill, and re-seed — and the homeowner's insurance sorted most of it. No more backup, no more roots, no more surprises.",
    },
  ],
  "Local & community": [
    {
      pillar: "Local & community",
      platform: "Instagram Reels",
      headline: "Your pipes might be older than your house in {town}.",
      hook: "Half the homes we work in have pipes older than their owners.",
      caption:
        "Galvanized steel from the '60s, cast iron from the '70s — {town} has a lot of vintage plumbing. It worked for decades, but it's living on borrowed time. If your water pressure is dropping, it's not the city's problem.",
    },
    {
      pillar: "Local & community",
      platform: "Facebook",
      headline: "We're the plumbers your neighbors call.",
      hook: "Word of mouth built this business — every review keeps it going.",
      caption:
        "Third generation of {town} families calling us when the hot water dies on a Sunday. We answer our own phone and show up when we say we will. Know someone with a leak right now? Tag them — that's what neighbors are for.",
    },
    {
      pillar: "Local & community",
      platform: "Google Business Profile",
      headline: "Local roots, {town} license, real answers.",
      hook: "You'll talk to a plumber, not a call center.",
      caption:
        "When you call us, a licensed plumber picks up — not a dispatch robot. We've been in {town} for years, and our reviews show it. Looking for a plumber who'll actually call back? That's us.",
    },
  ],
  "Customer win": [
    {
      pillar: "Customer win",
      platform: "Instagram Reels",
      headline: "The 9 PM call that saved a {town} basement.",
      hook: "Main line backup, water rising — our phone rang at 9 PM.",
      caption:
        "We had a crew there in under an hour, cleared the line, and had the water moving again before midnight. The homeowner's review: 'They saved our basement and our weekend.' Emergencies are why we keep night slots.",
    },
    {
      pillar: "Customer win",
      platform: "Facebook",
      headline: "No hot water since Tuesday. Fixed by Thursday lunch.",
      hook: "Three days of cold showers was three days too many.",
      caption:
        "The Harrisons' water heater died mid-week — we had a new one installed by Thursday. No upselling, no 'we'll call you back,' just a working shower. That's the service we'd want, so it's the service we give.",
    },
    {
      pillar: "Customer win",
      platform: "Google Business Profile",
      headline: "From leak to fixed: one {town} family's review.",
      hook: "'On time, tidy, and the price matched the quote.'",
      caption:
        "We fixed the Martinez family's slab leak, repainted the patch, and left the garage spotless. They left a five-star review — we left a warranty card. Fair price, honest work, done when we said.",
    },
  ],
  "Seasonal & timely": [
    {
      pillar: "Seasonal & timely",
      platform: "Instagram Reels",
      headline: "Frozen pipes: 10 minutes now saves a $2,000 mess.",
      hook: "The first hard freeze in {town} is coming.",
      caption:
        "Disconnect garden hoses, insulate exposed pipes in crawlspaces, and know where your shutoff is. A burst pipe is the most expensive plumbing call of the year — and nearly always preventable. Prep this weekend.",
    },
    {
      pillar: "Seasonal & timely",
      platform: "Facebook",
      headline: "Spring in {town}: time to check the sump pump.",
      hook: "The rain's coming. Is your pump ready?",
      caption:
        "Test it: pour a bucket of water into the pit and make sure it kicks on and drains. If it hums but doesn't pump, it's dying right on schedule. Fix it now, before the basement does the testing for you.",
    },
    {
      pillar: "Seasonal & timely",
      platform: "Google Business Profile",
      headline: "Holiday kitchen warning: don't put turkey fat down the drain.",
      hook: "Thanksgiving is the busiest day of the year for drain clogs.",
      caption:
        "Turkey fat looks liquid when it's hot — and it's solid grease by the time it hits your pipes. Skim it into a jar, let it cool, toss it. Keep the holiday about the food, not the plumber.",
    },
  ],
  "Safety tip": [
    {
      pillar: "Safety tip",
      platform: "Instagram Reels",
      headline: "That hissing water heater is a warning. Take it seriously.",
      hook: "Yes, really — this is the one to act on today.",
      caption:
        "Water heaters are pressurized. A failing relief valve, rusted tank, or gas smell means call a pro today, not next week. We've seen tanks fail in spectacular ways — don't let it be yours.",
    },
    {
      pillar: "Safety tip",
      platform: "Facebook",
      headline: "Carbon monoxide: the leak you can't see or smell.",
      hook: "You're not going to like this one, but read it anyway.",
      caption:
        "If your water heater or furnace runs on gas, a cracked heat exchanger or backdraft can push CO into the house. That's why the vent pipe gets checked on every visit. Have a CO alarm near every sleeping area — and test it monthly.",
    },
    {
      pillar: "Safety tip",
      platform: "Google Business Profile",
      headline: "Why we never tell you to 'just add more chemicals' to a clog.",
      hook: "Drano doesn't know where to stop.",
      caption:
        "Chemical drain cleaners eat clogs — and, over time, PVC and metal pipes. The slow drain you 'fixed' three times is actually a pipe that's degrading. We camera-inspect instead. Safer for you, safer for your pipes, safer for the environment.",
    },
  ],
  "Education & FAQ": [
    {
      pillar: "Education & FAQ",
      platform: "Instagram Reels",
      headline: "Water pressure: the number your house should be at.",
      hook: "Most homes in {town} are either starving or screaming for water.",
      caption:
        "Ideal is 40-60 psi. Above 80, you're wearing out fixtures and risk sudden bursts; below 40, showers feel weak. Ask us to check yours on the next visit — it's a two-minute gauge test.",
    },
    {
      pillar: "Education & FAQ",
      platform: "Facebook",
      headline: "Hard water, explained in 30 seconds.",
      hook: "White spots on the faucets? That's a clue, not just ugly.",
      caption:
        "Hard water is dissolved calcium and magnesium. It shortens water heater life, clogs showerheads, and eats fixtures. A softener or a simple descaling schedule fixes most of it. If your glassware is cloudy, your water is telling you something.",
    },
    {
      pillar: "Education & FAQ",
      platform: "Google Business Profile",
      headline: "FAQ: why does my toilet run all night?",
      hook: "It's not haunted — it's a flapper.",
      caption:
        "A worn flapper leaks water from tank to bowl 24/7 — that's the ghost-flush sound and the wasted water. It's usually a $10 part and a 10-minute swap. Want us to show you? We can do it while we're out anyway.",
    },
  ],
};

const HVAC: TradeCatalog = {
  "Before & after": [
    {
      pillar: "Before & after",
      platform: "Instagram Reels",
      headline: "Old AC out, new one in — a {town} before/after.",
      hook: "Watch the 2006 unit leave on a dolly.",
      caption:
        "The old unit was a decade past its prime, blowing warm air and eating electricity. New high-efficiency system, new thermostat, and the upstairs is finally cool in {town} summer. The homeowner's first comment? 'Why didn't I do this sooner?'",
    },
    {
      pillar: "Before & after",
      platform: "Facebook",
      headline: "Before: a furnace from the 90s. After: a bill that's 25% lower.",
      hook: "The old furnace was a money furnace.",
      caption:
        "This {town} home was heating the attic and paying for it. We replaced the unit, sealed the ducts, and their gas bill dropped. Equipment age matters — if yours is 15+, it's worth a conversation.",
    },
    {
      pillar: "Before & after",
      platform: "Google Business Profile",
      headline: "The difference a duct seal makes (photos included).",
      hook: "30% of your cooling was leaking into the crawlspace.",
      caption:
        "We sealed and insulated the ducts in this {town} home, and the upstairs bedrooms dropped 8 degrees without touching the thermostat. The pictures tell the story — cracked flex duct, fixed and sealed.",
    },
  ],
  "How-to tip": [
    {
      pillar: "How-to tip",
      platform: "Instagram Reels",
      headline: "Change your filter. That's the whole reel.",
      hook: "One of the most expensive HVAC problems is a $10 filter.",
      caption:
        "A clogged filter starves the system, freezes the coil in summer, and overheats the furnace in winter. Check it monthly, change it when it's gray. Set a phone reminder — your HVAC bill will thank you.",
    },
    {
      pillar: "How-to tip",
      platform: "Facebook",
      headline: "Why your AC runs all day but the house never cools.",
      hook: "Before you call anyone, check these three things.",
      caption:
        "1) Filter — clogged? 2) Outside unit — is the coil caked with {town} dust and grass? 3) Vents — are furniture or rugs covering returns? All three are free to fix. Still warm after that? Now call us.",
    },
    {
      pillar: "How-to tip",
      platform: "Google Business Profile",
      headline: "The right thermostat settings for {town} summers.",
      hook: "There's a 'set it and forget it' sweet spot.",
      caption:
        "We recommend 78° when you're home, higher when you're out, and a programmable schedule instead of deep drops. Every degree you raise the setpoint in summer saves about 3% on cooling. Comfort and savings can coexist.",
    },
  ],
  "Myth-busting": [
    {
      pillar: "Myth-busting",
      platform: "Instagram Reels",
      headline: "Myth: bigger AC is better.",
      hook: "A bigger system won't cool faster — it'll just freeze up.",
      caption:
        "An oversized AC cycles on and off constantly, short-cycling, freezing the coil, and failing to dehumidify. Correct size comes from a load calculation, not square footage. Trust the math, not the 'more power' pitch.",
    },
    {
      pillar: "Myth-busting",
      platform: "Facebook",
      headline: "Myth: closing vents in unused rooms saves energy.",
      hook: "You're not helping — you're pressurizing the system.",
      caption:
        "Closing vents raises duct pressure, which can blow out seals and cause the blower to work harder. The 'savings' are imaginary; the wear and tear is real. Leave vents open and use zoning the right way.",
    },
    {
      pillar: "Myth-busting",
      platform: "Google Business Profile",
      headline: "Myth: if it's blowing cold air, the AC is fine.",
      hook: "Cold air ≠ the right temperature.",
      caption:
        "An AC can blow 55° air and still fail to cool your house because it's low on refrigerant or the coil is dirty. The real test is whether the space reaches the setpoint. That's what our tune-up measures — actual performance, not just cold air.",
    },
  ],
  "Behind the scenes": [
    {
      pillar: "Behind the scenes",
      platform: "Instagram Reels",
      headline: "4 AM on a {town} July morning: why we start so early.",
      hook: "We're on rooftops before the sun makes it dangerous.",
      caption:
        "Summer installs in {town} start at first light — for us and for the equipment. This is a full changeout: condenser, coil, lineset, the works. By noon, the crane's gone and the cool air's on.",
    },
    {
      pillar: "Behind the scenes",
      platform: "Facebook",
      headline: "What's actually in an HVAC tune-up.",
      hook: "It's not just 'spray and pray' — here's the checklist.",
      caption:
        "Amperage draw, refrigerant pressures, coil condition, capacitor health, airflow readings, thermostat calibration. 20+ checks on every visit, logged and explained. If a 'tune-up' doesn't involve a multimeter, you're paying for a sticker.",
    },
    {
      pillar: "Behind the scenes",
      platform: "Google Business Profile",
      headline: "The part that makes your AC actually cold (and why it fails).",
      hook: "This little cylinder does a giant job.",
      caption:
        "The capacitor is the muscle that starts the compressor and fan. In {town} heat, they fail regularly — that's the classic 'AC hums but won't start.' It's a 20-minute fix. Not a new system. Ask for the diagnosis before you ever say 'replace it.'",
    },
  ],
  "Local & community": [
    {
      pillar: "Local & community",
      platform: "Instagram Reels",
      headline: "{town} summers are no joke. Neither is our response time.",
      hook: "When it's 98°, a broken AC isn't an inconvenience.",
      caption:
        "That's why we keep same-week slots and a real human on the phone. {town} neighbors know us from church, school pickup, and the hardware store. If your AC quits in a heatwave, we treat it like the emergency it is.",
    },
    {
      pillar: "Local & community",
      platform: "Facebook",
      headline: "Cooling {town} one home at a time.",
      hook: "We've got more references in this town than we can count.",
      caption:
        "From the old brick houses near the square to the new builds on the edge of town, we've worked on most of {town} over the years. Ask around — then ask us for a quote. Happy to be judged by our neighbors.",
    },
    {
      pillar: "Local & community",
      platform: "Google Business Profile",
      headline: "A {town} business with {town} technicians.",
      hook: "No call center, no out-of-state dispatchers.",
      caption:
        "When you call, you get a local tech who knows {town} construction — the crawlspaces, the clay soil, the way the wind hits the east side. We're your neighbors, and we'll treat your home like ours.",
    },
  ],
  "Customer win": [
    {
      pillar: "Customer win",
      platform: "Instagram Reels",
      headline: "Her AC died on the hottest day of the year.",
      hook: "Baby at home, 101° outside — you can't wait three days.",
      caption:
        "We had a loaner unit running that afternoon and her new system installed two days later. Her review: 'They didn't just fix it — they took care of us.' Heatwave response is a promise, not a perk.",
    },
    {
      pillar: "Customer win",
      platform: "Facebook",
      headline: "The {town} family that saved $400 a year on cooling.",
      hook: "New system, same comfort, smaller bill.",
      caption:
        "The Whitfields' 14-year-old system was running constantly and their July bill was brutal. New SEER-rated equipment plus a duct seal and their usage dropped. They paid less per month than the old system's electric bill.",
    },
    {
      pillar: "Customer win",
      platform: "Google Business Profile",
      headline: "Review of the week from {town}.",
      hook: "'They found the problem two other companies missed.'",
      caption:
        "The unit was short-cycling and two quotes said 'replace the whole system.' We found the real culprit — a failing control board — and fixed it for a fraction of the cost. Honest diagnosis is the whole job.",
    },
  ],
  "Seasonal & timely": [
    {
      pillar: "Seasonal & timely",
      platform: "Instagram Reels",
      headline: "Before {town} summer hits, do this.",
      hook: "May is when ACs start dying. Don't be June's statistic.",
      caption:
        "Book the tune-up before the heatwave, not during. A spring check catches refrigerant leaks and capacitor fatigue while there's still time to order parts. It's cheaper to prevent than to rush.",
    },
    {
      pillar: "Seasonal & timely",
      platform: "Facebook",
      headline: "The first cold snap is coming — here's the furnace checklist.",
      hook: "October is the month furnaces fail. Every year.",
      caption:
        "Change the filter, clear the vents, check the CO alarm, and book the annual safety inspection. {town} winters aren't forgiving — a furnace that dies on the coldest night of the year is the avoidable kind of emergency.",
    },
    {
      pillar: "Seasonal & timely",
      platform: "Google Business Profile",
      headline: "Why your heat pump runs nonstop in the shoulder season.",
      hook: "It's not broken. Here's what's actually happening.",
      caption:
        "Heat pumps cycle differently in mild weather — long, low-speed runs keep the house even and efficient. If your bills are normal and the house is comfortable, it's working. If it's running nonstop *and* you're cold, call us.",
    },
  ],
  "Safety tip": [
    {
      pillar: "Safety tip",
      platform: "Instagram Reels",
      headline: "3 smells from your vents you should never ignore.",
      hook: "If you smell any of these, shut it off and call us.",
      caption:
        "Burning or fishy = electrical problem. Rotten eggs = possible gas leak. Sweet or chemical = refrigerant or mold. Smells are your system talking — don't wait for the smoke detector to chime in.",
    },
    {
      pillar: "Safety tip",
      platform: "Facebook",
      headline: "The CO alarm test you should do tonight.",
      hook: "One beep every 30 seconds is not a low-battery chirp.",
      caption:
        "A consistent beep pattern means carbon monoxide detected — get everyone outside and call the gas company. Low-battery is a single chirp. Know the difference; it saves lives. We check CO levels on every service call, free.",
    },
    {
      pillar: "Safety tip",
      platform: "Google Business Profile",
      headline: "Furnace safety: what our tech checks before winter.",
      hook: "A cracked heat exchanger is invisible — and deadly.",
      caption:
        "Every fall, we inspect the heat exchanger, burner flame, and venting before we sign off on a furnace. It's the difference between 'ready for winter' and 'heater that leaks CO.' That's why we never skip the safety inspection.",
    },
  ],
  "Education & FAQ": [
    {
      pillar: "Education & FAQ",
      platform: "Instagram Reels",
      headline: "SEER ratings in 30 seconds.",
      hook: "That sticker on your AC? Here's what it actually means.",
      caption:
        "SEER measures cooling efficiency — higher is better, and newer systems are far ahead of the 10-SEER units from 2006. Upgrading from 10 to 16 SEER can cut cooling power use by a third. If your unit's 15+, ask what a swap saves you.",
    },
    {
      pillar: "Education & FAQ",
      platform: "Facebook",
      headline: "Why your AC freezes in summer (yes, summer).",
      hook: "Ice on the outside unit is not 'extra cold' — it's a symptom.",
      caption:
        "A frozen coil usually means low refrigerant or restricted airflow — a dirty filter, blocked return, or closed vents. Turn the system off and let it thaw, change the filter, and call if it refreezes. Ice is never normal.",
    },
    {
      pillar: "Education & FAQ",
      platform: "Google Business Profile",
      headline: "FAQ: how often should I replace my HVAC system?",
      hook: "The honest answer is 'it depends' — here's how to know.",
      caption:
        "Most systems last 12-15 years with regular maintenance. The real triggers: rising repair bills, falling efficiency, refrigerant phaseouts, and comfort that never improves. We'll tell you honestly whether repair or replace wins — and show you the math.",
    },
  ],
};

const LANDSCAPING: TradeCatalog = {
  "Before & after": [
    {
      pillar: "Before & after",
      platform: "Instagram Reels",
      headline: "From dirt lot to backyard oasis in {town}.",
      hook: "6 weeks. One crew. Zero shortcuts.",
      caption:
        "This {town} backyard was a mud pit with a dying lawn. Now: sod, a paver patio, landscape lighting, and a planting bed the homeowner actually knows how to water. We design it, build it, and show you how to keep it.",
    },
    {
      pillar: "Before & after",
      platform: "Facebook",
      headline: "The lawn that was 'past saving' — 8 weeks later.",
      hook: "Brown, compacted, weed-infested. Then we got to work.",
      caption:
        "Aeration, compost top-dress, overseeding, and a watering plan. The before photos barely look like the same yard. If your lawn looks dead, it's probably just asking for better soil — not replacement.",
    },
    {
      pillar: "Before & after",
      platform: "Google Business Profile",
      headline: "Front yard refresh, {town} style.",
      hook: "Curb appeal is the cheapest home upgrade there is.",
      caption:
        "New edging, fresh mulch, native plantings, and a cleaned-up walkway. Total time: two days. The neighbors have already asked who did it. A great front yard isn't a luxury — it's the first impression of your home.",
    },
  ],
  "How-to tip": [
    {
      pillar: "How-to tip",
      platform: "Instagram Reels",
      headline: "How to mow your lawn like a pro.",
      hook: "You've been mowing wrong. Watch this.",
      caption:
        "Don't scalp it — cut no more than a third of the blade. Mow in different directions each time to prevent grain, and keep the blades sharp. Dull blades shred grass instead of cutting it, which is how lawns turn brown at the tips.",
    },
    {
      pillar: "How-to tip",
      platform: "Facebook",
      headline: "The 15-minute watering rule for {town} summers.",
      hook: "Watering every day? That's how you grow weak roots.",
      caption:
        "Deep, infrequent watering wins: 1-1.5 inches once or twice a week beats a sprinkle every night. Water early morning so it soaks in before the {town} sun evaporates it. Your lawn will grow deeper roots and shrug off heat.",
    },
    {
      pillar: "How-to tip",
      platform: "Google Business Profile",
      headline: "When to prune what: a {town} quick guide.",
      hook: "Prune at the wrong time and you'll prune this year's blooms off.",
      caption:
        "Spring bloomers (lilac, azalea) prune right after flowering. Summer bloomers (hydrangea, roses) prune in late winter or early spring. When in doubt, cut less — you can always cut more next year.",
    },
  ],
  "Myth-busting": [
    {
      pillar: "Myth-busting",
      platform: "Instagram Reels",
      headline: "Myth: grass clippings cause thatch.",
      hook: "The bag is doing more harm than the clippings.",
      caption:
        "Clippings are 80% water and break down fast, feeding the lawn for free. Thatch comes from overfeeding and compacted soil, not clippings. Mulch them — your lawn gets free fertilizer and you never rake again.",
    },
    {
      pillar: "Myth-busting",
      platform: "Facebook",
      headline: "Myth: more fertilizer = better lawn.",
      hook: "Burning that stripe into your lawn isn't 'feeding' it.",
      caption:
        "Over-fertilizing creates thatch, torches the grass in summer heat, and runs off into the water. The right amount on the right schedule beats a heavy handful every time. We can test your soil and tell you exactly what it needs.",
    },
    {
      pillar: "Myth-busting",
      platform: "Google Business Profile",
      headline: "Myth: you have to 'de-thatch' every spring.",
      hook: "Most lawns don't need it — and doing it wrong hurts.",
      caption:
        "Thatch over ½ inch is rare on a well-maintained lawn. Power-raking a healthy lawn tears up the crowns and opens it to weeds. If your lawn is spongy underfoot, let's measure before you rent the machine.",
    },
  ],
  "Behind the scenes": [
    {
      pillar: "Behind the scenes",
      platform: "Instagram Reels",
      headline: "What it actually takes to install a paver patio.",
      hook: "It's not 'put pavers on sand' — far from it.",
      caption:
        "Excavation, compacted base, plate compactor passes, edge restraints, joint sand — a patio is a foundation with pretty stone on top. Skip the base and your 'patio' becomes a wavy mess in two winters. This is why the prep is 60% of the job.",
    },
    {
      pillar: "Behind the scenes",
      platform: "Facebook",
      headline: "Meet the crew that's been in your neighborhood all week.",
      hook: "If you've seen the trucks, here's the team behind them.",
      caption:
        "Five guys, one goal: make this {town} backyard the best on the block. We're on site by 7, tools cleaned by 5, and we leave the street cleaner than we found it. Hard work, done right, on schedule.",
    },
    {
      pillar: "Behind the scenes",
      platform: "Google Business Profile",
      headline: "A day of planting in {town}: what goes into a bed.",
      hook: "It's more than 'dig hole, drop plant.'",
      caption:
        "Soil amendment, spacing for mature size, root ball depth, mulch depth, and a watering schedule that gets them through the first summer. Every plant in this bed was chosen for {town}'s sun and soil. Plant it right, and it thrives for decades.",
    },
  ],
  "Local & community": [
    {
      pillar: "Local & community",
      platform: "Instagram Reels",
      headline: "What grows best in {town}: the honest list.",
      hook: "Skip the plants that fight your soil and sun.",
      caption:
        "We've planted (and rescued) enough {town} yards to know: natives and well-adapted varieties win every time. Lower water, fewer pests, less fuss. Ask us what works on your side of town before you buy anything from the big-box garden center.",
    },
    {
      pillar: "Local & community",
      platform: "Facebook",
      headline: "Keeping {town} green is a neighborhood effort.",
      hook: "We sponsor the community garden — again this year.",
      caption:
        "From the planters downtown to the youth soccer fields, we believe a town that looks good feels good. Supporting {town} means more than mowing for a living — it means showing up for the community we're part of.",
    },
    {
      pillar: "Local & community",
      platform: "Google Business Profile",
      headline: "The {town} lawn that stopped the block's traffic.",
      hook: "Three people asked for our card while we were working.",
      caption:
        "That's the ripple effect of a great front yard in {town}. We're local, we're licensed, and we know this soil. If your lawn is the weak link on your street, let's fix that this season.",
    },
  ],
  "Customer win": [
    {
      pillar: "Customer win",
      platform: "Instagram Reels",
      headline: "They tried for three years to grow grass in the shade.",
      hook: "This {town} side yard was a dirt patch — until we stopped fighting it.",
      caption:
        "The fix wasn't more seed; it was the right ground cover and a mulched bed. The homeowners love it, the dogs love it, and the maintenance is a fraction of a lawn that never wanted to grow there. Sometimes the win is working with what's there.",
    },
    {
      pillar: "Customer win",
      platform: "Facebook",
      headline: "The review that made our day.",
      hook: "'My yard is the envy of the neighborhood.'",
      caption:
        "Mrs. Okafor's lawn went from weedy to the greenest on the block after a season of soil building. Her review, her words: 'Professional, punctual, and the yard is gorgeous.' Happy customers are the only marketing we need.",
    },
    {
      pillar: "Customer win",
      platform: "Google Business Profile",
      headline: "From overgrown nightmare to weekly maintenance in {town}.",
      hook: "This yard hadn't been touched in two years.",
      caption:
        "We came in, cut back the overgrowth, cleared the beds, and set up a weekly plan. The owner sent us a photo a month later: kids playing in the yard for the first time since they moved in. That's the actual job description.",
    },
  ],
  "Seasonal & timely": [
    {
      pillar: "Seasonal & timely",
      platform: "Instagram Reels",
      headline: "Fall in {town} is for planting. Yes, really.",
      hook: "Spring planting is a myth — fall is the power season.",
      caption:
        "Cooler air, warm soil, and autumn rain mean roots establish before winter. Trees, shrubs, and perennials planted now come up strong in spring. Plus, you skip the summer watering marathon. Book your fall planting before the calendar fills.",
    },
    {
      pillar: "Seasonal & timely",
      platform: "Facebook",
      headline: "Spring cleanup checklist for {town} yards.",
      hook: "Your lawn woke up last week. Here's how to greet it.",
      caption:
        "Dethatch only if needed, aerate compacted areas, apply a light pre-emergent, and sharpen the mower blades. Don't rake the fall leaves into oblivion — mulch them into the beds. Small moves now, big lawn all summer.",
    },
    {
      pillar: "Seasonal & timely",
      platform: "Google Business Profile",
      headline: "The last mow of the season: don't scalp it.",
      hook: "Cut it too short before winter and you'll pay in spring.",
      caption:
        "Leave your lawn at 2.5-3 inches for winter — it shades the crowns and holds moisture. And yes, one more fall fertilization sets up the spring green-up. We're booking {town} winterization now.",
    },
  ],
  "Safety tip": [
    {
      pillar: "Safety tip",
      platform: "Instagram Reels",
      headline: "How to safely use a string trimmer.",
      hook: "This is how people end up in the ER with line wraps.",
      caption:
        "Let the line do the work — don't jam the head into concrete or fencing. Keep the guard on, wear eye protection, and never trim after rain on a slope. And check for debris — hidden rocks become projectiles.",
    },
    {
      pillar: "Safety tip",
      platform: "Facebook",
      headline: "Lawn mower safety: the 3 rules we teach every new crew member.",
      hook: "Mowers send 80,000 people to the ER every year.",
      caption:
        "1) Never reach under a running mower — blades keep spinning after the engine stops. 2) Clear the yard of rocks and toys first. 3) No riders, ever — one seat, one operator. These rules aren't just for pros; they're for every weekend mower.",
    },
    {
      pillar: "Safety tip",
      platform: "Google Business Profile",
      headline: "Heavy pruning? Don't do it from a ladder on uneven ground.",
      hook: "That's a fall waiting to happen.",
      caption:
        "We're insured and trained for high work. For branches near power lines or roof edges, hire the pros — the cost of a service call is nothing compared to a hospital visit. Let us handle the tall stuff.",
    },
  ],
  "Education & FAQ": [
    {
      pillar: "Education & FAQ",
      platform: "Instagram Reels",
      headline: "What your soil test actually tells you.",
      hook: "Your lawn isn't 'bad' — it's hungry for a specific thing.",
      caption:
        "pH, nitrogen, phosphorus, potassium — a $15 soil test tells you exactly what to add and what to skip. Most {town} lawns need less phosphorus and more organic matter than people think. Test once, save money every year after.",
    },
    {
      pillar: "Education & FAQ",
      platform: "Facebook",
      headline: "Native plants vs. everything else in {town}.",
      hook: "Your water bill will tell you which is winning.",
      caption:
        "Native and adapted plants in {town} handle our heat, drought, and clay soil with far less water and fuss. They also feed local pollinators. We design with natives first — pretty AND practical.",
    },
    {
      pillar: "Education & FAQ",
      platform: "Google Business Profile",
      headline: "FAQ: how often should I water new sod?",
      hook: "Week one decides whether your new lawn lives or dies.",
      caption:
        "New sod needs daily watering for the first 7-10 days — enough to soak through to the soil beneath. Then taper to every other day, then twice a week. Miss the first week and the seams dry out. We include a care card with every install.",
    },
  ],
};

const GREASE: TradeCatalog = {
  "Before & after": [
    {
      pillar: "Before & after",
      platform: "Instagram Reels",
      headline: "A grease trap that hadn't been cleaned in 8 months.",
      hook: "This is what restaurant 'aromas' are made of.",
      caption:
        "When the grease trap fills, the smell doesn't stay in the kitchen — it walks out to the dining room and the alley. We pumped it, scraped it, and documented every inch. Before and after in one video. Your kitchen shouldn't be this one.",
    },
    {
      pillar: "Before & after",
      platform: "Facebook",
      headline: "The 'odor complaint' that wasn't the trash.",
      hook: "The restaurant blamed the dumpster. It was the trap.",
      caption:
        "A {town} restaurant had complaints about the smell near the back door for weeks. One camera check later: a grease trap at 110% capacity, backed up into the line. We cleaned it, and the complaint — and the smell — disappeared. If your back door smells, check the trap first.",
    },
    {
      pillar: "Before & after",
      platform: "Google Business Profile",
      headline: "Kitchen exhaust hood before/after.",
      hook: "That black crust is a fire hazard wearing a disguise.",
      caption:
        "Heavy grease buildup in a hood system is exactly how kitchen fires start. This one hadn't been deep cleaned since it was installed. After our service: bare metal, safe, and ready for the fire marshal. We post the photos because 'trust us' isn't good enough.",
    },
  ],
  "How-to tip": [
    {
      pillar: "How-to tip",
      platform: "Instagram Reels",
      headline: "The right way to scrape a plate (yes, there's a right way).",
      hook: "This 10-second habit saves you from a grease trap emergency.",
      caption:
        "Scrape plates into the trash before the dishwasher. Use a strainer in the sink. Never pour liquid grease down the drain — it hardens in the line, not the trap. Small habits = a kitchen that never has 'the call' at 6 PM on a Friday.",
    },
    {
      pillar: "How-to tip",
      platform: "Facebook",
      headline: "What your grease trap is telling you (before it's an emergency).",
      hook: "Four signs it's time to call us.",
      caption:
        "1) The kitchen sink drains slow. 2) There's a smell near the floor drains. 3) Your line backs up into the dish pit. 4) The last service date sticker is months old. Any of these? Call before the health inspector adds it to the list.",
    },
    {
      pillar: "How-to tip",
      platform: "Google Business Profile",
      headline: "Between services: the 5-minute kitchen checklist.",
      hook: "The time between cleanings is when problems start.",
      caption:
        "Check the trap lid is sealed, strainers are in, degreaser is stocked, and the floor drains are clear. Five minutes a day keeps your kitchen from becoming our emergency call. We put a checklist on every invoice.",
    },
  ],
  "Myth-busting": [
    {
      pillar: "Myth-busting",
      platform: "Instagram Reels",
      headline: "Myth: grease traps clean themselves.",
      hook: "It's a trap — literally.",
      caption:
        "Bacteria additives and 'magic enzymes' can't replace physical removal. Grease, sludge, and solids have to be pumped out and scraped out. If someone tells you a bottle of bacteria replaces a service, run — then call us.",
    },
    {
      pillar: "Myth-busting",
      platform: "Facebook",
      headline: "Myth: 'we don't need a grease trap, we're not a fry place.'",
      hook: "If you cook with any oil, you produce grease.",
      caption:
        "Grilled food, salad dressings, sauces, even coffee creamer leaves residue. {town} health codes require a trap for a reason: it protects the whole sewer line. We service bakeries, delis, and pizzerias — not just fry-heavy spots.",
    },
    {
      pillar: "Myth-busting",
      platform: "Google Business Profile",
      headline: "Myth: dumping hot water 'melts' the grease.",
      hook: "It melts now. It hardens a hundred feet down the pipe.",
      caption:
        "Hot water pushes warm grease past the trap — and it solidifies in the colder main line, building a blockage that costs more than any service call. The trap exists to catch it. Let the trap do its job, and let us empty it.",
    },
  ],
  "Behind the scenes": [
    {
      pillar: "Behind the scenes",
      platform: "Instagram Reels",
      headline: "What a grease trap service actually involves.",
      hook: "Spoiler: it's not glamorous. It's necessary.",
      caption:
        "Pump-out, scrape-down, pressure wash, and a full report with photos. We tag every trap we service with the date and our sticker. This is the job that keeps kitchens safe and drains open — and we're proud of doing it right.",
    },
    {
      pillar: "Behind the scenes",
      platform: "Facebook",
      headline: "Why we show up at 6 AM.",
      hook: "We work around your service, not against it.",
      caption:
        "Before the lunch rush, after closing, or on your slowest day — we schedule around the kitchen, not the other way around. Our crew is in and out with minimal disruption. You run the restaurant; we handle the grease.",
    },
    {
      pillar: "Behind the scenes",
      platform: "Google Business Profile",
      headline: "The truck and the gear: what we bring to every service.",
      hook: "Vacuum truck, high-pressure washer, camera — all of it.",
      caption:
        "We don't just pump — we inspect. The camera catches cracks and blockages before they become a floor of wastewater. Every service includes a condition report so you know exactly what's in your lines.",
    },
  ],
  "Local & community": [
    {
      pillar: "Local & community",
      platform: "Instagram Reels",
      headline: "We keep {town} restaurants running — literally.",
      hook: "If you've eaten out in {town} this month, you've probably eaten at a kitchen we service.",
      caption:
        "From the diner on Main to the new place near the highway, we keep {town}'s grease traps clean and its drains open. Supporting local food means supporting the people who keep it flowing.",
    },
    {
      pillar: "Local & community",
      platform: "Facebook",
      headline: "Shoutout to the {town} kitchens that do it right.",
      hook: "You know who you are — and so do your inspectors.",
      caption:
        "We service some of the cleanest kitchens in {town}. Proper scraping, strainers, and regular maintenance make our job easy — and keep your doors open. Tag your favorite {town} restaurant and give them some love.",
    },
    {
      pillar: "Local & community",
      platform: "Google Business Profile",
      headline: "A local business, cleaning local business.",
      hook: "We're {town}-based and proud of it.",
      caption:
        "We're not a regional dispatcher sending a truck from an hour away. We're your neighbors, and we answer our own phone. Every {town} restaurant we keep clean is a small business like ours. That's why we treat yours like our own.",
    },
  ],
  "Customer win": [
    {
      pillar: "Customer win",
      platform: "Instagram Reels",
      headline: "The call that saved a {town} restaurant's Friday rush.",
      hook: "6 PM Friday, grease backing into the dish pit — and a full dining room.",
      caption:
        "We had a truck there in 90 minutes, cleared the line, and had the kitchen running before the second seating. The owner's review: 'They saved our Friday and our reputation.' Emergency service isn't a luxury — it's how we treat our neighbors.",
    },
    {
      pillar: "Customer win",
      platform: "Facebook",
      headline: "From 'write-up risk' to 'inspector's favorite' in one season.",
      hook: "This {town} kitchen turned it around.",
      caption:
        "A health inspection flagged their trap, so they signed up for monthly service, posted our checklist, and trained the crew. Next inspection: a clean pass and a compliment. It's not magic — it's maintenance. We'd love to help your kitchen do the same.",
    },
    {
      pillar: "Customer win",
      platform: "Google Business Profile",
      headline: "The review that means the most to us.",
      hook: "'Finally, a company that shows up when they say they will.'",
      caption:
        "That's from a {town} restaurant owner who had been burned by no-show service before. Reliability isn't a feature for us — it's the whole product. When we book a slot, we're there. Your kitchen's schedule depends on it.",
    },
  ],
  "Seasonal & timely": [
    {
      pillar: "Seasonal & timely",
      platform: "Instagram Reels",
      headline: "Summer = more grease. Here's why.",
      hook: "Patio season in {town} means fryers working overtime.",
      caption:
        "Warmer weather brings more outdoor dining, more specials, more frying — and more grease volume. If you service quarterly in winter, consider monthly from June through September. It's cheaper than a July backup during a full house.",
    },
    {
      pillar: "Seasonal & timely",
      platform: "Facebook",
      headline: "The holiday crunch: why December is our busiest month.",
      hook: "Catering season is grease season.",
      caption:
        "Holiday parties mean ovens and fryers running nonstop. Book your pre-holiday service now so the trap is fresh before the big push. A backup on the week of your annual party is the phone call nobody wants to make.",
    },
    {
      pillar: "Seasonal & timely",
      platform: "Google Business Profile",
      headline: "Spring is the best time for a line inspection.",
      hook: "Before the rush, find the problems.",
      caption:
        "Winter sludge has settled and compacted. A spring camera inspection catches cracks, roots, and partial blockages before the summer volume makes them urgent. Book it now — the weather's right and the schedule's open.",
    },
  ],
  "Safety tip": [
    {
      pillar: "Safety tip",
      platform: "Instagram Reels",
      headline: "The fire-safety truth about hood grease.",
      hook: "That grease on the hood isn't ugly — it's fuel.",
      caption:
        "A hood system packed with grease is the #1 factor in kitchen fires spreading. NFPA 96 requires regular cleaning for a reason. If you can't remember the last hood service, that's your answer. We deep-clean hoods, filters, and ducts to code.",
    },
    {
      pillar: "Safety tip",
      platform: "Facebook",
      headline: "Kitchen fire safety: the 10-second check.",
      hook: "Look up. What do you see?",
      caption:
        "Filters caked with grease, visible buildup on the hood, or a fire suppression system past its inspection date? Those are the three things inspectors and insurers check first. We'll tell you honestly where you stand — no upsell, just safety.",
    },
    {
      pillar: "Safety tip",
      platform: "Google Business Profile",
      headline: "Slip-and-fall season: why floor care matters.",
      hook: "A greasy floor is a lawsuit waiting to happen.",
      caption:
        "Grease tracked from the kitchen to the dining room turns a normal floor into a hazard. Daily degreasing of the back-of-house and monthly deep cleans keep your team and your customers safe. We include floor degreasing in many of our service plans.",
    },
  ],
  "Education & FAQ": [
    {
      pillar: "Education & FAQ",
      platform: "Instagram Reels",
      headline: "What the health inspector actually checks in your kitchen.",
      hook: "Here's the list nobody posts on the wall.",
      caption:
        "Trap records, hood cleanliness, floor drains, and the dates on your service stickers. Inspectors don't need to smell a problem — they look at paperwork. Regular, documented service keeps you on the right side of the checklist.",
    },
    {
      pillar: "Education & FAQ",
      platform: "Facebook",
      headline: "Grease trap sizes, explained.",
      hook: "Your trap isn't a 'one size fits all' thing.",
      caption:
        "Traps are rated by flow — 500, 1000, 1500+ gallons. Undersized traps fill fast and back up; oversized traps sit and get rancid. We'll measure yours and tell you if it's right for your menu and volume. If it's wrong, we'll give you options.",
    },
    {
      pillar: "Education & FAQ",
      platform: "Google Business Profile",
      headline: "FAQ: how often should a restaurant's grease trap be cleaned?",
      hook: "The honest answer: it depends on your menu.",
      caption:
        "Fry-heavy kitchens: monthly, sometimes twice a month. Light kitchens: quarterly. The right answer comes from volume, not a guess. We'll tell you a schedule that keeps you legal, smell-free, and backed-up-free — and we'll remind you when it's time.",
    },
  ],
};

const OTHER: TradeCatalog = {
  "Before & after": [
    {
      pillar: "Before & after",
      platform: "Instagram Reels",
      headline: "The job they said was 'impossible.' We did it in a day.",
      hook: "Watch the transformation — then read the caption.",
      caption:
        "This one started as 'we've been quoted everywhere, nobody can do it.' Two crews, one day, done. Whatever your project is, the first step is a conversation. We'll tell you straight whether we can handle it — and how.",
    },
    {
      pillar: "Before & after",
      platform: "Facebook",
      headline: "Before and after: the project we're most proud of this month.",
      hook: "The before photo says it all.",
      caption:
        "We don't just show up — we finish. This project had a tight deadline, a tricky site, and a happy customer at the end. If you've got a project you keep putting off, let's talk about making it a 'before and after' too.",
    },
    {
      pillar: "Before & after",
      platform: "Google Business Profile",
      headline: "Fresh photos from our latest project in {town}.",
      hook: "Scroll through — this one turned out great.",
      caption:
        "Completed on time, cleaned up, and exactly what the customer asked for. We document every job and share the good ones. Need something similar in {town}? Send us a message — we'll take a look.",
    },
  ],
  "How-to tip": [
    {
      pillar: "How-to tip",
      platform: "Instagram Reels",
      headline: "The question to ask any contractor before you hire them.",
      hook: "One question filters out half the bad ones.",
      caption:
        "Ask: 'Can I see photos or references from a job like mine in {town}?' If they can't show you comparable work, that's a signal. We keep a portfolio of every project — happy to share it.",
    },
    {
      pillar: "How-to tip",
      platform: "Facebook",
      headline: "3 things to have ready before you call for a quote.",
      hook: "A 2-minute prep saves you a week of back-and-forth.",
      caption:
        "1) What exactly do you need done? 2) Rough timeline. 3) Any photos of the site. That's it. The more we know up front, the faster we can give you a real answer — not a runaround.",
    },
    {
      pillar: "How-to tip",
      platform: "Google Business Profile",
      headline: "How to know it's time to hire a pro (and not DIY).",
      hook: "There's a line between 'save money' and 'spend more.'",
      caption:
        "If it involves heights, electricity, water, or your safety — it's usually worth the pro. If you've attempted it twice and it's still broken, that's your sign. We've 'fixed' plenty of DIY projects. The second time costs more.",
    },
  ],
  "Myth-busting": [
    {
      pillar: "Myth-busting",
      platform: "Instagram Reels",
      headline: "Myth: the cheapest quote is the best deal.",
      hook: "Cheap quotes have a way of getting expensive.",
      caption:
        "Materials, time, and cleanup all cost something. A lowball bid usually means corners somewhere — cheaper materials, rushed work, or surprise add-ons. Compare the scope, not just the number. We itemize ours so you know exactly what you're paying for.",
    },
    {
      pillar: "Myth-busting",
      platform: "Facebook",
      headline: "Myth: 'I can do it myself this weekend.'",
      hook: "Famous last words — and we're not laughing.",
      caption:
        "We've seen the results: half-finished projects, tool rentals that cost more than the job, and safety incidents. Sometimes DIY is great. When it's your main line, your roof, or your livelihood — that's what we're for.",
    },
    {
      pillar: "Myth-busting",
      platform: "Google Business Profile",
      headline: "Myth: a bigger crew means better work.",
      hook: "It means a bigger invoice — not always better results.",
      caption:
        "A small, experienced crew that communicates beats a big crew that doesn't. We'd rather send two people who know the job than five who are learning it. Quality is a habit, not a headcount.",
    },
  ],
  "Behind the scenes": [
    {
      pillar: "Behind the scenes",
      platform: "Instagram Reels",
      headline: "A day in the life: from first call to finished job.",
      hook: "Here's what 'we'll handle it' actually looks like.",
      caption:
        "8 AM: site walk. 9:30: work begins. 3 PM: done, cleaned up, and photos taken for the customer. Every job has a plan, and every plan has a cleanup step. We treat your home or business like our own — because we'd want the same.",
    },
    {
      pillar: "Behind the scenes",
      platform: "Facebook",
      headline: "The tools and the prep behind every job.",
      hook: "The part you don't see: the setup.",
      caption:
        "Equipment checked, materials staged, safety gear on. The 30 minutes before we start is what keeps the job on schedule and incident-free. When you hire us, you're paying for the prep as much as the work.",
    },
    {
      pillar: "Behind the scenes",
      platform: "Google Business Profile",
      headline: "Meet the team.",
      hook: "The people you're hiring, in one post.",
      caption:
        "Local, licensed, and proud of it. We're the ones answering the phone, showing up on site, and standing behind the work. Hire a face, not a faceless number.",
    },
  ],
  "Local & community": [
    {
      pillar: "Local & community",
      platform: "Instagram Reels",
      headline: "Why hiring local in {town} matters.",
      hook: "Your money stays here — and so do we.",
      caption:
        "Local crews hire local people, sponsor local teams, and answer local calls. When you hire us, the dollars stay in {town} and the service stays accountable. That's the kind of business we want to be.",
    },
    {
      pillar: "Local & community",
      platform: "Facebook",
      headline: "Proud to serve {town} and the surrounding area.",
      hook: "We've been here a while — and we're not going anywhere.",
      caption:
        "From small jobs to big projects, {town} keeps us busy and grateful. If we've worked for you, leave us a review — it genuinely helps a local business like ours show up for the next neighbor.",
    },
    {
      pillar: "Local & community",
      platform: "Google Business Profile",
      headline: "Local business, local reputation.",
      hook: "Our reviews are from people you probably know.",
      caption:
        "The best part of working in {town} is the community. We treat every job like it could be a referral — because in this town, it will be. Thanks for trusting us with your projects.",
    },
  ],
  "Customer win": [
    {
      pillar: "Customer win",
      platform: "Instagram Reels",
      headline: "A customer review we'll never forget.",
      hook: "'I didn't think it could be done on time. They proved me wrong.'",
      caption:
        "We promised a date and hit it. The review goes on the wall, the story goes on the page. On-time, on-budget, and done right — that's the whole pitch. We'd love to earn yours next.",
    },
    {
      pillar: "Customer win",
      platform: "Facebook",
      headline: "From first call to done: the whole story.",
      hook: "A tight deadline, a worried customer, and a happy ending.",
      caption:
        "They needed it done before the family arrived — we made it happen. Photos, updates, and no surprises. The thank-you text they sent afterward is saved in our team chat forever. That's why we do this.",
    },
    {
      pillar: "Customer win",
      platform: "Google Business Profile",
      headline: "Another happy {town} customer.",
      hook: "Real people, real projects, real reviews.",
      caption:
        "'Professional from start to finish — we'll be calling them again.' That review isn't a screenshot from somewhere else; it's our work, our customer, our town. Ready to be next? Get in touch.",
    },
  ],
  "Seasonal & timely": [
    {
      pillar: "Seasonal & timely",
      platform: "Instagram Reels",
      headline: "The {town} seasonal checklist nobody posts.",
      hook: "Every season has a 'before it's urgent' list.",
      caption:
        "For most homes and businesses: spring means maintenance, summer means volume, fall means prep, winter means protection. Whatever your project, the best time to book is before the rush. Planning ahead gets you better scheduling and better pricing.",
    },
    {
      pillar: "Seasonal & timely",
      platform: "Facebook",
      headline: "Fall planning: why now is the time to book.",
      hook: "The calendar fills up fast — and we're honest about it.",
      caption:
        "We book out during peak seasons, so the people who plan ahead get the slots. If you have a project on your list, let's talk this week — even if it's for next month. A conversation costs nothing.",
    },
    {
      pillar: "Seasonal & timely",
      platform: "Google Business Profile",
      headline: "Timely tip for {town} this season.",
      hook: "The weather isn't waiting. Neither should you.",
      caption:
        "This time of year, conditions change fast — and so do schedules. If something on your property has been 'on the list,' this is a great window to get it done. Message us for a quick answer on timing and availability.",
    },
  ],
  "Safety tip": [
    {
      pillar: "Safety tip",
      platform: "Instagram Reels",
      headline: "One rule that keeps every job safe.",
      hook: "It's boring. It saves lives.",
      caption:
        "Slow down. Rushing is how cuts, falls, and mistakes happen — and it doesn't actually save time. Every pro on our crew lives by it. Whether it's our crew or another one on your property, watch for safety habits before you sign anything.",
    },
    {
      pillar: "Safety tip",
      platform: "Facebook",
      headline: "What to check before you let anyone work on your property.",
      hook: "Ten seconds of questions, zero regrets.",
      caption:
        "Insurance, license, and references — ask for all three before the work starts. A real business is happy to share them. We carry ours on every job. Protecting your home or business is the first task on our checklist.",
    },
    {
      pillar: "Safety tip",
      platform: "Google Business Profile",
      headline: "If something looks unsafe, say something.",
      hook: "It's not rude — it's a job requirement.",
      caption:
        "A safe worksite protects the customer, the crew, and the public. If you ever see something that doesn't look right on a job, the crew should want to hear it. We do. Safety isn't the boring part of the job — it's the whole point.",
    },
  ],
  "Education & FAQ": [
    {
      pillar: "Education & FAQ",
      platform: "Instagram Reels",
      headline: "The one question that saves you from a bad hire.",
      hook: "Ask it before you sign anything.",
      caption:
        "'Who exactly will be doing the work, and have they done this before?' You're hiring people, not logos. We tell you the crew's names up front — and they've all done this before. That's the standard we hold ourselves to.",
    },
    {
      pillar: "Education & FAQ",
      platform: "Facebook",
      headline: "What a real quote should include.",
      hook: "If these lines are missing, be suspicious.",
      caption:
        "Scope of work, materials, timeline, cleanup, and what's NOT included. A real quote answers all five in writing. We've seen too many 'surprise costs' from vague quotes — ours are itemized so the number we give is the number you pay.",
    },
    {
      pillar: "Education & FAQ",
      platform: "Google Business Profile",
      headline: "FAQ: how far out should I book?",
      hook: "The honest answer might surprise you.",
      caption:
        "For routine work, 1-3 weeks is plenty. For bigger projects or seasonal rushes, a month or more — and early birds get the best slots. If it's urgent, call anyway: we keep room for emergencies. The worst answer is always 'we never asked.'",
    },
  ],
};

export const IDEAS: Record<Trade, TradeCatalog> = {
  Roofing: ROOFING,
  Plumbing: PLUMBING,
  HVAC,
  Landscaping: LANDSCAPING,
  "Grease & cleanup": GREASE,
  Other: OTHER,
};

/* ------------------------------------------------------------------ */
/* Generation                                                          */
/* ------------------------------------------------------------------ */

const CTA_LINES: Record<Cta, string> = {
  "Call/text us": "Call or text us today — we'll get you a straight answer.",
  "Book a free estimate": "Book a free estimate — it takes two minutes.",
  "DM us 'HELP'": "DM us 'HELP' and we'll take it from there.",
};

const fill = (s: string, town: string) => s.replaceAll("{town}", town);

/** Deterministic pseudo-random index from a seed string. */
function pickIndex(seedStr: string, size: number): number {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % size;
}

export function generateWeek(trade: Trade, townInput: string, seed: number): Idea[] {
  const town = townInput.trim() || "[your town]";
  const catalog = IDEAS[trade];

  // Rotate the pillar order by the seed so different weeks feature different
  // pillars; take 7 distinct pillars per week (9 total, so the mix shifts).
  const offset = seed % PILLARS.length;
  const pillars: Pillar[] = [
    ...PILLARS.slice(offset),
    ...PILLARS.slice(0, offset),
  ].slice(0, DAYS.length);

  return DAYS.map((day, i) => {
    const pillar = pillars[i];
    const pool = catalog[pillar];
    const template = pool[pickIndex(`${trade}|${pillar}|${seed}|${i}`, pool.length)];
    const cta = CTAS[(seed + i) % CTAS.length];
    const caption = `${fill(template.caption, town)}\n\n${CTA_LINES[cta]}`;
    return {
      day,
      platform: template.platform,
      headline: fill(template.headline, town),
      hook: fill(template.hook, town),
      caption,
      cta,
    };
  });
}

export function copyTextFor(idea: Idea): string {
  return [
    `${idea.day} — ${idea.platform}`,
    idea.headline,
    "",
    `Hook: ${idea.hook}`,
    "",
    `Caption: ${idea.caption}`,
    "",
    `CTA: ${idea.cta}`,
  ].join("\n");
}
