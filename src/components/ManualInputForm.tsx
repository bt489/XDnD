"use client";

import { useState } from "react";
import type { ManualProfileInput, ScrapedProfile } from "@/types";

interface ManualInputFormProps {
  partialProfile?: Partial<ScrapedProfile>;
  handle: string;
  onSubmit: (input: ManualProfileInput) => void;
}

export default function ManualInputForm({ partialProfile, handle, onSubmit }: ManualInputFormProps) {
  const [form, setForm] = useState<ManualProfileInput>({
    displayName: partialProfile?.displayName || "",
    bio: partialProfile?.bio || "",
    keyInterests: "",
    communicationStyle: "casual",
    samplePosts: "",
    followerCount: partialProfile?.followersCount,
    accountAge: partialProfile?.joinDate || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.displayName && (form.bio || form.samplePosts)) {
      onSubmit(form);
    }
  };

  const update = (field: keyof ManualProfileInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-lg mx-auto opacity-0 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="font-cinzel text-[0.6rem] tracking-[0.35em] uppercase text-gold-deep/60 mb-3">
          The scrying pool is clouded
        </p>
        <h2 className="font-display text-2xl sm:text-3xl text-gold mb-3">
          Manual Divination
        </h2>
        <p className="font-body text-parchment/40 text-sm italic">
          The wards around @{handle} proved too strong. Provide what you can.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-5">
        {/* Display Name */}
        <div>
          <label className="block text-parchment/50 text-xs font-cinzel tracking-wider uppercase mb-2">
            True Name
          </label>
          <input
            type="text"
            value={form.displayName}
            onChange={(e) => update("displayName", e.target.value)}
            className="arcane-input w-full px-4 py-3"
            required
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-parchment/50 text-xs font-cinzel tracking-wider uppercase mb-2">
            Declaration (Bio)
          </label>
          <input
            type="text"
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            className="arcane-input w-full px-4 py-3"
          />
        </div>

        {/* Key Interests */}
        <div>
          <label className="block text-parchment/50 text-xs font-cinzel tracking-wider uppercase mb-2">
            Domains of Interest
          </label>
          <input
            type="text"
            value={form.keyInterests}
            onChange={(e) => update("keyInterests", e.target.value)}
            placeholder="e.g., programming, D&D, cooking, politics"
            className="arcane-input w-full px-4 py-3"
          />
        </div>

        {/* Communication Style */}
        <div>
          <label className="block text-parchment/50 text-xs font-cinzel tracking-wider uppercase mb-2">
            Manner of Speech
          </label>
          <select
            value={form.communicationStyle}
            onChange={(e) => update("communicationStyle", e.target.value)}
            className="arcane-input w-full px-4 py-3"
          >
            <option value="casual">Casual</option>
            <option value="professional">Professional</option>
            <option value="humorous">Humorous</option>
            <option value="academic">Academic</option>
            <option value="provocative">Provocative</option>
          </select>
        </div>

        {/* Sample Posts */}
        <div>
          <label className="block text-parchment/50 text-xs font-cinzel tracking-wider uppercase mb-2">
            Scrolls of Utterance
          </label>
          <textarea
            value={form.samplePosts}
            onChange={(e) => update("samplePosts", e.target.value)}
            rows={4}
            placeholder="Paste some typical tweets or describe posting style..."
            className="arcane-input w-full px-4 py-3 resize-none"
          />
        </div>

        {/* Followers + Account Age */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-parchment/50 text-xs font-cinzel tracking-wider uppercase mb-2">
              Followers
            </label>
            <input
              type="number"
              value={form.followerCount || ""}
              onChange={(e) => update("followerCount", parseInt(e.target.value) || 0)}
              className="arcane-input w-full px-4 py-3"
            />
          </div>
          <div>
            <label className="block text-parchment/50 text-xs font-cinzel tracking-wider uppercase mb-2">
              Account Age
            </label>
            <input
              type="text"
              value={form.accountAge || ""}
              onChange={(e) => update("accountAge", e.target.value)}
              placeholder="e.g., 5 years"
              className="arcane-input w-full px-4 py-3"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!form.displayName || (!form.bio && !form.samplePosts)}
          className="btn-gold w-full py-4 text-sm tracking-wider mt-2"
        >
          DIVINE THE CHARACTER
        </button>
      </form>
    </div>
  );
}
