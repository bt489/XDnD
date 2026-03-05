"use client";

import { SKILLS } from "@/lib/constants/dnd-data";
import { calculateModifier } from "@/lib/utils/helpers";
import type { Stats } from "@/types";

interface SkillsListProps {
  stats: Stats;
  proficiencyBonus: number;
  skillProficiencies: string[];
}

export default function SkillsList({ stats, proficiencyBonus, skillProficiencies }: SkillsListProps) {
  const profSet = new Set(skillProficiencies);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">
      {SKILLS.map((skill) => {
        const isProficient = profSet.has(skill.name);
        const abilityMod = calculateModifier(stats[skill.ability as keyof typeof stats]);
        const total = abilityMod + (isProficient ? proficiencyBonus : 0);
        const sign = total >= 0 ? "+" : "";

        return (
          <div
            key={skill.name}
            className={`flex items-center gap-2.5 py-1.5 border-b border-gold/5 ${
              isProficient ? "" : "opacity-50"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full border flex-shrink-0 ${
                isProficient
                  ? "bg-gold border-gold/60 shadow-[0_0_4px_rgba(212,168,67,0.3)]"
                  : "border-parchment/15 bg-transparent"
              }`}
            />
            <span
              className={`font-body text-sm flex-1 ${
                isProficient ? "text-parchment" : "text-parchment/50"
              }`}
            >
              {skill.name}
            </span>
            <span className="font-cinzel text-xs text-parchment/30 w-7">
              {skill.ability}
            </span>
            <span
              className={`font-mono text-xs w-6 text-right ${
                isProficient ? "text-gold" : "text-parchment/40"
              }`}
            >
              {sign}{total}
            </span>
          </div>
        );
      })}
    </div>
  );
}
