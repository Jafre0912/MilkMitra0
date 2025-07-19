import { useState } from "react";
import { MdOutlineFileUpload } from "react-icons/md";
import { toast } from "react-hot-toast";

const ImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [predictionResult, setPredictionResult] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    setSelectedImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPredictionResult(""); // Reset the prediction result
  };

  const handleUploadImage = async () => {
    if (!selectedImage) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.prediction) {
          setPredictionResult(data.prediction); // Set the prediction result
        } else {
          toast.error("Prediction failed. Please try again.");
        }
      } else {
        toast.error("Failed to get prediction");
      }
    } catch (error) {
      toast.error("Error uploading the image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-5 max-w-3xl mx-auto">
      <div className="mb-5 bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
        <div className="flex items-center">
          <MdOutlineFileUpload className="h-8 w-8 text-blue-600 mr-3 flex-shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-blue-800 mb-1">Upload Image</h1>
            <p className="text-sm text-gray-600">Upload an image for prediction</p>
          </div>
        </div>
      </div>

      <div className="mb-5 bg-white rounded-lg shadow-md p-6 text-center">
        {!selectedImage ? (
          <label className="cursor-pointer flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-all">
            <MdOutlineFileUpload className="h-12 w-12 text-blue-400 mb-3" />
            <span className="text-sm text-blue-600 font-medium">Click to upload image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={uploading}
            />
          </label>
        ) : (
          <div className="flex flex-col items-center">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Uploaded"
              className="w-48 h-48 object-cover rounded-lg shadow-md mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium transition-all shadow"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="mt-5">
          <button
            onClick={handleUploadImage}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-all shadow"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Predict"}
          </button>
        </div>

        {predictionResult && (
          <div className="mt-5">
            <p className="text-xl font-bold text-green-600">Prediction: {predictionResult}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
