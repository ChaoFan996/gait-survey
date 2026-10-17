# Visitor map

The site owner supplied the MapMyVisitors embed on 2026-10-17. The public widget identifier is configured in `visitor-map.js`; no account password or API secret is stored in the repository.

The map occupies the right side of the header, opposite the logo. The provider supplies live data and map interactions. Its public details open in a separate tab. Counts begin when the widget is activated; no historical traffic is imported. The widget currently shows recent visits and its reporting dates, rather than a promised lifetime total. Hover labels report visits for marked regions; unmarked map areas have no tooltip. Locations are approximate, and visits should not be described as distinct readers or people. The provider receives visitor requests to compute these statistics.

The loader is asynchronous and independent of the research library. It runs only on `chaofan996.github.io` under `/gait-survey/`, excluding local previews and forks. If the provider script fails to load, the panel is hidden. A blocked or unavailable third-party service may prevent statistics from appearing.

To change providers or widget accounts, obtain the new site-specific code from the owner and replace the public identifier. Keep the production-host guard, provider attribution, and a visible explanation of approximate counts. To disable the map, remove the `visitor-map.js` script element from `index.html`; the panel is hidden by default.
