import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserTab from "@/components/user-tab";
import AdminTab from "@/components/admin-tab";

export default function TaskManagement() {
  const [activeTab, setActiveTab] = useState("user");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <i className="fas fa-tasks text-xl"></i>
              </div>
              <h1 className="text-xl font-bold text-foreground">Task Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">v1.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger 
                value="user" 
                className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground font-medium text-sm focus:outline-none transition-colors duration-200 bg-transparent rounded-none"
                data-testid="tab-user"
              >
                <i className="fas fa-user mr-2"></i>
                User Dashboard
              </TabsTrigger>
              {isAdminUnlocked && (
                <TabsTrigger 
                  value="admin" 
                  className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary text-muted-foreground hover:text-foreground font-medium text-sm focus:outline-none transition-colors duration-200 bg-transparent rounded-none"
                  data-testid="tab-admin"
                >
                  <i className="fas fa-shield-alt mr-2"></i>
                  Admin Panel
                </TabsTrigger>
              )}
            </TabsList>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <TabsContent value="user" className="mt-0">
                <UserTab />
              </TabsContent>
              
              <TabsContent value="admin" className="mt-0">
                <AdminTab 
                  isUnlocked={isAdminUnlocked} 
                  onUnlock={() => {
                    setIsAdminUnlocked(true);
                    setActiveTab("admin");
                  }} 
                />
              </TabsContent>
            </main>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
