import { HashRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { HomePage } from "./pages/HomePage";
import { WorksPage } from "./pages/WorksPage";
import { PerformanceDetailPage } from "./pages/PerformanceDetailPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { PageTransition } from "./components/PageTransition";
import { NotFoundPage } from "./pages/NotFoundPage";
import { MediaPage } from "./pages/MediaPage";
import { AlbumDetailPage } from "./pages/AlbumDetailPage";

export default function App() {
  return (
    <HashRouter>
      <Header />
      <ScrollToTop />
      <main>
        <PageTransition>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/performance" element={<WorksPage />} />
          <Route path="/performance/:id" element={<PerformanceDetailPage />} />
          <Route path="/album/:id" element={<AlbumDetailPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </PageTransition>
      </main>
    </HashRouter>
  );
}
