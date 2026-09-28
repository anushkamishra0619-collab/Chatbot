import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './App.css'
import { URL,API_KEY } from './constants';
import RecentQuestions from './components/RecentQuestions'

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentHistory, setRecentHistory] = useState(() => {
    const savedHistory = localStorage.getItem("history");
    if (!savedHistory) return [];

    try {
      const parsedHistory = JSON.parse(savedHistory);
      if (Array.isArray(parsedHistory)) return parsedHistory;
      return typeof parsedHistory === "string" ? [parsedHistory] : [];
    } catch {
      return [];
    }
  });

  const askQuestion = async () => {
    if (!question.trim() || loading) return;

    const updatedHistory = [question, ...recentHistory];
    setRecentHistory(updatedHistory);
    localStorage.setItem("history", JSON.stringify(updatedHistory));

    if (!API_KEY) {
      setAnswer("Missing API key — check your .env file and restart the dev server.");
      return;
    }

    const payload = {
      contents: [
        { parts: [{ text: question }] }
      ]
    };

    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMessage = data?.error?.message || "The API returned an unexpected error.";
        console.error("API error:", res.status, data);
        setAnswer(`Error ${res.status}: ${errorMessage}`);
        return;
      }

      const candidate = data?.candidates?.[0];
      const text = candidate?.content?.parts
        ?.map((part) => part.text)
        .filter(Boolean)
        .join("\n");

      if (text) {
        setAnswer(text);
      } else {
        const reason = data?.promptFeedback?.blockReason || candidate?.finishReason;
        setAnswer(
          reason
            ? `The API couldn't answer this question (${reason}). Try rephrasing it.`
            : "The API returned no answer. Please try again."
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setAnswer("Network error — check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") askQuestion();
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
          <button className='p-3' onClick={askQuestion} disabled={loading}>
            {loading ? "..." : "Ask"}
          </button>
        </div>
      </div>
    </div>
  )
}
export default App; 