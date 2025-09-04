import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import UserTab from "@/components/user-tab";
import AdminTab from "@/components/admin-tab";

export default function TaskManagement() {
  const [currentView, setCurrentView] = useState("user");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const { toast } = useToast();

  const handleAdminLogin = () => {
    if (adminCode === "332133") {
      setIsAdminUnlocked(true);
      setCurrentView("admin");
      setShowAdminPrompt(false);
      setAdminCode("");
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect admin code.",
        variant: "destructive",
      });
      setAdminCode("");
    }
  };

  const handleBackToUser = () => {
    setCurrentView("user");
  };

  return (
    <div className="min-h-screen" style={{ background: '#aaa' }}>
      {/* Admin Login Button (Top Right) */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <Button
            onClick={() => setShowAdminPrompt(!showAdminPrompt)}
            className="px-5 py-3 text-white border-none rounded-lg shadow-lg transition-colors duration-300"
            style={{ background: '#2c3e50' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1a252f'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2c3e50'}
            data-testid="button-admin-login-toggle"
          >
            🔒 Admin Login
          </Button>
          
          {showAdminPrompt && (
            <div className="absolute right-0 top-full mt-4 bg-white border border-gray-300 rounded-md shadow-lg p-3" style={{ minWidth: '200px' }}>
              <Input
                type="password"
                placeholder="Enter admin code"
                maxLength={6}
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="mb-2 p-2 w-full border border-gray-300 rounded-md text-center"
                data-testid="input-admin-code"
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              />
              <Button
                onClick={handleAdminLogin}
                className="w-full p-2 text-white border-none rounded-md cursor-pointer transition-colors duration-300"
                style={{ background: '#2980b9' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f6391'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#2980b9'}
                data-testid="button-admin-submit"
              >
                Enter
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {currentView === "user" && <UserTab />}
        {currentView === "admin" && isAdminUnlocked && (
          <div>
            <div className="mb-6">
              <Button
                onClick={handleBackToUser}
                variant="outline"
                className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
                data-testid="button-back-to-user"
              >
                ← Back to User Tab
              </Button>
            </div>
            <AdminTab 
              isUnlocked={isAdminUnlocked} 
              onUnlock={() => {
                setIsAdminUnlocked(true);
                setCurrentView("admin");
              }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}