# Data Validator

A browser-based tool that validates contractor compliance declarations against Kenya compliance standards. Point it at a list of contractors and it tells you what's missing, what's expired, and what needs review before that data causes a problem downstream.

---

## What it checks

For each contractor record it validates:

- **Required fields** - contractor ID, name, county, and a properly formatted email address must all be present
- **Date format** - `submittedDate` and `expiryDate` on every declaration must parse as real calendar dates
- **Expiry** - flags any declaration whose expiry date has already passed
- **Compliance status** - marks non-compliant declarations for review
- **Category coverage** - warns if QualityStandards or EnvironmentalPermit declarations are missing (both are required as a baseline)

Results come back in three states: **Passed** (no issues), **Warnings** (valid but something needs attention), or **Failed** (missing or broken data that has to be fixed).

---

## What you can do in the UI

- View the validation card for each contractor - colour-coded by result
- See each contractor's declarations in a table (category, status, expiry date)
- Check the summary bar at the top for a quick count across all contractors
- Click **+ Add Contractor** to add a new record through the form and see it validated instantly

---

## Tech

- **TypeScript** - all validation logic is typed. `src/types.ts` defines the data shapes; `src/data-validator.ts` contains the rules; `src/app.ts` wires it to the DOM
- TypeScript compiles to `dist/` and `index.html` loads the compiled files directly - no bundler needed

---

## Project structure

```
src/
  types.ts           - TypeScript interfaces and union types for contractors and declarations
  data-validator.ts  - all validation logic (field checks, date parsing, expiry, category coverage)
  app.ts             - sample contractor data, card rendering, and the add contractor form
index.html           - the UI shell, loads compiled JS from dist/
```

---

## Getting started

You need Node.js installed for the TypeScript compiler.

```bash
npm install
```

To compile and watch for changes:

```bash
npx tsc --watch
```

Then open `index.html` in a browser. The page renders a validation card for each contractor in the sample dataset and a summary bar at the top.

To do a one-off compile:

```bash
npx tsc
```

---

## Adding your own data

You can add contractors through the **+ Add Contractor** button in the UI, or edit the sample records directly in `src/app.ts`. Each entry follows the `Contractor` interface - swap in real data and the validator picks it up on the next compile.

Supported compliance categories: `QualityStandards`, `EnvironmentalPermit`, `HazardousSubstances`, `EthicalSourcing`, `OccupationalHealth`, `WasteManagement`.
