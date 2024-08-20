using Microsoft.AspNetCore.Mvc.RazorPages;

namespace RouteGeneratorApplication.Models
{
    public class MapModel : PageModel
    {
		//// Property to hold the Google Maps API key
		//public string GoogleApiKey { get; private set; }

		// Constructor
		public MapModel()
		{
			//// Initialize the API key. In a real application, you might want to load this from configuration
			//GoogleApiKey = ConfigSaves.GoogleMapsSecret; // Replace with your actual API key
		}

		// OnGet method to handle GET requests
		public void OnGet()
		{
			// Any additional logic you need when the page is loaded can go here.
		}
	}
}
