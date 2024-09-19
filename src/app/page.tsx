import Input from "@/components/ui/input";
import Header from "@/components/ui/header";
import ChatList from "@/components/ui/chat-list";
import ErrorModal from "@/components/ui/error-modal";
import MarkdownDemo from "@/components/demo/markdown-1-h1-h6-demo";


export default function Home() {
  return (
      <>
          <div className="w-full h-screen bg-black">
         <MarkdownDemo/>
        <ErrorModal/>
        <ChatList/>
        <Input/>
        <Header/>
          </div>
      </>
  );
}
