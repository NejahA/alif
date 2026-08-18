import { Link } from 'react-router-dom';

// Simple SVG icons to avoid import issues
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ToasterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="12" rx="2" ry="2" />
    <path d="M6 13v.01" />
    <path d="M18 13v.01" />
    <path d="M12 13v.01" />
    <path d="M8 21v-4" />
    <path d="M16 21v-4" />
  </svg>
);

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const CoffeeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

const RocketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

export default function LandingPage() {
  const features = [
    {
      icon: <ClockIcon />,
      title: 'Time Travel',
      description: 'Journey through six historical eras from prehistoric to futuristic.',
    },
    {
      icon: <ToasterIcon />,
      title: 'Toaster Discovery',
      description: 'Discover unique toasters in each time period with special abilities.',
    },
    {
      icon: <ZapIcon />,
      title: 'Energy System',
      description: 'Manage your energy wisely to travel and toast effectively.',
    },
    {
      icon: <GlobeIcon />,
      title: 'Multi-Period Exploration',
      description: 'Explore different eras and uncover their secrets.',
    },
    {
      icon: <CoffeeIcon />,
      title: 'Toast Collection',
      description: 'Collect toasts to unlock achievements and rewards.',
    },
    {
      icon: <RocketIcon />,
      title: 'Real-time Updates',
      description: 'Live updates and notifications for discoveries.',
    },
  ];

  const timePeriods = [
    { name: 'Prehistoric', color: 'bg-amber-900', period: 'prehistoric' },
    { name: 'Medieval', color: 'bg-rose-900', period: 'medieval' },
    { name: 'Renaissance', color: 'bg-yellow-800', period: 'renaissance' },
    { name: 'Industrial', color: 'bg-gray-700', period: 'industrial' },
    { name: 'Modern', color: 'bg-emerald-700', period: 'modern' },
    { name: 'Futuristic', color: 'bg-cyan-700', period: 'futuristic' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400">
                Time Traveling
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-300 via-white to-gray-300">
                Toaster
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Revolutionize your breakfast with the ultimate time-traveling toaster experience.
              Discover, toast, and explore across six historical eras!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
              >
                Start Your Journey
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 glass-effect text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
              >
                Existing Traveler
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-400">
            ALL Features Included
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-effect rounded-2xl p-6 hover:scale-105 transition-transform"
            >
              <div className="mb-4 text-amber-400">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Time Periods */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            Travel Through Time
          </span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {timePeriods.map((period, index) => (
            <div
              key={index}
              className={`${period.color} rounded-xl p-6 text-center transform hover:scale-110 transition-all cursor-pointer animate-pulse-glow`}
            >
              <div className="text-2xl font-bold mb-2">{period.name}</div>
              <div className="text-sm opacity-80">Era</div>
            </div>
          ))}
        </div>
      </div>

      {/* API Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-effect rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">System Status</h3>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>Backend API: Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>Database: Connected</span>
            </div>
          </div>
          <p className="text-gray-300">
            Powered by modern tech stack: React 19, Node.js, MongoDB, WebSockets
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Time Traveling Toaster. Revolutionizing breakfast since the beginning of time.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="/api-docs" className="text-amber-400 hover:text-amber-300">
              API Documentation
            </a>
            <a href="/health" className="text-amber-400 hover:text-amber-300">
              Health Check
            </a>
            <Link to="/login" className="text-amber-400 hover:text-amber-300">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}