import MainComponent from "@/app/Main";
import NewsFeed from "@/app/NewsFeed";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-gray-800 transition-colors duration-300">
      <div className="transition-padding duration-300 min-h-screen">
        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MainComponent />
            <NewsFeed />
          </div>
        </main>
      </div>
    </div>
  );
}
