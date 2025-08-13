// import React from "react";

const MarketingPanel = () => {
  return (
    <div className="flex flex-col lg:w-1/2 bg-gray-900/70 backdrop-blur-sm p-12  justify-center items-center text-white">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <img src="https://framerusercontent.com/images/OSb5IkJHQVpsdpgcBb01WUBpHg.jpeg" alt="TrainUp Logo" className=" rounded-2xl w-24 h-24 mx-auto" />
        </div>
        <h2 className="text-3xl font-bold mb-4">
          "The body achieves what the mind believes."
        </h2>
        <p className="text-gray-300 mb-8">
          Join thousands of fitness enthusiasts who are transforming their lives
          with TrainUp.
        </p>
        <div className="flex justify-center space-x-4">
          {/* <div className="text-center">
            <div className="text-4xl font-bold text-[#176B87]">500+</div>
            <div className="text-sm text-gray-400">Workouts</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#176B87]">10k+</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#176B87]">98%</div>
            <div className="text-sm text-gray-400">Satisfaction</div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default MarketingPanel;