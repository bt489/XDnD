import {
  HIT_DICE,
  PROFICIENCY_BONUS,
  SAVING_THROWS,
  SPELLCASTING_ABILITY,
  FULL_CASTER_SLOTS,
  HALF_CASTER_SLOTS,
  WARLOCK_SLOTS,
  BASE_SPEED,
  NON_CASTER_CLASSES,
} from "@/lib/constants/dnd-data";
import type { DndCharacter, StatName, SpellSlotLevel } from "@/types";
import { calculateModifier } from "./helpers";

const SPELL_SLOT_LEVELS: SpellSlotLevel[] = ["1st", "2nd", "3rd", "4th", "5th"];

function getExpectedSlots(className: string, level: number): Record<SpellSlotLevel, number> {
  const empty: Record<SpellSlotLevel, number> = { "1st": 0, "2nd": 0, "3rd": 0, "4th": 0, "5th": 0 };

  if (NON_CASTER_CLASSES.includes(className)) {
    return empty;
  }

  if (className === "Warlock") {
    const warlockData = WARLOCK_SLOTS[level];
    if (!warlockData) return empty;
    const slots = { ...empty };
    const levelKey = `${["1st", "2nd", "3rd", "4th", "5th"][warlockData.level - 1]}` as SpellSlotLevel;
    slots[levelKey] = warlockData.slots;
    return slots;
  }

  const isHalfCaster = className === "Paladin" || className === "Ranger";
  const table = isHalfCaster ? HALF_CASTER_SLOTS : FULL_CASTER_SLOTS;
  const raw = table[level] || {};
  const slots = { ...empty };
  for (const key of SPELL_SLOT_LEVELS) {
    if (raw[key]) slots[key] = raw[key];
  }
  return slots;
}

function calculateExpectedHP(className: string, level: number, conScore: number): number {
  const hitDie = HIT_DICE[className] || 8;
  const conMod = calculateModifier(conScore);
  const avgRoll = Math.floor(hitDie / 2) + 1;
  return hitDie + avgRoll * (level - 1) + conMod * level;
}

export interface ValidationError {
  field: string;
  message: string;
  expected?: number | string;
  got?: number | string;
}

export function validateFullCharacter(char: DndCharacter): ValidationError[] {
  const errors: ValidationError[] = [];

  // Level range
  if (char.level < 5 || char.level > 10) {
    errors.push({ field: "level", message: "Level must be 5-10", expected: "5-10", got: char.level });
  }

  // Stat total
  const statTotal = Object.values(char.stats).reduce((s, v) => s + v, 0);
  if (statTotal < 60 || statTotal > 85) {
    errors.push({ field: "stats", message: "Stat total out of reasonable range", expected: "68-78", got: statTotal });
  }

  // Proficiency bonus
  const expectedProf = PROFICIENCY_BONUS[char.level];
  if (expectedProf && char.proficiencyBonus !== expectedProf) {
    errors.push({ field: "proficiencyBonus", message: "Wrong proficiency bonus", expected: expectedProf, got: char.proficiencyBonus });
  }

  // HP
  const expectedHP = calculateExpectedHP(char.class, char.level, char.stats.CON);
  if (Math.abs(char.hp - expectedHP) > 5) {
    errors.push({ field: "hp", message: "HP doesn't match formula", expected: expectedHP, got: char.hp });
  }

  // Spell slots
  const expectedSlots = getExpectedSlots(char.class, char.level);
  for (const lvl of SPELL_SLOT_LEVELS) {
    if (char.spellSlots[lvl] !== expectedSlots[lvl]) {
      errors.push({
        field: `spellSlots.${lvl}`,
        message: `Wrong ${lvl} level spell slots`,
        expected: expectedSlots[lvl],
        got: char.spellSlots[lvl],
      });
    }
  }

  // Saving throws
  const expectedSaves = SAVING_THROWS[char.class];
  if (expectedSaves) {
    const charSaves = new Set<string>(char.savingThrows);
    for (const save of expectedSaves) {
      if (!charSaves.has(save)) {
        errors.push({ field: "savingThrows", message: `Missing saving throw: ${save}` });
      }
    }
  }

  // Non-caster spellcasting
  if (NON_CASTER_CLASSES.includes(char.class) && char.spellcastingAbility !== null) {
    errors.push({ field: "spellcastingAbility", message: "Non-caster should have null spellcastingAbility" });
  }

  return errors;
}

export function fixCommonErrors(char: DndCharacter): DndCharacter {
  const fixed = { ...char };

  // Fix proficiency bonus
  fixed.proficiencyBonus = PROFICIENCY_BONUS[fixed.level] || fixed.proficiencyBonus;

  // Fix HP
  fixed.hp = calculateExpectedHP(fixed.class, fixed.level, fixed.stats.CON);

  // Fix spell slots
  const expectedSlots = getExpectedSlots(fixed.class, fixed.level);
  fixed.spellSlots = expectedSlots;

  // Fix non-caster spellcasting
  if (NON_CASTER_CLASSES.includes(fixed.class)) {
    fixed.spellcastingAbility = null;
    fixed.spellsKnown = [];
    fixed.cantrips = [];
  }

  // Fix saving throws
  const expectedSaves = SAVING_THROWS[fixed.class];
  if (expectedSaves) {
    fixed.savingThrows = expectedSaves as StatName[];
  }

  // Fix spellcasting ability
  const expectedAbility = SPELLCASTING_ABILITY[fixed.class];
  if (expectedAbility !== undefined) {
    fixed.spellcastingAbility = expectedAbility as StatName | null;
  }

  // Fix speed from race
  const speed = BASE_SPEED[fixed.race];
  if (speed) {
    fixed.speed = speed;
  }

  // Fix AC (basic calculation)
  const dexMod = calculateModifier(fixed.stats.DEX);
  if (fixed.class === "Barbarian") {
    fixed.ac = 10 + dexMod + calculateModifier(fixed.stats.CON);
  } else if (fixed.class === "Monk") {
    fixed.ac = 10 + dexMod + calculateModifier(fixed.stats.WIS);
  } else {
    fixed.ac = 10 + dexMod;
  }

  // Fix hit dice
  const hitDie = HIT_DICE[fixed.class] || 8;
  fixed.hitDice = `${fixed.level}d${hitDie}`;

  // Default empty arrays/values for new fields if missing
  fixed.cantrips = fixed.cantrips || [];
  fixed.equipment = fixed.equipment || [];
  fixed.weapons = fixed.weapons || [];
  fixed.armor = fixed.armor || "None";
  fixed.languages = fixed.languages || ["Common"];
  fixed.toolProficiencies = fixed.toolProficiencies || [];
  fixed.armorProficiencies = fixed.armorProficiencies || [];
  fixed.weaponProficiencies = fixed.weaponProficiencies || [];
  fixed.racialTraits = fixed.racialTraits || [];
  fixed.appearance = fixed.appearance || { age: "", height: "", weight: "", eyes: "", hair: "", skin: "" };
  fixed.gold = fixed.gold ?? 0;

  return fixed;
}
