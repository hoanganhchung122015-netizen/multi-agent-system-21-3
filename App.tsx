// File: App.tsx
import React, { useState, useRef } from 'react';

type SubjectType = 'TOÁN HỌC' | 'VẬT LÍ' | 'HÓA HỌC' | 'NHẬT KÝ' | null;
type AgentType = 'ĐIỀU PHỐI MAS' | 'GIẢI NHANH 1S' | 'GIA SƯ AI' | 'LUYỆN SKILL';

interface StudentInfo {
  name: string;
  className: string;
  school: string;
}

export default function App() {
  // Quản lý trạng thái Đăng nhập / Tài khoản
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Mặc định true để dùng ngay
  const [student, setStudent] = useState<StudentInfo>({
    name: 'CHUNG',
    className: '12A',
    school: 'THPT MAI SƠN - Sơn La',
  });

  // State nhập liệu cho màn hình đổi tài khoản
  const [inputName, setInputName] = useState(student.name);
  const [inputClass, setInputClass] = useState(student.className);

  // Quản lý trạng thái môn học & tác tử
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>(null);
  const [activeAgent, setActiveAgent] = useState<AgentType>('GIẢI NHANH 1S');
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Trạng thái chuyển sang Bước 3 (Hiện menu Tác tử & Gọi API)
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responseOutput, setResponseOutput] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý khi chọn/chụp ảnh
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setIsProcessing(true);
        executeAgentTask(activeAgent, reader.result as string, inputText);
      };
      reader.readAsDataURL(file);
    }
  };

  // Hàm gọi Vercel Serverless API (/api/gemini)
  const executeAgentTask = async (agent: AgentType, imgData = imagePreview, textData = inputText) => {
    setLoading(true);
    setResponseOutput(null);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: student,
          subject: selectedSubject,
          agent: agent,
          input: textData,
          image: imgData,
          action: 'PROCESS_TASK'
        })
      });

      const data = await res.json();
      if (data.error) {
        setResponseOutput(`Lỗi: ${data.error}`);
      } else {
        setResponseOutput(data.text);
      }
    } catch (err: any) {
      setResponseOutput(`Lỗi kết nối máy chủ AI: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Nút THỰC HIỆN
  const handleStartProcess = () => {
    if (!inputText && !imagePreview) {
      alert('Vui lòng chụp ảnh, chọn ảnh từ thư viện hoặc nhập nội dung câu hỏi!');
      return;
    }
    setIsProcessing(true);
    executeAgentTask(activeAgent);
  };

  // Chuyển Agent
  const handleAgentChange = (agent: AgentType) => {
    setActiveAgent(agent);
    executeAgentTask(agent);
  };

  // Reset về Menu chọn môn
  const handleResetSubject = () => {
    setSelectedSubject(null);
    setIsProcessing(false);
    setResponseOutput(null);
    setImagePreview(null);
    setInputText('');
  };

  // NÚT ĐỔI TÀI KHOẢN: Thoát hoàn toàn ra Màn hình Đăng nhập
  const handleLogout = () => {
    handleResetSubject();
    setIsLoggedIn(false);
  };

  // Xử lý Đăng nhập tài khoản mới
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || !inputClass.trim()) {
      alert('Vui lòng nhập đầy đủ Tên và Lớp!');
      return;
    }
    setStudent({
      name: inputName.toUpperCase(),
      className: inputClass.toUpperCase(),
      school: 'THPT MAI SƠN - Sơn La',
    });
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col items-center justify-between p-4 selection:bg-indigo-100">
      
      {/* HEADER THƯƠNG HIỆU SYMBIOTIC AI */}
      <header className="text-center my-3 w-full">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">SYMBIOTIC AI</h1>
        <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">MULTI AGENT SYSTEMS</p>
        <p className="text-xs italic text-indigo-500 mt-1">Gia sư ảo thông minh của mọi thế hệ học sinh</p>
        
        {/* Nhãn môn học hiển thị khi chọn môn */}
        {selectedSubject && isLoggedIn && (
          <div className="mt-2 inline-block bg-indigo-50 text-indigo-600 border border-indigo-100 px-4 py-1 rounded-full text-xs font-bold tracking-wide">
            {selectedSubject}
          </div>
        )}
      </header>

      {/* MÀN HÌNH ĐĂNG NHẬP (Hiển thị khi bấm ĐỔI TÀI KHOẢN) */}
      {!isLoggedIn ? (
        <main className="w-full max-w-sm my-auto bg-slate-50 border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <h2 className="text-sm font-extrabold text-slate-800 text-center mb-1">ĐĂNG NHẬP HỌC SINH</h2>
          <p className="text-[11px] text-slate-500 text-center mb-5">Nhập thông tin để bắt đầu học tập cùng AI</p>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Họ và tên học sinh:</label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="VD: CHUNG"
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Lớp:</label>
              <input
                type="text"
                value={inputClass}
                onChange={(e) => setInputClass(e.target.value)}
                placeholder="VD: 12A"
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Trường:</label>
              <input
                type="text"
                value={student.school}
                disabled
                className="w-full p-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold tracking-wide shadow-md transition-transform active:scale-95 mt-2"
            >
              XÁC NHẬN ĐĂNG NHẬP
            </button>
          </form>
        </main>
      ) : (
        <>
          {/* THANH THÔNG TIN HỌC SINH */}
          <div className="w-full max-w-sm bg-slate-50/80 border border-slate-100 rounded-full px-4 py-2 flex items-center justify-between text-[11px] mb-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800">{student.name} ({student.className})</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">{student.school}</span>
            </div>
            <button onClick={handleLogout} className="text-indigo-600 font-bold hover:underline">
              ĐỔI TÀI KHOẢN
            </button>
          </div>

          {/* NỘI DUNG CHÍNH (3 BƯỚC) */}
          <main className="w-full max-w-sm flex-1 flex flex-col justify-center">
            
            {/* ==========================================
                BƯỚC 1: MENU 4 MÔN HỌC (HÌNH 1)
               ========================================== */}
            {!selectedSubject && (
              <div className="grid grid-cols-2 gap-4 my-auto">
                <button
                  onClick={() => setSelectedSubject('TOÁN HỌC')}
                  className="h-44 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl flex flex-col items-center justify-center space-y-3 shadow-md transition-transform active:scale-95"
                >
                  <span className="font-extrabold text-base tracking-wide">TOÁN HỌC</span>
                  <span className="text-4xl">📐</span>
                </button>

                <button
                  onClick={() => setSelectedSubject('VẬT LÍ')}
                  className="h-44 bg-purple-600 hover:bg-purple-700 text-white rounded-3xl flex flex-col items-center justify-center space-y-3 shadow-md transition-transform active:scale-95"
                >
                  <span className="font-extrabold text-base tracking-wide">VẬT LÍ</span>
                  <span className="text-4xl">⚛️</span>
                </button>

                <button
                  onClick={() => setSelectedSubject('HÓA HỌC')}
                  className="h-44 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl flex flex-col items-center justify-center space-y-3 shadow-md transition-transform active:scale-95"
                >
                  <span className="font-extrabold text-base tracking-wide">HÓA HỌC</span>
                  <span className="text-4xl">🧪</span>
                </button>

                <button
                  onClick={() => setSelectedSubject('NHẬT KÝ')}
                  className="h-44 bg-amber-600 hover:bg-amber-700 text-white rounded-3xl flex flex-col items-center justify-center space-y-3 shadow-md transition-transform active:scale-95"
                >
                  <span className="font-extrabold text-base tracking-wide">NHẬT KÝ</span>
                  <span className="text-4xl">📓</span>
                </button>
              </div>
            )}

            {/* ==========================================
                BƯỚC 2: CHỤP/TẢI ĐỀ BÀI (HÌNH 2)
               ========================================== */}
            {selectedSubject && !isProcessing && (
              <div className="flex flex-col flex-1 justify-between py-2">
                
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-3xl p-6 min-h-[300px] flex flex-col items-center justify-center text-center shadow-inner">
                  {imagePreview ? (
                    <div className="relative w-full h-56">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-2xl" />
                      <button
                        onClick={() => setImagePreview(null)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 w-full">
                      <p className="text-xs font-semibold text-indigo-900/60">
                        Vui lòng chụp ảnh hoặc ghi âm đề bài...
                      </p>
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Hoặc gõ trực tiếp câu hỏi tại đây..."
                        className="w-full p-3 text-xs bg-white/80 border border-indigo-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="grid grid-cols-4 gap-2 text-center my-6">
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.capture = 'environment';
                        fileInputRef.current.click();
                      }
                    }}
                    className="flex flex-col items-center space-y-1 group"
                  >
                    <div className="w-14 h-14 bg-blue-600 group-active:scale-90 transition-transform rounded-2xl flex items-center justify-center text-white text-xl shadow-md">
                      📷
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-slate-500">CAMERA</span>
                  </button>

                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.removeAttribute('capture');
                        fileInputRef.current.click();
                      }
                    }}
                    className="flex flex-col items-center space-y-1 group"
                  >
                    <div className="w-14 h-14 bg-blue-600 group-active:scale-90 transition-transform rounded-2xl flex items-center justify-center text-white text-xl shadow-md">
                      🖼️
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-slate-500">THƯ VIỆN</span>
                  </button>

                  <button
                    onClick={() => alert('Tính năng thu âm đang được kết nối...')}
                    className="flex flex-col items-center space-y-1 group"
                  >
                    <div className="w-14 h-14 bg-blue-600 group-active:scale-90 transition-transform rounded-2xl flex items-center justify-center text-white text-xl shadow-md">
                      🎙️
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-slate-500">GHI ÂM</span>
                  </button>

                  <button
                    onClick={handleStartProcess}
                    className="flex flex-col items-center space-y-1 group"
                  >
                    <div className="w-14 h-14 bg-indigo-200 group-active:scale-90 transition-transform rounded-2xl flex items-center justify-center text-indigo-600 text-xl shadow-md">
                      🚀
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-indigo-600">THỰC HIỆN</span>
                  </button>
                </div>

                <button onClick={handleResetSubject} className="text-xs text-slate-400 font-semibold text-center hover:underline">
                  ← Quay lại chọn môn
                </button>
              </div>
            )}

            {/* ==========================================
                BƯỚC 3: THIẾT LẬP AGENTS & KẾT QUẢ (HÌNH 3)
               ========================================== */}
            {selectedSubject && isProcessing && (
              <div className="flex flex-col flex-1 justify-between py-2">
                
                <div className="bg-blue-600 p-1 rounded-2xl flex justify-between items-center text-white shadow-md text-[10px] font-bold mb-4">
                  {(['ĐIỀU PHỐI MAS', 'GIẢI NHANH 1S', 'GIA SƯ AI', 'LUYỆN SKILL'] as AgentType[]).map((agent) => (
                    <button
                      key={agent}
                      onClick={() => handleAgentChange(agent)}
                      className={`px-2 py-2 rounded-xl transition-all flex items-center space-x-1 ${
                        activeAgent === agent
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-blue-100 hover:bg-blue-500'
                      }`}
                    >
                      {agent === 'GIẢI NHANH 1S' && <span>⚡</span>}
                      {agent === 'GIA SƯ AI' && <span>⭕</span>}
                      {agent === 'LUYỆN SKILL' && <span>🔍</span>}
                      <span>{agent}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-6 min-h-[320px] flex flex-col items-center justify-center text-center shadow-inner relative">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs font-bold text-blue-600 tracking-wide uppercase">
                        ĐANG TẢI DỮ LIỆU TỪ CHUYÊN GIA {activeAgent}...
                      </p>
                    </div>
                  ) : (
                    <div className="w-full text-left text-xs leading-relaxed text-slate-700 whitespace-pre-wrap max-h-[350px] overflow-y-auto p-1">
                      {responseOutput || 'Chưa nhận được phản hồi. Vui lòng bấm chọn Tác tử để thực thi lại.'}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setIsProcessing(false)}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    ← Tải/Chụp ảnh khác
                  </button>
                  <button
                    onClick={handleResetSubject}
                    className="text-xs text-slate-400 font-semibold hover:underline"
                  >
                    Quay lại Trang chủ
                  </button>
                </div>

              </div>
            )}

          </main>
        </>
      )}

      {/* FOOTER BẢN QUYỀN */}
      <footer className="text-center my-3 w-full">
        <p className="text-[10px] font-extrabold text-slate-700 tracking-wider">
          SYMBIOTIC AI — GIẢI PHÁP CHUYỂN ĐỔI SỐ GIÁO DỤC
        </p>
        <p className="text-[10px] font-bold text-indigo-500 mt-0.5">TRƯỜNG THPT MAI SƠN</p>
      </footer>

    </div>
  );
}
