// src/services/mapService.ts

export const getStaticMapImageUrl = (
    polygon: google.maps.Polygon,
    zoom: number = 19,
    size: string = '600x600',
    scale: number = 2
  ): string => {
    const paths = polygon
      .getPath()
      .getArray()
      .map((latLng) => `${latLng.lat()},${latLng.lng()}`)
      .join('|');
  
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  
    return `https://maps.googleapis.com/maps/api/staticmap?size=${size}&scale=${scale}&maptype=satellite&zoom=${zoom}&path=color:0x0000ff|weight:3|${paths}&key=${apiKey}`;
  };
  