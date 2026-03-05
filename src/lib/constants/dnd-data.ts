// ── Hit Dice per Class ──

export const HIT_DICE: Record<string, number> = {
  Barbarian: 12,
  Fighter: 10,
  Paladin: 10,
  Ranger: 10,
  Bard: 8,
  Cleric: 8,
  Druid: 8,
  Monk: 8,
  Rogue: 8,
  Warlock: 8,
  Sorcerer: 6,
  Wizard: 6,
};

// ── Proficiency Bonus by Level ──

export const PROFICIENCY_BONUS: Record<number, number> = {
  1: 2, 2: 2, 3: 2, 4: 2,
  5: 3, 6: 3, 7: 3, 8: 3,
  9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6,
};

// ── Saving Throw Proficiencies per Class ──

export const SAVING_THROWS: Record<string, [string, string]> = {
  Barbarian: ["STR", "CON"],
  Bard: ["DEX", "CHA"],
  Cleric: ["WIS", "CHA"],
  Druid: ["INT", "WIS"],
  Fighter: ["STR", "CON"],
  Monk: ["STR", "DEX"],
  Paladin: ["WIS", "CHA"],
  Ranger: ["STR", "DEX"],
  Rogue: ["DEX", "INT"],
  Sorcerer: ["CON", "CHA"],
  Warlock: ["WIS", "CHA"],
  Wizard: ["INT", "WIS"],
};

// ── Spellcasting Ability per Class ──

export const SPELLCASTING_ABILITY: Record<string, string | null> = {
  Barbarian: null,
  Bard: "CHA",
  Cleric: "WIS",
  Druid: "WIS",
  Fighter: null, // EK uses INT but base Fighter has none
  Monk: null,
  Paladin: "CHA",
  Ranger: "WIS",
  Rogue: null, // AT uses INT but base Rogue has none
  Sorcerer: "CHA",
  Warlock: "CHA",
  Wizard: "INT",
};

// ── Full Caster Spell Slots (Bard, Cleric, Druid, Sorcerer, Wizard) ──

export const FULL_CASTER_SLOTS: Record<number, Record<string, number>> = {
  1: { "1st": 2 },
  2: { "1st": 3 },
  3: { "1st": 4, "2nd": 2 },
  4: { "1st": 4, "2nd": 3 },
  5: { "1st": 4, "2nd": 3, "3rd": 2 },
  6: { "1st": 4, "2nd": 3, "3rd": 3 },
  7: { "1st": 4, "2nd": 3, "3rd": 3, "4th": 1 },
  8: { "1st": 4, "2nd": 3, "3rd": 3, "4th": 2 },
  9: { "1st": 4, "2nd": 3, "3rd": 3, "4th": 3, "5th": 1 },
  10: { "1st": 4, "2nd": 3, "3rd": 3, "4th": 3, "5th": 2 },
};

// ── Half Caster Spell Slots (Paladin, Ranger) ──

export const HALF_CASTER_SLOTS: Record<number, Record<string, number>> = {
  1: {},
  2: { "1st": 2 },
  3: { "1st": 3 },
  4: { "1st": 3 },
  5: { "1st": 4, "2nd": 2 },
  6: { "1st": 4, "2nd": 2 },
  7: { "1st": 4, "2nd": 3 },
  8: { "1st": 4, "2nd": 3 },
  9: { "1st": 4, "2nd": 3, "3rd": 2 },
  10: { "1st": 4, "2nd": 3, "3rd": 2 },
};

// ── Warlock Pact Magic Slots ──

export const WARLOCK_SLOTS: Record<number, { slots: number; level: number }> = {
  1: { slots: 1, level: 1 },
  2: { slots: 2, level: 1 },
  3: { slots: 2, level: 2 },
  4: { slots: 2, level: 2 },
  5: { slots: 2, level: 3 },
  6: { slots: 2, level: 3 },
  7: { slots: 2, level: 4 },
  8: { slots: 2, level: 4 },
  9: { slots: 2, level: 5 },
  10: { slots: 2, level: 5 },
};

// ── Base Speed by Race ──

export const BASE_SPEED: Record<string, number> = {
  Human: 30,
  Elf: 30,
  "High Elf": 30,
  "Wood Elf": 35,
  "Dark Elf": 30,
  Dwarf: 25,
  "Hill Dwarf": 25,
  "Mountain Dwarf": 25,
  Halfling: 25,
  "Lightfoot Halfling": 25,
  "Stout Halfling": 25,
  Gnome: 25,
  "Rock Gnome": 25,
  "Forest Gnome": 25,
  "Half-Elf": 30,
  "Half-Orc": 30,
  Tiefling: 30,
  Dragonborn: 30,
};

// ── All 18 D&D 5e Skills with Ability ──

export const SKILLS: { name: string; ability: string }[] = [
  { name: "Acrobatics", ability: "DEX" },
  { name: "Animal Handling", ability: "WIS" },
  { name: "Arcana", ability: "INT" },
  { name: "Athletics", ability: "STR" },
  { name: "Deception", ability: "CHA" },
  { name: "History", ability: "INT" },
  { name: "Insight", ability: "WIS" },
  { name: "Intimidation", ability: "CHA" },
  { name: "Investigation", ability: "INT" },
  { name: "Medicine", ability: "WIS" },
  { name: "Nature", ability: "INT" },
  { name: "Perception", ability: "WIS" },
  { name: "Performance", ability: "CHA" },
  { name: "Persuasion", ability: "CHA" },
  { name: "Religion", ability: "INT" },
  { name: "Sleight of Hand", ability: "DEX" },
  { name: "Stealth", ability: "DEX" },
  { name: "Survival", ability: "WIS" },
];

// ── Class Skill Lists ──

export const CLASS_SKILLS: Record<string, string[]> = {
  Barbarian: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"],
  Bard: SKILLS.map((s) => s.name), // Bards can pick any
  Cleric: ["History", "Insight", "Medicine", "Persuasion", "Religion"],
  Druid: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"],
  Fighter: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
  Monk: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"],
  Paladin: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"],
  Ranger: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"],
  Rogue: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"],
  Sorcerer: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"],
  Warlock: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"],
  Wizard: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
};

// ── Non-caster classes ──

export const NON_CASTER_CLASSES = ["Barbarian", "Fighter", "Monk", "Rogue"];
