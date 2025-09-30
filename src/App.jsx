import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { Play, RotateCcw, Clipboard, Loader2, Code } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";

function App() {
  const [aiReady, setAiReady] = useState(false);
  const [inputCode, setInputCode] = useState(`function welcome() {\n console.log("Welcome to AI Code Converter!");\n}`);
  const [outputCode, setOutputCode] = useState("");
  const [toLang, setToLang] = useState("Python");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const languages = ["Python", "JavaScript", "Java", "C++", "C", "Go", "Rust", "TypeScript"];

  // AI Initialization
  useEffect(() => {
    const checkReady = setInterval(() => {
      if (window.puter?.ai?.chat) {
        setAiReady(true);
        clearInterval(checkReady);
      }
    }, 300);
    return () => clearInterval(checkReady);
  }, []);

  // OCR Image Upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    setFeedback("Extracting code from image...");
    try {
      const { data: { text } } = await Tesseract.recognize(file, "eng", { logger: m => console.log(m) });
      setInputCode(text);
      setFeedback("✅ Code extracted successfully!");
    } catch (err) {
      console.error("OCR error:", err);
      setFeedback("Error extracting code from image.");
    }
    setLoading(false);
  };

  // Convert code
  const handleConvert = async () => {
    if (!inputCode.trim()) {
      setFeedback("Enter code to convert.");
      return;
    }
    if (!aiReady) {
      setFeedback("Initializing AI, please wait...");
      return;
    }

    setLoading(true);
    setFeedback("");
    setOutputCode("");

    try {
      // Detect source language automatically
      const fromLangDetected = await window.puter.ai.chat(`
        Detect the programming language of this code and reply ONLY with the name:
        ${inputCode}
      `);

      const res = await window.puter.ai.chat(`
        Convert the following code from ${fromLangDetected} to ${toLang}.
        Only return the converted code, no explanations.

        Code:
        ${inputCode}
      `);

      let reply = "";
      if (typeof res === "string") reply = res;
      else if (Array.isArray(res?.message)) reply = res.message.map(m => m.content).join("\n");
      else reply = res?.message?.content || "";

      if (!reply.trim()) throw new Error("Empty response from AI");

      setOutputCode(reply.trim());
      setFeedback("✅ Conversion successful!");
    } catch (err) {
      console.error("Conversion error:", err);
      setFeedback(`Error: ${err.message}`);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setInputCode(`function welcome() {\n console.log("Welcome to AI Code Converter!");\n}`);
    setOutputCode("");
    setFeedback("");
  };

  const handleCopy = async () => {
    if (outputCode) {
      await navigator.clipboard.writeText(outputCode);
      setFeedback("✅ Code copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen relative flex items-stretch justify-center p-6">
      {/* Subtle backdrop grid */}
      <svg className="pointer-events-none absolute inset-0 opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="w-full max-w-7xl flex flex-col gap-8">
        {/* Header */}
        <header className="mt-2">
          <div className="glass rounded-3xl px-6 sm:px-10 py-5 sm:py-7 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 sm:size-14 grid place-items-center rounded-2xl border border-white/10" style={{background:"linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))"}}>
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Code Converter</h1>
                <p className="text-[13px] text-white/60">Translate code across languages with OCR and AI</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              {!aiReady && <span className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10">Initializing</span>}
              {aiReady && <span className="px-3 py-1 rounded-full text-xs border border-white/10" style={{color:"rgb(var(--accent))", background:"rgba(255,255,255,0.05)"}}>AI Ready</span>}
            </div>
          </div>
        </header>

        {/* Controls */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="glass rounded-2xl px-5 py-4 flex items-center justify-between hover:translate-y-[-1px] transition-transform cursor-pointer">
            <div>
              <p className="text-sm text-white/70">Upload image</p>
              <p className="font-semibold">OCR Code from Image</p>
            </div>
            <div className="px-3 py-2 rounded-xl text-sm border border-white/10" style={{background:"rgba(255,255,255,0.06)"}}>Choose</div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          <div className="glass rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Target language</p>
              <p className="font-semibold">Convert To</p>
            </div>
            <select value={toLang} onChange={(e) => setToLang(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-teal-300/20">
              {languages.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={handleConvert} disabled={!aiReady || loading}
              className="glass rounded-2xl px-5 py-4 flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[0px] transition-transform disabled:opacity-50"
              style={{boxShadow:"0 0 0 1px rgba(255,255,255,0.06)", background:"linear-gradient(180deg, rgba(45,212,191,0.18), rgba(45,212,191,0.10))"}}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              <span className="font-semibold">{loading ? "Processing" : "Convert"}</span>
            </button>
            <button onClick={handleReset} disabled={loading}
              className="glass rounded-2xl px-5 py-4 flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[0px] transition-transform"
              style={{boxShadow:"0 0 0 1px rgba(255,255,255,0.06)"}}>
              <RotateCcw className="w-5 h-5" />
              <span className="font-semibold">Reset</span>
            </button>
          </div>
        </section>

        {/* Editors */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-3xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
              <Code className="w-4 h-4" />
              <span className="text-sm text-white/70">Input Code</span>
            </div>
            <CodeMirror value={inputCode} height="460px" extensions={[javascript({jsx:true})]} theme={dracula}
              onChange={(val) => setInputCode(val)} />
          </div>

          <div className="glass rounded-3xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-sm text-white/70">Converted Code ({toLang})</span>
            <button onClick={handleCopy} disabled={!outputCode}
                className="text-xs px-3 py-1 rounded-lg disabled:opacity-50" style={{background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.10)", color:"rgb(var(--accent))"}}>Copy</button>
            </div>
            <CodeMirror value={outputCode} height="460px" extensions={[javascript({jsx:true})]} theme={dracula} editable={false} />
          </div>
        </section>

        {/* Feedback */}
        {!!feedback && (
          <div className="grid place-items-center">
            <div className={`glass rounded-xl px-4 py-3 text-sm ${feedback.includes("✅") ? "text-emerald-300 border-emerald-500/40" : "text-rose-300 border-rose-500/40"} animate-[fadeIn_.6s_ease_forwards]`}>
              {feedback}
            </div>
          </div>
        )}

        {!aiReady && (
          <p className="text-xs text-white/60 text-center">Initializing AI... please wait</p>
        )}
      </div>
    </div>
  );
}

export default App;
