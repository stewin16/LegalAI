import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ChatPage from "./pages/ChatPage";
import ComparisonPage from "./pages/ComparisonPage";
import SummarizePage from "./pages/SummarizePage";
import DraftingPage from "./pages/DraftingPage";
import AIFeaturesHub from "./pages/AIFeaturesHub";
import NotFound from "./pages/NotFound";

// AI Tool Pages
import CasePredictorPage from "./pages/tools/CasePredictorPage";
import FIRGeneratorPage from "./pages/tools/FIRGeneratorPage";
import BailCheckerPage from "./pages/tools/BailCheckerPage";
import SectionFinderPage from "./pages/tools/SectionFinderPage";
import TranslatorPage from "./pages/tools/TranslatorPage";
import RiskAnalyzerPage from "./pages/tools/RiskAnalyzerPage";
import PrecedentMatcherPage from "./pages/tools/PrecedentMatcherPage";
import LawyerFinderPage from "./pages/tools/LawyerFinderPage";

import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/draft" element={<DraftingPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/summarize" element={<SummarizePage />} />
          <Route path="/features" element={<AIFeaturesHub />} />

          {/* AI Tool Pages */}
          <Route path="/tools/case-predictor" element={<CasePredictorPage />} />
          <Route path="/tools/fir-generator" element={<FIRGeneratorPage />} />
          <Route path="/tools/bail-checker" element={<BailCheckerPage />} />
          <Route path="/tools/section-finder" element={<SectionFinderPage />} />
          <Route path="/tools/translator" element={<TranslatorPage />} />
          <Route path="/tools/risk-analyzer" element={<RiskAnalyzerPage />} />
          <Route path="/tools/precedent-matcher" element={<PrecedentMatcherPage />} />
          <Route path="/tools/lawyer-finder" element={<LawyerFinderPage />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


