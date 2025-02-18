import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js"; // Import Tesseract.js
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import CardContent from "./components/ui/CardContent";
import Input from "./components/ui/Input";
import Navbar from "./components/ui/NavBar";

const DigitalIdentityApp = () => {
  const [identity, setIdentity] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    surname: "",
    fathersName: "",
    mothersName: "",
    dateOfBirth: "",
    placeOfBirth: "",
    issuanceOffice: "",
    idNumber: "",
    datePublish: "",
  });
  const [showLicenseCard, setShowLicenseCard] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showConnectedWarning, setConnectedWarning] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Add loading state

  useEffect(() => {
    setWalletAddress(null);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (window.keplr) {
        window.keplr.disable();
        console.log("Wallet disconnected");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Function to extract text from the image using Tesseract.js
  const extractTextFromImage = async (file) => {
    setIsProcessing(true); // Start loading
    try {
      const result = await Tesseract.recognize(
        file,
        "eng+ell", // Try English and Greek languages
        {
          logger: (m) => console.log(m), // Log progress
        }
      );
  
      const extractedText = result.data.text;
      console.log("Extracted Text:", extractedText);
  
      // Parse the extracted text to populate userData
      parseExtractedText(extractedText);
    } catch (error) {
      console.error("Error extracting text:", error);
    } finally {
      setIsProcessing(false); // Stop loading
    }
  };
  

  // Function to parse extracted text and populate userData
  const parseExtractedText = (text) => {
    // Example parsing logic (customize based on your image format)
    const lines = text.split("\n");

    const parsedData = {
      name: extractValue(lines, "Name"),
      surname: extractValue(lines, "Surname"),
      fathersName: extractValue(lines, "Father's Name"),
      mothersName: extractValue(lines, "Mother's Name"),
      dateOfBirth: extractValue(lines, "Date of Birth"),
      placeOfBirth: extractValue(lines, "Place of Birth"),
      issuanceOffice: extractValue(lines, "Issuance Office"),
      idNumber: extractValue(lines, "IdNumber"),
      datePublish: extractValue(lines, "datePublish"),
    };

    setUserData(parsedData);
  };

  // Helper function to extract values based on keywords
  const extractValue = (lines, keyword) => {
    const line = lines.find((line) => line.toLowerCase().includes(keyword.toLowerCase()));
    return line ? line.split(":")[1].trim() : "";
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg"];
      if (allowedTypes.includes(file.type)) {
        setUploadedImage(file);
        console.log("Image uploaded:", file.name);
      } else {
        alert("Invalid file type. Please upload a PNG or JPEG image.");
      }
    }
  };

  const handleGenerateIdentity = () => {
    // Check if the wallet is connected
    if (!walletAddress) {
      setConnectedWarning(true); // Show the warning message
      setTimeout(() => setConnectedWarning(false), 3000); // Hide warning after 3 seconds
      return; // Prevent identity generation if wallet is not connected
    }
  
    // Check if any user data field is filled
    const isAnyFieldChanged = Object.values(userData).some((value) => value !== "");
  
    if (!isAnyFieldChanged) {
      setShowWarning(true); // Show warning if no user data is filled
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }
  
    // Proceed with identity generation
    setIdentity({
      ...userData,
      blockchainProof: "0x123abc456def",
      uploadedImage: uploadedImage ? URL.createObjectURL(uploadedImage) : null,
    });
  };

  const handleClickPlus = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleInsertLicense = () => {
    setShowLicenseCard(!showLicenseCard);
    setIsDropdownOpen(false);
  };

  const handleConnectWallet = async () => {
    if (window.keplr) {
      try {
        await window.keplr.enable("nillion-chain-testnet-1");
        const offlineSigner = window.keplr.getOfflineSigner("nillion-chain-testnet-1");
        const accounts = await offlineSigner.getAccounts();
        setWalletAddress(accounts[0].address);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert("Please install Keplr Wallet!");
    }
  };

  const handleInsertSmallPaper = () => {
    console.log("Insert Small Paper functionality");
  };

  return (
    <div className="flex flex-col min-h-screen" style={{
          backgroundImage: "url(/nillion-wave-img.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
      <Navbar
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
        onInsertSmallPaper={handleInsertSmallPaper}
      />

      <div className="flex flex-col items-center justify-center flex-grow p-6">

        {walletAddress && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded-lg shadow-md text-gray-900">
            <strong>Connected Wallet:</strong> <span className="text-green-700">{walletAddress}</span>
          </div>
        )}

        {showConnectedWarning && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg shadow-md">
         You have to connect your wallet first to create identity.
        </div>
         
        )}

        {/* Show Upload Card if userData is empty */}
        {Object.values(userData).every((value) => value === "") ? (
          <Card className="w-full max-w-5xl p-8 bg-white rounded-3xl shadow-2xl flex flex-col items-center">
            <CardContent>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
                Upload Identity Image
              </h2>

              <div className="mt-4 flex flex-col items-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex items-center space-x-2">
                    <span>📤 Upload Identity Image</span>
                  </div>
                </label>
                <input id="file-upload" type="file" accept=".png, .jpeg, .jpg" onChange={handleImageUpload} className="hidden" />
                {uploadedImage && <p className="mt-2 text-sm text-gray-500">Uploaded: {uploadedImage.name}</p>}
              </div>

              {/* Display the uploaded image */}
              {uploadedImage && (
                <div className="mt-6">
                  <img
                    src={URL.createObjectURL(uploadedImage)}
                    alt="Uploaded Identity"
                    className="w-96 max-w-full h-auto rounded-lg shadow-md"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      extractTextFromImage(uploadedImage)
                    }}
                    className="mt-4 bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-800 transition transform hover:scale-105"
                  >
                    Post My Identifier
                  </Button>
                </div>
              )}

              {/* Loading state */}
              {isProcessing && (
                <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg shadow-md">
                  Processing image... Please wait.
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          // Show Form Card if userData is populated
          <Card className="w-full max-w-5xl p-8 bg-white rounded-3xl shadow-2xl flex flex-col items-center">
            <CardContent>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
                Blockchain Digital Identity
              </h2>

              <form className="grid grid-cols-3 gap-6 w-full">
                {Object.keys(userData).map((key) => (
                  <Input
                    key={key}
                    name={key}
                    placeholder={`Enter ${key.replace(/([A-Z])/g, " $1")}`}
                    value={userData[key]}
                    onChange={handleInputChange}
                    className="w-full border-b-2 border-transparent focus:border-blue-600 focus:outline-none bg-transparent py-1"
                  />
                ))}
              </form>

              {showWarning && (
                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg shadow-md">
                  Please fill in at least one field before generating the identity.
                </div>
              )}

              <Button type="button" onClick={handleGenerateIdentity} className="mt-6 w-full bg-blue-700 text-white py-3 rounded-lg shadow-md hover:bg-[#4159F6] transition transform hover:scale-105">
                Generate Identity
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="bg-gray-800 text-white text-center py-4">
        <p>© 2025 All Rights Reserved <a>GitHub</a></p>
      </div>
    </div>
  );
};

export default DigitalIdentityApp;