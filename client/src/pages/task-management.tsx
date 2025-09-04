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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Login Button (Top Right) */}
      <div className="fixed top-4 right-4 z-50">
        <div className="relative">
          <Button
            onClick={() => setShowAdminPrompt(!showAdminPrompt)}
            variant="outline"
            size="sm"
            className="bg-white shadow-md"
            data-testid="button-admin-login-toggle"
          >
            🔒 Admin Login
          </Button>
          
          {showAdminPrompt && (
            <div className="absolute right-0 top-full mt-2 bg-white border rounded-md shadow-lg p-3 min-w-[200px]">
              <Input
                type="password"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="mb-2"
                data-testid="input-admin-code"
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              />
              <Button
                onClick={handleAdminLogin}
                size="sm"
                className="w-full"
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
                className="mb-4"
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