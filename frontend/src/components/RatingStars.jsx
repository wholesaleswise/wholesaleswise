import React from "react";

const RatingStars = ({ rating }) => {
  const filledStars = Math.floor(rating);
  const emptyStars = 5 - filledStars;
  const stars = [];

  // Add filled stars
  for (let i = 0; i < filledStars; i++) {
    stars.push(
      <svg
        key={`filled-${i}`}
        className="w-[14px] h-[14px] fill-yellow-600"
        viewBox="0 0 14 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M7 0L9.4687 3.60213L13.6574 4.83688L10.9944 8.29787L11.1145 12.6631L7 11.2L2.8855 12.6631L3.00556 8.29787L0.342604 4.83688L4.5313 3.60213L7 0Z" />
      </svg>
    );
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <svg
        key={`empty-${i}`}
        className="w-[14px] h-[14px] fill-[#CED5D8]"
        viewBox="0 0 14 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M7 0L9.4687 3.60213L13.6574 4.83688L10.9944 8.29787L11.1145 12.6631L7 11.2L2.8855 12.6631L3.00556 8.29787L0.342604 4.83688L4.5313 3.60213L7 0Z" />
      </svg>
    );
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
};

export default RatingStars;
