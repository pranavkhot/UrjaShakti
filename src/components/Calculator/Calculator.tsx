// Calculator.tsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import './Calculator.css';

// Presentation only: motion wrappers and interface icons
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Pencil, Check, Undo2, X, ArrowRight } from 'lucide-react';
import { Reveal, Stagger, StaggerItem, SplitHeading } from '../../motion/kit';

import {
  GoogleMap,
  Marker,
  Polygon,
  Polyline,
  useJsApiLoader,
} from '@react-google-maps/api';

// Import icons (ensure correct paths)
import { ReactComponent as AreaIcon } from './icons/area.svg';
import { ReactComponent as SunIcon } from './icons/sun.svg';
import { ReactComponent as CapacityIcon } from './icons/capacity.svg';
import { ReactComponent as EnergyIcon } from './icons/energy.svg';
import { FaSolarPanel, FaCompass } from 'react-icons/fa';

// Import SunCalc library
import SunCalc from 'suncalc';

// Import Firebase (ensure correct path)
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

// Import AuthContext (ensure correct path)
import { AuthContext } from '../../AuthContext';

// Import useNavigate from react-router-dom for navigation
import { useNavigate } from 'react-router-dom';

import { PERFORMANCE_RATIO } from '../../utils/solarCalculations';

// Define the Google Maps API key and libraries
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

const libraries: (
  | 'drawing'
  | 'geometry'
  | 'places'
  | 'visualization'
)[] = ['geometry', 'places'];

const Calculator: React.FC = () => {
  // Access the user from AuthContext
  const { user } = useContext(AuthContext);
  const userId = user ? user.uid : null;

  // State variables
  const [areaResult, setAreaResult] = useState<number>(0);
  const [irradianceResult, setIrradianceResult] = useState<number>(0);
  const [capacityResult, setCapacityResult] = useState<number>(0);
  const [dailyEnergyResult, setDailyEnergyResult] = useState<number>(0);
  const [tiltAngleResult, setTiltAngleResult] = useState<number>(0);
  const [sunPosition, setSunPosition] = useState<{
    azimuth: number;
    elevation: number;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 28.6139,
    lng: 77.209,
  }); // Default center: New Delhi, India
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedPolygon, setSelectedPolygon] =
    useState<google.maps.Polygon | null>(null);
  // Custom drawing state (replaces the deprecated google.maps.drawing.DrawingManager)
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawingPath, setDrawingPath] = useState<google.maps.LatLngLiteral[]>(
    []
  );

  // Ref for the address input
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  // State for error message
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Initialize useNavigate for navigation
  const navigate = useNavigate();

  // Scroll to the top when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load the Google Maps script
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey, // Your actual API key
    libraries, // Required libraries
  });

  // Memoize map options to prevent unnecessary re-renders
  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        { featureType: 'water', stylers: [{ color: '#aadaff' }] },
      ],
      disableDefaultUI: true, // Disable all default UI controls
      zoomControl: true,      // Enable zoom control
      mapTypeControl: true,   // Enable map type control
      streetViewControl: false,
      fullscreenControl: true, // **Enable built-in fullscreen control**
    }),
    []
  );

  // Handle map load event
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Function to calculate the centroid of a polygon
  const getPolygonCentroid = (
    polygon: google.maps.Polygon
  ): google.maps.LatLng | null => {
    const path = polygon.getPath();
    let latSum = 0;
    let lngSum = 0;
    const numPoints = path.getLength();
    for (let i = 0; i < numPoints; i++) {
      const point = path.getAt(i);
      latSum += point.lat();
      lngSum += point.lng();
    }
    return new google.maps.LatLng(latSum / numPoints, lngSum / numPoints);
  };

  // Function to calculate optimal tilt angle based on latitude
  const calculateOptimalTiltAngle = (latitude: number): number => {
    // Simple formula: Optimal tilt angle ≈ Latitude
    return Math.abs(latitude);
  };

  // Function to calculate sun position using SunCalc
  const calculateSunPosition = (
    latitude: number,
    longitude: number
  ): {
    azimuth: number;
    elevation: number;
  } => {
    const now = new Date();
    const position = SunCalc.getPosition(now, latitude, longitude);

    // Convert azimuth and elevation from radians to degrees
    const azimuth = (position.azimuth * 180) / Math.PI + 180;
    const elevation = (position.altitude * 180) / Math.PI;

    return {
      azimuth,
      elevation,
    };
  };

  // Function to fetch solar irradiance data from NASA's API
  const getSolarIrradiance = async (
    latitude: number,
    longitude: number
  ): Promise<number> => {
    const parameters = 'ALLSKY_SFC_SW_DWN'; // Solar irradiance parameter
    const apiUrl = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=${parameters}&community=RE&longitude=${longitude}&latitude=${latitude}&format=JSON`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      // NASA POWER climatology returns JAN..DEC plus an "ANN" (annual mean)
      // entry. Use ANN directly; averaging all 13 keys counted the annual
      // value as a 13th month. Fall back to a day-weighted mean of the 12
      // months, skipping NASA's -999 fill values.
      const monthlyData = data.properties.parameter.ALLSKY_SFC_SW_DWN;
      const annual = Number(monthlyData?.ANN);
      if (isFinite(annual) && annual > 0) {
        return annual; // Units: kWh/m²/day
      }
      const MONTHS: Array<[string, number]> = [
        ['JAN', 31], ['FEB', 28.25], ['MAR', 31], ['APR', 30],
        ['MAY', 31], ['JUN', 30], ['JUL', 31], ['AUG', 31],
        ['SEP', 30], ['OCT', 31], ['NOV', 30], ['DEC', 31],
      ];
      let weighted = 0;
      let days = 0;
      for (const [month, monthDays] of MONTHS) {
        const value = Number(monthlyData?.[month]);
        if (isFinite(value) && value >= 0) {
          weighted += value * monthDays;
          days += monthDays;
        }
      }
      return days > 0 ? weighted / days : 0; // Units: kWh/m²/day
    } catch (error) {
      console.error('Error fetching irradiance data:', error);
      return 0;
    }
  };

  // Function to calculate solar system capacity and related metrics
  const calculateSolarCapacity = useCallback(
    async (area: number, polygon: google.maps.Polygon) => {
      const centroid = getPolygonCentroid(polygon);
      if (!centroid) return;

      const latitude = centroid.lat();
      const longitude = centroid.lng();

      // Fetch solar irradiance data
      const irradiance = await getSolarIrradiance(latitude, longitude);
      setIrradianceResult(irradiance);

      const panelEfficiency = 0.18; // 18% efficiency
      const coverageRatio = 0.8;     // 80% coverage

      const totalPanelArea = area * coverageRatio; // Total panel area in m²

      // Calculate system capacity in kW
      const standardIrradiance = 1000; // W/m²
      const systemCapacityKW =
        (totalPanelArea * panelEfficiency * standardIrradiance) / 1000; // Convert W to kW
      setCapacityResult(systemCapacityKW);

      // Daily energy for a whole-roof system in kWh/day, after the same
      // system losses (performance ratio) the report uses.
      const dailyEnergyProduction =
        systemCapacityKW * irradiance * PERFORMANCE_RATIO;
      setDailyEnergyResult(dailyEnergyProduction);

      // Calculate optimal tilt angle
      const tiltAngle = calculateOptimalTiltAngle(latitude);
      setTiltAngleResult(tiltAngle);

      // Calculate sun position
      const sunPos = calculateSunPosition(latitude, longitude);
      setSunPosition(sunPos);

      // Save data to Firebase if user is authenticated
      if (userId) {
        const solarData = {
          area: area,
          irradiance: irradiance,
          capacity: systemCapacityKW,
          dailyEnergy: dailyEnergyProduction,
          tiltAngle: tiltAngle,
          sunPosition: sunPos,
          timestamp: new Date().toISOString(),
        };

        try {
          // Reference to the user's calculations subcollection
          const calculationsRef = collection(
            db,
            'users',
            userId,
            'calculations'
          );
          await addDoc(calculationsRef, solarData);
          console.log('Solar data saved successfully.');
        } catch (error) {
          console.error('Error saving solar data:', error);
          alert('Failed to save your calculation. Please try again.');
        }
      } else {
        // Prompt user to log in
        console.log('User not logged in. Cannot save solar data.');
        alert('Please log in to save your calculations.');
      }
    },
    [userId]
  );

  // Function to calculate area of the drawn polygon
  const calculateArea = useCallback(
    async (polygon: google.maps.Polygon) => {
      const area = google.maps.geometry.spherical.computeArea(
        polygon.getPath()
      );
      setAreaResult(area);

      // Calculate solar capacity based on the area
      await calculateSolarCapacity(area, polygon);
    },
    [calculateSolarCapacity]
  );

  // Function to add event listeners to the polygon for real-time updates
  const addPolygonListeners = useCallback(
    (polygon: google.maps.Polygon) => {
      polygon
        .getPath()
        .addListener('set_at', () => calculateArea(polygon));
      polygon
        .getPath()
        .addListener('insert_at', () => calculateArea(polygon));
      polygon.addListener('dragend', () => calculateArea(polygon));
    },
    [calculateArea]
  );



// Wrap saveLocationToFirebase with useCallback
const saveLocationToFirebase = useCallback(
  async (latitude: number, longitude: number) => {
    if (userId) {
      try {
        const locationData = {
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        };

        const locationsRef = collection(db, 'users', userId, 'locations');
        await addDoc(locationsRef, locationData);

        console.log('Location data saved successfully.');
      } catch (error) {
        console.error('Error saving location data:', error);
        alert('Failed to save your location. Please try again.');
      }
    } else {
      console.log('User not logged in. Cannot save location.');
      alert('Please log in to save your location.');
    }
  },
  [userId]
);

  // Handler for when a polygon is completed
  const onPolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      if (selectedPolygon) {
        selectedPolygon.setMap(null); // Remove the previous polygon
      }
      setSelectedPolygon(polygon);
  
      calculateArea(polygon);
      addPolygonListeners(polygon);
  
      const centroid = getPolygonCentroid(polygon);
      if (centroid) {
        saveLocationToFirebase(centroid.lat(), centroid.lng());
      }
  
      // Exit drawing mode
      setIsDrawing(false);
      setDrawingPath([]);
    },
    [selectedPolygon, calculateArea, addPolygonListeners, saveLocationToFirebase]
  );

  // ---- Custom polygon drawing (replacement for the deprecated DrawingManager) ----

  // Start a fresh drawing: clear any existing polygon and begin collecting points
  const startDrawing = useCallback(() => {
    if (selectedPolygon) {
      selectedPolygon.setMap(null);
      setSelectedPolygon(null);
    }
    setDrawingPath([]);
    setIsDrawing(true);
  }, [selectedPolygon]);

  // While drawing, each map click adds a vertex to the roof outline
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!isDrawing || !e.latLng) return;
      const point = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setDrawingPath((prev) => [...prev, point]);
    },
    [isDrawing]
  );

  // Remove the last placed vertex
  const undoLastPoint = useCallback(() => {
    setDrawingPath((prev) => prev.slice(0, -1));
  }, []);

  // Cancel drawing without creating a polygon
  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
    setDrawingPath([]);
  }, []);

  // Finish drawing: build a real google.maps.Polygon and run the same
  // completion logic the DrawingManager used to trigger (area, capacity,
  // Firebase save, editable/draggable listeners).
  const finishDrawing = useCallback(() => {
    if (drawingPath.length < 3) {
      alert(
        'Please click at least 3 points on the map to outline your roof area.'
      );
      return;
    }

    const polygon = new google.maps.Polygon({
      paths: drawingPath,
      editable: true,
      draggable: true,
      fillColor: '#2196F3',
      fillOpacity: 0.3,
      strokeColor: '#0000ff',
      strokeWeight: 3,
    });

    polygon.setMap(mapRef.current);
    onPolygonComplete(polygon);
  }, [drawingPath, onPolygonComplete]);


  // Function to geocode an address and center the map
  const geocodeAddress = () => {
    const address = addressInputRef.current?.value;

    if (!address) {
      alert('Please enter a location.');
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results) {
        const location = results[0].geometry.location;

        setMapCenter(location.toJSON());
        setMarkerPosition(location.toJSON());

        // Save location to Firebase
        saveLocationToFirebase(location.lat(), location.lng());

        // Pan to the searched location
        if (mapRef.current) {
          mapRef.current.panTo(location);

          // Start smooth zoom
          const currentZoom = mapRef.current.getZoom() || 2;
          const targetZoom = 20; // Desired zoom level
          smoothZoom(mapRef.current, targetZoom, currentZoom);
        }
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  // Function to perform smooth zooming
  const smoothZoom = (
    map: google.maps.Map,
    targetZoom: number,
    currentZoom: number
  ) => {
    if (currentZoom >= targetZoom) {
      return;
    } else {
      google.maps.event.addListenerOnce(map, 'zoom_changed', () => {
        smoothZoom(map, targetZoom, currentZoom + 1);
      });
      setTimeout(() => {
        map.setZoom(currentZoom);
      }, 80); // Adjust the delay for smoother or faster zoom
    }
  };

  // Ensure map resizes on fullscreen change
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        google.maps.event.trigger(mapRef.current, 'resize');
        if (markerPosition) {
          mapRef.current.setCenter(markerPosition);
        }
      }
    };

    // Add listeners for standard and vendor-prefixed fullscreen change events
    document.addEventListener('fullscreenchange', handleResize);
    document.addEventListener('webkitfullscreenchange', handleResize); // Safari
    document.addEventListener('mozfullscreenchange', handleResize); // Firefox
    document.addEventListener('MSFullscreenChange', handleResize); // IE11

    return () => {
      document.removeEventListener('fullscreenchange', handleResize);
      document.removeEventListener('webkitfullscreenchange', handleResize);
      document.removeEventListener('mozfullscreenchange', handleResize);
      document.removeEventListener('MSFullscreenChange', handleResize);
    };
  }, [markerPosition]);

  // Handle loading errors
  if (loadError) {
    return (
      <div className="calc us-page">
        <div className="us-container calc-state" role="alert">
          <h1 className="us-h3">Error loading Google Maps</h1>
          <p className="us-small">
            The map could not be loaded, so the roof cannot be traced right
            now. Check your connection and reload the page.
          </p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (!isLoaded) {
    return (
      <div className="calc us-page" role="status" aria-live="polite">
        <div className="us-container calc-state">
          <div className="us-skeleton calc-state-map" />
          <p className="us-small">Loading Map...</p>
        </div>
      </div>
    );
  }

  // Handler for "Let's calculate" button
  const handleCalculateClick = () => {
    // Reset previous error message
    setErrorMessage('');

    // Validate if location is entered and calculations are done
    if (!markerPosition) {
      setErrorMessage('Please enter your location.');
      return;
    }

    if (areaResult === 0) {
      setErrorMessage('Please draw your roof area on the map to perform calculations.');
      return;
    }

    // Optional: Additional validation if needed

    // If all validations pass, navigate to the next page
    navigate('/energy-estimation');
  };

  return (
    <div className="calculator-page calc us-page">
      {/* Intro */}
      <section className="calc-intro us-container">
        <Reveal as="ol" className="us-steps" kind="fade" inView={false} duration={0.4} aria-label="Progress">
          <li aria-current="step"><span className="us-nums">01</span> Roof</li>
          <li><span className="us-nums">02</span> Bill</li>
          <li><span className="us-nums">03</span> Report</li>
        </Reveal>
        <div className="calc-intro-row">
          <SplitHeading
            as="h1"
            className="us-h1 calc-title"
            text="Trace your roof."
            mark={['roof.']}
            inView={false}
            delay={0.05}
          />
          <Reveal as="p" className="us-lead calc-lead" inView={false} delay={0.25}>
            Search your address, then click round the outline of your roof.
            The area, the sunlight at that spot and the system it can hold are
            worked out from the shape you draw.
          </Reveal>
        </div>
      </section>

      {/* Workspace: the map, with its controls beside it rather than over it */}
      <section className="calc-workspace us-container">
        <div className="calc-stage">
          <div className="calc-toolbar">
            {/* Search */}
            <div className="calc-search us-glass us-glass--dense">
              <Search className="calc-search-icon" size={20} aria-hidden="true" />
              <input
                ref={addressInputRef}
                type="text"
                placeholder="Enter your location"
                aria-label="Your address or location"
                onKeyDown={(e) => {
                  // Enter runs the same search as the button beside it.
                  if (e.key === 'Enter') {
                    geocodeAddress();
                  }
                }}
                className="calc-search-input"
              />
              <button
                id="search-btn"
                className="us-btn us-btn--primary calc-search-button"
                onClick={geocodeAddress}
              >
                Find my roof
              </button>
            </div>

            {/* Drawing controls (replacement for the deprecated DrawingManager toolbar) */}
            <div className="calc-draw us-glass us-glass--dense">
              <AnimatePresence mode="wait" initial={false}>
                {!isDrawing ? (
                  <motion.div
                    key="idle"
                    className="calc-draw-group"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <button
                      type="button"
                      className="calc-draw-btn calc-draw-btn--start"
                      onClick={startDrawing}
                    >
                      <Pencil size={16} aria-hidden="true" /> Draw Roof Area
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="drawing"
                    className="calc-draw-group"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <span className="calc-draw-hint" aria-live="polite">
                      <i aria-hidden="true" />
                      Click on the map to add points ({drawingPath.length})
                    </span>
                    <button
                      type="button"
                      className="calc-draw-btn calc-draw-btn--finish"
                      onClick={finishDrawing}
                    >
                      <Check size={16} aria-hidden="true" /> Finish
                    </button>
                    <button
                      type="button"
                      className="calc-draw-btn"
                      onClick={undoLastPoint}
                    >
                      <Undo2 size={16} aria-hidden="true" /> Undo
                    </button>
                    <button
                      type="button"
                      className="calc-draw-btn calc-draw-btn-cancel"
                      onClick={cancelDrawing}
                    >
                      <X size={16} aria-hidden="true" /> Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className={`calc-map-wrapper ${isDrawing ? 'is-drawing' : ''}`}>
            {/* Built-in Fullscreen Toggle Button is enabled via mapOptions */}

            {/* Map Container */}
            <GoogleMap
              id="map"
              mapContainerClassName="calculator-map"
              center={mapCenter}
              zoom={5}
              onLoad={onMapLoad}
              onClick={handleMapClick}
              options={mapOptions} // Use memoized options with fullscreenControl enabled
            >
              {markerPosition && <Marker position={markerPosition} />}

              {/* Live drawing preview (replaces the deprecated DrawingManager) */}
              {isDrawing && drawingPath.length > 0 && (
                <>
                  <Polyline
                    path={drawingPath}
                    options={{
                      strokeColor: '#0000ff',
                      strokeWeight: 3,
                      clickable: false,
                    }}
                  />
                  {drawingPath.length >= 3 && (
                    <Polygon
                      paths={drawingPath}
                      options={{
                        fillColor: '#2196F3',
                        fillOpacity: 0.2,
                        strokeOpacity: 0,
                        clickable: false,
                      }}
                    />
                  )}
                  {drawingPath.map((pt, i) => (
                    <Marker
                      key={i}
                      position={pt}
                      options={{
                        clickable: false,
                        icon: {
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 5,
                          fillColor: '#ffffff',
                          fillOpacity: 1,
                          strokeColor: '#0000ff',
                          strokeWeight: 2,
                        },
                      }}
                    />
                  ))}
                </>
              )}
            </GoogleMap>
          </div>

          {/* What to do next, read from the state the page already has */}
          <ol className="calc-guide">
            <li className={markerPosition ? 'is-done' : 'is-current'}>
              <span className="us-nums">1</span>
              Search for your address
            </li>
            <li className={areaResult > 0 ? 'is-done' : isDrawing ? 'is-current' : ''}>
              <span className="us-nums">2</span>
              Draw the roof, then press Finish
            </li>
            <li className={areaResult > 0 ? 'is-current' : ''}>
              <span className="us-nums">3</span>
              Drag a corner to adjust, then continue
            </li>
          </ol>
        </div>

        {/* Results */}
        <aside className="calc-results" aria-labelledby="calc-results-title">
          <h2 id="calc-results-title" className="calc-results-title">
            Your Solar System Snapshot
          </h2>
          <Stagger className="calc-rows" inView={false} delay={0.3} gap={0.06}>
            {/* Area */}
            <StaggerItem className="calc-row">
              <AreaIcon className="calc-row-icon" aria-hidden="true" />
              <h3 className="calc-row-title">Roof Area</h3>
              <p id="area-result" key={areaResult} className="calc-value us-nums">
                {areaResult.toFixed(2)} m²
              </p>
            </StaggerItem>
            {/* Irradiance */}
            <StaggerItem className="calc-row">
              <SunIcon className="calc-row-icon" aria-hidden="true" />
              <h3 className="calc-row-title">Solar Irradiance</h3>
              <p id="irradiance-result" key={irradianceResult} className="calc-value us-nums">
                {irradianceResult.toFixed(2)} kWh/m²/day
              </p>
            </StaggerItem>
            {/* System Capacity */}
            <StaggerItem className="calc-row">
              <CapacityIcon className="calc-row-icon" aria-hidden="true" />
              <h3 className="calc-row-title">Roof Potential (max)</h3>
              <p id="capacity-result" key={capacityResult} className="calc-value us-nums">
                {capacityResult.toFixed(2)} kW
              </p>
            </StaggerItem>
            {/* Daily Energy Production */}
            <StaggerItem className="calc-row">
              <EnergyIcon className="calc-row-icon" aria-hidden="true" />
              <h3 className="calc-row-title">
                Daily Energy (whole roof)
              </h3>
              <p id="daily-energy-result" key={dailyEnergyResult} className="calc-value us-nums">
                {dailyEnergyResult.toFixed(2)} kWh/day
              </p>
            </StaggerItem>
            {/* Optimal Tilt Angle */}
            <StaggerItem className="calc-row">
              <FaSolarPanel className="calc-row-icon" aria-hidden="true" />
              <h3 className="calc-row-title">Optimal Tilt Angle</h3>
              <p id="tilt-angle-result" key={tiltAngleResult} className="calc-value us-nums">
                {tiltAngleResult.toFixed(2)}°
              </p>
            </StaggerItem>
            {/* Sun Position */}
            <StaggerItem className="calc-row calc-row--wide">
              <FaCompass className="calc-row-icon" aria-hidden="true" />
              <h3 className="calc-row-title">Sun Position</h3>
              {sunPosition ? (
                <p id="sun-position-result" className="calc-value calc-value--small us-nums">
                  Azimuth: {sunPosition.azimuth.toFixed(2)}°, Elevation:{' '}
                  {sunPosition.elevation.toFixed(2)}°
                </p>
              ) : (
                <p id="sun-position-result" className="calc-value calc-value--small calc-value--idle">
                  Shown once your roof is traced
                </p>
              )}
            </StaggerItem>
          </Stagger>

          <p className="us-help calc-method">
            Irradiance is the long-term average from NASA POWER at the centre
            of your outline. Roof potential is the most the whole roof could
            hold: 80% of the roof usable at 18% panel efficiency. Your report
            sizes the system to your bill, usually far smaller. Shade is not
            modelled.
          </p>

          {/* Next step */}
          <div className="calc-next">
            <button
              className="us-btn us-btn--primary us-btn--lg calc-next-button"
              onClick={handleCalculateClick}
            >
              Continue to your bill
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            {/* Display error message if any */}
            {errorMessage && (
              <p className="us-error calc-error" role="alert">{errorMessage}</p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};

export default Calculator;
