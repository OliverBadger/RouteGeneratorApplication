// Declare a variable to hold the Google Maps object
let map;

// Set the starting location for the map (San Francisco in this case)
let startLocation = { lat: 37.7749, lng: -122.4194 }; // Example: San Francisco

// Radius of the Earth in meters, used for calculations
const RADIUS_EARTH = 6371000; // Radius of Earth in meters

// Function to initialize the map
function initMap() {
    // Create a new Google Maps object and set its properties
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14, // Zoom level (14 is quite zoomed in)
        center: startLocation, // Center the map on the starting location
    });

    // Create a new marker and add it to the map
    const marker = new google.maps.Marker({
        position: startLocation, // Position of the marker
        map: map, // Map to place the marker on
        label: 'Start' // Label for the marker
    });
}

// Function to generate a circular route based on a given distance
function generateRandomRoute(distanceInKm) {
    // Generate waypoints in a circular pattern around the start location
    const waypoints = generateCircularWaypoints(startLocation, distanceInKm);

    // Create a DirectionsService object to request directions
    const directionsService = new google.maps.DirectionsService();

    // Create a DirectionsRenderer object to display the directions on the map
    const directionsRenderer = new google.maps.DirectionsRenderer();

    // Link the directionsRenderer to the map
    directionsRenderer.setMap(map);

    // Define the request object for the directions
    const request = {
        origin: startLocation, // Start location
        destination: startLocation, // End location (same as start to form a loop)
        waypoints: waypoints.map(waypoint => ({
            location: waypoint, // Each waypoint location
            stopover: true // Set stopover to true to include this waypoint in the route
        })),
        optimizeWaypoints: false, // Do not optimize the route
        travelMode: google.maps.TravelMode.DRIVING // Mode of travel (driving)
    };

    // Send the request to the DirectionsService
    directionsService.route(request, function (result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            // If the request is successful, set the directions on the map
            directionsRenderer.setDirections(result);
        } else {
            // If the request fails, log the error
            console.error('Directions request failed due to ' + status);
        }
    });
}

// Function to generate waypoints for a circular path
function generateCircularWaypoints(center, distanceInKm) {
    // Array to hold the generated waypoints
    const waypoints = [];

    // Number of points to generate (8 points for an octagon)
    const numPoints = 8;

    // Calculate the radius of the circle in meters
    const radius = (distanceInKm * 1000) / 2 / Math.PI; // Convert distance to meters and calculate radius

    // Loop through the number of points and calculate each waypoint
    for (let i = 0; i < numPoints; i++) {
        // Calculate the angle for each point
        const angle = (i * 360) / numPoints; // Divide the circle into equal parts

        // Calculate the coordinates for the waypoint at the given angle
        const waypoint = calculateWaypoint(center, radius, angle);

        // Add the calculated waypoint to the array
        waypoints.push(waypoint);
    }

    // Return the array of waypoints
    return waypoints;
}

// Function to calculate the latitude and longitude of a waypoint given the center, radius, and angle
function calculateWaypoint(center, radius, angle) {
    // Convert latitude and longitude of the center to radians
    const latRadians = degreesToRadians(center.lat);
    const lngRadians = degreesToRadians(center.lng);

    // Convert the angle to radians
    const bearing = degreesToRadians(angle);

    // Calculate the latitude of the waypoint
    const lat = Math.asin(Math.sin(latRadians) * Math.cos(radius / RADIUS_EARTH) +
        Math.cos(latRadians) * Math.sin(radius / RADIUS_EARTH) * Math.cos(bearing));

    // Calculate the longitude of the waypoint
    const lng = lngRadians + Math.atan2(Math.sin(bearing) * Math.sin(radius / RADIUS_EARTH) * Math.cos(latRadians),
        Math.cos(radius / RADIUS_EARTH) - Math.sin(latRadians) * Math.sin(lat));

    // Return the waypoint coordinates in degrees
    return {
        lat: radiansToDegrees(lat),
        lng: radiansToDegrees(lng)
    };
}

// Function to convert degrees to radians
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180); // Multiply degrees by the factor to convert to radians
}

// Function to convert radians to degrees
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI); // Multiply radians by the factor to convert to degrees
}