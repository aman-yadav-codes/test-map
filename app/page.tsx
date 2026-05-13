"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [details, setDetails] = useState({
    lat: "-",
    lng: "-",
    address: "-",
  });

  useEffect(() => {
    // Define the global callback for Google Maps API
    (window as any).initMap = () => {
      const google = (window as any).google;
      if (!google || !mapRef.current || !searchInputRef.current) return;

      const defaultLocation = {
        lat: 25.3176,
        lng: 82.9739
      };

      const map = new google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 13,
      });

      const marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true,
      });

      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        componentRestrictions: { country: "in" },
        fields: ["formatted_address", "geometry", "name"]
      });

      autocomplete.bindTo("bounds", map);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          return;
        }

        const location = place.geometry.location;
        map.panTo(location);
        map.setZoom(16);
        marker.setPosition(location);

        setDetails({
          lat: location.lat().toString(),
          lng: location.lng().toString(),
          address: place.formatted_address || "-",
        });
      });

      marker.addListener("dragend", () => {
        const position = marker.getPosition();
        if (!position) return;

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: position }, (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            setDetails({
              lat: position.lat().toString(),
              lng: position.lng().toString(),
              address: results[0].formatted_address,
            });
          }
        });
      });
    };

    // Load Google Maps script
    if (!(window as any).google) {
      const script = document.createElement("script");
      script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAtKsoYaqKOXMV00f9qLDAgbYYevlxAGsQ&libraries=places&callback=initMap";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      return () => {
        // Optional cleanup
        const scripts = document.head.getElementsByTagName("script");
        for (let i = 0; i < scripts.length; i++) {
          if (scripts[i].src.includes("maps.googleapis.com")) {
            document.head.removeChild(scripts[i]);
          }
        }
        delete (window as any).initMap;
      };
    } else {
      // If already loaded, just call initMap
      (window as any).initMap();
    }
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", margin: 0, padding: 0 }}>
      <div style={{
        position: "absolute",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        width: "400px"
      }}>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search location..."
          style={{
            width: "100%",
            padding: "14px 16px",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            outline: "none",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            color: "black",
            fontFamily: "Arial, sans-serif"
          }}
        />
      </div>

      <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />

      <div style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        zIndex: 10,
        background: "white",
        color: "black",
        padding: "12px",
        borderRadius: "10px",
        minWidth: "250px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
        fontFamily: "Arial, sans-serif"
      }}>
        <p style={{ margin: "5px 0", fontSize: "14px" }}><b>Latitude:</b> <span>{details.lat}</span></p>
        <p style={{ margin: "5px 0", fontSize: "14px" }}><b>Longitude:</b> <span>{details.lng}</span></p>
        <p style={{ margin: "5px 0", fontSize: "14px" }}><b>Address:</b> <span>{details.address}</span></p>
      </div>
    </div>
  );
}
