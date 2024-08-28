


'use client';

import Link from 'next/link';
import { HomeIcon, Leaf, MapPin, MessageCircle, User } from 'lucide-react';

const Menu: React.FC = () => {
    return (
        <footer className="bg-white shadow-lg fixed bottom-0 w-full">
            <nav className="flex flex-col items-center w-full">
                <div className="w-full flex justify-center">
                    <div className="w-full h-px bg-gray-200 my-2"></div>
                </div>
                <div className="flex justify-around items-center py-3 w-full">
                    <Link href="/" passHref>
                        <p className="flex flex-col items-center">
                            <HomeIcon size={25} />
                            <span className="text-xs mt-1">Accueil</span>
                        </p>
                    </Link>
                    <Link href="/plantes-utilisateur" passHref>
                        <p className="flex flex-col items-center">
                            <Leaf size={25} />
                            <span className="text-xs mt-1">Plantes</span>
                        </p>
                    </Link>
                    <Link href="/chercher-plantes" passHref>
                        <p className="flex flex-col items-center">
                            <MapPin size={25} />
                            <span className="text-xs mt-1">Map</span>
                        </p>
                    </Link>
                    <Link href="/messages" passHref>
                        <p className="flex flex-col items-center">
                            <MessageCircle size={25} />
                            <span className="text-xs mt-1">Messages</span>
                        </p>
                    </Link>
                    <Link href="/profile" passHref>
                        <p className="flex flex-col items-center">
                            <User size={25} />
                            <span className="text-xs mt-1">Profil</span>
                        </p>
                    </Link>
                </div>
            </nav>
        </footer>
    );
};

export default Menu;
