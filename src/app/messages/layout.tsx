export default function MessagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="messages-root">
            {children}
        </div>
    );
}
