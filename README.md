# Stilværksted

Personligt værktøj til farver og typografi i én HTML-fil: konverter (HEX, RGB, HSL, CMYK, Pantone, LAB, OKLCH), harmonier, paletbygger, visualisering, gradient, mixer, kontrasttjek og farver fra billede.

Roller giver paletfarverne en opgave (baggrund, tekst, primær, sekundær, accent) og foreslår en mørk udgave. Stilpakke samler palet, roller, typografi og ikoner til et stilark (PNG/PDF), én CSS-fil og et delelink, hvor hele indholdet ligger i adressen efter `#s=`.

Kilden er `src/app.html`. Kør `./build.sh` for at lave `index.html`, og deploy mappen som statisk side.

Pantone-værdierne er vejledende og kommer fra npm-pakken `pantone-colors` (MIT).

## Figma-plugin

`figma-plugin/` er et lille Figma-plugin, der opretter en palet fra Paletbygger som variabler, farvestile og en oversigt. Indlæs det i Figmas desktop-app via Plugins → Development → Import plugin from manifest. `build.sh` pakker det til `stilvaerksted-figma-plugin.zip`.
