import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";

function ChatPage() {
  const { logout } = useAuthStore();

  return (
    <div className=" relative">
      <button onClick={logout} className="cursor-pointer">Logout</button>
    </div>
  );
}

export default ChatPage;
