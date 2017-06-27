'use strict';

// auto invoke IIFE - all code is local, not global
(function () {

	// STATE declaration
	// JSON object for empty template
	var stateObj = {
		"googleMapsKey" : "AIzaSyAEOE9F9HGeovKbWnE4kMcYVLS7NO7Wapg",
		"localHours" : 0,
		"travelTime": 0,
		"travelDistance": 0,
		"pickup": "",
		"dropoff": "",
		"passengers": "1",
		"vehicle": "",
		"start": 
				{
					lng: 0,
					lat: 0
				},
		"end": 
				{
					lng: 0,
					lat: 0,
				},
		"results" : [
			{
				name: "Lyft",
				logo: "logo_tiny_pink.png",
				price: "",
				url: "https://www.lyft.com/",
				info: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
			},			
			{
				name: "GetMe",
				logo: "getme.png",
				price: "",
				url: "https://www.getme.com/",
				info: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
			}
			
		]
	};


	// selectors - Variable declaration
	var $container = $('#main-container')
	var $pickUp = $('#pickUp')
	var $dropOff = $('#dropOff')
	var $passengers = $('#passengers')
	var $vehicle = $('#vehicle')
	var $results = $('ol.result-list')
	var $resultContainer = $('#results')
	var $template = $('#result-section')



	

	// Function Declaration

	function showHide(screenName) {
		$(".box").addClass("hide")
		$(screenName).removeClass("hide") 

	}
	

	function userInputPickup() {
			stateObj.pickup = $(this).val();
			getMap();
			calculatePrice();
		// to get the text for user inputted pickup location
		// use function when user .change value of input text
	}

	function userInputDropoff() {
			stateObj.dropoff = $(this).val();
			getMap();
			calculatePrice();
		// to get the text for user inputted dropoff location
		// use function when user .change value of input text
		
	}

	function userInputVehicle() {
			stateObj.vehicle = $(this).val();
			getMap();
			calculatePrice();
	}

	function getMap() {
		if(requiresLocations()) return false
		var pickUpMap = encodeURIComponent(stateObj.pickup)
		var dropOffMap = encodeURIComponent(stateObj.dropoff)
		$("#map").html('<iframe width="100%" height="100%" frameborder="0" '
			+' style="border:0" src="https://www.google.com/maps/embed/v1/directions?origin='
			+ pickUpMap +'&destination='
			+ dropOffMap +'&key=AIzaSyAEOE9F9HGeovKbWnE4kMcYVLS7NO7Wapg" allowfullscreen></iframe>')
	}


	// function getUberPrice() { 
	//     $.ajax(
	//         { 
	//             method: 'GET', 
	//             headers: {'Authorization': 'Bearer LRSxs5m7dfcp7FTOuCkzTv1WV4dwmHlvy_UaQJXy'}, 
	//             url: 'https://api.uber.com/v1.2/products?latitude=37.7752315&longitude=-122.418075', 
	    		
	 
	//         }
	//     ).done(function(data) { 
	        // console.log(data) 
	//     })
	// }


	function getLyftPrice() {
		$.ajax(
			{
				method: 'GET',
				headers: {'Authorization': 'Bearer gAAAAABZETzI6XduhQ07Kf_5dGrlNOrlcc817Q4GbPq8bW2ynOMWPH4rSGSzbdfTb2Lvn6odv3fGE3S6s5hws2_lBpoXxfAPIUrc4ylA1j0hnXtSWQplmYo84fhATqzvzaAgxanbZpxtR9Y1o3QYWpjGUb8jDXU2qZVh4lIYlehLcw7GatTEjWE='},
				url: 'https://api.lyft.com/v1/cost?start_lat='+ stateObj.start.lat +'&start_lng='+ stateObj.start.lng +'&end_lat='+ stateObj.end.lat +'&end_lng='+ stateObj.end.lng

			}
		).done(function(data) {
			if(!data.cost_estimates.length) {
				setPrice('Lyft', ' Trip Exceeds Maximum Fare')
			} else {
					if(stateObj.vehicle === 'car') {
						setPrice('Lyft', data.cost_estimates[4].estimated_cost_cents_min/100 + ' - ' + data.cost_estimates[4].estimated_cost_cents_max/100)
					} else {
						setPrice('Lyft', data.cost_estimates[2].estimated_cost_cents_min/100 + ' - ' + data.cost_estimates[2].estimated_cost_cents_max/100)
					}
			}
			
			showResults();
		})
	}

	function getDirections() {
		if(requiresLocations()) return false
		var directionsService = new google.maps.DirectionsService();
		var request = {
		    origin: stateObj.pickup, // Here the origin from the state
		    destination: stateObj.dropoff, // Here the destination from the state
		    travelMode: 'DRIVING'
		};
		directionsService.route(request, function(result, status) {
			if(result && result.routes.length) {
				stateObj.start.lat = result.routes[0].legs[0].start_location.lat()
				stateObj.start.lng = result.routes[0].legs[0].start_location.lng()
				stateObj.end.lat = result.routes[0].legs[0].end_location.lat()
				stateObj.end.lng = result.routes[0].legs[0].end_location.lng()
				stateObj.travelDistance = result.routes[0].legs[0].distance.value
				stateObj.travelTime = result.routes[0].legs[0].duration.value
			}
		    getLyftPrice()
		    findGetMePrice()
			showResults()
		});
	}

	function requiresLocations() {
		if(!stateObj.pickup || !stateObj.dropoff || !stateObj.vehicle) { 
			return true 
		}

	}

	function getUserTime() {
		stateObj.localHours = new Date().getHours();
	}


	function findGetMePrice() {
		var estimatedDistance = stateObj.travelDistance / 1609.34
		var estimatedTravelTime = stateObj.travelTime / 60 / 60 
		var dayCar = 1.50 + 1.50*estimatedDistance + 0.23*estimatedTravelTime + 3.50
		var daySuv = 3.00 + 2.60*estimatedDistance + 0.35*estimatedTravelTime + 3.50
		var nightCar = 3.00 + 2.50*estimatedDistance + 0.30*estimatedTravelTime + 3.50
		var nightSuv = 3.00 + 3.50*estimatedDistance + 0.52*estimatedTravelTime + 3.50
		var price = 0
		function dayPrice() {
			if(stateObj.vehicle === 'car') {
				return dayCar.toFixed(2)
			} else {
				return daySuv.toFixed(2)
			}
		}
		function nightPrice() {
			if(stateObj.vehicle === 'car') {
				return nightCar.toFixed(2)
			} else {
				return nightSuv.toFixed(2)
			}
		}
		if (stateObj.vehicle === 'car' || stateObj.vehicle === 'suv') {
			if (stateObj.localHours < 22 && stateObj.localHours >= 5) {
				price = dayPrice()
			} else {
				price = nightPrice()
			}
		}
		setPrice('GetMe', price) 
	}

	function setPrice(name, price) {
		var company = stateObj.results.find(function(item) {
			if (item.name === name) {
				return true
			}
		})
		company.price = price
	}

	function showResults() {
		var resultHTML = ""
		stateObj.results.forEach(function(item) {
			var companyName = item.name
			var companyPrice = item.price
			var companyUrl = item.url
			var companyInfo = item.info
			
			$template.find('#change-company').html(companyName)
			$template.find('img').attr('src', item.logo)
			$template.find('a').attr('href', companyUrl)
			$template.find('#change-price').html('$' + companyPrice)
			$template.find('#change-info').html(companyInfo)
			resultHTML += $template.html()
		})
		$results.html(resultHTML);
		$resultContainer.removeClass('hide')
	}
	function calculatePrice() {
		// getUberPrice();
		getUserTime();
		getDirections();
		

	}

	function init() {
		showHide('#home');
	}

	// Events declaration
	$pickUp.on('keyup', userInputPickup)
	$dropOff.on('keyup', userInputDropoff)
	$vehicle.on('change', userInputVehicle)

	// Initialization of the application
	init();

})();
