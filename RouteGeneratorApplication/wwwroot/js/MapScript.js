// Declare a variable to hold the Google Maps object
let map; // This will hold the instance of the Google Maps object.


// Set the starting location for the map (San Francisco in this case)
let startLocation = { lat: 37.7749, lng: -122.4194 }; // Example coordinates: San Francisco. Used as the initial center for the map.

// Radius of the Earth in meters, used for calculations
const RADIUS_EARTH = 6371000; // Radius of the Earth in meters. This is required for calculating distances on the Earth's surface.

// Function to initialize the map
function initMap() {
    // Create a new Google Maps object and set its properties
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14, // Zoom level for the map (14 is a medium-zoomed-in view).
        center: startLocation, // Center the map on the `startLocation` coordinates.
    });

    // Create a new marker and add it to the map
    const marker = new google.maps.Marker({
        position: startLocation, // Set the marker at the `startLocation`.
        map: map, // Attach the marker to the initialized Google map object.
        label: 'Start' // Add a label "Start" to the marker for clarity.
    });
}

// Function to generate a circular route based on a given distance
function generateRandomRoute(diameterInKm) {

    // Calculate the radius of the circle in meters
    const radius = (diameterInKm * 1000) / 2;
    // Convert the diameter from kilometers to meters and divide by 2 to get the radius of the circle.

    //Makes a new starting location so the original appears on the diametre 
    const startAngle = Math.random() * 360;
    let newStartLocation = calculateWaypoint(startLocation, radius, startAngle);
    startLocation = newStartLocation;


    // Generate waypoints in a circular pattern around the start location
    const waypoints = generateCircularWaypoints(startLocation, diameterInKm);
    // Generates waypoints that form a circular path around the start location based on the provided diameter.

    // Create a DirectionsService object to request directions
    const directionsService = new google.maps.DirectionsService();
    // Google Maps API's `DirectionsService` is used to calculate routes between different waypoints.

    // Create a DirectionsRenderer object to display the directions on the map
    const directionsRenderer = new google.maps.DirectionsRenderer();
    // DirectionsRenderer is used to visually display the route on the map.

    // Link the directionsRenderer to the map
    directionsRenderer.setMap(map);
    // Attach the DirectionsRenderer to the initialized map so that it can display the route on it.

    // Define the request object for the directions
    const request = {
        origin: waypoints[0], // Start the route at the first waypoint (which forms part of the circular route).
        destination: waypoints[0], // End the route back at the first waypoint, forming a loop.
        waypoints: waypoints.slice(1).map(waypoint => ({
            location: waypoint, // Set each of the remaining waypoints as intermediate stops on the route.
            stopover: true // Treat each waypoint as a stop along the way (required by the API to create a proper route).
        })),
        optimizeWaypoints: false, // Do not optimize the waypoint order, maintain the circular pattern.
        travelMode: google.maps.TravelMode.DRIVING // Specify the mode of travel (in this case, driving).
    };

    // Send the request to the DirectionsService
    directionsService.route(request, function (result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            // If the request is successful, set the directions on the map
            directionsRenderer.setDirections(result);
            // Display the generated directions on the map using the `DirectionsRenderer`.
        } else {
            // If the request fails, log the error
            console.error('Directions request failed due to ' + status);
            // Log an error message if the route calculation fails for some reason.
        }
    });
}

// Function to generate waypoints for a circular path
function generateCircularWaypoints(center, diameterInKm) {
    // Array to hold the generated waypoints
    const waypoints = [];
    // Create an empty array that will be populated with calculated waypoints.

    // Calculate the radius of the circle in meters
    const radius = (diameterInKm * 1000) / 2;
    // Convert the diameter from kilometers to meters and divide by 2 to get the radius of the circle.

    // Number of points to generate (8 points for an octagon)
    const numPoints = 8;
    // Define how many waypoints to create (in this case, 8 points which form an octagon).

    // Calculate a random angle for the starting location
    const startAngle = Math.random() * 360;
    // Generate a random starting angle between 0 and 360 degrees, determining where the circle starts.

    // Calculate the new starting point on the diameter
    const startPoint = calculateWaypoint(center, radius, startAngle);
    // Use the `calculateWaypoint` function to get the coordinates of the first point on the circle at the random angle.

    // Loop through the number of points and calculate each waypoint
    for (let i = 0; i < numPoints; i++) {
        // Calculate the angle for each point
        const angle = (i * 360) / numPoints;
        // Divide the circle evenly into `numPoints` by calculating the angle between each point.

        // Calculate the coordinates for the waypoint at the given angle
        const waypoint = calculateWaypoint(startPoint, radius, angle);
        // Calculate the actual coordinates of the waypoint based on the calculated angle.

        // Add the calculated waypoint to the array
        waypoints.push(waypoint);
        // Store the calculated waypoint in the array.
    }

    // Return the array of waypoints
    return waypoints;
    // Return the array of calculated waypoints, which can be used to form the route.
}

// Function to calculate the latitude and longitude of a waypoint given the center, radius, and angle
function calculateWaypoint(center, radius, angle) {
    // Convert latitude and longitude of the center to radians
    const latRadians = degreesToRadians(center.lat);
    // Convert the latitude of the center to radians (trigonometric functions work in radians).

    const lngRadians = degreesToRadians(center.lng);
    // Convert the longitude of the center to radians.

    // Convert the angle to radians
    const bearing = degreesToRadians(angle);
    // Convert the angle (bearing) to radians.

    // Calculate the latitude of the waypoint
    const lat = Math.asin(Math.sin(latRadians) * Math.cos(radius / RADIUS_EARTH) +
        Math.cos(latRadians) * Math.sin(radius / RADIUS_EARTH) * Math.cos(bearing));
    // Using spherical trigonometry, calculate the latitude of the waypoint.

    // Calculate the longitude of the waypoint
    const lng = lngRadians + Math.atan2(Math.sin(bearing) * Math.sin(radius / RADIUS_EARTH) * Math.cos(latRadians),
        Math.cos(radius / RADIUS_EARTH) - Math.sin(latRadians) * Math.sin(lat));
    // Similarly, calculate the longitude of the waypoint using spherical trigonometry.

    // Return the waypoint coordinates in degrees
    return {
        lat: radiansToDegrees(lat), // Convert the calculated latitude back to degrees.
        lng: radiansToDegrees(lng) // Convert the calculated longitude back to degrees.
    };
}

// Function to convert degrees to radians
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
    // Conversion formula: multiply the degree value by π/180 to get radians.
}

// Function to convert radians to degrees
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
    // Conversion formula: multiply the radian value by 180/π to get degrees.
}