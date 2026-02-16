# Product Map – UI Architecture Spec

This document defines the structure of the Product Map frontend.

The UI must strictly follow the domain model and persistence layer.

The UI must never redefine data structures.

---

# UI Goals (MVP)

User must be able to:

- Create Map
- Load Map
- View Map as grid
- Add Stage
- Add Row
- Edit Cell
- Save Map

No AI generation required yet.

---

# Core UI Components

The UI consists of the following components:

---

## 1. App (root)

Responsibility:

- Application state
- Load and save Maps

---

## 2. MapList

Displays list of Maps.

Functions:

- show saved maps
- select map
- create map

Uses:

listMaps()

---

## 3. MapEditor

Main editing interface.

Loads Map.

Contains:

- MapGrid
- Save button

---

## 4. MapGrid

Displays Map as grid.

Horizontal axis:

Stages

Vertical axis:

Rows

Contains:

- StageHeader
- RowHeader
- CellEditor

---

## 5. StageHeader

Displays stage names.

Allows:

- rename stage
- add stage

---

## 6. RowHeader

Displays row names.

Allows:

- rename row
- add row

---

## 7. CellEditor

Displays and edits cell content.

Allows:

- edit content
- save content

Must update Map object.

---

# UI State Model

UI must store:

currentMap

All edits modify currentMap.

Saving calls:

saveMap(currentMap)

---

# Data Flow

Load:

User selects map
→ loadMap()
→ set currentMap
→ render MapGrid

Edit:

User edits cell
→ update currentMap
→ re-render

Save:

User clicks save
→ saveMap(currentMap)

---

# Technology Stack

Required:

Next.js
React
TailwindCSS

Optional:

React state management (useState sufficient for MVP)

Do NOT use complex state libraries.

---

# UI Constraints

Must follow schema exactly.

Must not duplicate domain logic.

Must not bypass persistence layer.

Must use domain operations.

---

# Visual Layout (MVP)

Layout:

Top bar:
- Map name
- Save button

Main area:
Grid layout

Columns:
Stages

Rows:
Experience dimensions

Cells:
Editable text

---

# Folder Structure

UI files must be under:

src/ui/

Example:

src/ui/
  App.jsx
  MapList.jsx
  MapEditor.jsx
  MapGrid.jsx
  StageHeader.jsx
  RowHeader.jsx
  CellEditor.jsx

---

# MVP Success Criteria

User can:

- create map
- edit map
- save map
- load map

without errors.
