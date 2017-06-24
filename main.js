'use strict';

// auto invoke IIFE - all code is local, not global
(function () {

	// JSON object for empty template
	var stateObj = {
		"googleMapsKey" : "AIzaSyAEOE9F9HGeovKbWnE4kMcYVLS7NO7Wapg",
		"localHours" : 0,
		"travelTime": 0,
		"travelDistance": 0,
		"pickup": "",
		"dropoff": "",
		"passengers": "1",
		"vehicle": "car",
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


	// selectors 
	var $container = $('#main-container')
	var $pickUp = $('#pickUp')
	var $dropOff = $('#dropOff')
	var $passengers = $('#passengers')
	var $vehicle = $('#vehicle')
	var $results = $('ol.result-list')
	var $resultContainer = $('#results')
	var $template = $('#result-section')


	// events 
	$pickUp.on('keyup', userInputPickup)
	$dropOff.on('keyup', userInputDropoff)
	$passengers.on('change', userInputPassengers)
	$vehicle.on('change', userInputVehicle)
	

	// functions needed 
		// How to change the pages
		// How to show/hide template pages

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

	function userInputPassengers() {
			stateObj.passengers = $(this).val();
			calculatePrice();
		// // to get the text for user inputted number of passengers
		// use function when user .change value of input text
	}

	function userInputVehicle() {
			stateObj.vehicle = $(this).val();
			calculatePrice();
	}

	function getMap() {
		if(requiresLocations()) return false
		var pickUpMap = encodeURIComponent(stateObj.pickup)
		var dropOffMap = encodeURIComponent(stateObj.dropoff)
		$("#map").html('<iframe width="100%" height="100%" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/directions?origin='+ pickUpMap +'&destination='+ dropOffMap +'&key=AIzaSyAEOE9F9HGeovKbWnE4kMcYVLS7NO7Wapg" allowfullscreen></iframe>')
		// getCoordinates(pickUpMap);
		// getCoordinates(dropOffMap);
	}

	function getCoordinates(address) {
		$.get('http://maps.google.com/maps/api/geocode/json?address='+ address, function(data) {
			// console.log(data.results[0].geometry.location.lat)
			// console.log(data.results[0].geometry.location.lng)
		})

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
			// console.log('lyft state', stateObj)
			$.ajax(
				{
					method: 'GET',
					headers: {'Authorization': 'Bearer gAAAAABZETzI6XduhQ07Kf_5dGrlNOrlcc817Q4GbPq8bW2ynOMWPH4rSGSzbdfTb2Lvn6odv3fGE3S6s5hws2_lBpoXxfAPIUrc4ylA1j0hnXtSWQplmYo84fhATqzvzaAgxanbZpxtR9Y1o3QYWpjGUb8jDXU2qZVh4lIYlehLcw7GatTEjWE='},
					url: 'https://api.lyft.com/v1/cost?start_lat='+ stateObj.start.lat +'&start_lng='+ stateObj.start.lng +'&end_lat='+ stateObj.end.lat +'&end_lng='+ stateObj.end.lng

				}
			).done(function(data) {
				console.log('lyftprice', data)
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
			// console.log('api state', stateObj)
		    // console.log(result, status) // Have a look to the response
		    console.log(stateObj.travelDistance)
		    console.log(stateObj.travelTime)	
		    getLyftPrice();	
		    var getMePrice = findGetMePrice();
			setPrice('GetMe', getMePrice);
			showResults();
		

		});
	}

	function requiresLocations() {
		if(!stateObj.pickup || !stateObj.dropoff) { // requires the properties and not empty with some value
			return true // breaks the function
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
		if (stateObj.vehicle === 'car' || stateObj.vehicle === 'suv') {
			// console.log(estimatedDistance, estimatedTravelTime, dayCar)
			 if (stateObj.localHours < 22 && stateObj.localHours >= 5) {
				if(stateObj.vehicle === 'car') {
					return dayCar.toFixed(2)
				} else {
					return daySuv.toFixed(2)
				}
			} else {
				if(stateObj.vehicle === 'car') {
					return nightCar.toFixed(2)
				} else {
					return nightSuv.toFixed(2)
				}
			}
		} else {
			return 0
		}
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
		// create a price list for each of the individual companies
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
		// console.log(resultHTML);
		$results.html(resultHTML);
		$resultContainer.removeClass('hide')
		// console.log('results')
	}
	function calculatePrice() {
		// getUberPrice();
		getUserTime();
		getDirections();
		

	}

	function init() {
		showHide('#home');
	}


	init();

})();



// TASK TO DO
// write Readme explaining the use of API and jquery of the project and then finish CSS