let map; // Google Maps object
let startLocation = { lat: 53.428900, lng: -1.324000 }; // Initial map center
const RADIUS_EARTH = 6371000; // Earth radius in meters
let hotspots = []; // Array to store hotspot locations
let markers = []; // Array to store all markers
let directionsRenderer; // Global variable to store the DirectionsRenderer
let distanceInfoWindow; // Info window to display total distance on the map

function initMap() {
    // Initialise Google Maps
    map = new google.maps.Map(document.getElementById('map'), {
        mapId: "dd5c4669aa0f8a85",
        zoom: 14,
        center: startLocation,
    });

    // Initialise a marker for the starting point
    const markerContent = document.createElement('div');
    markerContent.textContent = 'Start';
    markerContent.style.fontSize = '14px';

    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: startLocation,
        map: map,
        content: markerContent
    });

    markers.push(marker); // Track the marker

    // Allow users to add hotspots by clicking on the map
    map.addListener('click', function (e) {
        addHotspot(e.latLng);
    });

    // Initialise the DirectionsRenderer
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Initialise the InfoWindow to display the total distance
    distanceInfoWindow = new google.maps.InfoWindow();
}

// Add a hotspot when the user clicks on the map
function addHotspot(location) {
    hotspots.push(location);

    const markerContent = document.createElement('div');
    markerContent.textContent = 'Hotspot';
    markerContent.style.fontSize = '14px';
    markerContent.style.color = 'red'; // Set hotspot markers to red

    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: map,
        content: markerContent
    });

    markers.push(marker); // Track the marker
}

// Generates a circular route and adjusts based on nearby hotspots
function generateRandomRoute(circumferenceInKm) {
    //const radius = (circumferenceInKm * 1000) / 2; // Calculate radius from diameter
    const radius = (circumferenceInKm * 1000) / (2 * Math.PI); // Calculate radius from circumference
    const waypoints = generateCircularWaypoints(startLocation, radius);

    const directionsService = new google.maps.DirectionsService();

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

            // Placing custom markers and showing total distance
            placeCustomMarkers(result); // Place custom markers for origin, destination, and waypoints
            showTotalDistance(result);  // Show the total distance of the route
        } else {
            console.error('Directions request failed due to ' + status);
        }
    });
}

// Display the total distance of the route in the HTML or on the map
function showTotalDistance(result) {
    let totalDistance = 0;
    const legs = result.routes[0].legs;

    // Calculate total distance by summing the distance of each leg
    legs.forEach(leg => {
        totalDistance += leg.distance.value; // distance in meters
    });

    totalDistance = (totalDistance / 1000).toFixed(2); // Convert meters to kilometers and round to 2 decimal places

    // Update the HTML element with the total distance
    document.getElementById('totalDistance').innerHTML = `Total Distance: ${totalDistance} km`;

    // Optionally, show distance on the map using an info window
    distanceInfoWindow.setContent(`Total Distance: ${totalDistance} km`);
    distanceInfoWindow.setPosition(startLocation);
    distanceInfoWindow.open(map);
}

// Place custom markers for origin, destination, and waypoints
function placeCustomMarkers(result) {
    const route = result.routes[0];
    const leg = route.legs[0];

    // Create custom marker for the origin
    const originMarkerContent = document.createElement('div');
    originMarkerContent.innerHTML = '<div class="custom-marker">A</div>'; // Custom HTML content

    const originMarker = new google.maps.marker.AdvancedMarkerElement({
        position: leg.start_location,
        map: map,
        content: originMarkerContent
    });
    markers.push(originMarker); // Track the marker

    // Create custom marker for the destination
    const destinationMarkerContent = document.createElement('div');
    destinationMarkerContent.innerHTML = '<div class="custom-marker">B</div>';

    const destinationMarker = new google.maps.marker.AdvancedMarkerElement({
        position: leg.end_location,
        map: map,
        content: destinationMarkerContent
    });
    markers.push(destinationMarker); // Track the marker

    // Create custom markers for each waypoint
    route.waypoint_order.forEach((waypointIndex) => {
        const waypoint = leg.via_waypoints[waypointIndex];
        const waypointMarkerContent = document.createElement('div');
        waypointMarkerContent.innerHTML = `<div class="custom-marker">${String.fromCharCode(67 + waypointIndex)}</div>`; // C, D, E, etc.

        const waypointMarker = new google.maps.marker.AdvancedMarkerElement({
            position: waypoint,
            map: map,
            content: waypointMarkerContent
        });
        markers.push(waypointMarker); // Track the marker
    });
}

// Generate circular waypoints adjusted by nearby hotspots
function generateCircularWaypoints(center, radius) {
    const waypoints = [];
    const numPoints = 8; // Number of waypoints for the circle
    const influenceRadius = 1000; // Hotspot influence radius (in meters)

    let startingAngle = Math.floor(Math.random() * 360) + 1;

    center = calculateWaypoint(center, radius, startingAngle);

    for (let i = 0; i < numPoints; i++) {
        let waypoint;
        let markerContent = document.createElement('div');
        markerContent.style.fontSize = '14px';

        if (i == 0) {
            waypoint = calculateWaypoint(center, radius, startingAngle);
        } else {
            const incriment = (i * 360) / numPoints; // Divide the circle into equal parts
            if (startingAngle > 360) { startingAngle -= (360 + incriment); }
            else { startingAngle += incriment }
            waypoint = calculateWaypoint(center, radius, startingAngle);

            // Find the closest hotspot to the current waypoint
            let closestHotspot = findClosestHotspot(waypoint);

            // Adjust the waypoint if it is within the influence radius of a hotspot
            if (closestHotspot) {
                const distanceToHotspot = calculateDistance(waypoint, closestHotspot);
                if (distanceToHotspot < influenceRadius) {
                    waypoint = adjustWaypointTowardsHotspot(waypoint, closestHotspot, distanceToHotspot, influenceRadius);

                    // Visual indicator: Hotspot-influenced waypoints in green
                    markerContent.textContent = 'Influenced Waypoint';
                    markerContent.style.color = 'green';
                } else {
                    // Standard waypoint (not influenced)
                    markerContent.textContent = 'Waypoint';
                    markerContent.style.color = 'blue';
                }
            }
        }

        // Create markers for waypoints and track them
        const marker = new google.maps.marker.AdvancedMarkerElement({
            position: waypoint,
            map: map,
            content: markerContent
        });

        markers.push(marker); // Track the marker
        waypoints.push(waypoint);
    }

    return waypoints;
}

// Find the closest hotspot to a given waypoint
function findClosestHotspot(waypoint) {
    if (hotspots.length === 0) return null;

    let closestHotspot = null;
    let minDistance = Infinity;

    hotspots.forEach(hotspot => {
        const distance = calculateDistance(waypoint, hotspot);
        if (distance < minDistance) {
            minDistance = distance;
            closestHotspot = hotspot;
        }
    });

    return closestHotspot;
}

// Adjust the waypoint to move it halfway towards the closest hotspot
function adjustWaypointTowardsHotspot(waypoint, hotspot, distanceToHotspot, influenceRadius) {
    const factor = 0.5; // Move the waypoint halfway to the hotspot
    const latDelta = (hotspot.lat() - waypoint.lat) * factor;
    const lngDelta = (hotspot.lng() - waypoint.lng) * factor;

    return {
        lat: waypoint.lat + latDelta,
        lng: waypoint.lng + lngDelta
    };
}

// Calculates waypoint coordinates based on center, radius, and angle
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

// Calculates the distance between two points in meters
function calculateDistance(point1, point2) {
    const lat1 = degreesToRadians(point1.lat);
    const lng1 = degreesToRadians(point1.lng);
    const lat2 = degreesToRadians(point2.lat());
    const lng2 = degreesToRadians(point2.lng());

    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return RADIUS_EARTH * c; // Distance in meters
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

// Remove all markers from the map
function removeAllMarkers() {
    // Remove all manually added markers
    markers.forEach(marker => {
        marker.map = null; // Remove the marker from the map
    });
    markers = []; // Clear the marker array

    // Clear the route and its waypoint markers (A, B, C, D markers)
    directionsRenderer.setDirections({ routes: [] });
}