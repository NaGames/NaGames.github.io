/* ==========================================================================
   NaGames - ALL SITE CONTENT LIVES HERE
   --------------------------------------------------------------------------
   This is the only file you need to edit day to day. Adding a game, a code,
   or a patch note is a change here and nothing else. Never edit the HTML.

   Anything still marked TODO renders with a dashed gold outline on the live
   site, so unfinished content is impossible to miss. Search this file for
   "TODO" to find everything that still needs your input.
   ========================================================================== */

window.NAGAMES = {

  /* ---------------------------------------------------------- the studio -- */
  studio: {
    name: "NaGames",
    // Shown under the big heading on the homepage. Keep it short and dry.
    tagline: "We make Roblox games and Minecraft add-ons. Some of them are good.",
    founded: "2018",
    email: "TODO@example.com",    // business / press contact

    /* The About page story. One entry per person, shown in this order.

       by     must match a name in the `team` array below - the role and the
              avatar are read from there, so nothing is duplicated.
       text   blank line between paragraphs. Leave the whole entry out until
              that person has actually written something.                    */
    story: [
      {
        by: "imwood04",
        text:
          "NaGames started because I liked making things. It began with PHP " +
          "plugins for PocketMine, moved over to Roblox, wandered through a few " +
          "other things, and has now come back round to Roblox again.\n\n" +

          "For years the pattern never changed: start a game, lose interest, " +
          "stop. The only things I ever actually finished were command block " +
          "maps on Minecraft Realms. Watching people play those - messing " +
          "about, having a laugh, making a memory out of something I built - " +
          "is the whole reason I'm still here.\n\n" +

          "So this time I'm finishing one properly, with my best friend " +
          "redredgavin along for the ride.",
      },
      {
        by: "redredgavin",
        text:
          "I've always been the one coming up with ideas for projects - " +
          "usually more of them than I can keep up with. A few have turned " +
          "into actual things over the years, from a Discord music bot to a " +
          "sound pack tool for games like GTA 5.\n\n" +

          "I just like making things and seeing where an idea goes, whether " +
          "that's a small side project or something bigger. Lately that's " +
          "meant tagging along on NaGames, helping bring ideas to life with " +
          "my best friend and getting stuck into Blacksteel Arms.\n\n" +

          "I'm here for the same reason I always have been: building things, " +
          "trying ideas out, and hopefully making something people enjoy as " +
          "much as we enjoy making it.",
      },
    ],
  },

  /* ----------------------------------------------------------- the links --
     Leave any of these as an empty string "" and they disappear from the
     site automatically. Nothing breaks, the link just will not render.      */
  links: {
    discord: "https://discord.com/invite/tP7jWqG",
    group:   "https://www.roblox.com/communities/34650790/NaGames",
    roblox:  "",   // TODO: your personal Roblox profile
    youtube: "",   // TODO
    tiktok:  "",   // TODO
    twitter: "",   // TODO (X)
  },

  // Your Roblox group id, read from the group link above. Used to pull the
  // live member count. Leave "" to fall back to the manual number below.
  groupId: "34650790",

  /* ---------------------------------------------------- what we actually do --
     The "What we do" cards on the homepage. Add, remove or reorder freely -
     set the array to [] and the whole section disappears.

     link / linkLabel are optional. Leave link as "" and the card renders
     with no button, which is right for something you do but have nothing
     to point at yet.                                                        */
  services: [
    {
      title: "Roblox games",
      body:
        "Full experiences built in Roblox Studio, from the first block to " +
        "live updates and the people playing them. Blacksteel Arms Tycoon is " +
        "the one we are heads-down on right now.",
      link: "games.html",
      linkLabel: "See the games",
    },
    {
      title: "Minecraft Bedrock add-ons",
      body:
        "Add-ons for Minecraft Bedrock: custom behaviour, entities, items and " +
        "the scripting that holds it together. It is where a lot of this " +
        "started, and we never really stopped.",
      link: "",                  // TODO: a download page or MCPEDL link, if you have one
      linkLabel: "",
    },
  ],

  /* ------------------------------------------------------- headline stats --
     Shown as the strip under the homepage hero. Delete any row you do not
     want, or set the whole array to [] to hide the strip entirely.

     source   optional. Pulls the number live from data/roblox.json instead
              of using num. One of:
                "totalVisits"  - every game's visits added together
                "groupMembers" - members in the group above
                "gameCount"    - how many games are listed below
              num is the fallback used before the first fetch, or if Roblox
              is unreachable.                                                */
  stats: [
    { num: "406", label: "Total visits",  source: "totalVisits"  },
    { num: "6",   label: "Group members", source: "groupMembers" },
    { num: "1",   label: "Games live",    source: "gameCount"    },
  ],

  /* ----------------------------------------------------------- the games --
     ADD A GAME: copy one whole { ... } block and change the values.

     slug        URL-safe id. Becomes game.html?id=<slug>. Must be unique.
     name        Display name.
     placeId     The number in your Roblox URL:
                 roblox.com/games/[THIS NUMBER]/Game-Name
                 Used to build the Play link and fetch the thumbnail.
     art         Optional. Local image in assets/games/ used if the live
                 Roblox thumbnail fails to load. Recommended - it loads
                 faster than Roblox and never breaks.
     featured    true puts it on the homepage.
     status      Free text badge: "Live", "Beta", "In development"...
     visits      Manual. Update when you feel like it. "" hides the row.
     players     Manual. "" hides the row.
     codes       Active and expired codes for this game.
     updates     Patch notes for this game. Newest first.
  */
  games: [
    {
      slug: "blacksteel-arms-tycoon",
      name: "Blacksteel Arms Tycoon",
      placeId: "18571684934",
      art: "",                           // TODO: optional local cover in assets/games/
      featured: true,
      status: "Live",
      genre: "Tycoon",
      tagline: "Run a weapons factory, ship guns by the truckload, build an arms empire.",
      description:
        "Get your own factory, build production lines and turn out guns for cash. " +
        "Unlock six wings, from the Pistol Wing all the way up to the Rotary Minigun line.\n\n" +
        "It is not just watching numbers go up. Clear line jams, run QC checks, hand-build " +
        "guns at the bench and take contracts for bonus income. Everything you make, you can " +
        "equip and skin with 25 finishes.\n\n" +
        "Then there is the rest of the map: boss raids against the Rogue Juggernaut, a capture " +
        "zone worth +20% income if you can hold it, supply drops guarded by drones, and " +
        "vehicles from a Patrol Jeep up to a Scout Helicopter off your own rooftop helipad. " +
        "Rebirth resets you for permanent multipliers and new unlocks. PvP is opt-in.\n\n" +

        "You are not on your own either. Hire a squad of up to six soldiers, raid other " +
        "players for the war chest in their outpost, and dig in behind sandbags and a gate " +
        "gun when they come for yours. Send a convoy out and it keeps earning while you " +
        "are logged off.",

      // Optional. Shown as a list on the game page. Delete the array to hide it.
      features: [
        "Build production lines across six weapon wings",
        "Recruit a squad of up to 6 soldiers and give them orders",
        "Raid other players for their war chest, and fortify your own base",
        "Send convoys that keep earning while you are offline",
        "Clear jams, run QC and hand-build at the bench",
        "Equip every gun you make, with 25 skins",
        "Boss raids against the Rogue Juggernaut",
        "Capture zone for +20% income, if you can hold it",
        "Supply drops guarded by drones",
        "Patrol Jeep, Armored Humvee and Scout Helicopter",
        "Rebirth for permanent multipliers",
        "Daily rewards and the Requisition Wheel",
        "Opt-in PvP",
      ],

      // Live values from Roblox replace these automatically once the refresh
      // workflow runs. They are only the fallback.
      visits: "406",
      players: "",

      // Where players type them in. Shown on the codes page and this game's page.
      redeem: "Menu > Rewards > Codes",

      // Set expired: true when one stops working - it moves to a collapsed
      // list at the bottom instead of being deleted, because players search
      // for expired codes too.
      codes: [
        // --- working as of v0.9 ---
        { code: "SQUADUP",  reward: "30 minutes of income, plus 2x Line Speed for 30 minutes", expired: false },
        { code: "WARCHEST", reward: "100 Gold, 2 wheel spins and the Desert finish", expired: false },
        { code: "COURIER",  reward: "30 minutes of cash, plus 2x Cash for 30 minutes", expired: false },
        { code: "GUNSMITH", reward: "15 Blueprints, 50 Gold and the Crimson finish (Gold instead if you already own Crimson)", expired: false },
        { code: "OVERHAUL", reward: "100 Gold, 2 wheel spins and 2x Line Speed for 15 minutes", expired: false },

        // --- expired at v0.9 ---
        { code: "LIFTOFF",  reward: "30 minutes of income, plus 2x Cash for 30 minutes", expired: true },
        { code: "CONVOY",   reward: "100 Gold and 2 wheel spins", expired: true },

        // --- expired at v0.8 ---
        { code: "SEISMIC",  reward: "Reward not recorded", expired: true },
        { code: "OVERTIME", reward: "Reward not recorded", expired: true },
        { code: "FIELDOPS", reward: "Reward not recorded", expired: true },
        { code: "ARMSRACE", reward: "30 minutes of cash, 2x Cash for 30 minutes and the Hunter finish", expired: true },
        { code: "LAUNCH",   reward: "150 Gold and 2 wheel spins", expired: true },
      ],

      /* ------------------------------------------------------- patch notes --
         NEWEST FIRST. Add new entries at the top of this array.

         date      YYYY-MM-DD. Optional - leave "" and the date chip is just
                   left off. Dated entries always sort above undated ones.
         version   optional, shown as a small gold chip
         summary   optional one-liner under the title
         notes     a flat list, for small updates
         sections  [{ heading, notes }] for big ones. Use one or the other.
                                                                              */
      updates: [
        {
          date: "",                      // TODO: when did v0.9 ship?
          version: "v0.9",
          title: "Troops & Raids",
          summary: "Hire a squad, raid other players, and send convoys out while you are offline.",
          sections: [
            {
              heading: "Troops",
              notes: [
                "Recruit soldiers: walk up to a patrol soldier and hold E to hire him. Build a squad of up to 6",
                "Orders: tell your squad to follow you or guard your base",
                "Stripes and promotions: troops that win fights earn stripes and get promoted",
                "Medics revive downed troops. Lose a troop in battle and he is gone for good",
                "A squad card on your screen shows your troops and what they are doing",
                "Troops ride along in your vehicle's seats",
                "Patrol soldiers now fight back when you shoot them, and they guard the export roads",
              ],
            },
            {
              heading: "Raids and base defences",
              notes: [
                "Raid other players: steal the war chest from their outpost and carry it back to your vault for cash",
                "Defend your base: hold off a raid and earn a bonus",
                "4 new defences: Sandbag Line, Barbed Wire, Guard Tower at Rebirth 3, and the Gate Gun at Rebirth 7",
                "You can man the Gate Gun yourself",
              ],
            },
            {
              heading: "Convoys and Collector's guns",
              notes: [
                "Convoys: send a truck on a 1, 4 or 8 hour run. It keeps driving while you are offline",
                "Watch your black CONVOY truck leave and come back",
                "Collector's Edition guns: a rare surprise gun can roll off your line. Grab it within 2 minutes, then show it off on your trophy wall",
                "Turn on Roblox notifications to hear when your convoy is back",
              ],
            },
            {
              heading: "Make it yours",
              notes: [
                "Factory paint: themes from rebirths, for Gold and in the shop, plus custom colours from Rebirth 5",
                "All 25 gun skins redone with real patterns and designs",
                "Try on skins before you equip them",
                "Inspect your gun with F, D-pad down, or the INSPECT button",
                "Gift passes to anyone in your server",
              ],
            },
            {
              heading: "Better minigames",
              notes: [
                "Rush Order and QC Inspection rebuilt - use Space. Rush Orders can now hit 100%",
                "Proof Range overhaul and a new medal screen",
                "Exports: a ready light, pick your buyer, hold the zone to unload",
                "Clearing jams and pulling the wing lever feel far more satisfying",
                "The Requisition Wheel is now a real spinning wheel with a big prize card",
              ],
            },
            {
              heading: "Sound",
              notes: [
                "Footsteps that match the ground - metal, gravel, concrete, wood - for players, troops and workers",
                "A hit sound when you get shot, and new outdoor ambience",
                "Full audio rebalance: nothing too loud, and rewards are easier to hear",
              ],
            },
            {
              heading: "Quality of life",
              notes: [
                "Faster walking (20) and sprinting (30)",
                "Faster join, simpler intro cards, and the Field Guide shows you the way",
                "Keyboard and controller work at the same time",
                "More drones around the map, and a redone rebirth cutscene",
                "Smoother menus with no more lost clicks, and lighter on weaker phones",
                "5 new badges to earn",
                "Fixed flickering roads and textures, plus lots of map and screen fixes",
              ],
            },
          ],
        },

        {
          date: "",                      // TODO: when did v0.8 ship?
          version: "v0.8",
          title: "Build from nothing",
          summary:
            "The biggest update yet: a new start, new models, new sounds and a lot of fixes.",
          sections: [
            {
              heading: "Build from nothing",
              notes: [
                "Every run now starts on a bare slab - walls, roofs and halls are all buttons, and unbuilt parts show as construction sites",
                "You start with a beat-up Safe shed. The Grand Bank is now an upgrade you buy",
                "Cash Courier: hire a runner who carries your cash to the vault",
                "Military Motorcycle: a cheap first ride for $25K cash",
              ],
            },
            {
              heading: "Gunsmith Bench rework",
              notes: [
                "Watch the gun come together in 3D as you build it",
                "Earn 1 to 3 stars - more stars means more pay",
                "New sounds, a countdown, and a quick intro the first time you buy it",
              ],
            },
            {
              heading: "Juggernaut and events",
              notes: [
                "Final Stand: at low health the Juggernaut speeds up and fires a laser sweep. Jump it",
                "Factory Overload: a rare event where jams pile up. Clear them in time or your lines slow down for a bit",
                "Supply drop alerts now show what it pays, how far, which way and when it lands",
              ],
            },
            {
              heading: "An all-new look",
              notes: [
                "Every gun, worker, soldier, vehicle and the Juggernaut got brand-new 3D models",
                "New assembly line machines, drones, supply crates and map props",
                "New Blacksteel Arms logo across the factories, map and trucks",
                "A real loading screen, instead of staring at the sky",
                "The prize wheel on the hub deck now actually spins and lands on your prize",
              ],
            },
            {
              heading: "Sound and music",
              notes: [
                "Calm factory music, plus combat and boss music that kicks in when it matters",
                "New sounds for the lines, crates, drones, minigun, motorcycle and courier",
                "Volume pass: clicks, gunshots and explosions are quieter, and you only hear other players and events when you are close",
              ],
            },
            {
              heading: "Phone, console and performance",
              notes: [
                "Phone HUD moved into Roblox's top bar, with a round sprint button",
                "Better controller support with real button icons",
                "Performance Mode in Settings (Auto / On / Off) for smoother play on phones and older PCs",
              ],
            },
            {
              heading: "Shop and rewards",
              notes: [
                "Blacksteel Contract: a new monthly membership, in the Shop",
                "Gold and spins are no longer sold for Robux - earn them by playing",
                "Cleaner Shop and Operations menus, and icons load instantly",
                "5 badges to earn, with more on the way",
              ],
            },
            {
              heading: "Fixes and balance",
              notes: [
                "Cheaper early upgrades, so the first minutes go faster",
                "Clearer tutorial, simpler wording, and a short intro for each new feature",
                "Fixed getting stuck in the workshop when buying the Grand Bank",
                "Fixed being thrown off your plot or glitched through conveyors when something builds",
                "Fixed walls that could lock you inside a wing",
                "Fixed invisible boxes in the yard that blocked shots and the camera",
                "Fixed the phone cash box stretching across the screen",
                "Plus a lot of smaller fixes",
              ],
            },
          ],
        },

        {
          date: "",                      // TODO: when did v0.7 ship?
          version: "v0.7",
          title: "Take to the skies",
          summary: "A helicopter, a much bigger base, and a start that does not overwhelm you.",
          sections: [
            {
              heading: "Scout Helicopter",
              notes: [
                "Buy it with cash from Rebirth 3, once you have built the Rooftop Helipad. Call it and you are placed straight onto the pad, ready for takeoff. Seats 4 and flies over everything",
                "The Rooftop Helipad now unlocks at Rebirth 3, down from Rebirth 10",
                "The Rebirth menu now shows exactly what your next rebirth unlocks",
              ],
            },
            {
              heading: "A bigger, better base",
              notes: [
                "New Ring Road connecting every factory, with kerbs and road markings",
                "8 new areas: Outpost Bravo, Fuel Depot, Comms Relay, Test Range, Crash Site, Motor Pool B, Supply Depot and Salvage Yard",
                "Direction signs at every junction, pointing to each area and back to the Arena",
                "Paved base, dusty outer yard, concrete yards with parking bays and a new mountain range on the horizon",
                "The hub plaza now has planters, benches, parked vehicles and branded leaderboards",
                "Vehicles now drive through lamp posts and sign poles around the hub",
                "Empty factories now say Open Factory: Invite a Friend",
              ],
            },
            {
              heading: "Juggernaut",
              notes: [
                "New look: armoured legs, a glowing visor and tan plating",
                "Between fights the arena floor shows a radar sweep and the countdown to the next breakout",
                "Fights scale to the number of players in your server, and new players take less damage",
                "Short shield after respawning in the arena",
                "Shots now spark and throw debris when they hit the Juggernaut and drones",
              ],
            },
            {
              heading: "Getting started",
              notes: [
                "New tutorial with a guided camera tour - replay it any time in Settings",
                "Features unlock as you progress, so the start is not overwhelming",
                "On your first run your Safe banks itself early on",
                "No jams or QC checks in your first 5 minutes",
              ],
            },
            {
              heading: "Factory",
              notes: [
                "Rush Orders: hold the console button and keep the pressure steady for bonus Momentum",
                "Line Jams and Rush Orders now use E, or the on-screen button on mobile and controller",
                "Overclock levers light up once that wing has a line",
                "New lines no longer spawn on top of you",
                "The Gunsmith Bench shows when it is ready",
                "Brighter factory interiors and a new build-in effect when you buy something",
                "Prototype alerts are grouped instead of spamming",
              ],
            },
            {
              heading: "Interface",
              notes: [
                "Full UI redesign",
                "Phones: a slim new HUD with one wallet for Cash, Gold and Safe, readable text, touch-sized buttons, and alerts tucked above the hint bar instead of covering the screen",
                "New Screen Shake & Impact setting",
                "Daily Supply rewards now say what they are, for example Field Issue gun skin",
              ],
            },
            {
              heading: "Shop",
              notes: [
                "New Recruit Kit, one per account: 1 hour of income, 2x Cash for 30 minutes and the Recruit Blaze weapon finish",
              ],
            },
            {
              heading: "Fixes",
              notes: [
                "Fixed flickering textures in factories and around the map",
                "Fixed an error when shooting drones",
                "Factory music is louder",
                "Cleaner map: less litter and no stray patches on the roads",
              ],
            },
          ],
        },

        {
          date: "",                      // TODO: when did v0.6 ship?
          version: "v0.6",
          title: "Run your factory, do not just watch it",
          summary: "Hands-on production, an Operations panel, and a Juggernaut that fights back.",
          sections: [
            {
              heading: "Hands-on production",
              notes: [
                "Shift Momentum: staying hands-on builds up to +50% income. It slowly drains when you step away",
                "Line Jams: hold F at the line console to clear a jam and get a 2x overclock",
                "QC Samples: inspect gold guns for bonus cash",
                "Overclock Levers: 2x line speed for 30 seconds",
                "Gunsmith Bench: hand-build a gun in a short minigame. Unlocks the Hand-Fitted and Artisan finishes",
              ],
            },
            {
              heading: "Operations Panel",
              notes: [
                "Contracts: 3 rotating jobs plus a weekly goal",
                "Research: permanent upgrades",
                "A Field Guide",
              ],
            },
            {
              heading: "Proof Range",
              notes: [
                "Shoot 6 targets fast. Gold, Silver and Bronze times give up to +40% income",
                "New Range Master leaderboard",
              ],
            },
            {
              heading: "Exports",
              notes: [
                "Deliver crates from the Shipping Yard on foot before time runs out, for a big payout",
                "Players with PvP on can intercept your crate",
              ],
            },
            {
              heading: "Juggernaut: Seismic Slam",
              notes: [
                "The Juggernaut now slams the ground and sends shockwaves across the whole arena",
                "You cannot outrun them, so jump each ring. Later phases send 2 to 3 rings with tricky timing",
              ],
            },
            {
              heading: "Weapons and mobile",
              notes: [
                "Every gun now has a full reload animation",
                "New MENU button that opens every option in one grid, with Shop and Ops one tap away",
                "Nothing sits under the joystick anymore, and the HUD adjusts to your screen size",
                "Alert badges show on the MENU button so you never miss a reward",
              ],
            },
            {
              heading: "World and visuals",
              notes: [
                "Rebuilt front yard: a more detailed Bank and Armory, new Foreman Office, Trophy Case and Forklift Fleet",
                "Bigger Proof Range, Shipping Yard and Command Center",
                "Line workers now walk, carry crates and work the line",
                "Fixed floating labels that were not showing",
              ],
            },
          ],
        },

        {
          date: "",                      // TODO: when did the game launch?
          version: "Launch",
          title: "Blacksteel Arms is live",
          summary: "Run your own weapons factory and build an arms empire.",
          notes: [
            "Build it up: claim a factory, build production lines, hire techs and watch the trucks ship your guns out",
            "Arm up: unlock 6 wings, from the Service Pistol all the way to the Rotary Minigun, and skin them with 15 finishes",
            "Boss raids: team up to take down the Rogue Juggernaut for big rewards",
            "Capture Zone: hold it for +20% income, if you can keep it",
            "Supply drops: race other players to drone-guarded crates",
            "Vehicles: call in a Patrol Jeep or Armored Humvee and tear across the map with your squad",
            "Rebirth: reset for permanent multipliers and new wings",
            "Join the group for +10% cash, forever, and play with friends for up to +20% more",
          ],
        },
      ],
    },

    /* ---- copy from here to add a second game ----
    {
      slug: "game-two",
      name: "",
      placeId: "",
      art: "",
      featured: true,
      status: "Live",
      tagline: "",
      description: "",
      visits: "",
      players: "",
      genre: "",
      codes: [],
      updates: [],
    },
    ---- to here ---- */
  ],

  /* ------------------------------------------------------------ the team --
     Set to [] to hide the team section on the About page entirely.

     robloxUserId  optional. If set, the real Roblox avatar is pulled in by
                   the refresh workflow and kept current.
     avatar        optional manual image, used if there is no live one.
     discord       optional. Shown under the role. Remove it if you would
                   rather not publish your handle - see the README note.      */
  team: [
    {
      name: "imwood04",
      role: "Founder / Owner",
      robloxUserId: "196456518",         // roblox.com/users/196456518 (redredgav829)
      link: "https://www.roblox.com/users/196456518/profile",
      avatar: "",
      discord: "Zer02_",
    },
    {
      name: "redredgavin",
      role: "Co-owner",
      robloxUserId: "60849547",          // roblox.com/users/60849547
      link: "https://www.roblox.com/users/60849547/profile",
      avatar: "",
      discord: "blazikenxx",
    },
  ],

  /* -------------------------------------------------------------- footer -- */
  footer: {
    // Shown small at the bottom. Required by Roblox if you reference them.
    disclaimer:
      "NaGames is not affiliated with, endorsed by, or sponsored by Roblox " +
      "Corporation. Roblox is a trademark of Roblox Corporation.",
  },
};
