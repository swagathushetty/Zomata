import axios from 'axios'
import { $ } from './bling'
const bounds = new mapboxgl.LngLatBounds();


function loadPlaces(map,lat=19.0280,lng=-73.0265){
    axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
    .then((res)=>{
        const places=res.data
        console.log(places)
        if(!places.length){
            return
        }
        places.forEach((place)=>{
            var marker = new mapboxgl.Marker() // initialize a new marker
                .setLngLat([place.location.coordinates[0], place.location.coordinates[1]]) // Marker [lng, lat] coordinates
                .addTo(map); // Add the marker to the map   
                
            //add popup
            new mapboxgl.Popup({
                offset: 30,
            })
                .setLngLat(place.location.coordinates)
                .setHTML(`<p>Day ${place.name}</p>`)
                .addTo(map);    

            bounds.extend(place.location.coordinates);
            map.fitBounds(bounds, {
                padding: {
                    top: 300,
                    bottom: 150,
                    left: 100,
                    right: 100,
                },
            });    
        })
        

    })
}

function makeMap(mapDiv){
    console.log(mapDiv)
    if(!mapDiv) return
    //make our map
    // const map= new google.maps.Map(mapDiv ,mapOptions)
    
    mapboxgl.accessToken = 'pk.eyJ1Ijoic3dhZ2F0aDU1IiwiYSI6ImNrMWFoamNndTA3dXAzY252eXFhM2ZtMW4ifQ.zrf2f-n0y7UndYASTGSB5A';
    var map = new mapboxgl.Map({
        container: 'map', // Container ID
        style: 'mapbox://styles/mapbox/streets-v11', // Map style to use
        // center: [-122.25948, 37.87221], // Starting position [lng, lat]
        // zoom: 12, // Starting zoom level
    });

    

    var geocoder = new MapboxGeocoder({ // Initialize the geocoder
        accessToken: mapboxgl.accessToken, // Set the access token
        mapboxgl: mapboxgl, // Set the mapbox-gl instance
        marker: true, // Do not use the default marker style
    });

    // Add the geocoder to the map
    map.addControl(geocoder);
    loadPlaces(map)


  
    
        



    
}

export default makeMap;

