# St. Louis Events

Event feed and calendar for St. Louis: Enterprise Center, Busch Stadium,
Energizer Park, The Dome at America's Center, Chaifetz Arena, the Fabulous Fox,
Stifel Theatre, the Sheldon, the music rooms from the Loop to Grand Center and
south city, and Maryland Heights, Chesterfield and St. Charles — with the home
teams' seasons (Blues, Cardinals, CITY SC, Battlehawks, Billikens, Mizzou) in a
Teams view.

Live at **https://stlouis.here.events/** once the domain is wired (GitHub
Pages, built by the Actions workflow once a day at noon Central).

One of the cities on the lqa-events codebase, built the day after Chicago:
everything that makes this St. Louis's is `site/city.js` (every team, venue,
type, default, share-code registry and string), `site/index.html`,
`scripts/fetch-events.mjs` (the sources), `scripts/sources.mjs` (the church
rule's exemptions), `site/embed.js`, `outlook.json`, `scripts/data/postseason.json`,
`channels.json`, the manifest and icons (the Gateway Arch, rendered from
`favicon.svg`). Everything else is lqa-events' own, byte for byte — copy from
there, never edit here.

## Embed

```html
<div id="stlouis-events"></div>
<script src="https://stlouis.here.events/embed.js" data-max="8" defer></script>
```

## Sources

- **Ticketmaster Discovery API** — every room by its venue id (every page):
  20 rooms, from the Dome to the 340-seat Duck Room. There is no city sweep:
  a St. Louis sweep would pull in the casinos across the river and every
  church hall, and the API stops a query at its thousandth event. Every call
  is paced a second apart and a 429 waits and retries, since a dozen sister
  builds share the key. Church events are left out (`isChurch`).
- **Seasons** — ESPN for CITY SC, the Battlehawks, the Billikens and Mizzou;
  MLB's stats API for the Cardinals; the NHL's for the Blues
  (`scripts/schedules.mjs`, shared with lqa). CITY SC's home matches enter the
  listing from the league's schedule (`inject` in city.js), since Ticketmaster
  lists only a few of them.

Next to add: the rooms whose shows Ticketmaster never lists (the Fox's
MetroTix seasons, Powell Hall and the St. Louis Symphony, the Muny's summer,
Off Broadway's own box office) and the city's festivals.

## Local run

```sh
cp .env.example .env   # TICKETMASTER_API_KEY=…
ALLOW_NO_ARCHIVE=1 node scripts/fetch-events.mjs   # ALLOW_NO_ARCHIVE only until the site has published once
node --test scripts/*.test.mjs
```
