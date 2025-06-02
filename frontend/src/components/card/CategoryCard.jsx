"use client";

import React from "react";

const CategoryCard = ({ category }) => {
  return (
    <>
      <>
        <div className="w-[75px] h-[75px] md:w-20 md:h-20 rounded-full overflow-hidden sm:p-4 p-4 bg-secondary flex items-center justify-center mb-4">
          <img
            src={category.categoryImage}
            alt={category.categoryName}
            className="h-full object-contain transition-transform duration-300 hover:scale-110"
          />
        </div>

        <p className="text-sm  md:text-base capitalize text-center text-primary  hover:text-hover">
          {category.categoryName}
        </p>
      </>
    </>
  );
};

export default CategoryCard;
