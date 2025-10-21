# Sprint Prompt Cards
(Use IDs; keep each card ≤150 lines. Add depends_on if needed.)

## P-005: Files Upload API
depends_on: []
context: project-brief.md, coding-standards.md, backend/INSTRUCTIONS.md
goal: POST /files to store resume/JD, return {fileId, mime, size}
DoD:
- 10MB limit + type check (pdf/docx)
- One e2e happy path
- Update sprint-current.md

## P-006: FE Upload Screen Wire-up
depends_on: [P-005]
context: project-brief.md, coding-standards.md, frontend/INSTRUCTIONS.md
goal: Hook RTK Query upload; show file name + error states
DoD:
- Disabled "Analyze" until 2 files present
- Basic a11y checks

## P-007: Analyses Service (Backend)
depends_on: [P-005]
goal: Service that accepts {resumeId, jdId} and returns stub {matchScore, atsScore}
DoD:
- Unit test for score stub
- Controller thin, service tested

## P-008: FE Analyze Action
depends_on: [P-006, P-007]
goal: Button calls POST /analyses and renders match% + ATS
DoD:
- Loading + error toasts
- Render bar with % value
