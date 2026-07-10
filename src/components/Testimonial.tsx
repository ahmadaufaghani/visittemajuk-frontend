import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialProps {
  name: string;
  date: string;
  rating: number;
  text: string;
  imageUrl: string;
}

const Testimonial: React.FC<TestimonialProps> = ({
  name,
  date,
  rating,
  text,
  imageUrl,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <img
          src={imageUrl}
          alt={name}
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div>
          <h3 className="font-semibold text-gray-800">{name}</h3>
          <p className="text-gray-500 text-sm">{date}</p>
        </div>
      </div>
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < rating ? 'text-accent-dark fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <p className="text-gray-600">{text}</p>
    </div>
  );
};

export default Testimonial;