import { useState } from "react";
import axios from "axios";

export const FileUploader = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    console.log("uploadddddddddddddddd", e.target.files);
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    console.log("dragggggggggggggggg", e.dataTransfer.files);
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  console.log("filessssssssss", files);

  //   const handleUpload = async () => {
  //     if (!files.length) return;
  //     setUploading(true);
  //     setMessage("");

  //     const formData = new FormData();
  //     files.forEach((file) => formData.append("files", file));

  //     try {
  //       const res = await axios.post("http://localhost:5000/upload", formData, {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       });
  //       setMessage(`Uploaded ${res.data.uploaded.length} files successfully!`);
  //     } catch (err) {
  //       console.error(err);
  //       setMessage("Upload failed");
  //     }

  //     setUploading(false);
  //   };

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 border rounded-xl bg-white shadow">
      <h1 className="text-2xl font-semibold mb-4 text-center">Upload Files</h1>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-400 p-8 text-center rounded-lg mb-4"
      >
        <p className="mb-2">Drag & drop files here</p>
        <p className="mb-4 text-sm text-gray-500">or</p>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mx-auto ml-20"
        />
      </div>
      {files.length > 0 && (
        <div className="my-4 text-sm text-center">
          <p className="font-semibold mb-2">Files to upload:</p>
          <ul className="list-disc list-inside text-gray-600">
            {files.map((file, idx) => (
              <li key={idx}>{file?.name}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        // onClick={handleUpload}
        disabled={uploading || files.length === 0}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        {uploading ? "Uploading..." : "Upload Files"}
      </button>

      {message && (
        <p className="mt-4 text-center text-sm text-green-600">{message}</p>
      )}
    </div>
  );
};
