var MainMenu = [
	{href: 'index.html', title: locale.menuOverview},
	{href: 'javascript:void(0)', title: locale.menuMap, smclass: 'map', submenu: [
		{href: 'current-position.html', title: locale.menuCurrentLocation},
		{href: 'routes.html', title: locale.menuRoutes},
		{href: 'geo-objects.html', title: locale.menuGeoObjects},
		{href: 'search.html', title: locale.menuSearch}
	]},
	{href: 'javascript:void(0)', title: locale.menuPlanning, smclass: 'planning', submenu: [
		{href: 'calendar.html', title: locale.menuCalendar},
		{href: 'routes-points.html', title: locale.menuRoutesPoints}
	]},
	{href: 'javascript:void(0)', title: locale.menuReports, smclass: 'reports'},
	{href: 'notifications.html', title: locale.menuNotifications},
	{href: 'javascript:void(0)', title: locale.menuAdministration, smclass: 'admin', submenu: [
		{href: 'users.html', title: locale.menuUsers},
		{href: 'admin-mapobjects.html', title: locale.menuObjects},
		{href: 'admin-geoobjects.html', title: locale.menuGeoObjects}
	]}
];