# Product Map – Core Concepts

Product Map is a structured workspace for product managers and designers to model user journeys, jobs to be done, pain points, opportunities, and solutions across time.

Product Map transforms unstructured product thinking into structured maps that can be edited, analysed, and exported.

This document defines the fundamental entities of Product Map. These definitions are the system of truth. All implementation must conform to these concepts.

---

# Primary Entity: Map

A Map represents a complete model of a user journey.

Examples:

- "Corporate travel booking experience"
- "E-commerce checkout journey"
- "User onboarding experience"

Fields:

- id: unique identifier
- name: name of the map
- description: optional description
- persona_id: reference to persona
- created_at: timestamp
- updated_at: timestamp

A Map contains:

- stages[]
- rows[]
- cells[]

A Map is the top-level object in Product Map.

---

# Entity: Stage

A Stage represents a step in the timeline of the journey.

Examples:

- Discover need
- Search
- Compare
- Select
- Purchase
- Use
- Support

Fields:

- id: unique identifier
- map_id: reference to parent map
- name: stage name
- order: integer representing sequence position

Stages form the horizontal axis of the map.

Stages define the temporal flow of the experience.

---

# Entity: Row

A Row represents a dimension of experience or analysis.

Examples:

- User Goal
- Jobs to be Done
- User Actions
- Touchpoints
- Pain Points
- Opportunities
- Solutions
- Emotions
- Metrics

Fields:

- id: unique identifier
- map_id: reference to parent map
- type: row category (goal, job, action, pain, opportunity, solution, emotion, touchpoint, metric, custom)
- name: display name
- order: integer representing vertical position

Rows form the vertical axis of the map.

Rows allow structured analysis across all stages.

---

# Entity: Cell

A Cell represents content at the intersection of a Stage and a Row.

Example:

Stage: Search
Row: Pain Point
Content: Too many options to evaluate

Fields:

- id: unique identifier
- map_id: reference to parent map
- stage_id: reference to stage
- row_id: reference to row
- content: text content
- created_at: timestamp
- updated_at: timestamp

Cells are the core building blocks of Product Map.

Every insight is stored as a Cell.

---

# Entity: Persona

Persona represents the user archetype for the Map.

Examples:

- Corporate traveler
- Travel manager
- First-time user
- Small business owner

Fields:

- id: unique identifier
- name: persona name
- description: persona description
- goals: persona goals
- frustrations: persona pain points
- created_at: timestamp
- updated_at: timestamp

A Map is associated with one Persona.

Persona provides context for interpreting the Map.

---

# Conceptual Model Summary

Product Map uses a structured 2D model:

Map
 ├── Persona
 ├── Stages (horizontal axis)
 ├── Rows (vertical axis)
 └── Cells (intersection of stage and row)

This creates a structured experience map.

---

# Example Structure

Map: Corporate Travel Booking

Stages:
1. Realise need
2. Search options
3. Compare options
4. Book hotel
5. Stay
6. Expense claim

Rows:
- User Goal
- Jobs to be Done
- Pain Points
- Opportunities
- Solutions

Cells:
Each stage and row intersection contains insights.

---

# Design Principles

Product Map follows these principles:

1. Structured
All insights must be stored in structured format.

2. Flexible
Users can add custom stages and rows.

3. Visual
Maps must be understandable at a glance.

4. Editable
All elements must be editable.

5. Exportable
Maps must be exportable to PDF, Excel, and other formats.

6. AI-Compatible
All structures must be compatible with AI generation and analysis.

---

# System of Record Rule

This document defines the core domain model.

All database schema, API design, UI, and AI features must conform to these definitions.
