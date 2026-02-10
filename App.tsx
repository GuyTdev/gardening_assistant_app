import React, { useState, useRef, useEffect } from 'react';
import { Camera, MessageCircle, RefreshCw, Leaf, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { analyzePlantImage, createChatSession } from './services/geminiService';
import { PlantData } from './types';
import { Button } from './components/Button';
import { PlantInfoCard } from './components/PlantInfoCard';
import { ChatInterface } from './components/ChatInterface';
import { Chat } from '@google/genai';

const App = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  
  // Chat session persistence
  const chatSessionRef = useRef<Chat | null>(null);
  
  useEffect(() => {
    // Initialize chat session once on mount
    chatSessionRef.current = createChatSession();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous analysis
    setPlantData(null);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);
      // Strip the prefix data:image/...;base64, for the API
      const base64Data = base64String.split(',')[1];
      analyzeImage(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) return;

    setIsAnalyzing(true);
    setPlantData(null);
    setError(null);
    setSelectedImage(imageUrl); // Show preview immediately

    try {
      // Fetch the image to convert to base64
      // Note: This relies on the image server allowing CORS.
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to load image");
      
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Keep the full string for preview, send stripped to API
        setSelectedImage(base64String);
        const base64Data = base64String.split(',')[1];
        analyzeImage(base64Data);
      };
      
      reader.onerror = () => {
        setError("שגיאה בעיבוד התמונה. נסה להוריד ולהעלות אותה כקובץ.");
        setIsAnalyzing(false);
      };
      
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
      setError("לא ניתן לטעון את התמונה מקישור זה (לרוב עקב הגבלות אבטחה של האתר). מומלץ להוריד את התמונה ולהעלות אותה כקובץ.");
      setIsAnalyzing(false);
    }
  };

  const analyzeImage = async (base64Data: string) => {
    setIsAnalyzing(true);
    try {
      const data = await analyzePlantImage(base64Data);
      setPlantData(data);
    } catch (err) {
      setError("לא הצלחנו לזהות את הצמח. נסה תמונה ברורה יותר.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPlantData(null);
    setError(null);
    setImageUrl('');
    setShowUrlInput(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 md:pb-0 font-rubik">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-stone-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-emerald-600 to-teal-500">
              החבר הבוטני
            </span>
          </div>
          
          {!isChatOpen && (
            <Button 
              variant="secondary" 
              onClick={() => setIsChatOpen(true)}
              className="hidden sm:flex text-sm py-2 px-3"
              icon={<MessageCircle className="w-4 h-4" />}
            >
              שאל את המומחה
            </Button>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero / Upload Section */}
        {!plantData && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
                זיהוי צמחים <br />
                <span className="text-emerald-600">בשניות</span>
              </h1>
              <p className="text-lg md:text-xl text-stone-600">
                צלמו תמונה כדי לקבל הוראות טיפול מפורטות, לוחות זמנים להשקיה ועצות מומחים באופן מיידי.
              </p>
            </div>

            <div className="w-full max-w-md flex flex-col gap-4">
              {/* Option 1: File Upload */}
              <div className="w-full p-8 bg-white rounded-3xl shadow-xl border border-stone-100 hover:shadow-2xl transition-all duration-300 relative group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 bg-emerald-50/50 group-hover:bg-emerald-50 transition-colors">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <span className="block text-lg font-semibold text-stone-800">צלם או העלה תמונה</span>
                    <span className="text-stone-500 text-sm">מהמחשב או מהגלריה</span>
                  </div>
                </div>
              </div>

              {/* Option 2: URL Input Toggle */}
              {!showUrlInput ? (
                <button 
                  onClick={() => setShowUrlInput(true)}
                  className="text-emerald-600 font-medium hover:text-emerald-700 hover:underline flex items-center justify-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  או הדבק קישור לתמונה
                </button>
              ) : (
                 <div className="bg-white p-2 rounded-xl border border-emerald-100 shadow-md flex gap-2 animate-fade-in-up">
                   <input 
                      type="text" 
                      placeholder="הדבק כאן קישור לתמונה..." 
                      className="flex-1 px-4 py-2 bg-stone-50 border-transparent focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-right"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                   />
                   <Button 
                    variant="primary" 
                    className="py-2 px-4 text-sm" 
                    onClick={handleUrlSubmit}
                    disabled={!imageUrl}
                   >
                     נתח
                   </Button>
                   <Button 
                    variant="ghost" 
                    className="p-2" 
                    onClick={() => { setShowUrlInput(false); setImageUrl(''); }}
                   >
                     <ImageIcon className="w-4 h-4" />
                   </Button>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis State */}
        {isAnalyzing && (
           <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
             <div className="relative">
                {selectedImage && (
                  <img 
                    src={selectedImage} 
                    alt="Analyzing" 
                    className="w-32 h-32 object-cover rounded-2xl shadow-lg opacity-50 blur-sm"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
                </div>
             </div>
             <div className="text-center space-y-2">
               <h3 className="text-xl font-bold text-stone-800">מנתח את הצמח שלך...</h3>
               <p className="text-stone-500">מזהה את הסוג ומכין הנחיות טיפול</p>
             </div>
           </div>
        )}

        {/* Results View */}
        {plantData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Image & Actions */}
            <div className="lg:col-span-1 space-y-6">
              <div className="relative rounded-3xl overflow-hidden shadow-lg aspect-square">
                {selectedImage && (
                  <img 
                    src={selectedImage} 
                    alt="Analyzed Plant" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="flex flex-col space-y-3">
                 <Button onClick={handleReset} variant="outline" className="w-full" icon={<RefreshCw className="w-4 h-4"/>}>
                    זהה צמח אחר
                 </Button>
                 <Button onClick={() => setIsChatOpen(true)} variant="primary" className="w-full lg:hidden" icon={<MessageCircle className="w-4 h-4"/>}>
                    שאל שאלות
                 </Button>
              </div>
            </div>

            {/* Right Column: Plant Details */}
            <div className="lg:col-span-2">
              <PlantInfoCard data={plantData} />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 rounded-2xl border border-red-100 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleReset} variant="secondary">נסה שוב</Button>
          </div>
        )}
      </main>

      {/* Chat Bot Interface */}
      <ChatInterface 
        chatSession={chatSessionRef} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
      
      {/* Floating Action Button for Chat (Mobile/Desktop when closed) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 left-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-xl shadow-emerald-200 flex items-center justify-center hover:bg-emerald-700 hover:scale-110 transition-all duration-200 z-40 group"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute left-full ml-3 bg-stone-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            שאל את המומחה
          </span>
        </button>
      )}
    </div>
  );
};

export default App;