import React, { useState } from "react";
import { toast } from "react-toastify";

interface GeoLocation {
  type: "Point";
  coordinates: [number, number];
}

interface LocationFormProps {
  formData: { geoLocation: GeoLocation };
  errors: { [key: string]: string };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const LocationForm: React.FC<LocationFormProps> = ({
  formData,
  errors,
  setFormData,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [address, setAddress] = useState("");

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await res.json();

          const a = data.address;
          const fullAddress = [
            a.house_number,
            a.road,
            a.suburb || a.neighbourhood,
            a.village || a.town || a.city_district,
            a.city || a.town || a.county,
            a.state_district || a.state,
            a.postcode,
            a.country,
          ]
            .filter(Boolean)
            .join(", ");

          setAddress(fullAddress || "Address not available");

          const geoLocation: GeoLocation = {
            type: "Point",
            coordinates: [longitude, latitude],
          };

          setFormData((prev: any) => ({ ...prev, geoLocation }));
          setShowPreview(true);
        } catch {
          toast.error("Failed to fetch address");
        }
      },
      () => {
        toast.error("Location access denied");
      }
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Gym Location</h2>

      <button
        type="button"
        onClick={getCurrentLocation}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
      >
        Use My Current Location
      </button>

      {errors.geoLocation && (
        <p className="text-red-400">{errors.geoLocation}</p>
      )}

      {showPreview && (
        <div className="bg-gray-700 p-4 rounded-lg text-sm text-gray-300 space-y-2">
          <p><strong>Address:</strong> {address}</p>
          <p><strong>Coordinates:</strong> {formData.geoLocation.coordinates[1].toFixed(6)}, {formData.geoLocation.coordinates[0].toFixed(6)}</p>
        </div>
      )}
    </div>
  );
};

export default LocationForm;