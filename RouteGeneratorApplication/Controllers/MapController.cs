using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Text.Json;

namespace RouteGeneratorApplication.Controllers
{
    public class MapController : Controller
    {
        private readonly ILogger<MapController> _logger;

        public MapController(ILogger<MapController> logger)
        {
            _logger = logger;
        }

        /* For Ajax Method */

        public class MyPostData
        {
            public string Name { get; set; }
        }

        [HttpPost]
        public IActionResult PostAjax([FromBody] MyPostData data)
        {
            // Perform server-side logic with the received name
            Console.WriteLine($"Name received: {data.Name}");

            // Redirect to the Index action
            return RedirectToAction("Index");
        }

        [HttpPost]
        public IActionResult GenerateRoute([FromBody] List<LatLng> waypoints)
        {
            // Implement route generation logic here
            // This could involve calling an external routing service API

            //var route = GenerateRouteFromWaypoints(waypoints);
            var route = GetRouteFromExternalService(waypoints);
            return View();
        }

        private List<LatLng> GenerateRouteFromWaypoints(List<LatLng> waypoints)
        {
            // Mock route for demonstration purposes
            return waypoints;
        }

        [HttpPost]
        public IActionResult Post(string name)
        {
            // Perform server-side logic with the received name
            Console.WriteLine($"Name received: {name}");

            // Redirect to the Index action
            return RedirectToAction("Index");
        }

        public IActionResult Index()
        {
            return View();
        }

        private async Task<List<LatLng>> GetRouteFromExternalService(List<LatLng> waypoints)
        {
            using (var httpClient = new HttpClient())
            {
                var response = await httpClient.PostAsJsonAsync("https://external-routing-service/api/getRoute", waypoints);
                response.EnsureSuccessStatusCode();

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var route = JsonSerializer.Deserialize<List<LatLng>>(jsonResponse);

                return route;
            }
        }
    }

    public class LatLng
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
    }

}
