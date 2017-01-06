var CLICKTIME_ADDRESS = "282 2nd Street 4th floor, San Francisco, CA 94105";

var CLICKTIME_LAT_LNG = {lat: 37.785636, lng: -122.397119} 
//Latitude and longitude credited to: 
//http://www.latlong.net/convert-address-to-lat-long.html

var SF_LAT_LNG = {lat: 37.773972, lng: -122.431297}

var map;

var myLoc;

locateMe();

/**
 * initMap() creates a new google.maps.Map object that can be used with the 
 * Directions and Places services. The created map is stored in variable map.
 */
function initMap () {
    map = new google.maps.Map(document.getElementById('map'), {
          zoom: 4,
          center: SF_LAT_LNG
        });
}

/**
 * locateMe() sets variable myLoc to a LatLng object literal representing the
 * user's current latitude and longitude location. Function will alert the user
 * if geolcation services fail, in which case myLoc will remain undefined.
 */
function locateMe () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setPos, handleError);
    }
    else {
        alert ("This browser doesn't support geolocation")
    }
}

/**
 * setPos() is the success callback method fot getCurrentPosition() that sets the 
 * variable myLoc to the user's current latitude and longitude. 
 */
function setPos(pos) {
    myLoc = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
    }
    //alert("("+ myLoc.lat + "," + myLoc.lng + ")" )
}

/**
 * handleError() is the error callback that handles errors that occur as a result
 * of attempting to use geolocation.
 */
function handleError (error) {
    alert ("An error occured");
}

/**
 * createDirectionsRequest() creates a google.maps.DirectionsRequest object based
 * on the input arguments.
 * 
 * Requires:
 * 
 * origin: refer to DirectionsRequest at https://developers.google.com/maps/documentation/javascript/directions
 * destination: same as origin
 * travelMode: same as origin
 * waypoints: same as origin
 */
function createDirectionsRequest(origin, destination, travelMode, waypoints) {
    return {
        origin: origin,
        destination: destination,
        travelMode: travelMode,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        waypoints: waypoints,
        optimizeWaypoints: true
    }
}

/**
 * getDirections() returns a google.maps.DirectionsResult object based on
 * the input DirectionsRequest object. Returns 'undefined' if the 
 * service fails to return directions. 
 * 
 * Requires:
 * 
 * request: a valid google.maps.DirectionsRequest object
 */
function getDirections(request) {
    document.getElementById("directions").innerHTML = "Waiting for directions...";
    var service = new google.maps.DirectionsService();
    service.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            displayDirections(response);
            //alert ("Directions request succeeded")
        }
        else {
            handleDirectionError(status);
        }
    })
}

/**
 * handleDirectionError() handles errors associated with failed directions
 * queries. 
 * 
 * Requires:
 * 
 * status: a valid google.maps.DirectionsStatus
 */
function handleDirectionError(status) {
    switch (status) {
        case google.maps.DirectionsStatus.NOT_FOUND :
            alert ("Location not found");
            break;
        case google.maps.DirectionsStatus.ZERO_RESULTS :
            alert ("No routes found");
            break;
        case google.maps.DirectionsStatus.OVER_QUERY_LIMIT :
            alert ("Exceeded API Key query limit. Denied");
            break;
        default :
            alert ("Failure");
    }
}

/**
 * Test function
 */
function test () {
    locateMe();
    var req = createDirectionsRequest(myLoc, CLICKTIME_ADDRESS, 
    google.maps.DirectionsTravelMode.DRIVING, []);
    getDirections(req);
}

/**
 * displayDirections() displays the directions as a sequence of steps.
 * 
 * Requires:
 * 
 * directions: a valid google.maps.DirectionsResult object
 */
function displayDirections(directions) {
    var displayStr = "";
    var counter = 1;
    var route = directions.routes[0].legs;
    for (i = 0; i < route.length; i++) {
        var steps = route[i].steps;
        for (j = 0; j < steps.length; j++) {
            displayStr = displayStr + counter + ". " + strFromStep(steps[j]) + "<br/>";
            counter++;
        }
    }
    document.getElementById("directions").innerHTML = displayStr;
    document.getElementById("dist").innerHTML = "Total distance is: " +
    routeDistance(directions.routes[0]) + " meters";
    document.getElementById("time").innerHTML = "Total time is: " +
    routeTime(directions.routes[0]) + " seconds";
    document.getElementById("copyright").innerHTML = 
        directions.routes[0].copyrights;
}

/**
 * strFromStep() returns a string representation of the instructions 
 * associated with the step. 
 * 
 * Requires:
 * 
 * step: a valid google.maps.DirectionsStep
 */
function strFromStep(step) {
    return step.instructions;
}

/**
 * routeDistance() returns the total distance of the route in meters
 * 
 * Requires: 
 * 
 * route: a valid google.maps.DirectionsRoute
 */
function routeDistance(route) {
    var acc = 0;
    for (i = 0; i < route.legs.length; i++) {
        acc = acc + route.legs[i].distance.value;
    }
    return acc;
}

/**
 * routeTime() returns the total time spent travelling in seconds, neglecting
 * traffic.
 * 
 * Requires:
 * 
 * route: a valid google.maps.DirectionsRoute
 */
function routeTime(route) {
    var acc = 0;
    for (i = 0; i < route.legs.length; i++) {
        acc = acc + route.legs[i].duration.value;
    }
    return acc;
}

/**
 * createSearchRequest() creates a search request based on the input arguments
 * 
 * Requires:
 * 
 * distance: radius of search in meters. Must be an integer > 0
 * afford: integer from 0..4 representing maximum expense (4 is max)
 */
function createSearchRequest(distance, afford) {
    return {
        //query: "coffee and donuts",
        keyword: "coffee and donuts",
        openNow: true,
        minPriceLevel: 0,
        maxPriceLevel: afford,
        location: CLICKTIME_LAT_LNG, 
        //radius: distance,
        rankBy: google.maps.places.RankBy.DISTANCE
    }
}

/**
 * search() finds shops with coffee and donuts within a specified distance of
 * the ClickTime headquarters, ranking results by distance.
 */
function search() {
    var req = createSearchRequest(3000, 4);
    service = new google.maps.places.PlacesService(map);
    //google.maps.Place alert ("Succesfully created service")
    service.nearbySearch(req, calculateRoute);
}

/**
 * displayNearby() displays the nearby coffee and donut shops 
 */
function displayNearby(result, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        var dispStr = "";
        for (i = 0; i < result.length; i++) {
            dispStr = dispStr + result[i].name + "<br/>";
        }
        document.getElementById("nearby").innerHTML = dispStr;
    }
    else handleSearchError(status);
}

/**
 * handleSearchError() handles errors resulting from a failed search
 * 
 * Requires:
 * 
 * status: a valid google.maps.places.PlacesServiceStatus
 */
function handleSearchError(status) {
    switch (status) {
        case google.maps.places.PlacesServiceStatus.ERROR :
            alert ("Error contacting Google servers");
            break;
        case google.maps.places.PlacesServiceStatus.ZERO_RESULTS :
            alert ("No results found");
            break;
        default : 
            alert("Unable to complete search request")
    }
}

/**
 * calculateRoute() calculates a route from the current location to the 
 * ClickTime headquarters while passing through the closest shop selling 
 * both coffee and donuts.
 * 
 * Requires:
 * 
 * result: array of google.maps.places.PlaceResult
 * status: a valid google.maps.places.PlacesServiceStatus
 */
function calculateRoute(result, status) {
    var routes = [];
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        var req = createDirectionsRequest(myLoc, CLICKTIME_ADDRESS, 
        getTravelMode(), [createWaypoint(result[0])]);
        var directions = getDirections(req);
    }
    else handleSearchError(status);
}

/**
 * createWaypoint() creates a waypoint literal from an address string. Waypoints 
 * will be considered to have stopovers
 * 
 * Requires:
 * 
 * res: a google.maps.places.PlaceResult object
 */
function createWaypoint(res) {
    var latlng = {
        lat: res.geometry.location.lat(),
        lng: res.geometry.location.lng()
    }
    return {
        location: latlng,
        stopover: true
    }
}

/**
 * getTravelMode() returns the selected travel mode
 */
function getTravelMode() {
    return google.maps.DirectionsTravelMode.WALKING //To be changed
}