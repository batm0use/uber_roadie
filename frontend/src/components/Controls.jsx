import React from 'react'
import PropTypes from 'prop-types'

/**
 * Controls bar with action buttons.
 * @param {{onRefreshNearby:Function,onRefreshLocation:Function,onTriggerBreak:Function}} props
 * @returns {JSX.Element}
 */
export default function Controls({ onRefreshNearby, onRefreshLocation, onTriggerBreak, onGetDeliveries, onGetRides }){
  return (
    <div className="controls">
      <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginLeft: 8 }}>
        <button className="btn" onClick={onRefreshNearby}>Refresh Nearby</button>
        <button className="btn" onClick={onRefreshLocation}>Refresh Location</button>
        <button className="btn" onClick={onGetRides}>Get Rides</button>
        <button className="btn" onClick={onGetDeliveries}>Get Deliveries</button>
        <button className="btn" onClick={onTriggerBreak}>Trigger break</button>
      </div>
    </div>
  )
}

Controls.propTypes = {
  onRefreshNearby: PropTypes.func,
  onRefreshLocation: PropTypes.func,
  onTriggerBreak: PropTypes.func,
  onGetDeliveries: PropTypes.func,
}

