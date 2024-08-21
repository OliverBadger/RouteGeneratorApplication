var map;
var markers = [];

// Initialize the map when the page loads
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 53.428455, lng: -1.32386 },
        zoom: 15
    });

    map.addListener('click', function (event) {
        addMarker(event.latLng);
    });
}

function addMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    markers.push(marker);
}

function getWaypoints() {
    return markers.map(marker => ({
        lat: marker.getPosition().lat(),
        lng: marker.getPosition().lng()
    }));
}

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