let map;
const markers = [];

// Initialize the map when the page loads
function initMap() {
    // Initialize the map centered at a starting point
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: { lat: 37.7749, lng: -122.4194 }  // Example: San Francisco
    });

    // Define the start and end points
    const start = { lat: 34.0522, lng: -118.2437 }; // Example: Los Angeles
    const end = { lat: 36.1699, lng: -115.1398 };   // Example: Las Vegas

    // Define waypoints
    const waypts = [
        {
            location: { lat: 35.2828, lng: -120.6596 }, // Example: San Luis Obispo
            stopover: true
        },
        {
            location: { lat: 34.9530, lng: -120.4357 }, // Example: Santa Maria
            stopover: true
        }
    ];

    // Create a DirectionsService and DirectionsRenderer
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Set up the request for directions
    const request = {
        origin: start,
        destination: end,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
    };

    // Request directions and display the route
    directionsService.route(request, function (result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
        } else {
            console.error('Directions request failed due to ' + status);
        }
    });

    // Add click event listener to the map
    map.addListener('click', function (event) {
        addMarker(event.latLng);
    });
}

// Add a marker at a given location
function addMarker(location) {
    const marker = new google.maps.Marker({
        position: location,
        map: map
    });
    markers.push(marker);
}

// Get waypoints from markers
function getWaypoints() {
    return markers.map(marker => ({
        lat: marker.getPosition().lat(),
        lng: marker.getPosition().lng()
    }));
}

// Send waypoints to the server
function sendWaypoints() {
    fetch('/Route/GenerateRoute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(getWaypoints())
    })
        .then(response => response.json())
        .then(route => {
            drawRoute(route);
        });
}

// Draw route on the map
function drawRoute(route) {
    const path = route.map(point => ({ lat: point.lat, lng: point.lng }));
    new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    }).setMap(map);
}