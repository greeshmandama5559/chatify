import { useEffect, useState } from "react";

function LocationComponent() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        // Example: call a reverse geocoding API
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        setLocation(data.address.city + ", " + data.address.state);
      });
    }
  }, []);

  return <div>Your location: {location}</div>;
}

export default LocationComponent;
