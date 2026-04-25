# GTA Passive Business Tracker

A drop in GTA Online passive business tracker for C Dawg's Arcade.

## What it does

- Tracks supplies and product for Bunker, Acid Lab, Cocaine, Meth, Cash, Weed, and Document Forgery.
- Tracks Nightclub warehouse crates by technician good type.
- Uses an "I am in game" toggle so production only advances while you say you are in GTA Online.
- Saves everything in the browser with localStorage.
- Includes export/import backup buttons.
- Works on GitHub Pages with no backend.

## Drop in setup for cdawgs arcade

Recommended folder location:

```text
games/gta-passive-tracker/
```

Put these files in that folder:

```text
index.html
styles.css
business-data.js
app.js
thumbnail.svg
README.md
arcade-card-snippet.html
```

Then link to it from your main arcade page with:

```html
<a href="games/gta-passive-tracker/">GTA Passive Business Tracker</a>
```

If your arcade home page uses game cards, copy the card from `arcade-card-snippet.html` and paste it into your games grid.

## Editing rates

All production values live in:

```text
business-data.js
```

That file is intentionally separate so you can quickly update GTA$ values, production speed, or event week multipliers without touching the main app code.

## Important note

This app is set for normal baseline production. GTA Online event weeks can temporarily change payouts or production speed, so edit `business-data.js` if Rockstar runs a double money or double production event.
