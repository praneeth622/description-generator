"use client"
import React, { useState, useRef } from "react";
import { Wand2, RefreshCw, Copy, Upload, X, Download } from "lucide-react";
import axios from "axios";
import { useFont } from "@/contexts/FontContext";
import Image from "next/image"; // Add this import

// First, update the interface to match the response structure
interface DescriptionResponse {
  title: string;
  short_description: string;
  content: string;
}

function GenerateDescription() {
  const { font } = useFont();
  const [image, setImage] = useState<File | null>(null);
  const [features, setFeatures] = useState("");
  const [tone, setTone] = useState("professional");
  const [paragraphs] = useState("1");
  const [style, setStyle] = useState("concise");
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [descriptionData, setDescriptionData] = useState<DescriptionResponse | null>(null);

  // Handle Image Upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  // Remove Image
  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Call Backend API to Generate Description
  const handleGenerate = async () => {
    if (!image) {
      alert("Please upload an image.");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("paragraphs", paragraphs);
      formData.append("style", style);
      formData.append("tone", tone);
      formData.append("features", "Give me discription for this product");

      console.log("Preparing to send request...");
      
      // Try the API endpoint without the user ID in the path
      const apiUrl = "https://description-generator-backend-production.up.railway.app/api/generate-description/user123";
      
      console.log("Sending request to:", apiUrl);
      
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log("Response received:", response);

      // Parse the response data
      const responseData = typeof response.data === 'string' 
        ? JSON.parse(response.data) 
        : response.data;

      if (responseData && responseData.title) {
        setDescriptionData(responseData);
        // Format the text for copy/export functionality
        setGeneratedDescription(
          `Title:\n${responseData.title}\n\nShort Description:\n${responseData.short_description}\n\nKey Features:\n${responseData.content}`
        );
      } else {
        console.error("Invalid response format");
        setDescriptionData(null);
        setGeneratedDescription("Error: Invalid response format.");
      }
    } catch (error) {
      console.error("Error generating description:", error);
      setDescriptionData(null);
      setGeneratedDescription("Error generating description. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDescription);
  };

  // Download Description as File
  const handleExport = () => {
    const blob = new Blob([generatedDescription], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-description.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-background to-background/80 font-${font}`}>
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">
          Product Catalogue Maintenance
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create compelling product descriptions in seconds
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Product Image
              </label>
              <div className="relative">
                {image ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={URL.createObjectURL(image)}
                      alt="Product"
                      className="rounded-lg"
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-background rounded-full shadow-md hover:bg-accent z-10"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-input rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Click to upload product image
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Key Features & Benefits
              </label>
              <textarea
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary h-32"
                placeholder="Enter key features (one per line)"
              />
            </div>

            <div className="grid  gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tone of Voice
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="formal">Formal</option>
                  <option value="enthusiastic">Enthusiastic</option>
                </select>
              </div>

              
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description Style
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setStyle("concise")}
                  className={`px-4 py-2 rounded-lg border ${
                    style === "concise"
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-input text-foreground hover:bg-accent"
                  }`}
                >
                  Concise
                </button>
                <button
                  onClick={() => setStyle("detailed")}
                  className={`px-4 py-2 rounded-lg border ${
                    style === "detailed"
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-input text-foreground hover:bg-accent"
                  }`}
                >
                  Detailed
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Wand2 className="w-5 h-5" />
              )}
              <span>
                {isGenerating ? "Generating..." : "Generate Description"}
              </span>
            </button>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-6 border border-input">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Generated Description
              </h2>
              <div className="flex space-x-2">
                {generatedDescription && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="text-foreground hover:text-foreground hover:bg-accent transition-colors p-2 rounded-lg"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleExport}
                      className="text-foreground hover:text-foreground hover:bg-accent transition-colors p-2 rounded-lg"
                      title="Download as file"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {descriptionData ? (
                <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
                  <div className="border-b border-border pb-4">
                    <h3 className="font-bold text-xl mb-2">Title</h3>
                    <p className="text-foreground">{descriptionData.title}</p>
                  </div>
                  
                  <div className="border-b border-border pb-4">
                    <h3 className="font-bold text-xl mb-2">Short Description</h3>
                    <p className="text-foreground">{descriptionData.short_description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-xl mb-2">Additional Details</h3>
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {descriptionData.content}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">
                  Your generated product description will appear here...
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GenerateDescription;
