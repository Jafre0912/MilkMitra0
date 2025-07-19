const ChatLayout = ({ children }) => {
  return (
    <div className="flex h-[80vh] bg-gray-100 overflow-hidden mt-2 mb-2">
      {children}
    </div>
  );
};

export default ChatLayout;