function MessagesLoadingSkeleton() {
  return (
    <div className="max-w-3xl md:max-w-6xl mx-auto space-y-6">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className={`chat ${index % 2 === 0 ? "chat-start" : "chat-end"} animate-pulse`}
        >
          <div className={`chat-bubble rounded-2xl bg-slate-800 text-white w-32`}></div>
        </div>
      ))}
    </div>
  );
}
export default MessagesLoadingSkeleton;