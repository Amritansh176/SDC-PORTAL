import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import PillNav from './PillNav';
import Prism from './components/Prism';
import FloatingLines from './components/FloatingLines';
import { MacbookScroll } from './components/ui/macbook-scroll';
import { ArrowRight, Code, Cloud, Cpu, Globe, Zap, Shield, Smartphone, MapPin, Mail, Phone, Send } from 'lucide-react';
import { IconBrandLinkedin, IconBrandGithub, IconBrandTwitter, IconBrandInstagram } from '@tabler/icons-react';
import GridScan from './GridScan';
import TextType from './TextType';

export default function App({ onPortalClick }) {
  const contentRef = useRef(null);

  useEffect(() => {
    // Entrance animations for content
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.stagger-up',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
      );
    }, contentRef);
    return () => ctx.revert();
  }, []);

  const services = [
    { icon: <Code className="w-8 h-8 mb-4 text-purple-400" />, title: 'Custom Software', desc: 'Enterprise-grade applications tailored to your specific business needs.' },
    { icon: <Cloud className="w-8 h-8 mb-4 text-blue-400" />, title: 'Cloud Architecture', desc: 'Scalable and secure cloud infrastructure utilizing AWS, Azure, or GCP.' },
    { icon: <Cpu className="w-8 h-8 mb-4 text-pink-400" />, title: 'AI & Machine Learning', desc: 'Integrating intelligent algorithms to automate and optimize processes.' },
    { icon: <Smartphone className="w-8 h-8 mb-4 text-teal-400" />, title: 'Mobile Solutions', desc: 'High-performance native and cross-platform mobile experiences.' },
  ];

  const stats = [
    { value: '10+', label: 'Years Experience' },
    { value: '250+', label: 'Successful Projects' },
    { value: '99%', label: 'Client Satisfaction' },
    { value: '24/7', label: 'Support Available' },
  ];

  return (
    <div className="min-h-screen bg-white text-black selection:bg-purple-500/30 font-sans" ref={contentRef}>
      {/* Header */}
      <header className="fixed top-4 inset-x-4 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-[95%] max-w-7xl z-50 pointer-events-auto">
        <div className="flex justify-between items-center bg-white/90 backdrop-blur-lg border border-gray-100 shadow-sm rounded-3xl px-6 py-3">
          <div className="flex items-center text-3xl font-black tracking-tighter">
            <span className="text-orange-500 mr-[2px]">III</span>SDC
          </div>
          
          <div className="hidden md:block">
            <PillNav
              hideLogo={true}
              items={[
                { label: 'HOME', href: '/' },
                { label: 'ABOUT', href: '/about' },
                { label: 'SERVICES', href: '/services' },
                { label: 'CONTACT', href: '/contact' }
              ]}
              activeHref="/"
              className="custom-nav"
              ease="power2.easeOut"
              baseColor="transparent"
              pillColor="#ffffff"
              hoveredPillTextColor="#ffffff"
              pillTextColor="#000000"
              initialLoadAnimation={false}
            />
          </div>
          
          <button
            id="team-portal-btn"
            onClick={onPortalClick}
            className="px-6 py-3 bg-black text-white text-sm font-bold rounded-full hover:scale-105 transition-transform flex items-center space-x-2 group"
          >
            <span>Team Portal</span>
            <ArrowRight className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#fafafa]">
        {/* Background decorations */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <GridScan
              sensitivity={0}
              lineThickness={1}
              linesColor="#000000"
              gridScale={0.1}
              scanColor="#ffa200"
              scanOpacity={0}
              enablePost
              bloomIntensity={0.6}
              chromaticAberration={0.002}
              noiseIntensity={0}
              lineJitter={0}
              scanGlow={0.5}
              scanSoftness={2}
              enableWebcam={false}
              showPreview={false}
              rotationSpeed={0.05}
            />
          </div>
        </div>
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-8 shadow-sm stagger-up">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700 tracking-wide">Accepting New Projects</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight mb-6 leading-[1.1] stagger-up text-black">
              We Engineer <br />
              <span className="text-orange-500 min-h-[1.1em] inline-block">
                <TextType 
                  text={["Digital Excellence", "Cloud Architecture", "Custom Software", "Mobile Solutions"]}
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor={true}
                  cursorCharacter="_"
                  deletingSpeed={50}
                  cursorBlinkDuration={0.5}
                />
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-xl leading-relaxed stagger-up">
              Empowering visionary companies with world-class software solutions. From intricate backend architectures to stunning user interfaces.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 stagger-up w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-black text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-300 flex items-center justify-center space-x-2">
                <span>Start a Project</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-gray-200 text-black font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center">
                Explore Our Work
              </button>
            </div>
          </div>

          {/* Right Visuals */}
          <div className="relative flex justify-center items-center stagger-up mt-12 lg:mt-0">
            {/* Concentric circles decoration */}
            <div className="absolute w-[500px] h-[500px] border-[0.5px] border-orange-500/20 rounded-full" />
            <div className="absolute w-[350px] h-[350px] border-[0.5px] border-orange-500/20 rounded-full" />
            <div className="absolute w-[200px] h-[200px] border-[0.5px] border-orange-500/20 rounded-full" />
            
            {/* Dots decorations */}
            <div className="absolute -top-10 -right-10 grid grid-cols-3 gap-2 opacity-40">
              {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-orange-500 rounded-full" />)}
            </div>
            <div className="absolute -bottom-10 left-0 grid grid-cols-3 gap-2 opacity-40">
              {[...Array(9)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-orange-500 rounded-full" />)}
            </div>

            <img src="/sdc-logo-black.png" alt="SDC Logo 3D" className="relative z-10 w-full max-w-lg drop-shadow-2xl" />
          </div>

        </div>

        {/* Scroll to Discover */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center stagger-up">
          <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">Scroll to discover</span>
          <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-orange-500 bg-white shadow-sm animate-bounce">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Macbook Scroll Section */}
      <section className="w-full overflow-hidden bg-black text-white border-b border-white/10">
        <MacbookScroll
          title={
            <span>
              Crafting Tomorrow's Solutions Today. <br /> Built for Scale.
            </span>
          }
          src={`/about_sdc_screen.png`}
          showGradient={false}
        />
      </section>

      {/* Services Section */}
      <section id="expertise" className="py-24 px-4 bg-white text-black relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 stagger-up">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Core Expertise</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">We deliver full-cycle software development services, combining deep technical expertise with industry best practices.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="stagger-up group relative p-8 rounded-3xl bg-black/[0.02] border border-black/5 hover:bg-black/[0.04] hover:border-black/10 transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
                {service.icon}
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 relative overflow-hidden border-y border-white/10 bg-black text-white">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="stagger-up">
                <div className="text-4xl md:text-6xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  {stat.value}
                </div>
                <div className="text-gray-400 font-medium tracking-wide text-sm uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#121212] text-white pt-20 pb-10 border-t border-gray-900">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-16 xl:gap-8 mb-20">
            
            {/* Left Column (takes 2 cols) */}
            <div className="xl:col-span-2 pr-8">
              <div className="text-[3.5rem] font-bold tracking-tighter mb-6 flex items-center leading-none">
                <div className="flex space-x-2 mr-3 h-12">
                  <div className="w-3.5 h-full bg-[#d34743]"></div>
                  <div className="w-3.5 h-full bg-[#e5a92a]"></div>
                  <div className="w-3.5 h-full bg-[#f4a261]"></div>
                </div>
                <span>SDC</span>
              </div>
              <p className="text-gray-400 mb-8 max-w-sm leading-relaxed text-base">
                SDC is a team of innovators and problem solvers building intelligent solutions for a better tomorrow.
              </p>
              <div className="space-y-4 text-base">
                <div className="flex items-center space-x-4 text-gray-300">
                  <MapPin className="w-5 h-5 text-[#d34743]" strokeWidth={1.5} />
                  <span>Jaipur, Rajasthan, India</span>
                </div>
                <div className="flex items-center space-x-4 text-gray-300">
                  <Mail className="w-5 h-5 text-[#e5a92a]" strokeWidth={1.5} />
                  <span>contact@sdc.com</span>
                </div>
                <div className="flex items-center space-x-4 text-gray-300">
                  <Phone className="w-5 h-5 text-[#f4a261]" strokeWidth={1.5} />
                  <span>+91 98765 43210</span>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-base font-semibold mb-4 tracking-wide uppercase">COMPANY</h4>
              <div className="w-8 h-0.5 bg-[#d34743] mb-8"></div>
              <ul className="space-y-5 text-gray-400 text-base">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Our Mission</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Team</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold mb-4 tracking-wide uppercase">SOLUTIONS</h4>
              <div className="w-8 h-0.5 bg-[#e5a92a] mb-8"></div>
              <ul className="space-y-5 text-gray-400 text-base">
                <li><a href="#" className="hover:text-white transition-colors">Web Development</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile Development</a></li>
                <li><a href="#" className="hover:text-white transition-colors">UI/UX Design</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cloud Solutions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI & Automation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Consulting</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold mb-4 tracking-wide uppercase">RESOURCES</h4>
              <div className="w-8 h-0.5 bg-[#f4a261] mb-8"></div>
              <ul className="space-y-5 text-gray-400 text-base">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Insights</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="xl:col-span-1">
              <h4 className="text-base font-semibold mb-4 tracking-wide uppercase">NEWSLETTER</h4>
              <div className="w-8 h-0.5 bg-[#d34743] mb-8"></div>
              <p className="text-gray-400 text-base mb-6 leading-relaxed">
                Stay updated with our latest news and insights.
              </p>
              <div className="flex items-center mb-6">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-transparent border border-gray-700 text-white px-4 py-3 rounded-l-md focus:outline-none focus:border-gray-500 text-sm"
                />
                <button className="bg-[#d34743] hover:bg-red-600 transition-colors px-5 py-3 rounded-r-md flex items-center justify-center border border-[#d34743]">
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-gray-500 text-sm">
                We respect your privacy.
              </p>
            </div>
            
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800/60 pt-8 flex flex-col md:flex-row items-center justify-between text-base text-gray-400">
            <div>
              © 2024 SDC. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 mt-6 md:mt-0">
              <span className="mr-2">Follow Us</span>
              <a href="#" className="p-2.5 border border-gray-700 rounded-full hover:bg-white hover:text-black transition-colors group">
                <IconBrandLinkedin stroke={1.5} className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="p-2.5 border border-gray-700 rounded-full hover:bg-white hover:text-black transition-colors group">
                <IconBrandGithub stroke={1.5} className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="p-2.5 border border-gray-700 rounded-full hover:bg-white hover:text-black transition-colors group">
                <IconBrandTwitter stroke={1.5} className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="p-2.5 border border-gray-700 rounded-full hover:bg-white hover:text-black transition-colors group">
                <IconBrandInstagram stroke={1.5} className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
