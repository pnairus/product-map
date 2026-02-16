"use client";

import { useState } from "react";
import MapList from "./components/MapList.jsx";
import MapEditor from "./components/MapEditor.jsx";
import MapGenerator from "./MapGenerator.jsx";

export default function App() {
  const [selectedMapId, setSelectedMapId] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  function handleGenerated(map) {
    setSelectedMapId(map.id);
    setRefreshToken((value) => value + 1);
  }

  return (
    <main className="min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Product Map MVP</h1>
        <p className="text-sm text-slate-600">Manage maps, edit cells, and save changes.</p>
      </header>

      <div className="grid gap-6">
        <MapGenerator onGenerated={handleGenerated} />
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <MapList
          selectedMapId={selectedMapId}
          onSelectMap={setSelectedMapId}
          refreshToken={refreshToken}
        />
        <MapEditor mapId={selectedMapId} />
        </div>
      </div>
    </main>
  );
}
