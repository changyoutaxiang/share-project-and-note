import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" data-testid="page-not-found">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4" data-testid="icon-404">🔍</div>
          <CardTitle className="text-2xl font-bold" data-testid="text-404-title">
            页面未找到
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground" data-testid="text-404-description">
            抱歉，您访问的页面不存在或已被移动。
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={handleGoHome}
              data-testid="button-go-home"
            >
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              data-testid="button-go-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回上页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}