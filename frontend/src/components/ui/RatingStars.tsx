import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 0 à 5
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  max = 5,
  size = 18,
  interactive = false,
  onChange,
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: interactive ? 'pointer' : 'default',
              display: 'inline-flex',
            }}
          >
            <Star
              size={size}
              fill={isFilled ? '#E88945' : 'transparent'}
              color={isFilled ? '#E88945' : '#D1D5CC'}
              strokeWidth={2}
            />
          </button>
        );
      })}
    </div>
  );
};
