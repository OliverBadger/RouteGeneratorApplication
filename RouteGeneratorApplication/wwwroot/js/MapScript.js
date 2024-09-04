let map;
let startLocation = { lat: 37.7749, lng: -122.4194 }; // Example: San Francisco
const RADIUS_EARTH = 6371000; // Radius of Earth in meters

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

function generateRandomRoute(distanceInKm) {
    const waypoints = generateCircularWaypoints(startLocation, distanceInKm);

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    const request = {
        origin: startLocation,
        destination: startLocation, // End at the start point to complete the circle
        waypoints: waypoints.map(waypoint => ({
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

function generateCircularWaypoints(center, distanceInKm) {
    const waypoints = [];
    const numPoints = 8; // Number of points to generate for the circle (8 points for an octagon)
    const radius = (distanceInKm * 1000) / 2 / Math.PI; // Convert distance to meters and calculate radius

    for (let i = 0; i < numPoints; i++) {
        const angle = (i * 360) / numPoints; // Divide circle into equal parts
        const waypoint = calculateWaypoint(center, radius, angle);
        waypoints.push(waypoint);
    }

    return waypoints;
}

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
    return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}