import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, Scale, MessageSquare, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TricolorBackground from "@/components/TricolorBackground";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const quickLinks = [
    { icon: MessageSquare, label: "Legal Chat", path: "/chat", description: "Ask legal questions" },
    { icon: FileText, label: "Draft Documents", path: "/draft", description: "Generate legal documents" },
    { icon: Scale, label: "AI Tools Hub", path: "/features", description: "Explore all tools" },
    { icon: HelpCircle, label: "IPC vs BNS", path: "/compare", description: "Compare legal codes" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <TricolorBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full text-center"
        >
          {/* 404 Visual */}
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-navy-india/10 to-navy-india/5 border-2 border-navy-india/20 mb-6"
            >
              <span className="text-6xl font-bold text-navy-india">404</span>
            </motion.div>
          </div>

          {/* Error Message */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4"
          >
            Page Not Found
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 mb-8 max-w-md mx-auto"
          >
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </motion.p>

          {/* Main Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <Button asChild size="lg" className="btn-navy rounded-full px-8">
              <Link to="/">
                <Home className="w-5 h-5 mr-2" />
                Go to Homepage
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-2">
              <Link to="/features">
                <Search className="w-5 h-5 mr-2" />
                Explore Tools
              </Link>
            </Button>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="group p-4 glass-tricolor-card rounded-xl hover:shadow-lg transition-all"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="icon-container icon-navy mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <link.icon className="w-5 h-5" />
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{link.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{link.description}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10"
          >
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Go back to previous page
            </button>
          </motion.div>

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-12 text-xs text-gray-400"
          >
            Attempted path: <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code>
          </motion.p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
