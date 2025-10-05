import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { MapContainer, TileLayer, Popup, useMap, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const DELFT_CENTER = [51.9995, 4.3625]

/**
 * Helper component that instructs the leaflet map to fly to a given location.
 * @param {{location:{lat:number,lng:number}}} props
 * @returns {null}
 */
function FlyToLocation({ location }){
  const map = useMap()

  useEffect(() => {
    if (!location || !map) return
    const { lat, lng } = location
    map.flyTo([lat, lng], 15, { duration: 0.8 })
  }, [location, map])

  return null
}

FlyToLocation.propTypes = {
  location: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
}

/**
 * MapView component - renders a Leaflet map, markers for nearby points and the user's location.
 * @param {{myLocation:{lat:number,lng:number}, points:Array<{id:number,lat:number,lng:number,name:string}>}} props
 * @returns {JSX.Element}
 */
export default function MapView({ myLocation, points, selectedDelivery, selectedRide }){
  const center = myLocation ? [myLocation.lat, myLocation.lng] : DELFT_CENTER

  const renderPoints = points?.length ? points : []

  return (
    <div className="map-wrapper">
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {renderPoints.map(p => (
          <CircleMarker key={p.id} center={[p.lat, p.lng]} radius={8} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.85 }}>
            <Popup>{p.name}</Popup>
          </CircleMarker>
        ))}

        {myLocation && (
          <CircleMarker center={[myLocation.lat, myLocation.lng]} radius={10} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.95 }}>
            <Popup>Your location</Popup>
          </CircleMarker>
        )}

        {/* Selected delivery pickup/drop markers */}
        {selectedDelivery && (
          <>
            <CircleMarker center={[selectedDelivery.lat_pickup, selectedDelivery.lng_pickup]} radius={8} pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.95 }}>
              <Popup>Pickup: {selectedDelivery.name}</Popup>
            </CircleMarker>
            <CircleMarker center={[selectedDelivery.lat_drop, selectedDelivery.lng_drop]} radius={8} pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.95 }}>
              <Popup>Drop: {selectedDelivery.name}</Popup>
            </CircleMarker>
          </>
        )}

        {selectedRide && (
          <>
            <CircleMarker center={[selectedRide.lat_pickup, selectedRide.lng_pickup]} radius={8} pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.95 }}>
              <Popup>Pickup: {selectedRide.name}</Popup>
            </CircleMarker>
            <CircleMarker center={[selectedRide.lat_drop, selectedRide.lng_drop]} radius={8} pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.95 }}>
              <Popup>Drop: {selectedRide.name}</Popup>
            </CircleMarker>
          </>
        )}

        {/* Fly to user's location by default */}
        <FlyToLocation location={myLocation} />

        {/* When a delivery is selected, fly to the pickup location */}
        {selectedDelivery && (
          <FlyToLocation location={{ lat: selectedDelivery.lat_pickup, lng: selectedDelivery.lng_pickup }} />
        )}

        {selectedRide && (
          <FlyToLocation location={{ lat: selectedRide.lat_pickup, lng: selectedRide.lng_pickup }} />
        )}
      </MapContainer>
    </div>
  )
}

MapView.propTypes = {
  myLocation: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  points: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), lat: PropTypes.number, lng: PropTypes.number, name: PropTypes.string })),
  selectedDelivery: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), name: PropTypes.string, eta_food: PropTypes.number, eta_arrive: PropTypes.number, lat_pickup: PropTypes.number, lng_pickup: PropTypes.number, lat_drop: PropTypes.number, lng_drop: PropTypes.number, extra_info: PropTypes.string }),
  selectedRide: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), name: PropTypes.string, eta_food: PropTypes.number, green: PropTypes.bool, red: PropTypes.bool, lat_pickup: PropTypes.number, lng_pickup: PropTypes.number, lat_drop: PropTypes.number, lng_drop: PropTypes.number, extra_info: PropTypes.string }),
}

MapView.defaultProps = {
  myLocation: null,
  points: null,
  selectedDelivery: null,
  selectedRide: null,
}
