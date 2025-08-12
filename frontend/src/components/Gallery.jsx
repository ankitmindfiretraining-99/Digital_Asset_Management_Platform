import axios from "axios";
import { useEffect, useState } from "react";

export default function Gallery() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/files");
        setFiles(res?.data || []);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  }, []);

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.length > 0 ? (
          filtered.map((file) => (
            <div
              key={file.name}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow bg-white"
            >
              {file.type.match(/jpg|png|gif|jpeg/) ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-48 object-cover"
                />
              ) : file.type.match(/mp4|webm|ogg/) ? (
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
