/* eslint-disable */

export const displayMap = (locations) => {
  maptilersdk.config.apiKey = 'dsZ4yRnNlQ5NiSa3gdKz';
  const map = new maptilersdk.Map({
    container: 'map', // container's id or the HTML element to render the map
    style: '628bb668-8e4f-49ab-b2b1-688ab640497c',
    scrollZoom: false
    //   center: [-18.113491, 34.111745], // starting position [lng, lat]
    //   zoom: 3, // starting zoom
    //   interactive: false
  });

  const bounds = new maptilersdk.LngLatBounds();

  locations.forEach((loc) => {
    // Create a marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add the marker
    new maptilersdk.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new maptilersdk.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 }
  });
};
