"use client";

import { useState, useCallback } from "react";
import HandleInput from "@/components/HandleInput";
import BookmarkletSetup from "@/components/BookmarkletSetup";
import LoadingState from "@/components/LoadingState";
import ManualInputForm from "@/components/ManualInputForm";
import ErrorDisplay from "@/components/ErrorDisplay";
import ShareableCard from "@/components/character/ShareableCard";
import FullCharacterSheet from "@/components/character/FullCharacterSheet";
import ShareActions from "@/components/ShareActions";
import ArcaneBackground from "@/components/ArcaneBackground";
import type {
  AppState,
  ScrapedProfile,
  DndCharacter,
  ManualProfileInput,
} from "@/types";
import { generateSessionToken } from "@/lib/utils/helpers";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [handle, setHandle] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [profile, setProfile] = useState<ScrapedProfile | null>(null);
  const [character, setCharacter] = useState<DndCharacter | null>(null);
  const [error, setError] = useState("");

  const reset = () => {
    setAppState("idle");
    setHandle("");
    setProfile(null);
    setCharacter(null);
    setError("");
  };

  const generateCharacter = useCallback(
    async (profileData: ScrapedProfile, manualOverrides?: ManualProfileInput) => {
      setAppState("generating");
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: profileData, manualOverrides }),
        });
        const data = await res.json();
        if (data.success && data.character) {
          setCharacter(data.character);
          setAppState("done");
        } else {
          setError(data.error || "Failed to generate character");
          setAppState("error");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
        setAppState("error");
      }
    },
    []
  );

  const handleHandleSubmit = (inputHandle: string) => {
    setHandle(inputHandle);
    const token = generateSessionToken();
    setSessionToken(token);
    setAppState("bookmarklet");
  };

  const handleBookmarkletData = useCallback(
    (data: unknown) => {
      const profileData = data as ScrapedProfile;
      setProfile(profileData);
      generateCharacter(profileData);
    },
    [generateCharacter]
  );

  const handleSkipBookmarklet = async () => {
    setAppState("scraping");

    try {
      const res = await fetch(`/api/scrape?handle=${encodeURIComponent(handle)}`);
      const data = await res.json();

      if (data.success && data.profile) {
        if (data.profile.completeness === "full") {
          setProfile(data.profile);
          generateCharacter(data.profile);
          return;
        }
        const partialProfile = data.profile as ScrapedProfile;

        try {
          const nitterRes = await fetch(
            `/api/scrape-nitter?handle=${encodeURIComponent(handle)}`
          );
          const nitterData = await nitterRes.json();

          if (nitterData.success && nitterData.profile) {
            const merged: ScrapedProfile = {
              ...partialProfile,
              recentTweets:
                partialProfile.recentTweets.length > 5
                  ? partialProfile.recentTweets
                  : nitterData.profile.recentTweets,
              completeness: "partial",
            };
            setProfile(merged);
            generateCharacter(merged);
            return;
          }
        } catch {
          // Nitter failed too
        }

        setProfile(partialProfile);
        setAppState("manual");
        return;
      }
    } catch {
      // Playwright failed
    }

    try {
      const nitterRes = await fetch(
        `/api/scrape-nitter?handle=${encodeURIComponent(handle)}`
      );
      const nitterData = await nitterRes.json();

      if (nitterData.success && nitterData.profile) {
        setProfile(nitterData.profile);
        generateCharacter(nitterData.profile);
        return;
      }
    } catch {
      // Nitter failed
    }

    setAppState("manual");
  };

  const handleManualSubmit = (input: ManualProfileInput) => {
    const manualProfile: ScrapedProfile = {
      handle,
      displayName: input.displayName,
      bio: input.bio,
      location: "",
      joinDate: input.accountAge || "",
      followersCount: input.followerCount || 0,
      followingCount: 0,
      tweetCount: 0,
      pinnedTweet: null,
      recentTweets: [],
      topMentions: [],
      mostUsedWords: [],
      avgEngagementRate: 0,
      completeness: "manual",
    };
    setProfile(manualProfile);
    generateCharacter(manualProfile, input);
  };

  return (
    <>
      {/* Arcane animated background */}
      <ArcaneBackground />

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {appState === "idle" && <HandleInput onSubmit={handleHandleSubmit} />}

        {appState === "bookmarklet" && (
          <BookmarkletSetup
            handle={handle}
            sessionToken={sessionToken}
            onDataReceived={handleBookmarkletData}
            onSkip={handleSkipBookmarklet}
          />
        )}

        {appState === "scraping" && <LoadingState stage="scraping" />}

        {appState === "manual" && (
          <ManualInputForm
            handle={handle}
            partialProfile={profile || undefined}
            onSubmit={handleManualSubmit}
          />
        )}

        {appState === "generating" && <LoadingState stage="generating" />}

        {appState === "done" && character && (
          <div className="w-full max-w-4xl space-y-10">
            <div className="flex flex-col items-center opacity-0 animate-reveal">
              <ShareableCard character={character} handle={handle} />
              <ShareActions character={character} handle={handle} />
            </div>
            <div className="opacity-0 animate-reveal stagger-3">
              <FullCharacterSheet character={character} />
            </div>
            <div className="text-center pb-12">
              <button
                onClick={reset}
                className="text-parchment/30 hover:text-gold-pale text-sm font-body tracking-wide transition-colors duration-300"
              >
                Cast again on another soul
              </button>
            </div>
          </div>
        )}

        {appState === "error" && <ErrorDisplay error={error} onRetry={reset} />}
      </main>
    </>
  );
}
