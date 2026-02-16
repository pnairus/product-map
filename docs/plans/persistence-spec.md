# Product Map – Persistence Layer Spec

This document defines how Product Map objects are stored and retrieved.

Persistence must strictly store schema-compliant Map objects.

---

# Persistence Goals (MVP)

The system must support:

- saveMap(map)
- loadMap(mapId)
- listMaps()
- deleteMap(mapId)

Persistence must preserve full Map structure.

---

# Storage Model

Maps must be stored as complete objects.

Each Map contains:

- persona
- stages
- rows
- cells

Relationships must be preserved using IDs.

---

# MVP Storage Option: Local File Storage

For MVP, Maps must be stored as JSON files.

Directory:

data/maps/

Each Map stored as:

data/maps/{map_id}.json

Example:

data/maps/78adcd80.json

---

# Required Functions

Coding agent must implement:

saveMap(map)

- validates map
- saves to file

loadMap(mapId)

- loads JSON file
- validates map
- returns Map object

listMaps()

- returns list of saved Maps

deleteMap(mapId)

- removes Map file

---

# Validation Requirement

Every save and load must call:

validateMap(map)

Invalid maps must never be saved.

---

# File Format Requirement

Stored files must match map-schema.json exactly.

---

# Future Storage (Post-MVP)

Later replace with:

Supabase or PostgreSQL

But MVP must use file storage first.

This simplifies development and debugging.
