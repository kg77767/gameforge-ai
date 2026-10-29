"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  display_name: string;
  email: string;
};

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session) {
        await loadProfile(data.session.user.id);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, next) => {
      setSession(next);

      if (next) {
        await loadProfile(next.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile({
        id: data.id,
        display_name: data.display_name,
        email: data.email,
      });
      setDisplayName(data.display_name);
    }
  };

  const handleSave = async () => {
    if (!session || !profile) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", session.user.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setProfile((prev) => (prev ? { ...prev, display_name: displayName } : prev));
    alert("Profile updated.");
  };

  if (!session) {
    return (
      <main className="profile-page">
        <div className="profile-card">
          <h2>Please log in</h2>
          <Link href="/" className="primary-button" style={{ display: "inline-block" }}>
            Go home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-card">
        <div className="card-row">
          <div>
            <div className="eyebrow">Profile</div>
            <h2>Account settings</h2>
          </div>
          <Link href="/" className="outline-button">Back to dashboard</Link>
        </div>

        <div className="field">
          <label>Email</label>
          <input className="text-input" value={profile?.email || ""} disabled />
        </div>

        <div className="field">
          <label>Display name</label>
          <input
            className="text-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <button className="primary-button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </main>
  );
}
