"use client";

import { useState } from "react";

export default function AddProperty() {

  const [area, setArea] = useState("");
  const [rent, setRent] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/api/properties/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        area: area,
        rent_range: rent
      })
    });

    const data = await res.json();
    console.log(data);

    alert("Property added!");

    setArea("");
    setRent("");
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">Add Property</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          className="border p-2 block"
          placeholder="Area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />

        <input
          className="border p-2 block"
          placeholder="Rent Range"
          value={rent}
          onChange={(e) => setRent(e.target.value)}
        />

        <button className="bg-blue-500 text-white px-4 py-2">
          Add Property
        </button>

      </form>

    </div>
  );
}