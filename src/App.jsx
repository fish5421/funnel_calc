import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FunnelCalculator = () => {
  const [stages, setStages] = useState([
    { name: 'Visitors', value: 1000, rate: 20, color: '#E76F51', editing: false },
    { name: 'Customers', value: 0, color: '#2A9D8F', editing: false },
  ]);

  const [revenue, setRevenue] = useState(100);
  const revenueInputRef = useRef(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const prevStagesRef = useRef(stages);

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F9ED69', '#F08A5D', '#B83B5E', '#6A2C70', '#08D9D6'];

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const calculateFunnel = useCallback(() => {
    setStages(prevStages => {
      let updatedStages = [...prevStages];
      for (let i = 1; i < updatedStages.length; i++) {
        const prevValue = updatedStages[i-1].value;
        const prevRate = updatedStages[i-1].rate;
        if (i === updatedStages.length - 1) {
          // For the last stage, just use the previous stage's calculated value
          updatedStages[i].value = (prevValue === '' || prevRate === '') 
            ? '' 
            : Math.round((prevValue * prevRate) / 100);
        } else {
          updatedStages[i].value = (prevValue === '' || prevRate === '') 
            ? '' 
            : Math.round((prevValue * prevRate) / 100);
        }
      }
      return updatedStages;
    });
  }, []);

  const addStage = useCallback(() => {
    if (stages.length < 10) {
      const newStage = {
        name: `Stage ${stages.length + 1}`,
        value: 0,
        rate: 100,
        color: colors[stages.length % colors.length],
        editing: false,
      };
      setStages(prevStages => {
        const newStages = [...prevStages.slice(0, -1), newStage, prevStages[prevStages.length - 1]];
        setTimeout(() => calculateFunnel(), 0);
        return newStages;
      });
    }
  }, [stages.length, calculateFunnel]);

  const removeStage = useCallback((index) => {
    if (stages.length > 2 && index !== 0 && index !== stages.length - 1) {
      setStages(prevStages => prevStages.filter((_, i) => i !== index));
    }
  }, [stages.length]);

  useEffect(() => {
    calculateFunnel();
  }, [calculateFunnel, stages[0].value, ...stages.map(stage => stage.rate)]);

  useEffect(() => {
    const lastStageValue = stages[stages.length - 1].value;
    setTotalRevenue(
      lastStageValue === '' || revenue === '' ? 0 : lastStageValue * revenue
    );
  }, [stages, revenue]);

  useEffect(() => {
    const hasSignificantChange = stages.some((stage, index) => {
      const prevStage = prevStagesRef.current[index];
      return prevStage && Math.abs(stage.value - prevStage.value) > prevStage.value * 0.05; // 5% threshold
    });

    if (hasSignificantChange) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 500);
      return () => clearTimeout(timer);
    }

    prevStagesRef.current = stages;
  }, [stages]);

  const handleInputChange = (index, field, value) => {
    setStages(prevStages => {
      const updatedStages = [...prevStages];
      if (field === 'rate') {
        const numValue = parseFloat(value);
        updatedStages[index].rate = isNaN(numValue) ? '' : Math.max(0, Math.min(100, numValue));
      } else if (field === 'value' && index === 0) {
        // Allow empty input or non-negative integers
        updatedStages[index].value = value === '' ? '' : Math.max(0, parseInt(value) || 0);
      } else if (field === 'name') {
        updatedStages[index].name = value.trim();
      }
      return updatedStages;
    });
  };

  const handleRevenueChange = (e) => {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    const value = input.value.replace(/[^0-9.]/g, '');
    const numericValue = parseFloat(value);
    const newValue = isNaN(numericValue) ? '' : Math.max(0, numericValue);
    
    setRevenue(newValue);

    // Use setTimeout to ensure the DOM has updated
    setTimeout(() => {
      const formattedLength = currencyFormatter.format(newValue).length;
      const newCursorPosition = cursorPosition + (formattedLength - input.value.length);
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const FunnelVisualization = () => (
    <svg viewBox="0 0 200 100" className="w-full h-64 mt-4">
      <style>
        {`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          .funnel-section {
            transition: all 0.5s ease-out;
          }
          .funnel-section.animate {
            animation: fadeInScale 0.5s ease-out forwards;
          }
          .funnel-text {
            transition: all 0.5s ease-out;
          }
          .funnel-text.animate {
            animation: fadeInScale 0.5s ease-out 0.2s forwards;
          }
        `}
      </style>
      {stages.map((stage, index) => {
        const height = 100 / stages.length;
        const topWidth = 80 - (index * (80 / stages.length));
        const bottomWidth = 80 - ((index + 1) * (80 / stages.length));
        return (
          <g key={index} className={`funnel-section ${shouldAnimate ? 'animate' : ''}`}>
            <path
              d={`M${(80 - topWidth) / 2},${index * height} 
                 L${(80 + topWidth) / 2},${index * height} 
                 L${(80 + bottomWidth) / 2},${(index + 1) * height} 
                 L${(80 - bottomWidth) / 2},${(index + 1) * height} Z`}
              fill={stage.color}
            />
            <text
              x="40"
              y={`${index * (100 / stages.length) + (50 / stages.length)}%`}
              textAnchor="middle"
              fill="black"
              fontSize="5"
              fontWeight="bold"
              className={`funnel-text ${shouldAnimate ? 'animate' : ''}`}
            >
              {stage.value}
            </text>
            <text
              x="90"
              y={`${index * (100 / stages.length) + (50 / stages.length)}%`}
              textAnchor="start"
              fill="black"
              fontSize="4"
              fontWeight="bold"
              className={`funnel-text ${shouldAnimate ? 'animate' : ''}`}
            >
              {stage.name}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <CardTitle className="text-center font-bold text-2xl">Funnel Optimization Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <Alert>
          <AlertDescription>
            This calculator helps you visualize and optimize your conversion funnel. Enter the number of visitors and conversion rates for each stage. You can add up to 10 stages and remove stages as needed. The tool will automatically calculate the flow through your funnel and the total revenue based on your inputs.
          </AlertDescription>
        </Alert>
        {stages.map((stage, index) => (
          <div key={index} className="flex flex-col space-y-2 bg-white bg-opacity-50 p-4 rounded-md">
            <div className="flex items-center space-x-2">
              <label className="w-1/3 font-semibold">Stage Name:</label>
              <Input 
                value={stage.name}
                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                className="w-2/3 border-2 border-gray-300 focus:border-blue-500"
                placeholder="e.g., Visitors, Leads"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-1/3 font-semibold">
                {index === 0 ? 'Number of Visitors:' : index === stages.length - 1 ? 'Number of Customers:' : 'Calculated Value:'}
              </label>
              <Input 
                type="number"
                value={stage.value}
                onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                className="w-2/3 border-2 border-gray-300 focus:border-blue-500"
                placeholder="Enter number"
                disabled={index !== 0}
              />
            </div>
            {index !== stages.length - 1 && (
              <div className="flex items-center space-x-2">
                <label className="w-1/3 font-semibold">Conversion Rate (%):</label>
                <Input 
                  type="number"
                  value={stage.rate}
                  onChange={(e) => handleInputChange(index, 'rate', e.target.value)}
                  className="w-2/3 border-2 border-gray-300 focus:border-blue-500"
                  placeholder="Enter percentage"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            )}
            {index !== 0 && index !== stages.length - 1 && (
              <div className="flex justify-end mt-2">
                <RemoveStageIcon onClick={() => removeStage(index)} />
              </div>
            )}
          </div>
        ))}
        {stages.length < 10 && (
          <Button onClick={addStage} className="mt-4 bg-green-500 hover:bg-green-600 text-white">
            Add Stage
          </Button>
        )}
        <div className="flex flex-col space-y-2 bg-white bg-opacity-50 p-4 rounded-md">
          <label className="font-semibold">Revenue per Customer:</label>
          <Input
            type="text"
            value={revenue === '' ? '' : currencyFormatter.format(revenue)}
            onChange={handleRevenueChange}
            className="w-full border-2 border-gray-300 focus:border-blue-500"
            placeholder="Enter amount"
            ref={revenueInputRef}
          />
        </div>
        <div className="text-2xl font-bold text-center bg-white bg-opacity-70 p-4 rounded-lg shadow-inner">
          Total Revenue: {formatter.format(totalRevenue)}
        </div>
        <FunnelVisualization />
      </CardContent>
    </Card>
  );
};

const RemoveStageIcon = ({ onClick }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Remove this stage</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default FunnelCalculator;
