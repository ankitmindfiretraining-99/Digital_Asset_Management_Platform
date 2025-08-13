import axios from "axios";
import { useEffect, useState } from "react";

export default function Gallery() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [fileType, setFileType] = useState("");
  const [uploadedRange, setUploadedRange] = useState(""); 

  const fetchFiles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/files", {
        params: {
          type: fileType || undefined,
          uploaded: uploadedRange || undefined,
        },
      });
      setFiles(res?.data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [fileType, uploadedRange]);

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mb-6">
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-md p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="w-full sm:w-48 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="other">Others</option>
        </select>

        <select
          value={uploadedRange}
          onChange={(e) => setUploadedRange(e.target.value)}
          className="w-full sm:w-48 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Uploaded</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </select>

        <button
          onClick={() => {
            setFileType("");
            setUploadedRange("");
            setSearch("");
            fetchFiles();
          }}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Reset
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.length > 0 ? (
          filtered.map((file) => (
            <div
              key={file.name}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow bg-white"
            >
              {file.type === "image" ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-48 object-cover"
                />
              ) : file.type === "video" ? (
                <video controls className="w-full h-48 object-cover bg-black">
                  <source src={file.url} type={`video/${file.type}`} />
                </video>
              ) : (
                <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
                  {file.name}
                </div>
              )}

              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {file.name}
                </p>
                <div className="p-4 flex gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition"
                  >
                    Open
                  </a>
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    download
                    className="flex-1 text-center bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No files found.
          </p>
        )}
      </div>
    </div>
  );
}
