using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

public class MapController : Controller
{
    private const double RADIUS_EARTH = 6371000; // Earth's radius in meters

    // GET: Map
    public IActionResult Index()
    {
        return View();
    }

    // POST: Generate route based on user input distance
    [HttpPost]
    public IActionResult GenerateRandomRoute(double distanceInKm, double lat = 37.7749, double lng = -122.4194)
    {
        var startLocation = new Location(lat, lng);
        var waypoints = GenerateCircularWaypoints(startLocation, distanceInKm);

        ViewBag.DistanceInKm = distanceInKm; // Pass the distance back to the view
        ViewBag.Waypoints = waypoints;       // Pass the waypoints to the view to display

        return View("Index"); // Return to the Index view
    }

    // Method to generate circular waypoints based on distance
    private List<Location> GenerateCircularWaypoints(Location center, double distanceInKm)
    {
        var waypoints = new List<Location>();
        int numPoints = 8; // Number of points for the circle

        // Calculate the radius of the circle based on the distance
        double radius = (distanceInKm * 1000) / (2 * Math.PI);

        // Create waypoints in a circular pattern
        for (int i = 0; i < numPoints; i++)
        {
            double angle = (i * 360) / numPoints;
            var waypoint = CalculateWaypoint(center, radius, angle);
            waypoints.Add(waypoint);
        }

        // Close the loop by adding the first waypoint as the last one
        waypoints.Add(waypoints[0]);

        return waypoints;
    }

    // Calculate each waypoint's location
    private Location CalculateWaypoint(Location center, double radius, double angle)
    {
        double latRadians = DegreesToRadians(center.Latitude);
        double lngRadians = DegreesToRadians(center.Longitude);

        double bearing = DegreesToRadians(angle);

        // Calculate new latitude and longitude
        double newLat = Math.Asin(Math.Sin(latRadians) * Math.Cos(radius / RADIUS_EARTH) +
                    Math.Cos(latRadians) * Math.Sin(radius / RADIUS_EARTH) * Math.Cos(bearing));

        double newLng = lngRadians + Math.Atan2(Math.Sin(bearing) * Math.Sin(radius / RADIUS_EARTH) * Math.Cos(latRadians),
                                Math.Cos(radius / RADIUS_EARTH) - Math.Sin(latRadians) * Math.Sin(newLat));

        return new Location(RadiansToDegrees(newLat), RadiansToDegrees(newLng));
    }

    private double DegreesToRadians(double degrees)
    {
        return degrees * (Math.PI / 180);
    }

    private double RadiansToDegrees(double radians)
    {
        return radians * (180 / Math.PI);
    }
}

// Helper class to represent latitude and longitude coordinates
public class Location
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public Location(double latitude, double longitude)
    {
        Latitude = latitude;
        Longitude = longitude;
    }
}