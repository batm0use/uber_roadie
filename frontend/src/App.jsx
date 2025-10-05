import React, { useState, useEffect } from 'react'
import MapView from './components/MapView'
import Assistant from './components/Assistant'
import Leaderboard from './components/Leaderboard'
import Controls from './components/Controls'
import Notifications from './components/Notifications'

import Carousel from './components/Carousel'
import CarouselRides from './components/CarouselRides'
import api, {playTTS} from './api'
import logo from './components/uber_assistant_logo.png'


const DEFAULT_LOCATION = { lat: 51.9995, lng: 4.3625 } // Delft
const BREAK_MESSAGE = "Hey, we noticed you have been working hard! Would you like to take a short break?"
// Configurable timings (change these values as needed)
const NOTIFICATION_WAIT_MS = 6000 // default notification auto-dismiss in milliseconds (6s)
const BREAK_INTERVAL_MS = 5 * 60 * 1000 // auto-trigger break every 5 minutes

/**
 * Try to get the user's current location from the browser Geolocation API.
 * Returns a Promise that resolves with an object { lat, lng } on success.
 * Rejects with an Error when geolocation is unavailable or the request times out.
 * @param {number} [timeout=5000] - milliseconds before the request is considered failed
 * @returns {Promise<{lat:number,lng:number}>}
 */
function getBrowserLocation(timeout = 5000){
  if (!navigator?.geolocation) return Promise.reject(new Error('Geolocation not available'))

  return new Promise((resolve, reject) => {
    const onSuccess = (pos) => {
      clearTimeout(timer)
      resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    }

    const onError = (err) => {
      clearTimeout(timer)
      reject(err)
    }

    const timer = setTimeout(() => onError(new Error('Geolocation timeout')), timeout)
    navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: true, maximumAge: 10000, timeout })
  })
}

export default function App(){
  const [myLocation, setMyLocation] = useState(null)
  const [nearby, setNearby] = useState([])
  const [deliveries, setDeliveries] = useState([])
  const [rides, setRides] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [selectedRide, setSelectedRide] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pickupAddress, setPickupAddress] = useState("Loading...")
  const [dropAddress, setDropAddress] = useState("Loading...");
  // loading state is not currently used in UI; keep internal lifecycle handling
  const [summary, setSummary] = useState([])
  const [preferredReturnTime, setPreferredReturnTime] = useState('')
  const [savingTime, setSavingTime] = useState(false)
  // splash screen state
  const [showSplash, setShowSplash] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1000) // show 1s then hide
    return () => clearTimeout(t)
  }, [])


  useEffect(() => {
    if (!selectedDelivery) return;

    async function fetchAddress() {
        setPickupAddress("Loading...");
        setDropAddress("Loading...");
      try {
        const data = await api.reverseGeoCoordinates(
          selectedDelivery.lat_pickup,
          selectedDelivery.lng_pickup
        );
        setPickupAddress(data || "Unknown location");
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data2 = await api.reverseGeoCoordinates(
          selectedDelivery.lat_drop,
          selectedDelivery.lng_drop
        );
        setDropAddress(data2 || "Unknown location");
      } catch (err) {
        console.error(err);
        setPickupAddress("Error fetching address");
        setDropAddress("Error fetching address");
      }
    }

    fetchAddress();
  }, [selectedDelivery]);

  useEffect(() => {
    if (!selectedRide) return;

    async function fetchAddress() {
        setPickupAddress("Loading...");
        setDropAddress("Loading...");
      try {
        const data = await api.reverseGeoCoordinates(
          selectedRide.lat_pickup,
          selectedRide.lng_pickup
        );
        setPickupAddress(data || "Unknown location");
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data2 = await api.reverseGeoCoordinates(
          selectedRide.lat_drop,
          selectedRide.lng_drop
        );
        setDropAddress(data2 || "Unknown location");
      } catch (err) {
        console.error(err);
        setPickupAddress("Error fetching address");
        setDropAddress("Error fetching address");
      }
    }

    fetchAddress();
  }, [selectedRide]);
useEffect(() => {
  let mounted = true

  async function determineInitialLocation() {
    try {
      const location = await getBrowserLocation(5000)
      return location
    } catch (err) {
      console.warn('Browser geolocation failed — using default location', err)
    }
    return DEFAULT_LOCATION
  }

  async function fetchSummary() {
    try {
      const userId = 'E10000' // Replace with actual logic
      const data = await api.getLeaderboardSummary(userId)
      if (mounted) setSummary(data)
    } catch (e) {
      console.error('Failed to fetch leaderboard summary', e)
    }
  }

  async function init() {
    try {
      const location = await determineInitialLocation()
      await fetchSummary()
      if (!mounted) return
      setMyLocation(location)

      const lb = await api.getLeaderboard()
      if (mounted) setLeaderboard(Array.isArray(lb) ? lb : [])
    } catch (e) {
      console.error('Failed to initialize app data', e)
      if (mounted) setMyLocation(DEFAULT_LOCATION)
    }
  }

  init()

  return () => {
    mounted = false
  }
}, [])

  // Auto-trigger break confirmation every BREAK_INTERVAL_MS
  useEffect(() => {
    const id = setInterval(() => {
      // open confirmation modal periodically
      setConfirmOpen(true)
    }, BREAK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  /**
   * Fetch nearby places for the current `myLocation` by POSTing to the backend.
   * On success updates `nearby` state and shows a notification.
   * If there is no known `myLocation`, this function is a no-op.
   * @returns {Promise<void>}
   */
  async function refreshNearby(){
    if(!myLocation) return
    try{
      const places = await api.sendNearbyPlacesRequest(myLocation)
      setNearby(Array.isArray(places) ? places.map(p => ({ id: p.id, lat: p.lat ?? p.y ?? p[1], lng: p.lng ?? p.x ?? p[0], name: p.name })) : [])
      showNotification('Nearby updated', `Found ${places.length} places near you`)
    }catch(e){
      console.warn('Refresh nearby failed', e)
      showNotification('Nearby failed', 'Could not fetch nearby places')
    }
  }

  /**
   * Fetch delivery options from backend for current location.
   */
  async function fetchDeliveries(){
    if(!myLocation) return
      setDeliveries([])
      setRides([])
      setSelectedDelivery(null)
      setSelectedRide(null)
    try{
      const list = await api.sendDeliveriesRequest(myLocation)
      setDeliveries(Array.isArray(list) ? list : [])
      // Show the result in the chat area as a message containing the carousel
      showNotification('Deliveries', `Found ${list.length} delivery options`)
    }catch(e){
      console.warn('Fetch deliveries failed', e)
      showNotification('Deliveries failed', 'Could not fetch deliveries')
    }
  }

  async function fetchRides(){
    if(!myLocation) return
      setDeliveries([])
      setRides([])
      setSelectedDelivery(null)
      setSelectedRide(null)
    try{
      const list = await api.sendRidesRequest(myLocation)
      setRides(Array.isArray(list) ? list : [])
      // Show the result in the chat area as a message containing the carousel
      showNotification('Rides', `Found ${list.length} ride options`)
    }catch(e){
      console.warn('Fetch rides failed', e)
      showNotification('Rides failed', 'Could not fetch rides')
    }
  }

  /**
   * Re-run browser geolocation to refresh `myLocation` and show a notification.
   * @returns {Promise<void>}
   */
  async function refreshLocation(){
    try{
      const loc = await getBrowserLocation(5000)
      setMyLocation(loc)
      showNotification('Location updated', `Lat ${loc.lat.toFixed(4)}, Lng ${loc.lng.toFixed(4)}`)
    }catch(e){
      console.warn('Refresh location failed', e)
      showNotification('Location failed', 'Could not update location')
    }
  }

  /**
   * Open the 'take a break' confirmation modal.
   * If the user confirms, it triggers refreshNearby().
   */
  function triggerBreak(){
    setConfirmOpen(true);
    playTTS(BREAK_MESSAGE).then();
  }

  /**
   * Called when the confirmation modal is answered.
   * @param {boolean} confirmed - true if user clicked Yes, false if No
   */
  function handleConfirm(confirmed){
    setConfirmOpen(false)
    if(confirmed){
      refreshNearby()
    }
  }

  /**
   * Push a new notification into the notifications list.
   * @param {{title:string,message:string}} item - notification payload
   * @returns {string} id - unique id for the created notification
   */
  function pushNotification(item){
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`
    setNotifications(prev => [...prev, { id, ...item }])
    // schedule auto-dismiss
    setTimeout(() => {
      closeNotification(id)
    }, NOTIFICATION_WAIT_MS)
    return id
  }

  /**
   * Convenience wrapper to push a simple title/message notification.
   * @param {string} title
   * @param {string} message
   */
  function showNotification(title, message){
    pushNotification({ title, message })
  }

  /**
   * Remove a notification by id.
   * @param {string} id
   */
  function closeNotification(id){
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="app-root dark">
      {/* Splash overlay */}
      <div className={`splash ${showSplash ? 'visible' : 'hidden'}`}>
        <img src={logo} alt="logo" className="splash-logo" />
      </div>
      <aside className="sidebar">
        <h2>Your Progress</h2>
        <Leaderboard summary={summary} />
        <div style={{ marginTop: 20 }}>
    <label htmlFor="return-time" style={{ display: 'block', marginBottom: 6 }}>
      Preferred return time:
    </label>
    <input
      id="return-time"
      type="text"
      value={preferredReturnTime}
      onChange={(e) => setPreferredReturnTime(e.target.value)}
      placeholder="e.g. 17:30"
      style={{
        width: '100%',
        padding: '6px 10px',
        borderRadius: 4,
        border: '1px solid #ccc',
        backgroundColor: '#1e1e1e',
        color: '#fff'
      }}
    />
        <div style={{ marginTop: 8 }}>
          <button className="btn" disabled={savingTime} onClick={async () => {
            // Accept HHMM (e.g. 1730) or HH:MM (e.g. 17:30). Normalize to HHMM.
            const raw = preferredReturnTime.trim()
            let hhmm = raw
            // If format HH:MM -> remove colon
            if (/^[0-2]?\d:[0-5]\d$/.test(raw)) {
              hhmm = raw.replace(':', '')
            }
            // If 3-digit like '930' -> pad to '0930'
            if (/^\d{3}$/.test(hhmm)) hhmm = '0' + hhmm
            // Validate final HHMM
            if (!/^[0-2]?\d[0-5]\d$/.test(hhmm)) {
              showNotification('Invalid time', 'Please enter time in HHMM or HH:MM format')
              return
            }

            setSavingTime(true)
            try {
              // Send plain string to /api/time as { message: hhmm }
              await api.postTimeString(hhmm)
              showNotification('Saved', `Time sent: ${hhmm}`)
            } catch (e) {
              console.error(e)
              showNotification('Save failed', 'Could not send time to server')
            } finally {
              setSavingTime(false)
            }
          }}>Set time</button>
        </div>
  </div>


      </aside>

      <div className="topbar">
    <h1>Uber Roadie</h1>
  <Controls onRefreshNearby={refreshNearby} onRefreshLocation={refreshLocation} onTriggerBreak={triggerBreak} onGetDeliveries={fetchDeliveries} onGetRides={fetchRides}/>
      </div>

      <div className="main">
          <div className="map-area">
          <MapView myLocation={myLocation} points={nearby} selectedDelivery={selectedDelivery} selectedRide={selectedRide} />
        </div>
      </div>

      <div className="assistant-area">
        <Assistant extraContent={deliveries && deliveries.length > 0 ? (
          <>
            <div className="msg assistant full-width">
              <div className="msg-text">
                <Carousel items={deliveries} selectedId={selectedDelivery?.id} onSelect={(it) => setSelectedDelivery(it)} />
              </div>
            </div>

            {selectedDelivery && (
              <div className="msg assistant full-width" style={{ marginTop: 8 }}>
                <div className="msg-text">
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{selectedDelivery.name} — selected</div>
                  <div>Pickup: {pickupAddress}</div>
                  <div>Drop: {dropAddress}</div>
                  <div style={{ marginTop: 8, fontSize: 13, color: '#cfe9d6' }}>{selectedDelivery.extra_info}</div>
                </div>
              </div>
            )}
          </>
        ) : null}
        extraContentRides={rides && rides.length > 0 ? (
          <>
            <div className="msg assistant full-width">
              <div className="msg-text">
                <CarouselRides items={rides} selectedId={selectedRide?.id} onSelect={(it) => setSelectedRide(it)} />
              </div>
            </div>

            {selectedRide && (
              <div className="msg assistant full-width" style={{ marginTop: 8 }}>
                <div className="msg-text">
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{selectedRide.name} — selected</div>
                  <div>Pickup: {pickupAddress}</div>
                  <div>Drop: {dropAddress}</div>
                  <div style={{ marginTop: 8, fontSize: 13, color: '#cfe9d6' }}>{selectedRide.extra_info}</div>
                </div>
              </div>
            )}
          </>
        ) : null}/>
      </div>
      <Notifications items={notifications} onClose={closeNotification} />

      {confirmOpen && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div className="confirm-title">{BREAK_MESSAGE}</div>
            <div className="confirm-actions">
              <button className="btn" onClick={() => handleConfirm(true)}>Yes</button>
              <button className="btn" onClick={() => handleConfirm(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
