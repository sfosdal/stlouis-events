// The city — every fact that makes this calendar St. Louis's rather than
// another town's, in one place (2026-10-11: one of the cities built on
// lqa-events the day after Chicago). The browser (filter.js, app.js) and the
// build (scripts/*.mjs) both read it; nothing else names a venue or a team.
// The shared files (app.js, filter.js, styles.css bar its --v-* hues,
// scripts/*.mjs bar fetch-events.mjs and sources.mjs) are lqa-events' own,
// byte for byte — see README "Sister sites".
//
// Loaded before filter.js (a plain script, so the tests can share it): it
// sets globalThis.LQACity (the name is the shared code's, not the city's).
(function (global) {
  'use strict';

  // The home teams, matched on the event title whatever the venue. Order =
  // the Teams strip, left to right. Per team:
  //   re        the title match
  //   venue     the home building; schedule = the club's own schedule page.
  //             A venue city.js does not list (Mizzou's Faurot Field, two
  //             hours west in Columbia) makes the club Teams-view only: its
  //             season shows there, no game enters the listing
  //   sport     keys the strip icon (app.js SPORT_ICONS), the game clock,
  //             the leader categories
  //   colors    [primary, accent] — the season calendar's home cells and
  //             card frames
  //   espn      ESPN's sport/league/team id — every St. Louis club is on
  //             ESPN, so the season, the form block, news and transactions
  //             all come from there (schedules.mjs); the Cardinals' season
  //             comes from MLB's stats API (first-pitch times, the standings)
  //             and the Blues' from the NHL's, as lqa's Mariners and Kraken
  //   division  (baseball) the division rivals by the abbreviations the
  //             schedule carries, for the standings line
  //   inject    a club whose home games reach no ticket feed here: the
  //             league's schedule puts them in the listing, linked to the
  //             club's ticket page (fetch-events.mjs)
  //   strip     false = a filter row but no tab in the Teams view (for a
  //             club whose season feed is empty; none here now)
  //   club      the club's name on Ticketmaster; news the outlets' feeds;
  //             wiki the article; opens when the season usually starts
  var MLB = function (slug) { return ['https://www.mlb.com/' + slug + '/feeds/news/rss.xml', 'MLB.com']; };
  var TEAMS = [
    // St. Louis Blues, NHL, Enterprise Center. The title match keeps the
    // city's name: "Blues" alone is half the music listings in town
    { slug: 'blues', label: 'Blues', re: /st\.? ?louis blues/i, sport: 'hockey', venue: 'Enterprise Center', colors: ['#002f87', '#fcb514'],
      espn: { sport: 'hockey', league: 'nhl', id: '19' }, season: { kind: 'nhl', abbrev: 'STL' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/stl.png', schedule: 'https://www.nhl.com/blues/schedule',
      club: 'St. Louis Blues', opens: 'early October', wiki: { title: 'St. Louis Blues' } },
    // St. Louis Cardinals, MLB, Busch Stadium
    { slug: 'cardinals', label: 'Cardinals', re: /st\.? ?louis cardinals/i, sport: 'baseball', venue: 'Busch Stadium', colors: ['#c41e3a', '#0c2340'],
      espn: { sport: 'baseball', league: 'mlb', id: '24' }, season: { kind: 'mlb', id: 138 }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/stl.png', schedule: 'https://www.mlb.com/cardinals/schedule',
      club: 'St. Louis Cardinals', opens: 'late March', wiki: { title: 'St. Louis Cardinals' },
      division: ['CHC', 'MIL', 'CIN', 'PIT'], // NL Central
      news: [MLB('cardinals')] },
    // St. Louis CITY SC, MLS (since 2023), Energizer Park. Ticketmaster lists
    // only a handful of the home matches (the club sells through SeatGeek),
    // so the league's schedule puts the rest in the listing (`inject`)
    { slug: 'citysc', label: 'CITY SC', name: 'St. Louis CITY SC', re: /city sc\b|st\.? ?louis city\b/i, sport: 'soccer', venue: 'Energizer Park', colors: ['#dc052d', '#001544'],
      espn: { sport: 'soccer', league: 'usa.1', id: '21812' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      inject: { url: 'https://www.stlcitysc.com/tickets/' },
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/21812.png', schedule: 'https://www.stlcitysc.com/schedule/',
      club: 'St. Louis CITY SC', opens: 'late February', wiki: { title: 'St. Louis City SC' } },
    // St. Louis Battlehawks, UFL (spring football, since 2020 as the XFL's), The Dome
    { slug: 'battlehawks', label: 'Battlehawks', re: /battlehawks/i, sport: 'football', venue: "The Dome at America's Center", colors: ['#0a2240', '#7ba4db'],
      espn: { sport: 'football', league: 'ufl', id: '112651' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ufl/500/stl.png', schedule: 'https://www.theufl.com/teams/st-louis/schedule',
      club: 'St. Louis Battlehawks', opens: 'late March', wiki: { title: 'St. Louis Battlehawks' } },
    // Saint Louis Billikens, college basketball (Atlantic 10), Chaifetz Arena:
    // the games come from the arena's Ticketmaster listing; the season from
    // ESPN's regular-season call (schedules.mjs asks for it beside the plain
    // call, which is an empty preseason until November). Were the feed ever
    // empty, `strip: false` would keep the filter row and drop the Teams tab
    { slug: 'billikens', label: 'Billikens', name: 'Saint Louis Billikens', abbr: 'SLU', re: /billikens/i, sport: 'basketball', venue: 'Chaifetz Arena', colors: ['#003da5', '#c8c8c8'],
      espn: { sport: 'basketball', league: 'mens-college-basketball', id: '139' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/139.png', schedule: 'https://slubillikens.com/sports/mens-basketball/schedule',
      club: 'Saint Louis Billikens', opens: 'November', wiki: { title: "Saint Louis Billikens men's basketball", teamPage: true } },
    // Missouri Tigers football (SEC), Faurot Field in Columbia — the state's
    // team, followed from St. Louis: Teams view only, since the ground is no
    // St. Louis venue (no `inject`), as Everett follows the Seattle clubs
    { slug: 'mizzou', label: 'Mizzou', name: 'Missouri Tigers', abbr: 'MIZ', re: /missouri tigers|\bmizzou\b/i, sport: 'football', venue: 'Faurot Field', colors: ['#f1b82d', '#000000'],
      espn: { sport: 'football', league: 'college-football', id: '142' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/142.png', schedule: 'https://mutigers.com/sports/football/schedule',
      club: 'Missouri Tigers', opens: 'late August', wiki: { title: 'Missouri Tigers football', teamPage: true } },
  ];

  // The venues, one record each — downtown and the stadiums first by size,
  // then the music rooms and the suburbs. Per venue:
  //   capacity how many people the place holds
  //   area     'town' for the music rooms across the city and the county
  //            (the panel's second group); absent = downtown and the
  //            stadiums
  //   type     the event type when the title decides nothing
  //   cssVar   the hue styles.css sets for it (dark block --v-*); color
  //            the same hue as a value, for the series graph
  //   url      the venue's own events listing — not a ticket vendor
  //   icon     a mark for listings without a team crest
  //   tm       its Ticketmaster Discovery listing (fetch-events.mjs reads
  //            the venue by id — every page). There is NO city sweep here:
  //            a St. Louis sweep would pull in the casinos across the river
  //            and every church hall, and the API stops a query at its
  //            thousandth event
  //   alias    the other spellings the feeds use for it, folded to this name
  // No festivals yet, so the panel's Festivals group folds away (app.js).
  var VENUES = {
    // --- Downtown and the stadiums: the arena, the ballpark, the soccer ground, the Dome, the big theatres ---
    'Enterprise Center': {
      geo: [38.62643, -90.20262],
      capacity: 18096,
      type: 'sports',
      cssVar: '--v-enterprise',
      color: '#ea8686',
      url: 'https://www.enterprisecenter.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.enterprisecenter.com&sz=128',
      tm: { id: 'KovZpa2DJe', match: 'enterprise center', fallbackUrl: 'https://www.enterprisecenter.com/events', exclude: /parking|tour/i },
      alias: /enterprise center|scottrade center/i,
    },
    'Busch Stadium': {
      geo: [38.62398, -90.19405],
      capacity: 44383,
      type: 'sports',
      cssVar: '--v-busch',
      color: '#86eaa3',
      url: 'https://www.mlb.com/cardinals/schedule',
      icon: 'https://www.google.com/s2/favicons?domain=www.mlb.com&sz=128',
      tm: { id: 'KovZpapBwe', match: 'busch stadium', fallbackUrl: 'https://www.mlb.com/cardinals/schedule', exclude: /parking|stadium tour|ballpark tour/i },
      alias: /busch stadium/i,
    },
    'Energizer Park': {
      geo: [38.6312, -90.2105],
      capacity: 22500,
      type: 'sports',
      cssVar: '--v-energizer',
      color: '#c086ea',
      url: 'https://www.energizerpark.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.stlcitysc.com&sz=128',
      tm: { id: 'KovZ917AttV', match: 'energizer park', fallbackUrl: 'https://www.energizerpark.com/', exclude: /parking/i },
      alias: /energizer park|citypark|city park stadium/i,
    },
    "The Dome at America's Center": {
      geo: [38.6308, -90.19149],
      capacity: 67000,
      type: 'sports',
      cssVar: '--v-dome',
      color: '#eadd86',
      url: 'https://www.explorestlouis.com/americas-center/',
      icon: 'https://www.google.com/s2/favicons?domain=www.explorestlouis.com&sz=128',
      tm: { id: 'KovZpZA6AJeA', match: 'the dome', fallbackUrl: 'https://www.explorestlouis.com/americas-center/', exclude: /parking/i },
      alias: /the dome at america|edward jones dome|^the dome$/i,
    },
    'Chaifetz Arena': {
      geo: [38.63296, -90.22667],
      capacity: 10600,
      type: 'concert',
      cssVar: '--v-chaifetz',
      color: '#86d9ea',
      url: 'https://www.chaifetzarena.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.chaifetzarena.com&sz=128',
      tm: { id: 'KovZpZAJ6ekA', match: 'chaifetz', fallbackUrl: 'https://www.chaifetzarena.com/events', exclude: /parking/i },
      alias: /chaifetz/i,
    },
    'Fabulous Fox Theatre': {
      geo: [38.639, -90.23213],
      capacity: 4500,
      type: 'arts',
      cssVar: '--v-fox',
      color: '#ea86bc',
      url: 'https://www.fabulousfox.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.fabulousfox.com&sz=128',
      tm: { id: 'KovZpZA17l7A', match: 'fox theatre', fallbackUrl: 'https://www.fabulousfox.com/events' },
      alias: /fabulous fox|fox theatre/i,
    },
    'Stifel Theatre': {
      geo: [38.62808, -90.20123],
      capacity: 3100,
      type: 'concert',
      cssVar: '--v-stifel',
      color: '#9fea86',
      url: 'https://www.stifeltheatre.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.stifeltheatre.com&sz=128',
      tm: { id: 'KovZpa3die', match: 'stifel theatre', fallbackUrl: 'https://www.stifeltheatre.com/events' },
      alias: /stifel theat|peabody opera house/i,
    },
    'The Sheldon': {
      geo: [38.63995, -90.23328],
      capacity: 700,
      type: 'arts',
      cssVar: '--v-sheldon',
      color: '#8a86ea',
      url: 'https://www.thesheldon.org/',
      icon: 'https://www.google.com/s2/favicons?domain=www.thesheldon.org&sz=128',
      tm: { id: 'KovZpZAJEanA', match: 'sheldon', fallbackUrl: 'https://www.thesheldon.org/' },
      alias: /sheldon concert hall|^the sheldon$/i,
    },
    // --- Music rooms and the suburbs (`area: 'town'`): the Loop and Grand Center rooms, the south city clubs, then Maryland Heights, Chesterfield and St. Charles ---
    'The Pageant': {
      geo: [38.65562, -90.29791],
      area: 'town',
      capacity: 2300,
      type: 'concert',
      cssVar: '--v-pageant',
      color: '#eaa786',
      url: 'https://www.thepageant.com/calendar/',
      icon: 'https://www.google.com/s2/favicons?domain=www.thepageant.com&sz=128',
      tm: { id: 'KovZpZA6AJ7A', match: 'pageant', fallbackUrl: 'https://www.thepageant.com/calendar/' },
      alias: /the pageant/i,
    },
    'Delmar Hall': {
      geo: [38.65553, -90.29719],
      area: 'town',
      capacity: 750,
      type: 'concert',
      cssVar: '--v-delmar',
      color: '#86eac4',
      url: 'https://www.delmarhall.com/calendar/',
      icon: 'https://www.google.com/s2/favicons?domain=www.delmarhall.com&sz=128',
      tm: { id: 'KovZpZAt6e7A', match: 'delmar hall', fallbackUrl: 'https://www.delmarhall.com/calendar/' },
      alias: /delmar hall/i,
    },
    'The Factory': {
      geo: [38.67209, -90.59321],
      area: 'town',
      capacity: 3000,
      type: 'concert',
      cssVar: '--v-factory',
      color: '#e186ea',
      url: 'https://thefactorystl.com/',
      icon: 'https://www.google.com/s2/favicons?domain=thefactorystl.com&sz=128',
      tm: { id: 'KovZ917APwI', match: 'the factory', fallbackUrl: 'https://thefactorystl.com/' },
      alias: /^the factory\b/i,
    },
    'Hollywood Casino Amphitheatre': {
      geo: [38.74564, -90.46996],
      area: 'town',
      capacity: 20000,
      type: 'concert',
      cssVar: '--v-hca',
      color: '#d5ea86',
      url: 'https://www.livenation.com/venue/KovZpZAEAnaA/hollywood-casino-amphitheatre-tickets',
      icon: 'https://www.google.com/s2/favicons?domain=www.livenation.com&sz=128',
      tm: { id: 'KovZpZAEAnaA', match: 'hollywood casino amphitheat', fallbackUrl: 'https://www.livenation.com/venue/KovZpZAEAnaA/hollywood-casino-amphitheatre-tickets', exclude: /parking|lawn pass|season pass/i },
      alias: /hollywood casino amphitheat|riverport/i,
    },
    'Chesterfield Amphitheater': {
      geo: [38.65366, -90.57232],
      area: 'town',
      capacity: 4000,
      type: 'concert',
      cssVar: '--v-chesterfield',
      color: '#86b7ea',
      url: 'https://www.chesterfieldamphitheater.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.chesterfieldamphitheater.com&sz=128',
      tm: { id: 'KovZpZAaaneA', match: 'chesterfield amphitheat', fallbackUrl: 'https://www.chesterfieldamphitheater.com/events' },
      alias: /chesterfield amphitheat/i,
    },
    'Old Rock House': {
      geo: [38.61529, -90.19651],
      area: 'town',
      capacity: 400,
      type: 'concert',
      cssVar: '--v-oldrock',
      color: '#ea869a',
      url: 'https://oldrockhouse.com/',
      icon: 'https://www.google.com/s2/favicons?domain=oldrockhouse.com&sz=128',
      tm: { id: 'KovZpZA1I6dA', match: 'old rock house', fallbackUrl: 'https://oldrockhouse.com/' },
      alias: /old rock house/i,
    },
    'Blueberry Hill Duck Room': {
      geo: [38.65594, -90.30497],
      area: 'town',
      capacity: 340,
      type: 'concert',
      cssVar: '--v-duckroom',
      color: '#86ea8e',
      url: 'https://blueberryhill.com/',
      icon: 'https://www.google.com/s2/favicons?domain=blueberryhill.com&sz=128',
      tm: { id: 'KovZpZAaatIA', match: 'duck room', fallbackUrl: 'https://blueberryhill.com/' },
      alias: /duck room|blueberry hill/i,
    },
    'Off Broadway': {
      geo: [38.59034, -90.21935],
      area: 'town',
      capacity: 400,
      type: 'concert',
      cssVar: '--v-offbway',
      color: '#ab86ea',
      url: 'https://www.offbroadwaystl.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.offbroadwaystl.com&sz=128',
      tm: { id: 'KovZpZAIdalA', match: 'off broadway', fallbackUrl: 'https://www.offbroadwaystl.com/' },
      alias: /^off broadway\b/i,
    },
    'The Hawthorn': {
      geo: [38.63518, -90.21157],
      area: 'town',
      capacity: 750,
      type: 'concert',
      cssVar: '--v-hawthorn',
      color: '#eac886',
      url: 'https://www.thehawthornstl.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.thehawthornstl.com&sz=128',
      tm: { id: 'KovZ917ARtS', match: 'hawthorn', fallbackUrl: 'https://www.thehawthornstl.com/' },
      alias: /the hawthorn\b/i,
    },
    'Red Flag': {
      geo: [38.63585, -90.22331],
      area: 'town',
      capacity: 800,
      type: 'concert',
      cssVar: '--v-redflag',
      color: '#86eae6',
      url: 'https://www.redflagstl.com/shows',
      icon: 'https://www.google.com/s2/favicons?domain=www.redflagstl.com&sz=128',
      tm: { id: 'KovZ917APxx', match: 'red flag', fallbackUrl: 'https://www.redflagstl.com/shows' },
      alias: /^red flag\b/i,
    },
    'River City Casino': {
      geo: [38.53549, -90.2658],
      area: 'town',
      capacity: 1600,
      type: 'concert',
      cssVar: '--v-rivercity',
      color: '#ea86d0',
      url: 'https://www.pennentertainment.com/river-city/entertainment',
      icon: 'https://www.google.com/s2/favicons?domain=www.pennentertainment.com&sz=128',
      tm: { id: 'KovZpZAJdFFA', match: 'river city casino', fallbackUrl: 'https://www.pennentertainment.com/river-city/entertainment' },
      alias: /river city casino/i,
    },
    'Family Arena': {
      geo: [38.74777, -90.50925],
      area: 'town',
      capacity: 11000,
      type: 'concert',
      cssVar: '--v-family',
      color: '#b3ea86',
      url: 'https://www.familyarena.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.familyarena.com&sz=128',
      tm: { id: 'KovZpZAIIEaA', match: 'family arena', fallbackUrl: 'https://www.familyarena.com/events', exclude: /parking/i },
      alias: /family arena/i,
    },
  };

  // The usual view: every room on — nothing here lists nightly bar programs
  var DEFAULT_ON = ['Enterprise Center', 'Busch Stadium', 'Energizer Park', "The Dome at America's Center", 'Chaifetz Arena', 'Fabulous Fox Theatre', 'Stifel Theatre', 'The Sheldon', 'The Pageant', 'Delmar Hall', 'The Factory', 'Hollywood Casino Amphitheatre', 'Chesterfield Amphitheater', 'Old Rock House', 'Blueberry Hill Duck Room', 'Off Broadway', 'The Hawthorn', 'Red Flag', 'River City Casino', 'Family Arena'];
  var DEFAULT_OFF = [];
  var PREFS_KNOWN_FROM = null; // no default-off venue yet, so nothing for saved prefs to be told about

  // Event types: every event lands in exactly one, from its flags, title,
  // then venue. The rows the panel shows, in order.
  var TYPES = [
    { key: 'concert', label: 'Concerts', title: 'Live music — arena tours to club nights' },
    { key: 'sports', label: 'Sports', title: 'Blues, Cardinals, CITY SC, Battlehawks and Billikens home games' },
    { key: 'arts', label: 'Arts & Theater', title: 'Broadway at the Fox, the Sheldon, comedy, dance' },
    { key: 'community', label: 'Community', title: 'Festivals, fairs, family days' },
  ];
  var MOVIE_VENUE = null; // no cinema here

  // Share codes (?f=CODE): REGISTRY is every filterable key in a fixed
  // order and a code is a bitmask over it, so the list is APPEND-ONLY —
  // adding an entry adds a bit and every existing code keeps meaning what
  // it meant; removing or reordering one changes every link out there.
  // 34 slots from the first build: seven base-36 digits.
  var CODE_LENGTH = 7;
  var REGISTRY = [
    ['venue', 'Enterprise Center'], ['venue', 'Busch Stadium'], ['venue', 'Energizer Park'], ['venue', "The Dome at America's Center"], ['venue', 'Chaifetz Arena'], ['venue', 'Fabulous Fox Theatre'], ['venue', 'Stifel Theatre'], ['venue', 'The Sheldon'], ['venue', 'The Pageant'], ['venue', 'Delmar Hall'], ['venue', 'The Factory'], ['venue', 'Hollywood Casino Amphitheatre'], ['venue', 'Chesterfield Amphitheater'], ['venue', 'Old Rock House'], ['venue', 'Blueberry Hill Duck Room'], ['venue', 'Off Broadway'], ['venue', 'The Hawthorn'], ['venue', 'Red Flag'], ['venue', 'River City Casino'], ['venue', 'Family Arena'],
    ['badge', 'concert'], ['badge', 'sports'], ['badge', 'arts'], ['badge', 'community'],
    ['team', 'blues'], ['team', 'cardinals'], ['team', 'citysc'], ['team', 'battlehawks'], ['team', 'billikens'], ['team', 'mizzou'],
    ['cap', 'stadium'], ['cap', 'arena'], ['cap', 'hall'], ['cap', 'room'],
  ];

  // The words the page uses for the place
  var WORDS = {
    teamCity: 'St. Louis', // the board drops it from the clubs' names ("St. Louis Blues" → Blues)
    presetDefault: 'Every venue — the arena, the ballpark, the Dome, the big theatres, the music venues and the county — every team and type',
    presetNeighborhood: 'Downtown and the stadiums only',
    presetBig: 'Only the places that hold 2,000 or more — the stadiums, the arenas and the big theatres',
    phrases: { all: 'Showing everything.', none: 'Showing nothing yet — open Filter and pick some venues.', neighborhood: 'Showing downtown and the stadiums only.', big: 'Showing the big venues only — the stadiums, the arenas and the big theatres.' },
  };

  global.LQACity = {
    key: 'stlouis',
    name: 'St. Louis',
    site: 'https://stlouis.here.events/',
    userAgent: 'Mozilla/5.0 (compatible; stlouis-events/1.0; +https://stlouis.here.events/)',
    tz: 'America/Chicago', tzName: 'Central', // the city's time zone: the ICS feed's TZID, the game clocks, the poster's footer
    state: "Missouri", stateOutline: 'M20.2 20.8L19.2 20.8L18.2 20.9L18.6 20.3L18.9 20.0L19.2 19.5L19.0 19.2L18.0 18.9L16.4 18.9L14.7 18.9L13.0 18.9L11.3 18.9L9.6 18.9L8.0 18.9L6.3 18.9L5.5 18.4L5.5 17.5L5.5 16.5L5.4 15.5L5.4 14.5L5.4 13.5L5.4 12.5L5.4 11.5L5.4 10.5L5.4 9.5L5.4 8.9L4.8 8.4L4.4 7.7L4.1 7.1L4.5 6.5L4.6 6.4L4.4 6.0L4.0 6.0L3.2 5.5L2.9 4.8L2.5 4.4L2.2 3.8L2.0 3.2L3.5 3.2L5.0 3.2L6.5 3.2L8.1 3.2L9.6 3.2L11.1 3.2L12.6 3.2L14.1 3.1L14.5 3.5L14.7 3.7L15.0 4.1L14.8 5.2L15.1 6.2L15.7 7.1L17.1 8.7L17.6 9.7L18.3 9.6L18.9 9.9L19.0 10.0L18.9 10.2L18.2 12.0L18.5 12.5L19.2 13.2L19.9 13.6L20.8 14.5L20.9 15.1L21.0 15.6L20.9 16.2L21.3 16.9L21.5 17.0L21.5 16.9L21.5 16.7L21.5 16.7L21.9 17.0L22.0 17.7L21.8 18.4L21.5 18.5L21.3 18.5L21.0 18.9L20.9 19.0L20.9 18.9L20.8 18.7L20.7 18.7L20.7 18.9L20.7 19.2L20.5 19.5L20.6 19.7L20.6 19.8L20.4 19.9L20.5 20.2L20.3 20.7Z', // the masthead's small state, linking to here.events (scripts/state-outline.mjs, Natural Earth 1:50m)
    // the calendar feed's header; the UID domain never changes (changing it
    // re-creates every event in subscribers' calendars)
    ics: { name: 'St. Louis Events', short: 'St. Louis Events', teams: 'St. Louis home teams — every season', prodid: '-//here.events//stlouis-events//EN', uidDomain: 'fosdal.net', // the UID domain the whole family issues (the shared ics test pins it)
      desc: 'Upcoming events around St. Louis\\, MO — Enterprise Center\\, Busch Stadium\\, Energizer Park\\, the Fox and the music rooms' },
    teams: TEAMS,
    map: { // the Map view (local-map.js; the ground drawn once by scripts/build-local-map.mjs from OpenStreetMap, committed as site/local-map.json) — every city gets one, Steve, 2026-10-26
      kind: 'urban',
      bbox: [38.504, -90.653, 38.78, -90.131], // south, west, north, east — every room, with a margin
      home: [38.617, -90.244, 38.647, -90.181], // the view at first: the city's own rooms; the fit button shows the whole frame
      roads: ['motorway', 'trunk', 'primary'],
      tolerance: 0.6,
      labels: [
        { name: 'St. Louis', lat: 38.627, lon: -90.199, anchor: 'middle' },
        { name: 'Maryland Heights', lat: 38.71505, lon: -90.436, anchor: 'middle' },
        { name: 'Chesterfield', lat: 38.65818, lon: -90.56806, anchor: 'middle' },
      ],
    },
    venues: VENUES,
    defaultOn: DEFAULT_ON,
    defaultOff: DEFAULT_OFF,
    prefsKnownFrom: PREFS_KNOWN_FROM,
    types: TYPES,
    movieVenue: MOVIE_VENUE,
    groundsVenue: null, // every listing is read by room, so nothing arrives under a name city.js lacks
    codeLength: CODE_LENGTH,
    registry: REGISTRY,
    words: WORDS,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
