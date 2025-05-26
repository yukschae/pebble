"use client";

import React, { useEffect } from 'react'; 
import { AuthContext, useAuthContext as useAuthInternalHook } from "@/lib/supabase";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const authData = useAuthInternalHook(); // This creates the state ONCE
  
    useEffect(() => {
      console.log("AuthProvider: Providing context value:", {
        user: !!authData.user,
        loading: authData.loading,
        profile: !!authData.userProfile,
      });
    }, [authData]);
  
    return (
      <AuthContext.Provider value={authData}>
        {children}
      </AuthContext.Provider>
    );
  }