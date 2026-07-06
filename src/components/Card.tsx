import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  category?: string;
  price?: string;
}

const Card: React.FC<CardProps> = ({
  id,
  title,
  description,
  imageUrl,
  link,
  category,
  price,
}) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="relative overflow-hidden h-56">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {category && (
          <div className="absolute top-4 right-4 bg-accent text-primary font-medium px-3 py-1 rounded-full text-sm">
            {category}
          </div>
        )}
        {price && (
          <div className="absolute bottom-4 left-4 bg-primary text-white font-medium px-3 py-1 rounded-full text-sm">
            {price}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>
        <Link
          to={`${link}/${id}`}
          className="inline-flex items-center text-primary hover:text-primary-dark font-medium transition-colors duration-200"
        >
          Lihat Detail
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default Card;
