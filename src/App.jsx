import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FunnelCalculator = () => {
  const [stages, setStages] = useState([
    { name: 'Visitors', value: 1000, rate: 20, color: '#E76F51', editing: false },
    { name: 'Leads', value: 0, rate: 10, color: '#F4A261', editing: false },
    { name: 'Opportunities', value: 0, rate: 5, color: '#E9C46A', editing: false },
    { name: 'Customers', value: 0, rate: 100, color: '#2A9D8F', editing: false },
  ]);

  const [revenue, setRevenue] = useState(100);
  const [revenueInput, setRevenueInput] = useState('100.00');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [animate, setAnimate] = useState(false);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    calculateFunnel();
  }, [stages, revenue]);

  const calculateFunnel = () => {
    let updatedStages = [...stages];
    for (let i = 1; i < updatedStages.length; i++) {
      updatedStages[i].value = Math.round((updatedStages[i - 1].value * updatedStages[i - 1].rate) / 100);
    }
    setStages(updatedStages);
    setTotalRevenue(updatedStages[updatedStages.length - 1].value * revenue);
    setAnimate(true);
    setTimeout(() => setAnimate(false), 500);
  };

  const handleInputChange = (index, field, value) => {
    const updatedStages = [...stages];
    if (field === 'rate') {
      if (value === '' || isNaN(value)) {
        updatedStages[index].rate = '';
        updatedStages[index].editing = true;
      } else {
        const numValue = parseFloat(value);
        updatedStages[index].rate = Math.max(0, Math.min(100, numValue));
        updatedStages[index].editing = false;
      }
    } else if (field === 'value' && index === 0) {
      updatedStages[index].value = Math.max(0, parseInt(value) || 0);
    } else if (field === 'name') {
      updatedStages[index].name = value.trim();
    }
    setStages(updatedStages);
  };

  const handleRateBlur = (index) => {
    const updatedStages = [...stages];
    if (updatedStages[index].rate === '') {
      updatedStages[index].rate = 0;
    }
    updatedStages[index].editing = false;
    setStages(updatedStages);
  };

  const handleRateFocus = (index) => {
    const updatedStages = [...stages];
    if (updatedStages[index].rate === 0) {
      updatedStages[index].rate = '';
    }
    updatedStages[index].editing = true;
    setStages(updatedStages);
  };

  const handleRevenueChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setRevenueInput(value);
    const newRevenue = parseFloat(value);
    if (!isNaN(newRevenue)) {
      setRevenue(newRevenue);
    }
  };

  const handleRevenueBlur = () => {
    const formattedRevenue = formatter.format(revenue);
    setRevenueInput(formattedRevenue);
  };

  const FunnelVisualization = () => (
    <svg viewBox="0 0 100 100" className="w-full h-64 mt-4">
      <style>
        {`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          .funnel-section { animation: fadeInScale 0.5s ease-out forwards; }
          .funnel-text { animation: fadeInScale 0.5s ease-out 0.2s forwards; }
        `}
      </style>
      {stages.map((stage, index) => {
        const height = 100 / stages.length;
        const topWidth = 100 - (index * (100 / stages.length));
        const bottomWidth = 100 - ((index + 1) * (100 / stages.length));
        return (
          <g key={index} className={animate ? 'funnel-section' : ''} style={{ animationDelay: `${index * 0.1}s` }}>
            <path
              d={`M${(100 - topWidth) / 2},${index * height} 
                 L${(100 + topWidth) / 2},${index * height} 
                 L${(100 + bottomWidth) / 2},${(index + 1) * height} 
                 L${(100 - bottomWidth) / 2},${(index + 1) * height} Z`}
              fill={stage.color}
            />
            <text
              x="50%"
              y={`${index * (100 / stages.length) + (50 / stages.length)}%`}
              textAnchor="middle"
              fill="black"
              fontSize="3"
              fontWeight="bold"
              className={animate ? 'funnel-text' : ''}
              style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
            >
              {stage.name}: {stage.value}
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
            This calculator helps you visualize and optimize your conversion funnel. Enter the number of visitors and conversion rates for each stage. The tool will automatically calculate the flow through your funnel and the total revenue based on your inputs.
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
              <label className="w-1/3 font-semibold">{index === 0 ? 'Number of Visitors:' : 'Calculated Value:'}</label>
              <Input
                type="number"
                value={stage.value}
                onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                className="w-2/3 border-2 border-gray-300 focus:border-blue-500"
                placeholder="Enter number"
                disabled={index !== 0}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="w-1/3 font-semibold">Conversion Rate (%):</label>
              <Input
                type="number"
                value={stage.editing ? stage.rate : (stage.rate === '' ? '' : stage.rate.toString())}
                onChange={(e) => handleInputChange(index, 'rate', e.target.value)}
                onFocus={() => handleRateFocus(index)}
                onBlur={() => handleRateBlur(index)}
                className="w-2/3 border-2 border-gray-300 focus:border-blue-500"
                placeholder="Enter percentage"
              />
            </div>
          </div>
        ))}
        <div className="flex flex-col space-y-2 bg-white bg-opacity-50 p-4 rounded-md">
          <label className="font-semibold">Revenue per Customer ($):</label>
          <Input
            type="text"
            value={revenueInput}
            onChange={handleRevenueChange}
            onBlur={handleRevenueBlur}
            className="w-full border-2 border-gray-300 focus:border-blue-500"
            placeholder="Enter amount"
          />
        </div>
        <div className="text-2xl font-bold text-center bg-white bg-opacity-70 p-4 rounded-lg shadow-inner">
          Total Revenue: ${formatter.format(totalRevenue)}
        </div>
        <FunnelVisualization />
      </CardContent>
    </Card>
  );
};

export default FunnelCalculator;