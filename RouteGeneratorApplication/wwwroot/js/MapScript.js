let map; // Google Maps object
let startLocation = { lat: 53.428900, lng: -1.324000 }; // Initial map center
const RADIUS_EARTH = 6371000; // Earth radius in meters

function initMap() {
    // Initialize the Google Maps object
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: startLocation,
        mapId: "dd5c4669aa0f8a85"
    });

    // Create a custom content for the marker (text inside a div, similar to a label)
    const beachFlagImg = document.createElement("img");

    beachFlagImg.src =
        "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";
    const markerContent = document.createElement('div');
    markerContent.textContent = 'Start';
    markerContent.style.fontSize = '14px';  // You can customize the style here

    // Create a new AdvancedMarkerElement for better marker functionality
    const marker = new google.maps.marker.AdvancedMarkerElement({
        map: map,
        position: startLocation,
        content: beachFlagImg, // Use the custom content for the marker
        title: "A Marking using a custom PNG Image"
    });
}

// Generates a circular route based on the circumference in kilometers
function generateRandomRoute(circumferenceInKm) {
    const radius = (circumferenceInKm * 1000) / (2 * Math.PI); // Convert circumference to radius
    const waypoints = generateCircularWaypoints(startLocation, radius);

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
        travelMode: google.maps.TravelMode.WALKING
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
function generateCircularWaypoints(center, radius) {
    const waypoints = [];
    const numPoints = 8; // Number of waypoints (8 for an octagon)
    const generatedMaps = 1;

    for (let x = 0; x < generatedMaps; x++) {
        
        let startAngle = Math.random(0,360) * 100;
        //let startAngle = (x * 360) / numPoints;
        let startPoint = calculateWaypoint(center, radius, startAngle);
        for (let i = 0; i < numPoints; i++) {
            const angle = (i * 360) / numPoints;
            const waypoin0t = calculateWaypoint(startPoint, radius, angle);
            waypoints.push(waypoint);
        }
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