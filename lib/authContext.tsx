'use client'

import { useRouter } from 'next/navigation';
import React, { ReactElement, ReactNode, createContext, useEffect, useState } from 'react';
const jwt = require("jsonwebtoken");

interface isAuthContextType {
    isAuth: boolean | undefined;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

export const isAuthContext = createContext<isAuthContextType>({
    isAuth: false,
    setIsAuth: () => undefined,
});

export const IsAuthProvider = ({ children }: any) => {
    const [isAuth, setIsAuth] = useState<boolean | undefined>(false);

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const path = window.location.pathname;

        // Autoriser l'accès à la page userTerms sans vérification d'authentification
        if (path === '/userTerms') {
            setIsAuth(false);
            return;
        }

        const isTokenExpired = async (token: string) => {
            try {
                const decodedToken = await jwt.decode(token, { complete: true });
                if (!decodedToken) {
                    localStorage.removeItem(token);
                    router.push("/");
                    return true; // Le token est invalide ou expiré
                }

                const currentTimestamp = Date.now() / 1000; // Timestamp actuel en secondes
                const expirationTimestamp = decodedToken.payload.exp; // Date d'expiration du token en secondes

                return expirationTimestamp < currentTimestamp; // Le token est expiré si la date d'expiration est antérieure à l'heure actuelle
            } catch (error) {
                console.error('Erreur lors de la vérification du token :', error);
                return true; // En cas d'erreur, considérer le token comme expiré
            }
        };

        isTokenExpired(token as string);

    }, [router]);

    return (
        <isAuthContext.Provider value={{ isAuth, setIsAuth }}>
            {children}
        </isAuthContext.Provider>
    );
};
