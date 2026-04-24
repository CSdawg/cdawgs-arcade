# cdawgs-arcade

GitHub Pages ready arcade website.

## Important

Upload these files directly into the ROOT of your GitHub repository.

Correct:

```text
cdawgs-arcade/
  index.html
  style.css
  .nojekyll
  games/
    runway-rush/
      index.html
```

Incorrect:

```text
cdawgs-arcade/
  game_hangar/
    index.html
    style.css
    games/
```

If the site only shows the repo name and description, GitHub Pages is not seeing `index.html` at the repo root.

## GitHub Pages settings

Go to:

Settings -> Pages

Use:

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

Then wait 1 to 3 minutes and refresh:

```text
https://csdawg.github.io/cdawgs-arcade/
```
