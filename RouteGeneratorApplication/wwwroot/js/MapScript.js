let map; // Google Maps object

let startLocation = { lat: 37.7749, lng: -122.4194 }; // Initial map center (San Francisco)

const RADIUS_EARTH = 6371000; // Earth radius in meters

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: startLocation,
    });

    const marker = new google.maps.Marker({
        position: startLocation,
        map: map,
        label: 'Start'
    });
}

// Generates a circular route based on a diameter
function generateRandomRoute(diameterInKm) {
    const radius = (diameterInKm * 1000) / 2;
    const startAngle = Math.random() * 360;
    let newStartLocation = calculateWaypoint(startLocation, radius, startAngle);
    startLocation = newStartLocation;

    const waypoints = generateCircularWaypoints(startLocation, diameterInKm);

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    const request = {
        origin: waypoints[0],
        destination: waypoints[0],
        waypoints: waypoints.slice(1).map(waypoint => ({
            location: waypoint,
            stopover: true
        })),
        optimizeWaypoints: false,
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

// Generates waypoints in a circular pattern
function generateCircularWaypoints(center, diameterInKm) {
    const waypoints = [];
    const radius = (diameterInKm * 1000) / 2;
    const numPoints = 8;
    const startAngle = Math.random() * 360;
    const startPoint = calculateWaypoint(center, radius, startAngle);

    for (let i = 0; i < numPoints; i++) {
        const angle = (i * 360) / numPoints;
        const waypoint = calculateWaypoint(startPoint, radius, angle);
        waypoints.push(waypoint);
    }

    return waypoints;
}

// Calculates waypoint coordinates
function calculateWaypoint(center, radius, angle) {
    const latRadians = degreesToRadians(center.lat);
    const lngRadians = degreesToRadians(center.lng);
    const bearing = degreesToRadians(angle);

    const lat = Math.asin(Math.sin(latRadians) * Math.cos(radius / RADIUS_EARTH) +
        Math.cos(latRadians) * Math.sin(radius / RADIUS_EARTH) * Math.cos(bearing));

    const lng = lngRadians + Math.atan2(Math.sin(bearing) * Math.sin(radius / RADIUS_EARTH) * Math.cos(latRadians),
        Math.cos(radius / RADIUS_EARTH) - Math.sin(latRadians) * Math.sin(lat));

    return {
        lat: radiansToDegrees(lat),
        lng: radiansToDegrees(lng)
    };
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180); // Converts degrees to radians
}

function radiansToDegrees(radians) {
    return radians * (180 / Math.PI); // Converts radians to degrees
}