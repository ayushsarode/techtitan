// HomePage.jsx
import Image from "next/image";
import Nav from "../app/components/Nav";
import { ArrowRight, Sparkles, Leaf, Award, BarChart3 } from "lucide-react";

export default function Home() {
  // Features section content
  const features = [
    {
      icon: <Leaf className="h-6 w-6 text-green-600" />,
      title: "Track Actions",
      description: "Log your daily eco-friendly activities with ease"
    },
    {
      icon: <Sparkles className="h-6 w-6 text-green-600" />,
      title: "Earn Points",
      description: "Get rewarded for every sustainable choice you make"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-green-600" />,
      title: "Track Progress",
      description: "Monitor your carbon footprint reduction over time"
    },
    {
      icon: <Award className="h-6 w-6 text-green-600" />,
      title: "Win Rewards",
      description: "Redeem your points for exclusive eco-friendly products"
    }
  ];

  return (
    <div className="min-h-screen">
      <Nav />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Left content */}
            <div className="max-w-xl text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-green-800 leading-tight">
                Go Green, <span className="text-green-600">Earn Rewards</span> <span className="inline-block">🌿</span>
              </h1>
              <p className="mt-6 text-lg text-gray-700 leading-relaxed">
                Track your eco-friendly actions, reduce your carbon footprint, and earn points for every sustainable choice. Join thousands making a difference.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-green-700 transition-colors duration-300 text-lg font-medium"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <a
                  href="/about"
                  className="inline-flex items-center justify-center bg-white text-green-700 border-2 border-green-600 px-6 py-3 rounded-xl hover:bg-green-50 transition-colors duration-300 text-lg font-medium"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Right image */}
            <div className="w-full md:w-1/2">
              <div className="relative h-80 sm:h-96 md:h-[28rem] w-full rounded-2xl overflow-hidden shadow-2xl">
              <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  {/* <!-- Background --> */}
  <defs>
    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#a8e6cf" />
      <stop offset="100%" stop-color="#dcedc1" />
    </linearGradient>
    <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4d7c0f" />
      <stop offset="100%" stop-color="#65a30d" />
    </linearGradient>
  </defs>
  
  {/* <!-- Sky background --> */}
  <rect x="0" y="0" width="800" height="450" fill="url(#skyGradient)" />
  
  {/* <!-- Ground --> */}
  <path d="M 0,450 C 200,400 600,500 800,430 L 800,600 L 0,600 Z" fill="url(#groundGradient)" />
  
  {/* <!-- Sun --> */}
  <circle cx="650" cy="120" r="60" fill="#FFD700" opacity="0.9">
    <animate attributeName="opacity" values="0.8;1;0.8" dur="5s" repeatCount="indefinite" />
  </circle>
  <g>
    <path d="M 650,40 L 650,10" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
    <path d="M 650,230 L 650,200" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
    <path d="M 570,120 L 540,120" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
    <path d="M 760,120 L 730,120" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
    <path d="M 595,65 L 575,45" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
    <path d="M 725,175 L 705,195" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
    <path d="M 595,175 L 575,195" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
    <path d="M 725,65 L 705,45" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
  </g>
  
  {/* <!-- Main Large Tree --> */}
  <g transform="translate(250, 350)">
    {/* <!-- Tree Trunk --> */}
    <path d="M -20,0 C -15,80 15,80 20,0 L 15,150 C 10,160 -10,160 -15,150 Z" fill="#8B4513" />
    
    {/* <!-- Tree Foliage --> */}
    <g>
      <circle cx="0" cy="-40" r="80" fill="#2d6a4f" />
      <circle cx="-50" cy="-20" r="60" fill="#40916c" />
      <circle cx="50" cy="-20" r="60" fill="#40916c" />
      <circle cx="-30" cy="-80" r="50" fill="#52b788" />
      <circle cx="30" cy="-80" r="50" fill="#52b788" />
      <circle cx="0" cy="-120" r="40" fill="#74c69d" />
    </g>
  </g>
  
  {/* <!-- Small Tree 1 --> */}
  <g transform="translate(100, 380)">
    <rect x="-7" y="0" width="14" height="70" fill="#8B4513" />
    <circle cx="0" cy="-20" r="35" fill="#52b788" />
    <circle cx="-15" cy="-35" r="25" fill="#40916c" />
    <circle cx="15" cy="-35" r="25" fill="#40916c" />
    <circle cx="0" cy="-55" r="20" fill="#74c69d" />
  </g>
  
  {/* <!-- Small Tree 2 --> */}
  <g transform="translate(400, 380)">
    <rect x="-7" y="0" width="14" height="70" fill="#8B4513" />
    <circle cx="0" cy="-20" r="35" fill="#52b788" />
    <circle cx="-15" cy="-35" r="25" fill="#40916c" />
    <circle cx="15" cy="-35" r="25" fill="#40916c" />
    <circle cx="0" cy="-55" r="20" fill="#74c69d" />
  </g>
  
  {/* <!-- Small Bush 1 --> */}
  <g transform="translate(150, 450)">
    <circle cx="0" cy="0" r="30" fill="#52b788" />
    <circle cx="-20" cy="-10" r="20" fill="#40916c" />
    <circle cx="20" cy="-10" r="20" fill="#40916c" />
    <circle cx="0" cy="-20" r="15" fill="#74c69d" />
  </g>
  
  {/* <!-- Small Bush 2 --> */}
  <g transform="translate(350, 450)">
    <circle cx="0" cy="0" r="30" fill="#52b788" />
    <circle cx="-20" cy="-10" r="20" fill="#40916c" />
    <circle cx="20" cy="-10" r="20" fill="#40916c" />
    <circle cx="0" cy="-20" r="15" fill="#74c69d" />
  </g>
  
  {/* <!-- Recycling Symbol --> */}
  <g transform="translate(600, 380) scale(0.7)">
    {/* <!-- Arrow 1 --> */}
    <path d="M 0,-50 L 30,-20 L 15,-20 C 15,0 35,40 75,40 L 75,60 C 15,60 -5,10 -5,-20 L -20,-20 Z" fill="#3CB371" />
    {/* <!-- Arrow 2 --> */}
    <path d="M 65,20 L 35,-10 L 35,5 C 15,5 -5,-35 -45,-35 L -45,-55 C 15,-55 35,-5 55,5 L 55,-10 Z" fill="#3CB371" />
    {/* <!-- Arrow 3 --> */}
    <path d="M -65,30 L -65,30 L -35,30 L -35,15 C -15,15 40,-5 40,-45 L 60,-45 C 60,15 20,45 -15,45 L -15,60 Z" fill="#3CB371" />
  </g>
  
  {/* <!-- Wind Turbine --> */}
  <g transform="translate(700, 350)">
    {/* <!-- Tower --> */}
    <path d="M -5,0 L 5,0 L 10,100 L -10,100 Z" fill="#D3D3D3" />

    <g>
      <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite" />
    
      <path d="M 0,0 L -5,-10 C -15,-50 -5,-80 5,-70 C 15,-60 5,-20 0,0 Z" fill="#F8F8FF" />
     
      <path d="M 0,0 L 8,-5 C 45,-25 70,-5 60,5 C 50,15 15,5 0,0 Z" fill="#F8F8FF" transform="rotate(120)" />
     
      <path d="M 0,0 L -3,8 C -30,45 -65,70 -55,60 C -45,50 -15,15 0,0 Z" fill="#F8F8FF" transform="rotate(240)" />
    </g>
   
    <circle cx="0" cy="0" r="7" fill="#C0C0C0" />
  </g>
  
  <g transform="translate(500, 500) scale(0.7)">
    <rect x="-70" y="-30" width="140" height="60" fill="#4169E1" stroke="#000" stroke-width="2" />
  
    <line x1="-70" y1="-10" x2="70" y2="-10" stroke="#000" stroke-width="1" />
    <line x1="-70" y1="10" x2="70" y2="10" stroke="#000" stroke-width="1" />
    <line x1="-35" y1="-30" x2="-35" y2="30" stroke="#000" stroke-width="1" />
    <line x1="0" y1="-30" x2="0" y2="30" stroke="#000" stroke-width="1" />
    <line x1="35" y1="-30" x2="35" y2="30" stroke="#000" stroke-width="1" />
    
    <path d="M -50,30 L -40,50 L 40,50 L 50,30" fill="none" stroke="#000" stroke-width="2" />
  </g>
  

  <g transform="translate(130, 170) scale(0.6)">
 
    <circle cx="0" cy="0" r="20" fill="#333" />
    <text x="0" y="5" text-anchor="middle" font-size="20" fill="white">C</text>
    
    
    <circle cx="60" cy="0" r="18" fill="#f03e3e" />
    <text x="60" y="5" text-anchor="middle" font-size="18" fill="white">O</text>
    
    <circle cx="-60" cy="0" r="18" fill="#f03e3e" />
    <text x="-60" y="5" text-anchor="middle" font-size="18" fill="white">O</text>

    <line x1="20" y1="0" x2="42" y2="0" stroke="#333" stroke-width="8" />
    <line x1="-20" y1="0" x2="-42" y2="0" stroke="#333" stroke-width="8" />
  </g>

  <g>
    <path d="M 300,100 C 310,95 315,105 320,100 C 325,95 330,105 340,100" stroke="#333" stroke-width="2" fill="none">
      <animate attributeName="d" values="M 300,100 C 310,95 315,105 320,100 C 325,95 330,105 340,100;M 300,105 C 310,100 315,110 320,105 C 325,100 330,110 340,105;M 300,100 C 310,95 315,105 320,100 C 325,95 330,105 340,100" dur="2s" repeatCount="indefinite" />
    </path>
    <path d="M 350,150 C 360,145 365,155 370,150 C 375,145 380,155 390,150" stroke="#333" stroke-width="2" fill="none">
      <animate attributeName="d" values="M 350,150 C 360,145 365,155 370,150 C 375,145 380,155 390,150;M 350,155 C 360,150 365,160 370,155 C 375,150 380,160 390,155;M 350,150 C 360,145 365,155 370,150 C 375,145 380,155 390,150" dur="1.7s" repeatCount="indefinite" />
    </path>
    <path d="M 400,80 C 410,75 415,85 420,80 C 425,75 430,85 440,80" stroke="#333" stroke-width="2" fill="none">
      <animate attributeName="d" values="M 400,80 C 410,75 415,85 420,80 C 425,75 430,85 440,80;M 400,85 C 410,80 415,90 420,85 C 425,80 430,90 440,85;M 400,80 C 410,75 415,85 420,80 C 425,75 430,85 440,80" dur="2.3s" repeatCount="indefinite" />
    </path>
  </g>
  
  <g transform="translate(460, 240)">
    <path d="M -100,-70 L 100,-70 Q 120,-70 120,-50 L 120,50 Q 120,70 100,70 L -70,70 L -100,100 L -90,70 L -100,70 Q -120,70 -120,50 L -120,-50 Q -120,-70 -100,-70 Z" fill="white" stroke="#2d6a4f" stroke-width="3" />
    

    <text x="0" y="-30" text-anchor="middle" font-size="24" fill="#2d6a4f" font-weight="bold">Earn Green Points</text>
    <text x="0" y="10" text-anchor="middle" font-size="16" fill="#333">Track eco-friendly actions</text>
    <text x="0" y="40" text-anchor="middle" font-size="16" fill="#333">Reduce carbon footprint</text>
  </g>
  
 
  <g opacity="0.8">
    <g>
      <circle cx="100" cy="80" r="30" fill="white" />
      <circle cx="130" cy="70" r="30" fill="white" />
      <circle cx="160" cy="80" r="25" fill="white" />
      <circle cx="135" cy="90" r="25" fill="white" />
      
      <animateTransform 
        attributeName="transform"
        attributeType="XML"
        type="translate"
        from="0 0"
        to="50 0"
        dur="30s"
        repeatCount="indefinite"
      />
    </g>
    
    <g>
      <circle cx="440" cy="120" r="25" fill="white" />
      <circle cx="470" cy="110" r="25" fill="white" />
      <circle cx="490" cy="120" r="20" fill="white" />
      <circle cx="465" cy="130" r="20" fill="white" />
      
      <animateTransform 
        attributeName="transform"
        attributeType="XML"
        type="translate"
        from="0 0"
        to="-80 0"
        dur="35s"
        repeatCount="indefinite"
      />
    </g>
  </g>
</svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it simple to track your sustainable actions and get rewarded
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-green-50 p-6 rounded-xl hover:shadow-md transition-shadow duration-300"
              >
                <div className="bg-white inline-block p-3 rounded-lg shadow-sm mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Growing Community Today</h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Over 10,000 people are already using EcoTracker to make a positive impact on our planet.
          </p>
          <a
            href="/register"
            className="inline-flex items-center justify-center bg-white text-green-700 px-6 py-3 rounded-xl shadow-lg hover:bg-green-50 transition-all duration-300 text-lg font-medium"
          >
            Create Free Account
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Leaf className="h-6 w-6 text-green-600 mr-2" />
              <span className="font-bold text-xl text-green-800">EcoTracker</span>
            </div>
            <div className="flex space-x-6">
              <a href="/about" className="text-gray-600 hover:text-green-600">About</a>
              <a href="/contact" className="text-gray-600 hover:text-green-600">Contact</a>
              <a href="/privacy" className="text-gray-600 hover:text-green-600">Privacy</a>
              <a href="/terms" className="text-gray-600 hover:text-green-600">Terms</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} EcoTracker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}