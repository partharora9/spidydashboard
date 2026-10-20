import { useState } from 'react';
import { PlanCard } from './PlanCard';
import { plansData, type Plan } from '../../data/plans';

interface PlanCardsProps {
  onPlanChange?: (plan: Plan) => void;
}

export const PlanCards = ({ onPlanChange }: PlanCardsProps) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'standard' | 'complete'>('standard');

  const handleSelect = (id: 'standard' | 'complete') => {
    setSelectedPlanId(id);
    const chosen = plansData.find((p) => p.id === id);
    if (chosen && onPlanChange) {
      onPlanChange(chosen);
    }
  };

  return (
    <section className="w-full mt-14 sm:mt-16 lg:mt-20 px-6 overflow-visible select-none">
      <div className="max-w-[800px] mx-auto flex flex-col sm:flex-row justify-center items-center sm:items-stretch gap-6 sm:gap-5 overflow-visible">
        {plansData.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            index={index}
            isSelected={selectedPlanId === plan.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </section>
  );
};
