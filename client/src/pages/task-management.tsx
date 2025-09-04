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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {/* Admin Login Button (Top Right) */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <Button
            onClick={() => setShowAdminPrompt(!showAdminPrompt)}
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none shadow-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
            data-testid="button-admin-login-toggle"
          >
            🔒 Admin Login
          </Button>
          
          {showAdminPrompt && (
            <div className="absolute right-0 top-full mt-2 bg-gradient-to-br from-white to-gray-50 border border-purple-200 rounded-lg shadow-xl p-4 min-w-[220px]">
              <Input
                type="password"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="mb-3 border-purple-200 focus:border-purple-400"
                data-testid="input-admin-code"
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              />
              <Button
                onClick={handleAdminLogin}
                size="sm"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none"
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