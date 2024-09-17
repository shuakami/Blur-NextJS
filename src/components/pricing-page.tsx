import { Check } from 'lucide-react'

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "Forever",
    features: [
      "For hobby sites",
      "Framer domain",
    ],
    buttonText: "Get started",
    buttonLink: "#",
  },
  {
    name: "Mini",
    price: "$5",
    period: "Per site per month",
    features: [
      "Custom domain",
      "Home and 404",
      "50 form submissions",
    ],
    buttonText: "Get site plan",
    buttonLink: "#",
  },
  {
    name: "Basic",
    price: "$15",
    period: "Per site per month",
    features: [
      "For personal sites",
      "150 pages",
      "Password protect",
      "500 form submissions",

    ],
    buttonText: "Get site plan",
    buttonLink: "#",
  },
  {
    name: "Pro",
    price: "$30",
    period: "Per site per month",
    features: [
      "For larger sites",
      "300 pages",
      "Analytics + cookies",
      "Staging environment",
      "200,000 visitors/mo",
      "Custom hosting",
    ],
    buttonText: "Get site plan",
    buttonLink: "#",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "Annual billing",
    features: [
      "For enterprise sites",
      "Enterprise security",
      "Custom hosting",
      "Launch support",
      "SSO for sites",
      "Custom limits",
      "Launch support",
    ],
    buttonText: "Learn more",
    buttonLink: "#",
  },
]

export default function PricingPage() {
  return (
      <div className="min-h-screen bg-black text-white p-6 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-blue-400 mb-2 text-sm">Site pricing</p>
            <h1 className="text-3xl font-bold mb-4">Start for free and upgrade<br/>to unlock more features.</h1>
            <div className="inline-flex items-center bg-[rgba(255,255,255,0.1)] rounded-full p-1">
              <span className="text-gray-400 text-xs px-3">Annual discount</span>
              <div className="w-8 h-4 bg-blue-500 rounded-full relative">
                <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-0.5"></div>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-end space-x-3">
            {pricingTiers.map((tier, index) => (
                <PricingCard
                    key={tier.name}
                    {...tier}
                    isHighlighted={index === 3}
                    index={index}
                />
            ))}
          </div>
        </div>
      </div>
  )
}

function PricingCard({ name, price, period, features, buttonText, isHighlighted, index }) {
  const getGradient = (index) => {
    const colors = [
      ['#111111', '#171E22'],
      ['#111111', '#171E22'],
      ['#12181D', 'rgba(22,44,56,0.47)'],
      ['#00ccff', '#0099ff'],
      ['rgba(35,61,67,0.48)', '#141515'],
    ];
    const [fromColor, toColor] = colors[index];
    return `
    linear-gradient(
      345deg,
      ${fromColor} 0%,
      ${toColor} 100%
    )
  `;
  };

  const getShadow = (index) => {
    const shadows = [
      'rgba(0,0,0,0.1)',  // 更加柔和的阴影
      'rgba(0,204,255,0.04)',
      'rgba(0,204,255,0.1)',
      'rgba(0,204,255,0.5)',  // 更加强调 Pro 版的立体感
      'rgba(0,204,255,0.1)',
    ];
    return `rgba(255, 255, 255, 0.1) 0px 1px 1px 0px inset, ${shadows[index]} 0px ${(index + 1) * 5}px ${(index + 1) * 20}px 0px`;
  };


  const cardClass = isHighlighted
      ? `bg-gradient-to-br from-[#00ccff] to-[#0099ff] text-white`
      : `bg-gradient-to-br ${getGradient(index)} text-white`;

  const cardStyle = {
    width: '230px',
    height: `${260 + index * 45}px`,
    boxShadow: getShadow(index),
    background: getGradient(index),
    borderRadius: '16px'

  };

  return (
      <div
          className={`rounded-2xl p-6 flex flex-col ${cardClass} backdrop-blur-[5px] border border-[rgba(255,255,255,0.05)] relative`}
          style={cardStyle}
      >
        <div>
          <h2 className={`text-lg font-semibold -mt-2 ${isHighlighted ? 'text-white' : 'text-gray-400'}`}>{name}</h2>
          <div className="text-4xl font-bold mb-1">{price}</div>
          <p className={`text-xs mb-6 ${isHighlighted ? 'text-white' : 'text-gray-400'}`}>{period}</p>
          <ul className="space-y-3 mb-16"> {/* 增加底部边距 */}
            {features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <div className="w-5 h-5 rounded bg-[rgba(255,255,255,0.1)] flex items-center justify-center mr-2 flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </li>
            ))}
          </ul>
        </div>
        <button
            className={`py-2 rounded-lg text-sm font-medium transition-colors absolute bottom-6 left-6 right-6 ${
                isHighlighted
                    ? 'bg-white text-[#0099ff] hover:bg-gray-100'
                    : 'bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.2)]'
            }`}
        >
          {buttonText}
        </button>
      </div>
  )
}