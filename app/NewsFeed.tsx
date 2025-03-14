"use client";
import { getNews } from "@/app/actions/crypto-panic-action";
import { NewsItem } from "@/lib/crypto-panic";
import { formatDistanceToNow } from "date-fns";
import { Bell, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchNews() {
    try {
      setLoading(true);
      setError(null);
      const response = await getNews();
      const news = response?.results;
      if (!news) {
        throw Error("Unable to fetch");
      }
      setNews(news);
    } catch (e) {
      setError("Unable to fetch the news.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className={`rounded-xl bg-white overflow-hidden`}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-1 flex items-center">
          <Bell size={18} className="mr-2 text-indigo-500" />
          Recent News
        </h2>
        <p className="text-sm text-opacity-70 mb-6">
          Latest activities and updates
        </p>

        <div className="space-y-6">
          {isLoading && (
            <div
              className="flex items-center justify-center p-8"
              style={{ width: "100%", height: "80%" }}
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-2 text-gray-600">Loading News...</span>
            </div>
          )}
          {error && (
            <div
              className="p-4 border-red-500 border rounded-md text-red-500"
              style={{ width: "100%", height: "auto" }}
            >
              {/* <h4 className="mb-2 text-lg font-semibold">
                Error Loading Content
              </h4> */}
              <p>{error}</p>
            </div>
          )}
          {news?.map((item) => (
            <Link
              href={item.url}
              key={item.id}
              className={`p-4 rounded-lg bg-gray-50 block hover:bg-gray-100 transition-colors`}
            >
              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium truncate">
                      {item.source.title}
                    </h3>
                    <div className="flex gap-1">
                      {item.currencies && item.currencies.length > 0 && (
                        <>
                          {item.currencies.map((currency, currencyIndex) => (
                            <span
                              key={currency.code + currencyIndex}
                              className={`text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600`}
                            >
                              {currency.code}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-opacity-70 mb-2">{item.title}</p>
                  <div className="flex items-center text-xs text-opacity-50">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(item.published_at))} ago
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
