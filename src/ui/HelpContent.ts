import type { HelpTopicId } from "../game/types";

export const HELP_COPY: Record<HelpTopicId, { title: string; body: string[] }> = {
  level: {
    title: "Level Sign",
    body: ["Shows the current level, turn limit, and the broad tactical theme. Use it to orient yourself before reading the board."]
  },
  save: {
    title: "Save Game",
    body: ["Save stores the current run on this device. Load restores that board state later. Campaign Oil and servant skills are still saved separately."]
  },
  now: {
    title: "Now Board",
    body: ["YESOD shows the board as it currently is: servants, Darkness, Checkpoints, houses, binds, and Light."]
  },
  coming: {
    title: "Coming Board",
    body: ["MALKUT shows what is approaching. Solid markers are fixed entry turns. Dashed markers are predicted route turns that can change when you move, Bind, Brace, or alter the Light Network."]
  },
  square: {
    title: "Board Square",
    body: ["A square can hold a servant, Darkness, a Bind, a Checkpoint, poor soil, the Cornerstone, or a house. Select squares to move servants or inspect threats."]
  },
  cornerstone: {
    title: "The Cornerstone",
    body: ["There is only one Cornerstone. It is the central Temple/Lamp at D4 and the root of all Light. If Darkness reaches it three times, the level is lost."]
  },
  house: {
    title: "House",
    body: ["Houses are the level objectives. They must receive connected Light from the Cornerstone, and each house may have a different condition before it stabilizes."]
  },
  checkpoint: {
    title: "Checkpoint of Light",
    body: ["Servants establish Checkpoints to carry Light outward. A Checkpoint only functions while connected to the Cornerstone through the Light Network."]
  },
  darkness: {
    title: "Darkness",
    body: ["Darkness moves deterministically. Shade goes direct, Shroud avoids Light, Depth pressures Checkpoints, and Abyss suppresses nearby Light."]
  },
  servant: {
    title: "Servant",
    body: ["Each servant has one move and one action each turn. Their strength is not interchangeable: positioning and role discipline matter."]
  },
  protector: {
    title: "Protector",
    body: ["The Protector never attacks. He guards ground, blocks entry, and can Brace to widen protection for the next Enemy Phase."]
  },
  binder: {
    title: "Binder",
    body: ["The Binder controls routes. Bind closes a square, Release Bind opens it, and Anchor can hold adjacent Darkness for one Enemy Phase."]
  },
  looser: {
    title: "Looser",
    body: ["The Looser is rapid recovery. Release removes a Bind, Free restores a suppressed Checkpoint, and Disperse pushes adjacent Darkness away."]
  },
  destroyer: {
    title: "Destroyer",
    body: ["The Destroyer can strike Darkness from anywhere, but overusing him where another servant could act has consequences. Watch and Stay Thy Hand reward restraint."]
  },
  bind: {
    title: "Bind",
    body: ["The Binder locks a square so Darkness cannot normally pass through it. This reshapes future routes shown in Coming."]
  },
  release: {
    title: "Release",
    body: ["Release removes a Bind. Use it when a previous route-control choice now blocks your own recovery."]
  },
  brace: {
    title: "Brace",
    body: ["The Protector gives up movement for the turn and widens his Guard during the next Enemy Phase."]
  },
  anchor: {
    title: "Anchor",
    body: ["Anchor holds adjacent Darkness in place for one Enemy Phase. It buys time without destroying the threat."]
  },
  free: {
    title: "Free",
    body: ["Free removes suppression from an adjacent Checkpoint of Light, restoring its place in the network if its connection still exists."]
  },
  disperse: {
    title: "Disperse",
    body: ["Disperse pushes adjacent Darkness one legal square away. It does not deal damage; it changes the future route."]
  },
  watch: {
    title: "Watch",
    body: ["Watch marks restraint. The Destroyer studies the threat instead of striking immediately, preserving Order when violence is not needed."]
  },
  stay: {
    title: "Stay Thy Hand",
    body: ["The Destroyer deliberately does not strike. This makes restraint an explicit tactical choice rather than doing nothing."]
  },
  scripture: {
    title: "Scripture",
    body: ["Major clashes use Scripture recall. Stats set blanks and attempts; the passage determines whether the action lands."]
  },
  establish: {
    title: "Establish Checkpoint",
    body: ["A ready servant can establish a Checkpoint on an open square. Poor soil must be prepared first, and new Checkpoints stabilize during Upkeep."]
  },
  forecast: {
    title: "Forecast Marker",
    body: ["Solid means fixed entry: you cannot change where Darkness comes from. Dashed means predicted route: you can change where it goes next."]
  },
  order: {
    title: "Order",
    body: ["Order reflects the board coming into proper arrangement through Light, foresight, restraint, and protection. It is not a score meter."]
  },
  oil: {
    title: "Oil",
    body: ["Oil is campaign currency. You earn it for completing levels, preserving the Lamp and servants, holding houses in Light, and Scripture knowledge. Kills do not award Oil."]
  }
};
