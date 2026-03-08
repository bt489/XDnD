"use client";

import { useState } from "react";
import StatBlock from "./StatBlock";
import SpellSlotPips from "./SpellSlotPips";
import SkillsList from "./SkillsList";
import { formatModifier, calculateModifier } from "@/lib/utils/helpers";
import { NON_CASTER_CLASSES } from "@/lib/constants/dnd-data";
import type { DndCharacter, StatName } from "@/types";

interface FullCharacterSheetProps {
  character: DndCharacter;
}

const TABS = ["Overview", "Combat", "Spellcasting", "Equipment", "Personality", "Origin"] as const;
type Tab = (typeof TABS)[number];
const STAT_ORDER: StatName[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

export default function FullCharacterSheet({ character }: FullCharacterSheetProps) {
  const isCaster = !NON_CASTER_CLASSES.includes(character.class);
  const availableTabs = isCaster ? TABS : TABS.filter((t) => t !== "Spellcasting");
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  return (
    <div className="glass-panel overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gold/8 overflow-x-auto">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3.5 font-cinzel text-[0.7rem] tracking-[0.08em] whitespace-nowrap transition-colors duration-200 relative ${
              activeTab === tab ? "tab-active" : "tab-inactive"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6 sm:p-8">
        {activeTab === "Overview" && <OverviewTab character={character} />}
        {activeTab === "Combat" && <CombatTab character={character} />}
        {activeTab === "Spellcasting" && <SpellcastingTab character={character} />}
        {activeTab === "Equipment" && <EquipmentTab character={character} />}
        {activeTab === "Personality" && <PersonalityTab character={character} />}
        {activeTab === "Origin" && <OriginTab character={character} />}
      </div>
    </div>
  );
}

// ── Overview Tab ──

function OverviewTab({ character }: { character: DndCharacter }) {
  const wisMod = calculateModifier(character.stats.WIS);
  const perceptionProficient = character.skillProficiencies.some(
    (s) => s.toLowerCase() === "perception"
  );
  const passivePerception = 10 + wisMod + (perceptionProficient ? character.proficiencyBonus : 0);

  return (
    <div className="space-y-8">
      {/* Avatar + Character Info */}
      {character.avatarUrl && (
        <div className="flex justify-center">
          <div
            className="w-32 h-44 rounded overflow-hidden"
            style={{
              border: "1px solid rgba(212, 168, 67, 0.2)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(212, 168, 67, 0.06)",
            }}
          >
            <img
              src={character.avatarUrl}
              alt={`${character.name} portrait`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Appearance */}
      {character.appearance && Object.values(character.appearance).some(Boolean) && (
        <div>
          <h3 className="section-header">Appearance</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {([["Age", character.appearance.age], ["Height", character.appearance.height], ["Weight", character.appearance.weight], ["Eyes", character.appearance.eyes], ["Hair", character.appearance.hair], ["Skin", character.appearance.skin]] as const).map(([label, value]) => value ? (
              <div key={label} className="glass-panel-gold p-3 text-center">
                <div className="font-cinzel text-[0.5rem] tracking-[0.15em] uppercase text-parchment/35 mb-1">{label}</div>
                <div className="font-body text-parchment/80 text-sm">{value}</div>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      <div>
        <h3 className="section-header">Ability Scores</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {STAT_ORDER.map((stat) => (
            <StatBlock
              key={stat}
              stat={stat}
              score={character.stats[stat]}
              reason={character.statReasons[stat]}
              dark
            />
          ))}
        </div>
      </div>

      {/* Passive Perception */}
      <div className="glass-panel-gold p-4 flex items-center justify-between">
        <span className="font-cinzel text-[0.6rem] tracking-[0.12em] uppercase text-parchment/50">Passive Perception</span>
        <span className="font-cinzel text-xl text-gold font-bold">{passivePerception}</span>
      </div>

      <div>
        <h3 className="section-header">Saving Throws</h3>
        <div className="flex flex-wrap gap-2">
          {STAT_ORDER.map((stat) => {
            const isProficient = character.savingThrows.includes(stat);
            const mod = calculateModifier(character.stats[stat]);
            const total = mod + (isProficient ? character.proficiencyBonus : 0);
            return (
              <div
                key={stat}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors ${
                  isProficient
                    ? "border-gold/25 bg-gold/5 text-parchment"
                    : "border-gold/6 text-parchment/30"
                }`}
              >
                <span className="font-cinzel text-[0.6rem] tracking-wider">{stat}</span>
                <span className="font-mono text-xs">
                  {total >= 0 ? "+" : ""}{total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="section-header">Skills</h3>
        <SkillsList
          stats={character.stats}
          proficiencyBonus={character.proficiencyBonus}
          skillProficiencies={character.skillProficiencies}
        />
      </div>

      {/* Languages & Proficiencies */}
      {(character.languages?.length > 0 || character.toolProficiencies?.length > 0) && (
        <div>
          <h3 className="section-header">Languages & Proficiencies</h3>
          <div className="space-y-3">
            {character.languages?.length > 0 && (
              <div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.12em] uppercase text-parchment/40 mb-2">Languages</div>
                <div className="flex flex-wrap gap-2">
                  {character.languages.map((lang) => (
                    <span key={lang} className="px-3 py-1 rounded-sm border border-gold/15 bg-gold/5 font-body text-parchment/75 text-sm">{lang}</span>
                  ))}
                </div>
              </div>
            )}
            {character.toolProficiencies?.length > 0 && (
              <div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.12em] uppercase text-parchment/40 mb-2">Tool Proficiencies</div>
                <div className="flex flex-wrap gap-2">
                  {character.toolProficiencies.map((tool) => (
                    <span key={tool} className="px-3 py-1 rounded-sm border border-gold/15 bg-gold/5 font-body text-parchment/75 text-sm">{tool}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Racial Traits */}
      {character.racialTraits?.length > 0 && (
        <div>
          <h3 className="section-header">Racial Traits</h3>
          <div className="space-y-2">
            {character.racialTraits.map((trait, i) => (
              <div key={i} className="glass-panel-gold p-3.5">
                <h4 className="font-cinzel text-xs tracking-wider text-gold mb-1">{trait.name}</h4>
                <p className="font-body text-parchment/60 text-sm leading-relaxed">{trait.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Combat Tab ──

function CombatTab({ character }: { character: DndCharacter }) {
  const combatStats = [
    { label: "Hit Points", value: String(character.hp), accent: true },
    { label: "Armor Class", value: String(character.ac), accent: false },
    { label: "Speed", value: `${character.speed} ft`, accent: false },
    { label: "Proficiency", value: `+${character.proficiencyBonus}`, accent: false },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {combatStats.map((item) => (
          <div key={item.label} className="glass-panel-gold p-4 text-center">
            <div className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase text-parchment/35 mb-1.5">
              {item.label}
            </div>
            <div className={`font-cinzel text-2xl font-bold ${item.accent ? "text-gold" : "text-parchment/90"}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="glass-panel-gold p-4">
          <div className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase text-parchment/35 mb-1">
            Initiative
          </div>
          <div className="font-cinzel text-xl text-gold">
            {formatModifier(character.stats.DEX)}
          </div>
        </div>
        {character.hitDice && (
          <div className="glass-panel-gold p-4">
            <div className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase text-parchment/35 mb-1">
              Hit Dice
            </div>
            <div className="font-cinzel text-xl text-gold">{character.hitDice}</div>
          </div>
        )}
        {character.armor && character.armor !== "None" && (
          <div className="glass-panel-gold p-4">
            <div className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase text-parchment/35 mb-1">
              Armor
            </div>
            <div className="font-body text-parchment/80 text-sm">{character.armor}</div>
          </div>
        )}
      </div>

      {/* Attacks */}
      {character.weapons?.length > 0 && (
        <div>
          <h3 className="section-header">Attacks</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/10">
                  <th className="font-cinzel text-[0.55rem] tracking-[0.12em] uppercase text-parchment/40 text-left py-2 pr-3">Weapon</th>
                  <th className="font-cinzel text-[0.55rem] tracking-[0.12em] uppercase text-parchment/40 text-center py-2 px-3">To Hit</th>
                  <th className="font-cinzel text-[0.55rem] tracking-[0.12em] uppercase text-parchment/40 text-center py-2 px-3">Damage</th>
                  <th className="font-cinzel text-[0.55rem] tracking-[0.12em] uppercase text-parchment/40 text-left py-2 pl-3">Properties</th>
                </tr>
              </thead>
              <tbody>
                {character.weapons.map((weapon, i) => {
                  const isFinesse = weapon.properties?.some((p) => p.toLowerCase() === "finesse");
                  const strMod = calculateModifier(character.stats.STR);
                  const dexMod = calculateModifier(character.stats.DEX);
                  const abilityMod = isFinesse ? Math.max(strMod, dexMod) : strMod;
                  const toHit = abilityMod + character.proficiencyBonus;
                  return (
                    <tr key={i} className="border-b border-gold/5">
                      <td className="font-body text-parchment/80 py-2.5 pr-3">{weapon.name}</td>
                      <td className="font-mono text-gold text-center py-2.5 px-3">+{toHit}</td>
                      <td className="font-mono text-parchment/70 text-center py-2.5 px-3">
                        {weapon.damage} {weapon.damageType}
                      </td>
                      <td className="font-body text-parchment/45 text-xs py-2.5 pl-3">
                        {weapon.properties?.join(", ") || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h3 className="section-header">Class Features</h3>
        <div className="space-y-3">
          {character.features.map((feature, i) => (
            <div key={i} className="glass-panel-gold p-4">
              <h4 className="font-cinzel text-xs tracking-wider text-gold mb-1.5">
                {feature.name}
              </h4>
              <p className="font-body text-parchment/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="section-header">Signature Ability</h3>
        <div className="p-5 rounded-md border border-gold/15 bg-gold/3">
          <h4 className="font-cinzel text-sm tracking-wider text-gold font-semibold mb-2">
            {character.signatureAbility.name}
          </h4>
          <p className="font-body text-parchment/70 text-sm leading-relaxed">
            {character.signatureAbility.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Spellcasting Tab ──

function SpellcastingTab({ character }: { character: DndCharacter }) {
  const spellMod = character.spellcastingAbility
    ? calculateModifier(character.stats[character.spellcastingAbility])
    : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="glass-panel-gold p-4 text-center">
          <div className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase text-parchment/35 mb-1.5">
            Ability
          </div>
          <div className="font-cinzel text-xl text-gold">
            {character.spellcastingAbility || "None"}
          </div>
        </div>
        {character.spellcastingAbility && (
          <>
            <div className="glass-panel-gold p-4 text-center">
              <div className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase text-parchment/35 mb-1.5">
                Spell Save DC
              </div>
              <div className="font-cinzel text-xl text-gold">
                {8 + character.proficiencyBonus + spellMod}
              </div>
            </div>
            <div className="glass-panel-gold p-4 text-center">
              <div className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase text-parchment/35 mb-1.5">
                Spell Attack
              </div>
              <div className="font-cinzel text-xl text-gold">
                +{character.proficiencyBonus + spellMod}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Cantrips */}
      {character.cantrips?.length > 0 && (
        <div>
          <h3 className="section-header">Cantrips</h3>
          <div className="space-y-2">
            {character.cantrips.map((cantrip, i) => (
              <div key={i} className="glass-panel-gold p-3.5">
                <h4 className="font-cinzel text-xs tracking-wider text-gold mb-0.5">
                  {cantrip.name}
                </h4>
                <p className="font-body text-parchment/40 text-xs italic leading-relaxed">
                  {cantrip.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="section-header">Spell Slots</h3>
        <div className="glass-panel-gold p-5">
          <SpellSlotPips spellSlots={character.spellSlots} />
        </div>
      </div>

      {character.spellsKnown.length > 0 && (
        <div>
          <h3 className="section-header">Spells Known</h3>
          <div className="space-y-2">
            {character.spellsKnown.map((spell, i) => (
              <div key={i} className="glass-panel-gold p-3.5">
                <h4 className="font-cinzel text-xs tracking-wider text-gold mb-0.5">
                  {spell.name}
                </h4>
                <p className="font-body text-parchment/40 text-xs italic leading-relaxed">
                  {spell.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Equipment Tab ──

function EquipmentTab({ character }: { character: DndCharacter }) {
  return (
    <div className="space-y-8">
      {/* Gold */}
      {character.gold != null && (
        <div className="glass-panel-gold p-4 flex items-center justify-between">
          <span className="font-cinzel text-[0.6rem] tracking-[0.12em] uppercase text-parchment/50">Gold</span>
          <span className="font-cinzel text-xl text-gold font-bold">{character.gold} gp</span>
        </div>
      )}

      {/* Equipment List */}
      {character.equipment?.length > 0 && (
        <div>
          <h3 className="section-header">Gear</h3>
          <div className="space-y-1.5">
            {character.equipment.map((item, i) => (
              <div key={i} className="flex items-center justify-between glass-panel-gold px-4 py-2.5">
                <span className="font-body text-parchment/80 text-sm">{item.name}</span>
                {item.quantity > 1 && (
                  <span className="font-mono text-parchment/40 text-xs">x{item.quantity}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Armor & Weapon Proficiencies */}
      {(character.armorProficiencies?.length > 0 || character.weaponProficiencies?.length > 0) && (
        <div>
          <h3 className="section-header">Armor & Weapon Proficiencies</h3>
          <div className="space-y-3">
            {character.armorProficiencies?.length > 0 && (
              <div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.12em] uppercase text-parchment/40 mb-2">Armor</div>
                <div className="flex flex-wrap gap-2">
                  {character.armorProficiencies.map((prof) => (
                    <span key={prof} className="px-3 py-1 rounded-sm border border-gold/15 bg-gold/5 font-body text-parchment/75 text-sm">{prof}</span>
                  ))}
                </div>
              </div>
            )}
            {character.weaponProficiencies?.length > 0 && (
              <div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.12em] uppercase text-parchment/40 mb-2">Weapons</div>
                <div className="flex flex-wrap gap-2">
                  {character.weaponProficiencies.map((prof) => (
                    <span key={prof} className="px-3 py-1 rounded-sm border border-gold/15 bg-gold/5 font-body text-parchment/75 text-sm">{prof}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Personality Tab ──

function PersonalityTab({ character }: { character: DndCharacter }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="section-header">Personality Traits</h3>
        <ul className="space-y-2.5">
          {character.personalityTraits.map((trait, i) => (
            <li key={i} className="flex gap-3 font-body text-parchment/75 leading-relaxed">
              <span className="text-gold/50 mt-0.5 flex-shrink-0">&loz;</span>
              {trait}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="section-header" style={{ color: "#a52a2a" }}>Flaw</h3>
        <p className="font-body text-parchment/70 italic leading-relaxed">{character.flaw}</p>
      </div>

      <div>
        <h3 className="section-header">Ideal</h3>
        <p className="font-body text-parchment/70 leading-relaxed">{character.ideal}</p>
      </div>

      <div>
        <h3 className="section-header">Bond</h3>
        <p className="font-body text-parchment/70 leading-relaxed">{character.bond}</p>
      </div>

      <div>
        <h3 className="section-header">Alignment</h3>
        <div className="glass-panel-gold p-4">
          <div className="font-cinzel text-sm text-gold mb-1.5">{character.alignment}</div>
          <p className="font-body text-parchment/50 text-sm italic leading-relaxed">
            {character.alignmentReason}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Origin Tab ──

function OriginTab({ character }: { character: DndCharacter }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="section-header">Behavioral Profile</h3>
        <p className="font-body text-parchment/65 leading-relaxed">
          {character.behavioralProfile}
        </p>
      </div>

      <div>
        <h3 className="section-header">Why {character.race}?</h3>
        <p className="font-body text-parchment/65 leading-relaxed">{character.raceReason}</p>
      </div>

      <div>
        <h3 className="section-header">
          Why {character.class} ({character.subclass})?
        </h3>
        <p className="font-body text-parchment/65 leading-relaxed">{character.classReason}</p>
      </div>

      <div>
        <h3 className="section-header">Background: {character.background}</h3>
      </div>

      <div>
        <h3 className="section-header">Backstory</h3>
        <div className="font-body text-parchment/65 leading-relaxed whitespace-pre-line">
          {character.backstory}
        </div>
      </div>
    </div>
  );
}
