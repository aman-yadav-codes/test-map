"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    initMap: () => void;
    google: any;
  }
}

export default function Home() {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [details, setDetails] = useState({
    lat: "-",
    lng: "-",
    address: "-",
    country: "-",
    state: "-",
    city: "-",
    area: "-",
    pincode: "-",
  });

  useEffect(() => {
    window.initMap = () => {
      const google = window.google;

      if (!google || !mapRef.current || !searchInputRef.current) return;

      const defaultLocation = {
        lat: 25.3176,
        lng: 82.9739,
      };

      const map = new google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 13,
      });

      const marker = new google.maps.Marker({
        position: defaultLocation,
        map,
        draggable: true,
      });

      const geocoder = new google.maps.Geocoder();

      // Function to update location details
      const updateLocationDetails = (
        position: any
      ) => {
        geocoder.geocode(
          { location: position },
          (results: any, status: any) => {
            if (status === "OK" && results[0]) {
              const components = results[0].address_components;

              const getComponent = (type: string) => {
                const comp = components.find((c: any) =>
                  c.types.includes(type)
                );
                return comp ? comp.long_name : "-";
              };

              const lat =
                typeof position.lat === "function"
                  ? position.lat()
                  : position.lat;

              const lng =
                typeof position.lng === "function"
                  ? position.lng()
                  : position.lng;

              setDetails({
                lat: lat.toString(),
                lng: lng.toString(),
                address: results[0].formatted_address || "-",

                country: getComponent("country"),

                state: getComponent(
                  "administrative_area_level_1"
                ),

                city:
                  getComponent("locality") ||
                  getComponent(
                    "administrative_area_level_2"
                  ),

                area:
                  getComponent("sublocality") ||
                  getComponent("neighborhood") ||
                  getComponent("route"),

                pincode: getComponent("postal_code"),
              });
            }
          }
        );
      };

      // Initial location data
      updateLocationDetails(defaultLocation);

      // Search autocomplete
      const autocomplete = new google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          componentRestrictions: { country: "in" },
          fields: [
            "formatted_address",
            "geometry",
            "name",
          ],
        }
      );

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

        updateLocationDetails(location);
      });

      // Marker drag event
      marker.addListener("dragend", () => {
        const position = marker.getPosition();

        if (!position) return;

        updateLocationDetails(position);
      });

      // Click on map
      map.addListener("click", (event: any) => {
        const clickedLocation = event.latLng;

        marker.setPosition(clickedLocation);

        updateLocationDetails(clickedLocation);
      });
    };

    // Load script
    if (!window.google) {
      const script = document.createElement("script");

      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyAtKsoYaqKOXMV00f9qLDAgbYYevlxAGsQ&libraries=places&callback=initMap";

      script.async = true;
      script.defer = true;

      document.head.appendChild(script);

      return () => {
        (window as any).initMap = undefined;
      };
    } else {
      window.initMap();
    }
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Search Box */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          width: "420px",
          maxWidth: "90%",
        }}
      >
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search location..."
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: "12px",
            border: "none",
            outline: "none",
            fontSize: "16px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            color: "#000",
            background: "#fff",
          }}
        />
      </div>

      {/* Map */}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {/* Details Card */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          zIndex: 10,
          background: "#ffffff",
          color: "#000",
          padding: "18px",
          borderRadius: "14px",
          minWidth: "320px",
          maxWidth: "90%",
          boxShadow: "0 4px 18px rgba(0,0,0,0.2)",
          fontFamily: "Arial",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: 12,
            fontSize: "18px",
          }}
        >
          Location Details
        </h3>

        <p><b>Latitude:</b> {details.lat}</p>

        <p><b>Longitude:</b> {details.lng}</p>

        <p><b>Country:</b> {details.country}</p>

        <p><b>State:</b> {details.state}</p>

        <p><b>City:</b> {details.city}</p>

        <p><b>Area:</b> {details.area}</p>

        <p><b>Pincode:</b> {details.pincode}</p>

        <p>
          <b>Address:</b> {details.address}
        </p>
      </div>
    </div>
  );
}