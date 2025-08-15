import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Shield, Key, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { hybridFlightService } from '@/services/hybridFlightService';

// Debug component to show API authentication status
export function ApiStatusDebug() {
  const [isOpen, setIsOpen] = useState(false);
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const info = await hybridFlightService.getAuthenticationInfo();
      setAuthInfo(info);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !authInfo) {
      checkAuthStatus();
    }
  }, [isOpen]);

  const getStatusBadge = (method: string, available: boolean, recommended?: boolean) => {
    if (!available) {
      return <Badge variant="secondary" className="text-xs">Not Available</Badge>;
    }

    if (method === 'oauth2') {
      return <Badge className="bg-green-100 text-green-800 text-xs">OAuth2 ✓</Badge>;
    }

    if (method === 'basic') {
      return <Badge className="bg-orange-100 text-orange-800 text-xs">Basic Auth (Legacy)</Badge>;
    }

    if (method === 'api_key') {
      return <Badge className="bg-blue-100 text-blue-800 text-xs">API Key</Badge>;
    }

    return <Badge variant="outline" className="text-xs">Anonymous</Badge>;
  };

  return (
    <Card className="border-dashed border-muted-foreground/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">API Authentication Status</CardTitle>
              </div>
              <ChevronDown 
                className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Checking authentication...</span>
              </div>
            ) : authInfo ? (
              <div className="space-y-4">
                {/* OpenSky Network Status */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">OpenSky Network</span>
                    {getStatusBadge(authInfo.opensky.method, authInfo.opensky.available, authInfo.opensky.recommended)}
                  </div>
                  
                  <div className="pl-6 space-y-1 text-xs text-muted-foreground">
                    <div>Rate Limit: 4000 daily credits</div>
                    <div>Method: {authInfo.opensky.method}</div>
                    {authInfo.opensky.method === 'oauth2' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Token Valid: {authInfo.opensky.tokenValid ? 'Yes' : 'No'}
                      </div>
                    )}
                    {authInfo.opensky.method === 'basic' && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <AlertTriangle className="h-3 w-3" />
                        Consider migrating to OAuth2
                      </div>
                    )}
                  </div>
                </div>

                {/* Aviation Stack Status */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Aviation Stack</span>
                    {getStatusBadge(authInfo.aviationstack.method, authInfo.aviationstack.available)}
                  </div>
                  
                  <div className="pl-6 space-y-1 text-xs text-muted-foreground">
                    <div>Rate Limit: 100 monthly calls</div>
                    <div>Method: {authInfo.aviationstack.method}</div>
                    <div>Role: Fallback service</div>
                  </div>
                </div>

                {/* Migration Notice */}
                {authInfo.opensky.method === 'basic' && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div className="text-xs">
                        <div className="font-medium text-orange-800">Migration Recommended</div>
                        <div className="text-orange-700 mt-1">
                          OpenSky Network is deprecating Basic Auth. Please migrate to OAuth2 Client Credentials for better security and future compatibility.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkAuthStatus}
                  className="w-full"
                >
                  Refresh Status
                </Button>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                Click to check authentication status
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}