# Production Calculator

A small-batch production cost calculator for 3D printed products.

## What it does

- Calculates filament model, purge, and prime tower cost.
- Calculates cost per printed piece.
- Adds bulk item usage cost per piece.
- Adds labour, packaging, handling, post-processing, and design time.
- Saves projects in browser local storage.
- Supports English and French.
- Supports desktop, phone, dark, light, and studio themes.
- Exports a printable Letter-format report through the browser print dialog.

## Hosting

This repository includes a GitHub Pages workflow. After the files are pushed, go to:

Settings > Pages > Build and deployment > Source > GitHub Actions

Then run the Deploy to GitHub Pages workflow or push to main.

## Local development

This repository currently uses a static single-page app so it can be hosted anywhere with no build step. Codex can later migrate it to Vite/React if we want a larger component structure.
