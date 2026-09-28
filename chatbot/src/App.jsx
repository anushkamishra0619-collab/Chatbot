import { useState } from 'react'
import './App.css'
import { URL,API_KEY } from './constants';

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim() || loading) return;

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

      if (res.status === 429) {
        setAnswer("Rate limit reached — please wait a moment and try again.");
        return;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error("API error:", res.status, errText);
        setAnswer(`Error ${res.status}: something went wrong.`);
        return;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response";
      setAnswer(text);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAnswer("Network error — check your connection.");
    } finally {
      setLoading(false);
    }
    let dataString=response.candidates[0].content.parts[0].text;
    dataString=dataString.split("*")
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") askQuestion();
  };

  return (
    <div className="grid grid-cols-5 h-screen text-center">
      <div className="col-span-1 bg-zinc-800"></div>
      <div className="col-span-4 p-10">
        <div className="container h-80 text-white overflow-y-auto whitespace-pre-wrap">
          {loading ? "Thinking..." : answer}
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
          <button onClick={askQuestion} disabled={loading}>
            {loading ? "..." : "Ask"}
          </button>
        </div>
      </div>
    </div>
  )
}
export default App;