import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";

const KarmaClubSimple = () => {
  return (
    <PageLayout title="KARMA CLUB">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Karma Club Activities</h1>
          <p className="text-gray-300">Make a positive impact and earn karma points</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#222] p-6 rounded-lg text-white">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold mb-2">Plant a Tree</h3>
            <p className="text-gray-300 mb-4">Plant a tree in your local area or participate in a tree-planting event</p>
            <div className="flex justify-between items-center">
              <span className="bg-blue-600 px-2 py-1 rounded text-sm">10 pts</span>
              <button 
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white"
                onClick={() => alert('Great! You completed "Plant a Tree" and earned 10 points!')}
              >
                Complete Activity
              </button>
            </div>
          </div>

          <div className="bg-[#222] p-6 rounded-lg text-white">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Volunteer at Food Bank</h3>
            <p className="text-gray-300 mb-4">Help sort and distribute food at a local food bank</p>
            <div className="flex justify-between items-center">
              <span className="bg-blue-600 px-2 py-1 rounded text-sm">20 pts</span>
              <button 
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white"
                onClick={() => alert('Great! You completed "Volunteer at Food Bank" and earned 20 points!')}
              >
                Complete Activity
              </button>
            </div>
          </div>

          <div className="bg-[#222] p-6 rounded-lg text-white">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Read to Children</h3>
            <p className="text-gray-300 mb-4">Read stories to children at a library or school</p>
            <div className="flex justify-between items-center">
              <span className="bg-blue-600 px-2 py-1 rounded text-sm">10 pts</span>
              <button 
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white"
                onClick={() => alert('Great! You completed "Read to Children" and earned 10 points!')}
              >
                Complete Activity
              </button>
            </div>
          </div>

          <div className="bg-[#222] p-6 rounded-lg text-white">
            <div className="text-4xl mb-4">💪</div>
            <h3 className="text-xl font-semibold mb-2">Donate Blood</h3>
            <p className="text-gray-300 mb-4">Donate blood to help save lives</p>
            <div className="flex justify-between items-center">
              <span className="bg-blue-600 px-2 py-1 rounded text-sm">15 pts</span>
              <button 
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white"
                onClick={() => alert('Great! You completed "Donate Blood" and earned 15 points!')}
              >
                Complete Activity
              </button>
            </div>
          </div>

          <div className="bg-[#222] p-6 rounded-lg text-white">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold mb-2">Visit Elderly</h3>
            <p className="text-gray-300 mb-4">Spend time with elderly residents at a care facility</p>
            <div className="flex justify-between items-center">
              <span className="bg-blue-600 px-2 py-1 rounded text-sm">15 pts</span>
              <button 
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white"
                onClick={() => alert('Great! You completed "Visit Elderly" and earned 15 points!')}
              >
                Complete Activity
              </button>
            </div>
          </div>

          <div className="bg-[#222] p-6 rounded-lg text-white">
            <div className="text-4xl mb-4">🌊</div>
            <h3 className="text-xl font-semibold mb-2">Beach Cleanup</h3>
            <p className="text-gray-300 mb-4">Participate in or organize a beach or park cleanup</p>
            <div className="flex justify-between items-center">
              <span className="bg-blue-600 px-2 py-1 rounded text-sm">15 pts</span>
              <button 
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white"
                onClick={() => alert('Great! You completed "Beach Cleanup" and earned 15 points!')}
              >
                Complete Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default KarmaClubSimple;