'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ContactModal from './ContactModal';
import { useRouter } from 'next/navigation';

// Refined params to match usage in JobDetailsPage
interface JobActionsProps {
    jobId: string;
    ownerId: string;
    phone?: string;
    email?: string;
    currentUser: any; // Using any or User type if available, simple null check needed
}

export default function JobActions({ jobId, ownerId, phone, email, currentUser }: JobActionsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const isLoggedIn = !!currentUser;

    const handleContactClick = async () => {
        if (!isLoggedIn) {
            router.push('/login?next=' + encodeURIComponent(window.location.pathname));
            return;
        }
        setIsModalOpen(true);
    };

    const handleChatClick = () => {
        router.push(`/messages?to=${ownerId}&job=${jobId}`);
    };

    return (
        <>
            <button
                onClick={handleContactClick}
                className="w-full bg-[#0084db] text-white font-black py-4 rounded-xl hover:bg-[#006bb3] transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
                <MessageCircle className="w-5 h-5" />
                تواصل مع صاحب الوظيفة
            </button>

            <ContactModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                phone={phone}
                email={email}
                onChatClick={handleChatClick}
            />
        </>
    );
}
