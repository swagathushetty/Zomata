let mapBox=document.getElementById('map')
console.log(mapBox)

if(mapBox){
    const locations = JSON.parse(mapBox.dataset.location)
    console.log(locations)
    mapboxgl.accessToken = 'pk.eyJ1Ijoic3dhZ2F0aDU1IiwiYSI6ImNrMWFoamNndTA3dXAzY252eXFhM2ZtMW4ifQ.zrf2f-n0y7UndYASTGSB5A';
   var map= new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
      center: [locations[0],locations[1]], //longitude ,latitiude
       zoom:14,   //more the number higher the zoom
       interactive:false //dont allow scrolling. makes the map static

  });

   
    const bounds = new mapboxgl.LngLatBounds();

        

    new mapboxgl.Marker()
        .setLngLat(locations)
        .addTo(map);


       








}