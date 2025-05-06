import { useRef, useState } from 'react';
import Map, {
  FullscreenControl,
  GeolocateControl,
  Layer,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
} from 'react-map-gl/maplibre';
import ControlPanel, { BasemapSwitcher } from './ControlPanel';
import {
  clusterLayer,
  clusterCountLayer,
  unclusteredPointLayer,
} from './Layers';
import { useCallback } from 'react';
import { getMagnitudeColor, formatDate } from './utils';
import { BASEMAPS, initialViewState } from '../public/constants';
import DraggableMarker from './DraggableMarker';

const App = () => {
  const mapRef = useRef();
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [currentBasemap, setCurrentBasemap] = useState(BASEMAPS[0]);
  const [cursor, setCursor] = useState('auto');

  const onSelectCity = useCallback(({ longitude, latitude }) => {
    mapRef.current?.flyTo({
      center: [longitude, latitude],
      duration: 1500,
      zoom: 12,
    });
  }, []);
  // Handle click events
  const onClick = useCallback(async (event) => {
    const feature = event.features?.[0];
    if (!feature) {
      setSelectedPoint(null);
      return;
    }

    // If it's a cluster
    if (feature.properties?.cluster_id) {
      const clusterId = feature.properties.cluster_id;
      const geojsonSource = mapRef.current.getSource('earthquakes');
      const zoom = await geojsonSource.getClusterExpansionZoom(clusterId);

      mapRef.current.easeTo({
        center: feature.geometry.coordinates,
        zoom,
        duration: 500,
      });
      setSelectedPoint(null);
    }
    // If it's an unclustered point
    else {
      setSelectedPoint({
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
        properties: feature.properties,
      });
    }
  }, []);

  // Handle hover events
  const onHover = useCallback((event) => {
    const feature = event.features?.[0];
    if (!feature || feature.properties?.cluster_id) {
      setHoveredPoint(null);
      return;
    }

    setHoveredPoint({
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1],
      properties: feature.properties,
    });
    setCursor('pointer');
  }, []);

  // Clear hover when mouse leaves the map
  const onMouseLeave = useCallback(() => {
    setHoveredPoint(null);
    setCursor('auto');
  }, []);

  return (
    <>
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={currentBasemap.url}
        interactiveLayerIds={[clusterLayer.id, unclusteredPointLayer.id]}
        onClick={onClick}
        onMouseMove={onHover}
        onMouseLeave={onMouseLeave}
        cursor={cursor}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />

        <Source
          id="earthquakes"
          type="geojson"
          data="https://maplibre.org/maplibre-gl-js/docs/assets/earthquakes.geojson"
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {/* Click Popup (persistent until closed) */}
        {selectedPoint && (
          <Popup
            longitude={selectedPoint.longitude}
            latitude={selectedPoint.latitude}
            onClose={() => setSelectedPoint(null)}
            anchor="bottom"
            offset={25}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="popup-container popup-click">
              <div
                className="popup-header"
                style={{
                  background: `linear-gradient(135deg, #6b73ff 0%, #000dff 100%)`,
                }}
              >
                <span
                  className="magnitude-indicator"
                  style={{
                    backgroundColor: getMagnitudeColor(
                      selectedPoint.properties.mag
                    ),
                  }}
                />
                Earthquake Details
              </div>
              <div className="popup-content">
                <div className="popup-row">
                  <span className="popup-label">Magnitude:</span>
                  <span className="popup-value">
                    {selectedPoint.properties.mag || 'N/A'}
                  </span>
                </div>
                <div className="popup-row">
                  <span className="popup-label">Time:</span>
                  <span className="popup-value">
                    {formatDate(selectedPoint.properties.time)}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        )}

        {/* Hover Popup (temporary) */}
        {hoveredPoint && !selectedPoint && (
          <Popup
            longitude={hoveredPoint.longitude}
            latitude={hoveredPoint.latitude}
            anchor="bottom"
            offset={15}
            closeButton={false}
            closeOnClick={false}
            closeOnMove={true}
          >
            <div className="popup-container popup-hover">
              <div className="popup-content">
                <div className="popup-row">
                  <span
                    className="magnitude-indicator"
                    style={{
                      backgroundColor: getMagnitudeColor(
                        hoveredPoint.properties.mag
                      ),
                    }}
                  />
                  <span className="popup-value">
                    Mag: {hoveredPoint.properties.mag || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        )}

        <DraggableMarker />
      </Map>
      <ControlPanel onSelectCity={onSelectCity} />
      <BasemapSwitcher
        basemaps={BASEMAPS}
        currentBasemap={currentBasemap}
        setCurrentBasemap={setCurrentBasemap}
      />
    </>
  );
};
export default App;
