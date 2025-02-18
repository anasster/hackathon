// src/components/ui/DrivingLicenseCard.js
import React, { useState } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import CardContent from "../ui/CardContent";
import Input from "../ui/Input";

const DrivingLicenseCard = ({ onGenerateLicense }) => {
  const [licenseData, setLicenseData] = useState({
    licenseNumber: "",
    name: "",
    surname: "",
    dateOfBirth: "",
    placeOfBirth: "",
    issuanceDate: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLicenseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateLicense = () => {
    // Generate license logic (you can modify this)
    onGenerateLicense(licenseData);
  };

  return (
    <Card className="w-full max-w-5xl p-8 bg-white rounded-3xl shadow-2xl flex flex-col items-center">
      <CardContent>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Driving License
        </h2>
        <form className="grid grid-cols-3 gap-6 w-full">
          <Input
            name="licenseNumber"
            placeholder="Enter License Number"
            value={licenseData.licenseNumber}
            onChange={handleInputChange}
            className="w-full border-b-2 border-transparent focus:border-blue-600 focus:outline-none bg-transparent py-1"
          />
          <Input
            name="name"
            placeholder="Enter Name"
            value={licenseData.name}
            onChange={handleInputChange}
            className="w-full border-b-2 border-transparent focus:border-blue-600 focus:outline-none bg-transparent py-1"
          />
          <Input
            name="surname"
            placeholder="Enter Surname"
            value={licenseData.surname}
            onChange={handleInputChange}
            className="w-full border-b-2 border-transparent focus:border-blue-600 focus:outline-none bg-transparent py-1"
          />
          <Input
            name="dateOfBirth"
            type="date"
            placeholder="Enter Date of Birth"
            value={licenseData.dateOfBirth}
            onChange={handleInputChange}
            className="w-full border-b-2 border-transparent focus:border-blue-600 focus:outline-none bg-transparent py-1"
          />
          <Input
            name="placeOfBirth"
            placeholder="Enter Place of Birth"
            value={licenseData.placeOfBirth}
            onChange={handleInputChange}
            className="w-full border-b-2 border-transparent focus:border-blue-600 focus:outline-none bg-transparent py-1"
          />
          <Input
            name="issuanceDate"
            type="date"
            placeholder="Enter Issuance Date"
            value={licenseData.issuanceDate}
            onChange={handleInputChange}
            className="w-full border-b-2 border-transparent focus:border-blue-600 focus:outline-none bg-transparent py-1"
          />
        </form>
        <Button
          type="button"
          onClick={handleGenerateLicense}
          className="mt-6 w-full bg-blue-700 text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition transform hover:scale-105"
        >
          Generate License
        </Button>
      </CardContent>
    </Card>
  );
};

export default DrivingLicenseCard;
