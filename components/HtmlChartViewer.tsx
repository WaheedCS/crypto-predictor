"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface HtmlBlobViewerProps {
  url: string;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export default function HtmlChartViewer({
  url,
  width = "100%",
  height = "500px",
  className = "",
}: HtmlBlobViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHtmlContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch HTML content: ${response.status} ${response.statusText}`
          );
        }

        const htmlContent = await response.text();

        // Create a blob from the HTML content
        const blob = new Blob([htmlContent], { type: "text/html" });

        // Create a URL for the blob
        const objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (err) {
        console.error("Error fetching HTML content:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load HTML content"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHtmlContent();

    // Clean up the blob URL when the component unmounts or the URL changes
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [url]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center p-8 bg-gray-100 border rounded-md"
        style={{ width, height }}
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-gray-600">Loading Forecast...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-4 text-white bg-red-500 border rounded-md"
        style={{ width, height: "auto" }}
      >
        <h3 className="mb-2 text-lg font-semibold">Error Loading Content</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <iframe
      src={blobUrl || "about:blank"}
      className={`border rounded-md ${className}`}
      style={{ width, height }}
      sandbox="allow-scripts allow-same-origin"
      title="HTML Content"
    />
  );
}
