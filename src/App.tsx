import { HashRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { HomePage } from "./pages/HomePage";
import { PerformancePage } from "./pages/PerformancePage";
import { PerformanceDetailPage } from "./pages/PerformanceDetailPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { PageTransition } from "./components/PageTransition";

export default function App() {
  return (
    <HashRouter>
      <Header />
      <ScrollToTop />
      <main>
        <PageTransition>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/performance/:id" element={<PerformanceDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
        </PageTransition>
      </main>
    </HashRouter>
  );
}
