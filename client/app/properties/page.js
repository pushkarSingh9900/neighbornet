"use client";

import { useEffect, useState } from "react";
import PropertyCard from "../../components/PropertyCard";

export default function Properties() {

  const [properties, setProperties] = useState([]);

  useEffect(() => {

    fetch("http://127.0.0.1:8000/api/properties")
      .then(res => res.json())
      .then(data => setProperties(data));

  }, []);

  return (

    <div>

      <h1 className="text-3xl font-bold mb-6">
        Browse Properties
      </h1>

      <div className="grid grid-cols-3 gap-6">

        {properties.map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}

      </div>

    </div>

  );

}