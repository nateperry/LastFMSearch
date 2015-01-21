<?php
	define("GOOGLE_MAPS_URL","http://maps.googleapis.com/maps/api/staticmap?size=200x150&sensor=false&zoom=11");
	define("GOOGLE_MAPS_API_KEY","AIzaSyCk1BJmnxOqudrvgdYDkzZCXHbtvPEwCpM");
	
	$lat = $_GET['lat'];
	$long = $_GET['long'];
	
	$map = getLocation ($lat, $long);
	echo $map;
	
	/*
		Author: Nathaniel Perry
		Function: getLocation
		Description: Looks for a map of the area that the concert is located
		Last Modified: 1/23/2012
	*/
	function getLocation ($lat , $long) {
		$html = "";

		//if (strlen($lat) < 1 || strlen($long) < 1) return "<h2>No Map requested</h2>";
		
		$url = GOOGLE_MAPS_URL;
		//$url .= "&key=" . GOOGLE_MAPS_API_KEY;
		$url .= "&center=$lat,$long";
		//$url .= "&markers=color:blue%7Clabel:S%7$lat,$long&markers=size:mid";
		$url .= "&markers=color:blue|label:A|$lat,$long";
		$map = "<img src='$url' />";
		return $map;
	}//end getLocation


?>