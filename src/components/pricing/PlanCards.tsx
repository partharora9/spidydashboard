import { PlanCard } from './PlanCard';
import { plansData, type Plan } from '../../data/plans';

interface PlanCardsProps {
  onCheckout: (plan: Plan) => void;
}

export const PlanCards = ({ onCheckout }: PlanCardsProps) => {
  const plan = plansData[0];

  return (
    <section className="w-full mt-8 sm:mt-10 lg:mt-12 px-6 overflow-visible select-none">
      <div className="max-w-[560px] mx-auto flex justify-center items-center overflow-visible">
        <PlanCard
          plan={plan}
          onCheckout={() => onCheckout(plan)}
        />
      </div>
    </section>
  );
};
