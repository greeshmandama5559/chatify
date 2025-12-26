import { useEffect, useRef } from "react";
import {
  Sparkles,
  Shield,
  Zap,
  Heart,
  Globe,
  Video,
  Send,
  Users,
  Music,
  Camera,
  MessageCircle,
  Loader,
} from "lucide-react";
import { useForm, ValidationError } from "@formspree/react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import SideNavBar from "../components/SideNavBar";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

// Register GSAP Plugins
gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

const features = [
  {
    title: "Smart Matching",
    desc: "Our algorithm connects you with like-minded people based on your interests.",
    icon: Users,
  },
  {
    title: "Safe & Secure",
    desc: "End-to-end encryption and verified profiles keep your conversations secure.",
    icon: Shield,
  },
  {
    title: "Instant Connect",
    desc: "Break the ice instantly with our unique conversation starters.",
    icon: Zap,
  },
  {
    title: "Build Real Bonds",
    desc: "From casual chats to lifelong friendships, nurture relationships.",
    icon: Heart,
  },
  {
    title: "Global Community",
    desc: "Connect with people from over 100 countries.",
    icon: Globe,
  },
  {
    title: "Rich Video Calling",
    desc: "Express yourself with face time and react with stickers.",
    icon: Video,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const Home = () => {
  const containerRef = useRef(null);
  const { authUser, isAuthenticated } = useAuthStore();
  const userAuthenticated = isAuthenticated && authUser?.isVerified;

  // Smooth Scroll Handler
  const handleNavClick = (id) => {
    gsap.to(window, {
      duration: 1.2,
      scrollTo: { y: id, offsetY: 80 },
      ease: "power4.inOut",
    });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Entrance
      gsap.from(".hero-text", {
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      });

      // About Section Animation (ScrollTrigger)
      gsap.from(".about-content", {
        scrollTrigger: {
          trigger: "#about",
          start: "top 80%",
        },
        x: -100,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
      });

      // Contact Form Animation
      gsap.from(".contact-card", {
        scrollTrigger: {
          trigger: "#contact",
          start: "top 80%",
        },
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const [state, handleSubmit] = useForm("maqyyejv");
  if (state.succeeded) {
    toast.success("Thank you for responding");
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#050505] text-white overflow-x-hidden"
    >
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-cyan-900/20 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] bg-cyan-900/20 blur-[120px] rounded-full" />
      </div>

      {/* TOP NAV */}
      <nav className="nav-bar fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl flex justify-between items-center px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full">
        <div className="flex items-center gap-2">
          <Link to="/">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
              <Sparkles size={18} />
            </div>
          </Link>
          <h1 className="hidden md:block text-xl font-bold tracking-tighter">
            ConvoX
          </h1>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          <button
            onClick={() => handleNavClick("#features")}
            className="hover:text-cyan-400 transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => handleNavClick("#about")}
            className="hover:text-cyan-400 transition-colors"
          >
            About
          </button>
          <button
            onClick={() => handleNavClick("#contact")}
            className="hover:text-cyan-400 transition-colors"
          >
            Contact Us
          </button>
        </div>

        {!userAuthenticated && (
          <div className="flex gap-2">
            <Link
              to="/login"
              className="px-5 py-2 text-cyan-400 font-bold hover:text-cyan-300 transition-colors"
            >
              signin
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2 bg-white text-black font-bold rounded-full hover:bg-cyan-400 transition-colors"
            >
              Join Now
            </Link>
          </div>
        )}
      </nav>

      {/* MAIN CONTENT CONTAINER */}
      <div className=" relative z-10 mx-auto max-w-7xl px-6 scrollbar-hide">
        {/* HERO SECTION */}

        <section className="relative h-screen w-full flex flex-col items-center justify-center text-center">
          {/* 1. Floating Interest Icons (Decorative) */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] left-[15%] text-cyan-500/40 rotate-12"
            >
              <Heart size={40} />
            </motion.div>
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-[25%] left-[20%] text-blue-500/40 -rotate-12"
            >
              <MessageCircle size={48} />
            </motion.div>
            <motion.div
              animate={{ y: [0, -25, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute top-[25%] right-[18%] text-purple-500/40 rotate-12"
            >
              <Camera size={38} />
            </motion.div>
          </div>

          {/* 2. Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-4 py-1 border border-cyan-500/30 rounded-full bg-cyan-500/10 text-cyan-400 text-xs tracking-widest font-bold flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            CONNECTING SOULS
          </motion.div>

          {/* 3. Main Text */}
          <h2 className="hero-text text-4xl md:text-9xl font-black tracking-tighter leading-[0.9]">
            BEYOND <br />
            <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              CONVERSATION.
            </span>
          </h2>

          <p className="hero-text mt-8 max-w-lg text-slate-400 text-lg md:text-xl leading-relaxed">
            Don't just chat. Connect with people who vibe with your energy
            through AI-powered matching and immersive video experiences.
          </p>

          {/* 4. Action Buttons */}
          {/* <div className="hero-text mt-10 flex flex-col sm:flex-row gap-4 items-center">
            <button className="group relative px-8 py-4 bg-cyan-600 rounded-full font-bold text-white overflow-hidden transition-all hover:bg-cyan-500">
              <span className="relative z-10 flex items-center gap-2">
                Start Vibrating <MousePointer2 size={18} />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>

            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2">
              <Play size={18} className="fill-white" /> How it works
            </button>
          </div> */}

          {/* 5. Social Proof */}
          {/* <div className="hero-text mt-12 flex flex-col items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-[#050505] bg-slate-800 overflow-hidden"
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    alt="user"
                  />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-[#050505] bg-cyan-600 flex items-center justify-center text-[10px] font-bold">
                +2k
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Joined by 10,000+ souls worldwide
            </p>
          </div> */}

          {/* Background Pulsing Orb */}
          <div className="absolute -z-10 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        </section>
        {/* FEATURES SECTION */}
        <section id="features" className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-slate-400">
              Everything you need to find your next great connection.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:border-cyan-500/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
                  <item.icon className="text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
        {/* ABOUT SECTION */}
        <section
          id="about"
          className="py-32 flex flex-col md:flex-row items-center gap-16"
        >
          <div className="about-content flex-1">
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              Our Mission to <br />
              <span className="text-cyan-500">Humanize Digital</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              At ConvoX, we believe that in an increasingly digital world, real
              human connection is more valuable than ever. We've built a
              platform that strips away the superficiality of traditional social
              media.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-3xl font-bold text-white">10M+</h4>
                <p className="text-cyan-500 text-sm">Active Users</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-white">100+</h4>
                <p className="text-cyan-500 text-sm">Countries</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full aspect-video bg-linear-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl border border-white/10 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            {/* <MessageSquare size={100} className="text-cyan-400/50" /> */}
            <img src="/login.png" className="mt-3.5" alt="" />
          </div>
        </section>
        {/* CONTACT SECTION */}
        <section id="contact" className="py-32">
          <div className="contact-card max-w-4xl mx-auto bg-linear-to-b from-white/10 to-transparent p-1px rounded-4xl">
            <div className="bg-[#0a0a0a] rounded-4xl p-10 md:p-16 border border-white/5">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
                <p className="text-slate-400">
                  Have questions? We're here to help you connect.
                </p>
              </div>
              <form
                action={"https://formspree.io/f/maqyyejv"}
                method="POST"
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <input
                  type="text"
                  placeholder="Name"
                  required
                  name="name"
                  className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <ValidationError
                  prefix="Name"
                  field="name"
                  errors={state.errors}
                />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  name="email"
                  className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <ValidationError
                  prefix="Email"
                  field="email"
                  errors={state.errors}
                />
                <textarea
                  placeholder="Message"
                  required
                  name="message"
                  className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl px-6 py-4 h-40 focus:outline-none focus:border-cyan-500 transition-colors"
                ></textarea>
                <ValidationError
                  prefix="Message"
                  field="message"
                  errors={state.errors}
                />
                <button
                  disabled={state.submitting}
                  className="md:col-span-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  {state.submitting ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <>
                      {" "}
                      Send Message <Send size={18} />{" "}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
      <SideNavBar />
    </div>
  );
};

export default Home;
