﻿let map; // Google Maps object
let startLocation = { lat: 53.428900, lng: -1.324000 }; // Initial map center
const RADIUS_EARTH = 6371000; // Earth radius in meters
let hotspots = []; // Array to store hotspot locations

function initMap() {
    // Initialize Google Maps
    map = new google.maps.Map(document.getElementById('map'), {
        mapId: "dd5c4669aa0f8a85",
        zoom: 14,
        center: startLocation,
    });

    // Initialize a marker for the starting point
    const markerContent = document.createElement('div');
    markerContent.textContent = 'Start';
    markerContent.style.fontSize = '14px';

    const marker = new google.maps.marker.AdvancedMarkerElement({
        position: startLocation,
        map: map,
        content: markerContent
    });

    // Allow users to add hotspots by clicking on the map
    map.addListener('click', function (e) {
        addHotspot(e.latLng);
    });
}

// Add a hotspot when the user clicks on the map
function addHotspot(location) {
    hotspots.push(location);

    const markerContent = document.createElement('div');
    markerContent.textContent = 'Hotspot';
    markerContent.style.fontSize = '14px';

    new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: map,
        content: markerContent
    });
}

// Generates a circular route and adjusts based on nearby hotspots
function generateRandomRoute(circumferenceInKm) {
    const radius = (circumferenceInKm * 1000) / (2 * Math.PI);
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

// Generate circular waypoints adjusted by nearby hotspots
function generateCircularWaypoints(center, radius) {
    const waypoints = [];
    const numPoints = 8; // Number of waypoints for the circle
    const influenceRadius = 1000; // Hotspot influence radius (in meters)

    for (let i = 0; i < numPoints; i++) {
        const angle = (i * 360) / numPoints; // Divide the circle into equal parts
        let waypoint = calculateWaypoint(center, radius, angle);

        // Find the closest hotspot to the current waypoint
        let closestHotspot = findClosestHotspot(waypoint);

        // Adjust the waypoint if it is within the influence radius of a hotspot
        if (closestHotspot) {
            const distanceToHotspot = calculateDistance(waypoint, closestHotspot);
            if (distanceToHotspot < influenceRadius) {
                waypoint = adjustWaypointTowardsHotspot(waypoint, closestHotspot, distanceToHotspot, influenceRadius);
            }
        }

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