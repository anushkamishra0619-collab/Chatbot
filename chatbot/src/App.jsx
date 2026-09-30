import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactMarkdown from 'react-markdown'
import './App.css'
import RecentQuestions from './components/RecentQuestions'
import { askQuestion } from './features/chat/chatSlice'

function App() {
  const [question, setQuestion] = useState("");
  const dispatch = useDispatch();
  const { answer, loading, recentHistory } = useSelector((state) => state.chat);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(recentHistory));
  }, [recentHistory]);

  const submitQuestion = () => {
    if (!question.trim() || loading) return;
    dispatch(askQuestion(question));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submitQuestion();
  };

  return (
    <div className="grid grid-cols-5 h-screen text-center">
      <RecentQuestions questions={recentHistory} onSelect={setQuestion} />
      <div className="col-span-4 p-10">
        <div className="container mx-auto max-h-[70vh] min-h-64 overflow-y-auto wrap-break-words px-6 py-5 text-left leading-7 text-white [&_h1]:mb-3 [&_h1]:text-2xl [&_h2]:mb-2 [&_h2]:text-xl [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6">
          {loading ? "Thinking..." : <ReactMarkdown>{answer}</ReactMarkdown>}
        </div>
        <div className="bg-zinc-800 w-1/2 text-white m-auto rounded-4xl border p-1 border-zinc-400 flex">
          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-full p-3 outline-none bg-transparent"
            placeholder="Ask me anything"
            disabled={loading}
          />
          <button className='p-3' onClick={submitQuestion} disabled={loading}>
            {loading ? "..." : "Ask"}
          </button>
        </div>
      </div>
    </div>
  )
}
export default App; 