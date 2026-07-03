import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { AuthProvider } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { AuthPage } from "@/pages/auth-page"
import { DashboardPage } from "@/pages/dashboard-page"
import { JobTrackerPage } from "@/pages/job-tracker-page"
import { ResumeManagerPage } from "@/pages/resume-manager-page"
import { Button } from "@/components/ui/button"

function About() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold tracking-tight">About</h1>
      <p className="text-muted-foreground text-lg">This is the about page.</p>
      <Button variant="secondary" asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  )
}

function Contact() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold tracking-tight">Contact</h1>
      <p className="text-muted-foreground text-lg">This is the contact page.</p>
      <Button variant="secondary" asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<AuthPage />} />

          {/* Protected routes — redirect to /login when no JWT */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/jobs" element={<JobTrackerPage />} />
            <Route path="/resume" element={<ResumeManagerPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
