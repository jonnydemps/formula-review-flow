import React from 'react';
import { CheckCircle2, Clock, AlertCircle, DollarSign, FileCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  status: string;
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  status,
  className = '',
}) => {
  const progress = (currentStep / totalSteps) * 100;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending_review':
        return {
          color: 'bg-yellow-500',
          icon: Clock,
          label: 'Pending Review',
          step: 1,
        };
      case 'quote_requested':
        return {
          color: 'bg-blue-500',
          icon: AlertCircle,
          label: 'Quote Requested',
          step: 2,
        };
      case 'quote_provided':
        return {
          color: 'bg-purple-500',
          icon: DollarSign,
          label: 'Quote Provided',
          step: 3,
        };
      case 'paid':
        return {
          color: 'bg-green-500',
          icon: CheckCircle2,
          label: 'Payment Complete',
          step: 4,
        };
      case 'completed':
        return {
          color: 'bg-emerald-500',
          icon: FileCheck,
          label: 'Completed',
          step: 5,
        };
      default:
        return {
          color: 'bg-gray-500',
          icon: Clock,
          label: 'Unknown',
          step: 1,
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const Icon = statusConfig.icon;

  const steps = [
    { label: 'Submitted', step: 1 },
    { label: 'Under Review', step: 2 },
    { label: 'Quote Ready', step: 3 },
    { label: 'Payment', step: 4 },
    { label: 'Complete', step: 5 },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Status Badge */}
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 text-white rounded-full p-1 ${statusConfig.color}`} />
        <Badge variant="secondary" className="text-sm">
          {statusConfig.label}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const isCompleted = statusConfig.step > step.step;
          const isCurrent = statusConfig.step === step.step;
          
          return (
            <div key={step.step} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? statusConfig.color + ' text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? '✓' : step.step}
              </div>
              <span className={`text-xs mt-1 text-center ${
                isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;