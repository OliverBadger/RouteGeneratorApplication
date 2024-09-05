let map;
let startLocation = { lat: 37.7749, lng: -122.4194 }; // San Francisco as an example

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: startLocation,
    });

    // Add a marker for the start location
    new google.maps.Marker({
        position: startLocation,
        map: map,
        label: 'Start'
    });
}

// Function to generate the route by calling the C# method via AJAX
function generateRoute() {
    const distanceInKm = 10; // Example distance

    // AJAX call to fetch waypoints from the server
    $.post('/Map/GenerateRandomRoute', { lat: startLocation.lat, lng: startLocation.lng, distanceInKm: distanceInKm }, function (waypoints) {
        drawRoute(waypoints);
    });
}

// Function to draw the circular route on the map
function drawRoute(waypoints) {
    const path = waypoints.map(function (wp) {
        return { lat: wp.Latitude, lng: wp.Longitude };
    });

    // Draw the polyline for the route
    const routePath = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    routePath.setMap(map);

    // Optionally, add markers for each waypoint
    path.forEach(function (point) {
        new google.maps.Marker({
            position: point,
            map: map,
            title: 'Waypoint'
        });
    });
}