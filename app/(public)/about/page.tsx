"use client"
import { Download, Heart, Users, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

type TabType = 'mission' | 'values' | 'team';

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('mission');

  const content: Record<TabType, {
    title: string;
    image: { icon: string; label: string };
    bullets: string[];
    description: string;
    story: string;
    stats: { number: string; label: string }[];
  }> = {
    mission: {
      title: "Our Mission",
      image: {
        icon: "/ch.jpeg",
        label: "Mission Focus"
      },
      bullets: [
        "Empowering communities through sustainable development",
        "Creating lasting solutions to local challenges",
        "Building bridges between resources and needs"
      ],
      description: "Our Mission Drive",
      story: "We exist to create meaningful change in communities by connecting resources with real needs. Our mission-driven approach ensures every initiative has a clear purpose and measurable impact.",
      stats: [
        { number: "160+", label: "Families Helped" },
        { number: "5", label: "Active Volunteers" },
        { number: "2+", label: "Communities Served" }
      ]
    },
    values: {
      title: "Our Values",
      image: {
        icon: "/c8.jpg",
        label: "Core Values"
      },
      bullets: [
        "Integrity in all our actions and decisions",
        "Respect for diverse perspectives and cultures",
        "Excellence in service delivery and outcomes"
      ],
      description: "Our Core Values",
      story: "Our values guide every decision we make and every action we take. They are the foundation upon which we build trust with our communities and partners.",
      stats: [
        { number: "100%", label: "Transparency" },
        { number: "24/7", label: "Community Support" },
        { number: "1+", label: "Years Experience" }
      ]
    },
    team: {
      title: "Our Team",
      image: {
        icon: "/c9.jpg",
        label: "Leadership Team"
      },
      bullets: [
        "Diverse backgrounds bringing unique perspectives",
        "Proven track record in community development",
        "Passionate commitment to social impact"
      ],
      description: "Our Amazing Team",
      story: "Our team brings together passionate individuals from diverse backgrounds, united by a common goal of creating positive change in communities around the world.",
      stats: [
        { number: "8", label: "Team Members" },
        { number: "2", label: "Countries" },
        { number: "4", label: "Languages Spoken" }
      ]
    }
  };

  const currentContent = content[activeTab];

  const services = [
    {
      title: "Healthcare Support",
      description: "Providing essential medical assistance and organizing blood drives to support our community health needs.",
      link: "/projects"
    },
    {
      title: "Nutrition Programs",
      description: "Combating food insecurity by distributing nutritious meals and groceries to families in need.",
      link: "/food"
    },
    {
      title: "Clean Water Access",
      description: "Ensuring communities have reliable access to clean, safe drinking water through sustainable solutions.",
      link: "/projects"
    },
    {
      title: "Educational Empowerment",
      description: "Building brighter futures through educational programs, scholarships, and skill development initiatives.",
      link: "/projects"
    }
  ];

  return (
    <div className="bg-[#fafffa]">
      {/* MINIMAL HERO */}
      <section className="py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="max-w-4xl mb-20">
          <span className="text-sm text-gray-500 uppercase tracking-wider">About Us</span>
          <h1 className="text-5xl md:text-7xl font-light text-gray-900 mt-4 mb-8 leading-tight">
            Creating <span className="font-semibold text-green-600">meaningful change</span> in communities worldwide
          </h1>
          <p className="text-xl text-gray-500 font-light leading-relaxed mb-8">
            We believe in the power of compassion, sustainable development, and meaningful partnerships 
            to create lasting positive change in the communities we serve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/exist">
              <button className="px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300 hover:scale-105 font-light">
                Why We Do This 
              </button>
            </Link>
            <Link href="/donate">
              <button className="px-8 py-4 border border-gray-300 text-gray-700 rounded-full hover:border-green-600 hover:text-green-600 transition-all duration-300 font-light">
                Support Our Mission
              </button>
            </Link>
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100">
            <Image
            width={1000}
            height={1000}
              src="/7.jpg"
              alt="Our community work"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="relative aspect-square md:aspect-auto rounded-2xl overflow-hidden bg-gray-100">
            <Image
            width={1000}
            height={1000}
              src="/c7.jpg"
              alt="Community impact"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-b border-gray-200">
          <div>
            <div className="text-4xl font-light text-green-600 mb-2">160+</div>
            <div className="text-sm text-gray-500">Families Helped</div>
          </div>
          <div>
            <div className="text-4xl font-light text-green-600 mb-2">5</div>
            <div className="text-sm text-gray-500">Active Volunteers</div>
          </div>
          <div>
            <div className="text-4xl font-light text-green-600 mb-2">4</div>
            <div className="text-sm text-gray-500">Communities</div>
          </div>
          <div>
            <div className="text-4xl font-light text-green-600 mb-2">1+</div>
            <div className="text-sm text-gray-500">Years Experience</div>
          </div>
        </div>
      </div>
    </section>

      {/* WHAT WE DO */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <span className="text-sm text-gray-500 uppercase tracking-wider">Our Services</span>
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mt-4 mb-6">
              What we <span className="font-semibold text-green-600">do</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl font-light">
              Our comprehensive approach addresses multiple aspects of community wellbeing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, idx) => (
              <div key={idx} className="group">
                <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-xl font-light text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <Link href={service.link} className="text-green-600 text-sm font-light hover:text-green-700">
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-20">
            <span className="text-sm text-gray-500 uppercase tracking-wider">Our Journey</span>
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mt-4 mb-12">
              Who we <span className="font-semibold text-green-600">are</span>
            </h2>

            {/* Description */}
            <div className="max-w-4xl mb-12 space-y-6">
              <p className="text-lg text-gray-600 leading-relaxed">
                EmpowerDreamz is a registered 501(c)(3) nonprofit organization dedicated to transforming lives and building stronger communities. 
                We believe in the power of compassion, sustainable development, and meaningful partnerships to create lasting positive change.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                As a federally recognized tax-exempt organization, all donations to EmpowerDreamz are tax-deductible to the fullest extent permitted by law. 
                We are committed to transparency, accountability, and maximizing the impact of every contribution we receive.
              </p>
            </div>

            {/* Download Button */}
            <a 
              href="/documents/09_24_25_OH_State_Notice_Empowering_Dreamers_Foundation.pdf" 
              download
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300 mb-16"
            >
              <Download className="w-5 h-5" />
              Download 501(c)(3) Letter
            </a>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => setActiveTab('mission')}
                className={`px-8 py-3 rounded-full font-light transition-all duration-300 ${
                  activeTab === 'mission' 
                    ? 'bg-green-600 text-white' 
                    : 'border border-gray-300 text-gray-700 hover:border-green-600'
                }`}
              >
                Our Mission
              </button>
              <button 
                onClick={() => setActiveTab('values')}
                className={`px-8 py-3 rounded-full font-light transition-all duration-300 ${
                  activeTab === 'values' 
                    ? 'bg-green-600 text-white' 
                    : 'border border-gray-300 text-gray-700 hover:border-green-600'
                }`}
              >
                Our Values
              </button>
              <button 
                onClick={() => setActiveTab('team')}
                className={`px-8 py-3 rounded-full font-light transition-all duration-300 ${
                  activeTab === 'team' 
                    ? 'bg-green-600 text-white' 
                    : 'border border-gray-300 text-gray-700 hover:border-green-600'
                }`}
              >
                Our Team
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
              <Image
            width={1000}
            height={1}
                src={currentContent.image.icon} 
                alt={currentContent.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div>
              <h3 className="text-3xl font-light text-gray-900 mb-6">
                {currentContent.description}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                {currentContent.story}
              </p>

              {/* Bullets */}
              <div className="space-y-4 mb-8">
                {currentContent.bullets.map((bullet, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-600">{bullet}</p>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                {currentContent.stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-light text-green-600 mb-1">{stat.number}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm text-gray-500 uppercase tracking-wider">Our Impact</span>
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mt-4">
              Making a <span className="font-semibold text-green-600">difference</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-6xl font-light text-green-600 mb-2">160+</div>
              <div className="text-gray-600">Families Helped</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-light text-green-600 mb-2">5</div>
              <div className="text-gray-600">Active Volunteers</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-light text-green-600 mb-2">1+</div>
              <div className="text-gray-600">Communities Served</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-light text-green-600 mb-2">2+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* JOIN US */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm text-gray-500 uppercase tracking-wider">Get Involved</span>
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mt-4 mb-6">
              Be part of our <span className="font-semibold text-green-600">story</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
              Every person who joins our mission adds another chapter to our story of community transformation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Support */}
            <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-green-600/10 flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-4">Support Our Work</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Your contributions help us expand our programs and reach more families in need across our communities.
              </p>
              <Link href="/donate" className="text-green-600 text-sm font-light hover:text-green-700 inline-flex items-center gap-1">
                Make a Donation →
              </Link>
            </div>

            {/* Volunteer */}
            <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-green-600/10 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-4">Join Our Team</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Become a volunteer and experience the joy of directly impacting lives while building meaningful connections.
              </p>
              <Link href="/contact" className="text-green-600 text-sm font-light hover:text-green-700 inline-flex items-center gap-1">
                Start Volunteering →
              </Link>
            </div>

            {/* Share */}
            <div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-green-600/10 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-4">Share Our Mission</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Help us reach more people by sharing our story and connecting us with others who share our values.
              </p>
              <Link href="/contact" className="text-green-600 text-sm font-light hover:text-green-700 inline-flex items-center gap-1">
                Get Connected →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-green-600 text-white">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6">
      Ready to make an <span className="font-semibold">impact?</span>
    </h2>
    <p className="text-base sm:text-lg md:text-xl text-green-100 mb-8 sm:mb-10 md:mb-12 font-light px-4">
      Join thousands of donors creating change around the world.
    </p>
    
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
      <Link href="/donate">
        <button className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-green-600 rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 text-sm sm:text-base">
          Donate Now
          <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      </Link>
      <Link href="/contact">
        <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/20 text-white rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-105 text-sm sm:text-base">
          Contact Us
        </button>
      </Link>
    </div>
  </div>
     </section>
    </div>
  );
};

export default AboutPage;