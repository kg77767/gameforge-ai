"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PlayGameModal from "@/components/PlayGameModal";

type Profile = {
  id: string;
  display_name: string;
  email: string;
};

type Game = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  visibility: "public" | "private";
  game_type: "quiz" | "challenge" | "memory";
  objective: string;
  content: any;
  user_id: string;
  created_at: string;
};

export default function HomePage() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"studio" | "library">("studio");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatedGame, setGeneratedGame] = useState<any>(null);
  const [publicGames, setPublicGames] = useState<Game[]>([]);
  const [privateGames, setPrivateGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session) {
        await loadProfile(data.session.user.id);
        await loadGames();
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, next) => {
      setSession(next);
      if (next) {
        await loadProfile(next.user.id);
        await loadGames();
      } else {
        setProfile(null);
        setPublicGames([]);
        setPrivateGames([]);
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
    }
  };

  const loadGames = async () => {
    if (!session) return;

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const allGames = (data || []) as Game[];

    setPublicGames(allGames.filter((game) => game.visibility === "public"));
    setPrivateGames(
      allGames.filter(
        (game) => game.visibility === "private" && game.user_id === session.user.id
      )
    );
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const { error: insertError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            email,
            display_name: name || "Player",
          });

          if (insertError) {
            console.error("Profile insert error:", insertError);
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.message || "Auth failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !prompt.trim()) {
      alert("Please enter a game title and prompt.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, prompt }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Generation failed.");

      setGeneratedGame(json);
    } catch (error: any) {
      alert(error.message || "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGame = async (visibility: "public" | "private") => {
    if (!session || !generatedGame) {
      alert("Create and generate a game before saving.");
      return;
    }

    const payload = {
      title: generatedGame.title || title,
      description: generatedGame.description || "AI generated game",
      prompt,
      visibility,
      gameType: generatedGame.gameType || "quiz",
      objective: generatedGame.objective || "Complete the challenge.",
      content: generatedGame.content || {},
    };

    const response = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok) {
      alert(json.error || "Could not save game.");
      return;
    }

    await loadGames();
    alert(`Saved "${payload.title}" to the ${visibility} library.`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <main className="auth-page">
        <div className="auth-panel">
          <div className="logo-large">AI</div>
          <h1>GameForge AI</h1>
          <p style={{ color: "#cbd5e1", lineHeight: 1.7, maxWidth: 620 }}>
            Generate games with AI, publish them to a public library, or keep them private for your own profile.
          </p>

          <ul>
            <li>Email sign-up and login</li>
            <li>Public and private libraries</li>
            <li>AI-generated game concepts</li>
            <li>Playable mini-games</li>
          </ul>
        </div>

        <div className="auth-card">
          <h2>{mode === "signup" ? "Create your profile" : "Log in"}</h2>

          <form onSubmit={handleAuth}>
            {mode === "signup" && (
              <div className="field">
                <label>Display name</label>
                <input
                  className="text-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            )}

            <div className="field">
              <label>Email</label>
              <input
                className="text-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                className="text-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Working..." : mode === "signup" ? "Create profile" : "Log in"}
            </button>
          </form>

          <p style={{ marginTop: 18, color: "#cbd5e1" }}>
            {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
            <button
              type="button"
              className="switch-link"
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            >
              {mode === "signup" ? "Log in" : "Create profile"}
            </button>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">G</div>
          <span>GameForge AI</span>
        </div>

        <div className="topbar-right">
          <span className="user-pill">{profile?.display_name || "Player"}</span>
          <Link href="/profile" className="outline-button">Profile</Link>
          <button className="outline-button" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <div className="dashboard">
        <aside className="sidebar">
          <div className="profile-block">
            <div className="profile-name">{profile?.display_name || "Player"}</div>
            <div className="profile-email">{profile?.email || "guest@example.com"}</div>
          </div>

          <div className="nav">
            <button
              className={`tab-button ${activeTab === "studio" ? "active" : ""}`}
              onClick={() => setActiveTab("studio")}
            >
              Game studio
            </button>

            <button
              className={`tab-button ${activeTab === "library" ? "active" : ""}`}
              onClick={() => setActiveTab("library")}
            >
              Libraries
            </button>
          </div>
        </aside>

        <section className="main-panel">
          {activeTab === "studio" && (
            <div className="panel">
              <div className="section-header">
                <div>
                  <div className="eyebrow">Create</div>
                  <h2>Generate a game</h2>
                </div>
              </div>

              <form className="form-grid" onSubmit={handleGenerate}>
                <div className="field">
                  <label>Game title</label>
                  <input
                    className="text-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nebula Runner"
                  />
                </div>

                <div className="field">
                  <label>AI prompt</label>
                  <textarea
                    className="textarea-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Create a puzzle adventure in a moon city where the player collects lost crystals and avoids haunted drones."
                  />
                </div>

                <button type="submit" className="primary-button" disabled={loading}>
                  {loading ? "Generating..." : "Generate game"}
                </button>
              </form>

              {generatedGame && (
                <div className="generated-card">
                  <div className="meta-row">
                    <div>
                      <h3>{generatedGame.title}</h3>
                      <p>{generatedGame.description}</p>
                    </div>
                    <span className="tag">{generatedGame.gameType}</span>
                  </div>

                  <p><strong>Objective:</strong> {generatedGame.objective}</p>

                  <div className="preview-actions">
                    <button className="secondary-button" onClick={() => handleSaveGame("public")}>
                      Save to public
                    </button>

                    <button className="warning-button" onClick={() => handleSaveGame("private")}>
                      Save to private
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "library" && (
            <div className="library-grid">
              <div className="library-panel">
                <div className="library-header">
                  <h3>Public library</h3>
                  <span className="tag">{publicGames.length}</span>
                </div>

                <div className="game-list">
                  {publicGames.length === 0 && <div className="empty-state">No public games yet.</div>}

                  {publicGames.map((game) => (
                    <div key={game.id} className="game-item">
                      <h4>{game.title}</h4>
                      <p>{game.description}</p>

                      <div className="game-item-footer">
                        <span className="small-tag">{game.game_type}</span>
                        <button
                          className="primary-button"
                          style={{ padding: "8px 12px" }}
                          onClick={() => setSelectedGame(game)}
                        >
                          Play
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="library-panel">
                <div className="library-header">
                  <h3>Private library</h3>
                  <span className="tag">{privateGames.length}</span>
                </div>

                <div className="game-list">
                  {privateGames.length === 0 && <div className="empty-state">No private games yet.</div>}

                  {privateGames.map((game) => (
                    <div key={game.id} className="game-item">
                      <h4>{game.title}</h4>
                      <p>{game.description}</p>

                      <div className="game-item-footer">
                        <span className="small-tag">{game.game_type}</span>
                        <button
                          className="primary-button"
                          style={{ padding: "8px 12px" }}
                          onClick={() => setSelectedGame(game)}
                        >
                          Play
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {selectedGame && (
        <PlayGameModal
          game={{
            id: selectedGame.id,
            title: selectedGame.title,
            description: selectedGame.description,
            objective: selectedGame.objective,
            game_type: selectedGame.game_type,
            content: selectedGame.content,
          }}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </main>
  );
}
