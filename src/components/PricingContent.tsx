import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Crown, Gem } from 'lucide-react';
import { AdBannerDisplay, Advertisement } from './AdManagement';

interface PricingContentProps {
  advertisements?: Advertisement[];
}

export function PricingContent({ advertisements = [] }: PricingContentProps) {
  const [selectedCategory, setSelectedCategory] = useState('SAT');
  const [selectedPeriod, setSelectedPeriod] = useState('6 Months');

  const categories = ['SAT', 'ACT', 'AP', 'College Admissions'];
  const periods = ['1 Month', '3 Months', '6 Months', '1 Year'];

  const pricingPlans = [
    {
      icon: Gem,
      name: 'Digital SAT',
      originalPrice: 39,
      price: 19,
      discount: 51,
      billingText: '$114 billed every 6 months',
      description: 'Increase your score by 200+ points',
      isPopular: false,
      features: [
        '150-point increase money-back guarantee',
        '20 Full-length practice tests',
        'Online course with 92 interactive lessons (32 hours)',
        '3000 practice mode questions',
        '30 Reading and Writing practice test modules',
        '30 Math practice test modules',
        '122 Question-type specific problem sets',
        'Difficult questions',
        'Question type selection in practice mode',
        'Unlimited access to study tools',
        '467-page Reading/Writing study guide',
        '425-page Math study guide',
        '4 Full-length Practice Test PDFs',
        '20 Reading and Writing Practice Module PDFs',
        '20 Math Practice Module PDFs'
      ],
      buttonColor: '#000',
      buttonHoverColor: '#333'
    },
    {
      icon: Crown,
      name: 'High School Success',
      originalPrice: 69,
      price: 35,
      discount: 49,
      billingText: '$210 billed every 6 months',
      description: 'Everything in one amazing deal',
      isPopular: true,
      features: [
        'Complete Digital SAT premium package',
        'Complete ACT premium package',
        'Complete AP premium package',
        'Complete College Admissions premium package'
      ],
      buttonColor: '#3D5AA1',
      buttonHoverColor: '#2F4A85'
    }
  ];

  const getPriceForPeriod = (basePrice: number, period: string) => {
    switch (period) {
      case '1 Month':
        return Math.round(basePrice * 1.5);
      case '3 Months':
        return Math.round(basePrice * 0.9);
      case '6 Months':
        return basePrice;
      case '1 Year':
        return Math.round(basePrice * 0.75);
      default:
        return basePrice;
    }
  };

  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl mb-4" style={{ fontWeight: 700, color: '#1a1a1a' }}>
            Start Your Journey to Success
          </h1>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: '#666' }}>
            Conquer your high school academic career with SAT Prep premium products. You can cancel anytime, and there are no hidden charges ever.
          </p>
        </motion.div>

        {/* Advertisement Banner */}
        <AdBannerDisplay advertisements={advertisements} location="pricing" />

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center gap-3 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="px-6 py-3 rounded-full transition-all text-sm"
              style={{
                backgroundColor: selectedCategory === category ? '#2d3748' : '#e5e7eb',
                color: selectedCategory === category ? 'white' : '#4b5563',
                fontWeight: selectedCategory === category ? 700 : 500,
                boxShadow: selectedCategory === category ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Period Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-12"
        >
          <p className="text-sm mb-4" style={{ color: '#666' }}>
            Save more and get better results with longer commitments.
          </p>
          <div className="flex justify-center gap-3">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className="px-5 py-2.5 rounded-full transition-all text-sm"
                style={{
                  backgroundColor: selectedPeriod === period ? '#2d3748' : '#f3f4f6',
                  color: selectedPeriod === period ? 'white' : '#4b5563',
                  fontWeight: selectedPeriod === period ? 700 : 500,
                  boxShadow: selectedPeriod === period ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                {period}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon;
            const currentPrice = getPriceForPeriod(plan.price, selectedPeriod);
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="relative rounded-2xl p-8 shadow-lg"
                style={{
                  backgroundColor: index === 0 ? '#f3f4f6' : '#e8edf5',
                  border: plan.isPopular ? '2px solid #3D5AA1' : '1px solid #e5e7eb'
                }}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#3D5AA1', fontWeight: 700 }}>
                      Most popular
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className="mb-4">
                  <Icon size={40} style={{ color: index === 0 ? '#1a1a1a' : '#3D5AA1' }} />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl mb-4" style={{ fontWeight: 700, color: '#1a1a1a' }}>
                  {plan.name}
                </h3>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-lg line-through" style={{ color: '#999' }}>
                    ${plan.originalPrice}
                  </span>
                  <span className="text-4xl" style={{ fontWeight: 700, color: '#1a1a1a' }}>
                    ${currentPrice}
                  </span>
                  <span className="text-lg" style={{ color: '#666' }}>
                    /month
                  </span>
                  {index === 0 && (
                    <div className="ml-2 px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: '#3D5AA1', fontWeight: 700 }}>
                      GUARANTEE
                    </div>
                  )}
                </div>

                {/* Billing Info */}
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-sm" style={{ color: '#666' }}>
                    {plan.billingText}
                  </p>
                  <span className="px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: '#10b981', fontWeight: 700 }}>
                    Save {plan.discount}%
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm mb-6" style={{ color: '#666' }}>
                  {plan.description}
                </p>

                {/* CTA Button */}
                <button
                  className="w-full py-3 rounded-lg text-white transition-all mb-6"
                  style={{
                    backgroundColor: plan.buttonColor,
                    fontWeight: 700
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = plan.buttonHoverColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = plan.buttonColor;
                  }}
                >
                  Start 7-Day Free Trial
                </button>

                {/* Features List */}
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                      <span className="text-sm" style={{ color: '#333' }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Money-back Guarantee Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <div className="inline-block px-6 py-3 rounded-full" style={{ backgroundColor: '#e8edf5' }}>
            <span className="text-sm" style={{ color: '#3D5AA1', fontWeight: 700 }}>
              ✓ 7-Day Money-Back Guarantee • Cancel Anytime • No Hidden Fees
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}