function autocomplete(input,latInput,lngInput){
    console.log(input,lngInput,latInput)

    if(!input) return

    // const dropdown=new google.maps.places.Autocomplete(input)

    // dropdown.addListener('place_changed',()=>{
    //     const place=dropdown.getPlace()
    //     console.log(place)
    //  latInput.value=place.geometry.location.lat()
    //  lngInput.value=place.geometry.location.lat()
    // })
    // const MAPBOX_KEY ='pk.eyJ1IjoiamVuYXJvOTQiLCJhIjoiY2pzbnBpajh3MGV5MTQ0cnJ3dmJlczFqbiJ9.Aktxa1EqTzpy7yEaBDM1xQ'
    mapboxgl.accessToken = 'pk.eyJ1Ijoic3dhZ2F0aDU1IiwiYSI6ImNrMWFoamNndTA3dXAzY252eXFhM2ZtMW4ifQ.zrf2f-n0y7UndYASTGSB5A'

    let geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
    })

    geocoder.addTo('#geocoder')
    geocoder.on('result', e => {
        console.log(e)
        input.value = e.result.place_name
        lngInput.value = e.result.geometry.coordinates[0]
        latInput.value = e.result.geometry.coordinates[1]
    })

    input.on('keydown',e=>{
        if(e.keyCode===13) e.preventDefault()
    })

}


export default autocomplete