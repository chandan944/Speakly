/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InfoPage() {
  const [isDark, setIsDark] = React.useState(false);

  const colors = {
    light: {
      bg: '#f8fafc',
      bgAlt: '#f1f5f9',
      text: '#1e293b',
      textLight: '#64748b',
      accent: '#06b6d4',
      accentLight: '#d4ff00',
      card: '#ffffff',
      border: '#e2e8f0'
    },
    dark: {
      bg: '#0f172a',
      bgAlt: '#1e293b',
      text: '#f1f5f9',
      textLight: '#cbd5e1',
      accent: '#06b6d4',
      accentLight: '#d4ff00',
      card: '#1e293b',
      border: '#334155'
    }
  };

  const theme = isDark ? colors.dark : colors.light;

  // Handle navigation
  const handleSignIn = () => {
    window.location.href = '/authentication/login';
  };

  const handleSignUp = () => {
    window.location.href = '/authentication/signup';
  };

  const FeatureSection = ({ title, description, image, features, imagePosition = 'left', multipleImages = false }) => (
    <section className="w-full py-12 md:py-20 px-4 md:px-6" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-full mx-auto px-0 md:px-0">
        <div className={`flex flex-col ${imagePosition === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 items-center`}>
          
          {/* Images Section */}
          {multipleImages ? (
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4 px-4 md:px-6">
              {image.map((img, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src={img} 
                    alt={`Feature ${idx + 1}`}
                    className="w-full h-48 md:h-56 object-cover"
                    onError={(e) => {
                      e.target.style.background = theme.bgAlt;
                      e.target.style.display = 'flex';
                      e.target.style.alignItems = 'center';
                      e.target.style.justifyContent = 'center';
                      e.target.textContent = `Image ${idx + 1}`;
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full md:w-1/2 px-4 md:px-6">
              <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-80 md:h-96 object-cover"
                  onError={(e) => {
                    e.target.style.background = theme.bgAlt;
                    e.target.style.display = 'flex';
                    e.target.style.alignItems = 'center';
                    e.target.style.justifyContent = 'center';
                    e.target.textContent = title;
                  }}
                />
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="w-full md:w-1/2 space-y-6 px-4 md:px-6">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: theme.text }}>
                {title}
              </h2>
              <p className="text-base md:text-lg leading-relaxed" style={{ color: theme.textLight }}>
                {description}
              </p>
            </div>

            {/* Features List */}
            <ul className="space-y-4">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div 
                    className="flex-shrink-0 mt-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
                  >
                    ✓
                  </div>
                  <span className="text-sm md:text-base" style={{ color: theme.textLight }}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text }} className="transition-colors duration-300 w-full">
      
      {/* Header with Theme Toggle */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm w-full" style={{ backgroundColor: theme.bg + 'E6', borderBottom: `1px solid ${theme.border}` }}>
        <div className="w-full px-4 md:px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: theme.accent }}>
            Talksy
          </h1>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg transition-colors duration-200"
            style={{ backgroundColor: theme.bgAlt }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden pt-16">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1650&q=80')",
          }}
        />
        
        {/* Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: isDark 
              ? 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' 
              : 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 space-y-6 w-full">
          <div className="space-y-2">
            <p className="text-sm md:text-base font-semibold text-white/90">
              Learn the better way ✨
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight inline">
              Talksy
              <span 
                className="inline-block w-3 md:w-4 h-3 md:h-4 rounded-full ml-2 md:ml-4 align-top"
                style={{ backgroundColor: colors.light.accentLight }}
              />
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/90 font-medium">
            Where learning meets creativity 💡
          </p>
          
        </div>
      </section>

      {/* Content Sections */}
      <FeatureSection
        title="Welcome Home 🏡"
        description="After creating your profile, you will land on the home page. Here you can express yourself, connect with others, and start your learning journey."
        image="/public/Homi.png"
        features={[
          "Create posts, like posts, and comment on them 💬",
          "Edit or delete your posts and comments ✏️🗑️",
          "Use the central icon to ask questions, get meanings of words or phrases 🧠💡"
        ]}
      />

      <section style={{ backgroundColor: theme.bgAlt }} className="w-full">
        <FeatureSection
          title="Connect, Learn & Grow Together 🤝✨"
          description="Welcome to your learning community! 🌱 Here you can build meaningful connections with fellow learners — share ideas, inspire each other, and grow every day."
          image="/public/Friend.png"
          imagePosition="right"
          features={[
            "🤗 Send or accept friend requests and start real conversations that spark growth.",
            "💡 Collaborate with others — shared learning increases memory retention by up to 65%.",
            "🚀 8 out of 10 learners say social learning helps them stay motivated and consistent."
          ]}
        />
      </section>

      <FeatureSection
        title="🎯 Quiz & Learn Zone"
        description="Play quizzes, learn through explanations, and understand concepts deeply! 🧩📚"
        image="/public/Quizes.png"
        imagePosition="right"
        features={[
          "When you try to recall information during a quiz, your brain strengthens that memory. ✨ This is called the testing effect — it literally rewires your brain to remember things longer!",
          "When quizzes include explanations, learners don't just memorize answers — they understand why something is right or wrong. 💡"
        ]}
      />

      <section style={{ backgroundColor: theme.bgAlt }} className="w-full">
        <FeatureSection
          title="📖 Library"
          description="Read stories, sentences, grammar lessons, and vocabulary words to improve your English skills. 📖✨"
          image="/public/Story.png"
          features={[
            "According to research by the University of Sussex, reading for just 6 minutes a day 📚 can ✨reduce stress by 68%✨ and improve focus!"
          ]}
        />
      </section>

      <FeatureSection
        title="🎮 Games"
        description="Play fun, interactive games to improve your English skills! 🎮🧠 Each game comes with a unique concept designed to make learning exciting and effective."
        image={["/public/FlipCrart.png", "/public/SenArrange.png", "/public/fill-black.png", "/public/BUttu.png"]}
        multipleImages={true}
        imagePosition="right"
        features={[
          "Translate sentences and get instant feedback on your answers.",
          "Spot and correct mistakes in grammar and vocabulary.",
          "Arrange shuffled words to form meaningful sentences."
        ]}
      />

      {/* CTA Section */}
      <section style={{ backgroundColor: theme.bgAlt }} className="w-full">
        <div className="w-full px-4 md:px-6 py-16 md:py-24">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">Ready to Transform Your Learning?</h2>
              <p className="text-lg md:text-xl" style={{ color: theme.textLight }}>
                Join thousands of learners already using Talksy to achieve their goals
              </p>
            </div>

            {/* Auth Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleSignIn}
                style={{ 
                  backgroundColor: theme.accent,
                  color: '#ffffff'
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-lg font-semibold text-base md:text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <LogIn size={20} />
                Sign In
              </button>

              <button
                onClick={handleSignUp}
                style={{ 
                  backgroundColor: 'transparent',
                  color: theme.accent,
                  border: `2px solid ${theme.accent}`
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-lg font-semibold text-base md:text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <UserPlus size={20} />
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${theme.border}` }} className="w-full py-8">
        <div className="w-full px-4 md:px-6 text-center" style={{ color: theme.textLight }}>
          <p className="text-sm md:text-base">
            © 2025 Talksy. All rights reserved. <br className="md:hidden" />
            <span className="hidden md:inline">| </span>
            your.talksy@gmail.com
          </p>
        </div>
      </footer>

    </div>
  );
}