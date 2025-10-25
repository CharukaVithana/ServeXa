import React from 'react';

interface StatusCard {
  title: string;
  count: number;
}

const StatusCards: React.FC = () => {
  const cards: StatusCard[] = [
    { title: 'Appointed', count: 5 },
    { title: 'Completed', count: 12 },
    { title: 'In progress', count: 3 },
    { title: 'Logged Today', count: 8 },
    { title: 'Efficiency', count: 94 }
  ];

  return (
    <div className="w-full bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-4 justify-between">
          {cards.map((card, index) => (
            <div
              key={index}
              className="flex-1 bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-all cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium mb-2 text-gray-300">
                  {card.title}
                </span>
                <span className="text-3xl font-bold text-white">
                  {card.count}{card.title === 'Efficiency' ? '%' : ''}
                </span>
              </div>
              
              {/* Three dots menu */}
              <div className="flex justify-end mt-2">
                <button className="flex flex-col gap-0.5 p-1 rounded hover:bg-gray-600 transition-colors text-gray-500">
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusCards;