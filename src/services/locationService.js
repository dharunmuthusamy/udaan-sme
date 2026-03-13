/**
 * Helper to get the user's current location using the browser's Geolocation API.
 * @returns {Promise<{ latitude: number, longitude: number }>}
 */
export async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message = 'Failed to get location.';
        if (error.code === 1) message = 'Location access denied. Please enter location manually.';
        else if (error.code === 2) message = 'Location unavailable.';
        else if (error.code === 3) message = 'Location request timed out.';
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

/**
 * Reverse geocode latitude and longitude to a human-readable address using Nominatim API.
 * @param {number} lat 
 * @param {number} lon 
 * @returns {Promise<string>}
 */
export async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch address.');
    }

    const data = await response.json();
    
    // Construct a sensible address from the components
    if (data && data.address) {
      const { road, suburb, city_district, city, town, village, state, postcode } = data.address;
      
      const parts = [
        road,
        suburb || city_district,
        city || town || village,
        state,
        postcode
      ].filter(Boolean); // Remove null/undefined/empty string parts
      
      return parts.join(', ');
    }
    
    return data.display_name || 'Unknown Location';
  } catch (error) {
    console.error('Reverse Geocoding Error:', error);
    throw new Error('Could not resolve address from coordinates.');
  }
}
