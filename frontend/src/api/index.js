import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";


/**
 * Send a message to the assistant backend endpoint.
 * POST /api/assistant
 * @param {string} message - user message text to send
 * @returns {Promise<any>} - backend response body (often { response: string } or plain string)
 */
export async function sendMessageToAssistant(message) {
  const res = await axios.post(`${API_BASE}/assistant`, { "message": message });
  return res.data;
}

export async function reverseGeoCoordinates(lat, lon) {
  const res = await axios.get(`${API_BASE}/reverse_geocode/${lat}/${lon}`);
  console.log(typeof res.data)
  return res.data;
}

/**
 * Send a message to the assistant backend endpoint.
 * POST /api/assistant
 * @param {string} message - user message text to send
 * @returns {Promise<any>} - backend response body (often { response: string } or plain string)
 */
export async function playTTS(message) {
    const res = await fetch(`${API_BASE}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "message": message }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.volume = 1;
    return audio.play();
  }


// Send current location to backend and receive nearby places
// Request: { lat: number, lng: number }
// Response: [{ id, lat, lng, name }, ...]
/**
 * POST /api/nearby_places
 * Request body: { lat: number, lng: number }
 *   - lat: latitude of the user's current location
 *   - lng: longitude of the user's current location
 * Response (frontend expectation): Array of nearby places, each with coordinates and a name. Preferred shape:
 *   - [{ id, lat, lng, name }, ...]
 * Example request body: { "lat": 51.9995, "lng": 4.3625 }
 * Example response: [ { "id": 101, "lat": 51.9996, "lng": 4.3626, "name": "Demo Spot" } ]
 */
/**
 * Send current coordinates to the backend and receive nearby places.
 * POST /api/nearby_places
 * @param {{lat:number,lng:number}} location - user's current coordinates
 * @returns {Promise<Array>} - array of places (preferred shape: [{ id, lat, lng, name }, ...])
 */
export async function sendNearbyPlacesRequest(location){
  const res = await axios.post(`${API_BASE}/nearby_places`, location)
  return res.data
}

/**
 * Fetch the leaderboard from the backend.
 * GET /api/leaderboard
 * @returns {Promise<Array<{id:number,name:string,score:number}>>}
 */
export async function getLeaderboard() {
  const res = await axios.get(`${API_BASE}/leaderboard`);
  return res.data;
}
export async function getLeaderboardSummary(userId) {
  const response = await fetch(`${API_BASE}/leaderboard-summary/${userId}`)
  if (!response.ok) throw new Error('Failed to fetch leaderboard summary')
  return await response.json()
}

/**
 * POST /api/deliveries
 * Request body: { lat: number, lng: number }
 * Response: Array of delivery objects with fields:
 *   { id, name, eta_food, eta_arrive, lat_pickup, lng_pickup, lat_drop, lng_drop, extra_info }
 */
export async function sendDeliveriesRequest(location){
  const res = await axios.post(`${API_BASE}/deliveries`, location)
  return res.data
}

export async function sendRidesRequest(location){
  const res = await axios.post(`${API_BASE}/rides`, location)
  return res.data
}

/**
 * POST a plain time string to /api/time. Backend expects { message: string }
 * where message is HHMM (e.g. '1730').
 */
export async function postTimeString(timeString){
  const res = await fetch(`${API_BASE}/time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: timeString })
  })
  return await res.json()
}

export default {
  sendMessageToAssistant,
  sendNearbyPlacesRequest,
  getLeaderboard,
  sendDeliveriesRequest,
    sendRidesRequest,
    playTTS,
    reverseGeoCoordinates,
  getLeaderboardSummary,
  postTimeString
};
