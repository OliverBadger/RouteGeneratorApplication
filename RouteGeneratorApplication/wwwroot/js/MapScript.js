let map;
const markers = [];
let startLocation = null;

// Initialize the map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: 37.7749, lng: -122.4194 }  // Example: San Francisco
    });

    map.addListener('click', function (event) {
        handleMapClick(event.latLng);
    });
}

function handleMapClick(location) {
    if (startLocation === null) {
        // Set the starting location on the first click
        startLocation = location;
        addMarker(location, 'Start');
    } else {
        // Add waypoints on subsequent clicks
        addMarker(location, 'Waypoint');
    }
}

function addMarker(location, label) {
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        label: label
    });
    markers.push(marker);
}

function drawRoute() {
    if (!startLocation || markers.length < 2) {
        alert('Please set the start location and at least one waypoint.');
        return;
    }

    // Add the starting point as the final destination to close the loop
    const waypts = markers.slice(1).map(marker => ({
        location: marker.getPosition(),
        stopover: true
    }));

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    const request = {
        origin: startLocation,
        destination: startLocation, // End at the starting point
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function (result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
        } else {
            console.error('Directions request failed due to ' + status);
        }
    });
}

function resetMap() {
    // Clear all markers and routes
    markers.forEach(marker => marker.setMap(null));
    markers.length = 0; // Clear the markers array
    startLocation = null; // Reset the start location
    map.setCenter({ lat: 37.7749, lng: -122.4194 });  // Reset to default center
    map.setZoom(6);  // Reset zoom level
}