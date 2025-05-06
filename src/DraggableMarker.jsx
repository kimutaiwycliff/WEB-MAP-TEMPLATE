import { useCallback, useState } from 'react';
import { Marker } from 'react-map-gl/maplibre';
import { ICON, pinStyle } from '../public/constants';

const DraggableMarker = () => {
  const [marker, setMarker] = useState({
    latitude: 40,
    longitude: -100,
  });
  const [events, logEvents] = useState({});

  const onMarkerDragStart = useCallback((event) => {
    logEvents((_events) => ({ ..._events, onDragStart: event.lngLat }));
  }, []);

  const onMarkerDrag = useCallback((event) => {
    logEvents((_events) => ({ ..._events, onDrag: event.lngLat }));

    setMarker({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
    });
  }, []);

  const onMarkerDragEnd = useCallback((event) => {
    logEvents((_events) => ({ ..._events, onDragEnd: event.lngLat }));
  }, []);

  return (
    <Marker
      longitude={marker.longitude}
      latitude={marker.latitude}
      anchor="bottom"
      draggable
      onDragStart={onMarkerDragStart}
      onDrag={onMarkerDrag}
      onDragEnd={onMarkerDragEnd}
    >
      <Pin size={20} />
    </Marker>
  );
};

const Pin = (props) => {
  const {size = 20} = props;
  return (
    <svg height={size} viewBox="0 0 24 24" style={pinStyle}>
    <path d={ICON} />
  </svg>
  )
}
export default DraggableMarker;
