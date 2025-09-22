import { useState, useEffect } from "react";
import {
  Code,
  Play,
  RotateCcw,
  CheckCircle,
  Clipboard,
  Loader2,
} from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";



function App() {

  const [aiReady, setAiReady] = useState(false);
  const [inputCode, setInputCode] = useState(`function welcome() {\n console.og("Welcome to AI Code Converter!");\n}`);
  const [outputCode,setOutputCode] = useState("");
  const [targetLang, setTargetLang] = useState("Python")
  const [loading,setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const checkReady = setInterval(() => {
      if (window.puter?.ai?.chat){
        setAiReady(true);
        clearInterval(checkReady);
      }
    },300);
    return () => clearInterval(checkReady);
  }, [])


  const handleConvert = async () => {
    if(!inputCode.trim()){
      setFeedback("Enter code to convert.")
      return;
    }
    if(!aiReady){
      setFeedback("Just a moment,please...")
      return;
    }

    setLoading(true);
    setFeedback("");
    setOutputCode("");

    try{

      const res = await window.puter.ai.chat(
        `
          Convert the following code into ${targetLang}. Only return the 
          converted code, no explanations.

          Code:
          ${inputCode}

        `
      );

      const reply = typeof res === "string" ? res :
        res?.message?.content || res?.message?.map((m) => m.content).
        join("\n") || "";

      if (!reply.trim()) throw new Error("Empty response from AI");

      setOutputCode(reply.trim());
      setFeedback("Conversion successful!")

    }
    catch (err) {
      console.error("Conversion error:", err);
      setFeedback(`Error: ${err.message}`);
    }
  };


  const handleReset = () => {
    setInputCode(`function welcome() {\n console.og("Welcome to AI Code Converter!");\n}`);
    setOutputCode("");
    setFeedback("");
  };

  const handleCopy = async () => {
    if(outputCode){
      await navigator.clipboard.wirteText(outputCode);
      setFeedback("Code copied to clipboard!");
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 flex flex-col items-center justify-center p-6 gap-10 relative overflow-hidden">
      <h1 className="text-5xl sm:text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent text-center drop-shadow-lg relative">
        AI Code Converter
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">

        <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}
          className="bg-slate-900/80 text-white px-4 py-2 rounded-xl border border-slate-700 shadow-lg backdrop-blur-md cursor-pointer">
            {["Python", "Java", "C++", "Go", "Rust","TypeScript"].map((lang) => (
              <option value={lang} key={lang}>
                {lang}
              </option>
            ))}
          </select>

          
      </div>
    </div>
  );
}

export default App;
