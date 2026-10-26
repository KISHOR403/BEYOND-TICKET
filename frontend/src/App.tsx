import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Pages
import { HomePage } from "@/pages/HomePage";
import { ExplorePage } from "@/pages/ExplorePage";
import { CategoryPage } from "@/pages/CategoryPage";
import { EventDetailPage } from "@/pages/EventDetailPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { TicketSuccessPage } from "@/pages/TicketSuccessPage";
import { MyTicketsPage } from "@/pages/MyTicketsPage";
import { TicketValidationPage } from "@/pages/TicketValidationPage";
import { OrganizerPage } from "@/pages/OrganizerPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/events/:slug" element={<EventDetailPage />} />
              <Route path="/checkout/:reservationId" element={<CheckoutPage />} />
              <Route path="/tickets" element={<MyTicketsPage />} />
              <Route path="/tickets/success" element={<TicketSuccessPage />} />
              <Route path="/scanner" element={<TicketValidationPage />} />
              <Route path="/organizer" element={<OrganizerPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
