'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, User, PenSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ConversationsList() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeUserId = searchParams.get('user_id');

  const [user, setUser] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Fetch distinct conversations
      // Strategy: Get all messages where user is sender OR receiver
      const { data: allMessages } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (allMessages) {
        // Determine unread counts and last message per contact
        const contactMap: Record<string, any> = {};

        allMessages.forEach((msg: any) => {
          const contactId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

          if (!contactMap[contactId]) {
            contactMap[contactId] = {
              id: contactId,
              last_msg: msg,
              unread_count: 0
            };
          }

          // If this is the newest message so far (since list is desc, first hit is newest)
          // Actually, we are iterating desc, so the first time we see a contact, that's the latest message.
          // But we initialize above.

          // Check for unread
          if (msg.receiver_id === user.id && !msg.is_read) {
            contactMap[contactId].unread_count++;
          }
        });

        const contactIds = Object.keys(contactMap);
        if (contactIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', contactIds);

          if (profiles) {
            profiles.forEach(p => {
              if (contactMap[p.id]) {
                contactMap[p.id] = { ...contactMap[p.id], ...p };
              }
            });
          }
        }

        setContacts(Object.values(contactMap).sort((a, b) =>
          new Date(b.last_msg.created_at).getTime() - new Date(a.last_msg.created_at).getTime()
        ));
      }
      setLoading(false);
    };

    fetchContacts();

    // Realtime Subscription for List Updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const channel = supabase.channel(`conversations_list_${session.user.id}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${session.user.id}`
          }, () => {
            fetchContacts(); // Refresh list on new message recv
          })
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `sender_id=eq.${session.user.id}`
          }, () => {
            fetchContacts(); // Refresh list on message sent
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        }
      }
    });

  }, [supabase]);

  const filteredContacts = contacts.filter(c =>
    (c.full_name || 'مستخدم').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMessagePreview = (msg: any) => {
    if (!msg) return '';
    if (msg.content) return msg.content;
    if (msg.attachment_type === 'image') return '📷 صورة';
    if (msg.attachment_type === 'audio') return '🎤 رسالة صوتية';
    if (msg.attachment_type === 'video') return '🎥 فيديو';
    if (msg.attachment_type === 'file') return '📎 ملف';
    return 'مرفق';
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#115d9a]" /></div>;

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="h-16 bg-[#115d9a] flex items-center justify-between px-4 text-white shrink-0 shadow-sm z-10">
        <h1 className="font-bold text-lg">الرسائل</h1>
        <Link href="/talents" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <PenSquare className="h-5 w-5" />
        </Link>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-100 bg-gray-50/50">
        <div className="bg-white border border-gray-200 rounded-xl flex items-center px-3 h-10 shadow-sm focus-within:border-[#115d9a] focus-within:ring-1 focus-within:ring-[#115d9a]/20 transition-all">
          <Search className="h-4 w-4 text-gray-400 ml-2" />
          <input
            placeholder="ابحث في المحادثات..."
            className="bg-transparent flex-1 focus:outline-none text-sm text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredContacts.length > 0 ? (
          filteredContacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => router.push(`/messages?user_id=${contact.id}`)}
              className={`flex items-center gap-3 p-4 border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-colors ${activeUserId === contact.id ? 'bg-blue-50 border-l-4 border-l-[#115d9a]' : ''}`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                  {contact.avatar_url ? (
                    <img src={contact.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                {contact.unread_count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                    {contact.unread_count}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`font-bold text-sm truncate ${activeUserId === contact.id ? 'text-[#115d9a]' : 'text-gray-900'}`}>{contact.full_name || 'مستخدم مسار'}</h3>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(contact.last_msg.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <p className={`text-xs truncate ${contact.unread_count > 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                  {contact.last_msg.sender_id === user?.id && <span className="mr-1">أنت:</span>}
                  {getMessagePreview(contact.last_msg)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <User className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">لا توجد محادثات جارية</p>
            <Link href="/talents" className="mt-4 text-[#115d9a] text-sm font-bold hover:underline">
              ابدأ محادثة جديدة
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}