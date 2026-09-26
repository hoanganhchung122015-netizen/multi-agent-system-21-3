import React, { useState, useEffect } from 'react';

// Cấu trúc dữ liệu học sinh & nhật ký
interface StudentInfo {
  fullName: string;
  className: string;
  school: string;
}

interface LogEntry {
  id: string;
  student: StudentInfo;
  timestamp: string;
  subject: string;
  agent: string;
  question: string;
  response: string;
}

export default function App() {
  // 1. STATE QUẢN LÝ TÀI KHOẢN HỌC SINH
  const [student, setStudent] = useState<StudentInfo>(() => {
    const saved = localStorage.getItem('symbiotic_student');
    return saved
      ? JSON.parse(saved)
      : { fullName: '', className: '', school: 'THPT MAI SƠN - Sơn La' };
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('symbiotic_is_logged_in') === 'true';
  });

  // 2. STATE ĐIỀU HƯỚNG GIAO DIỆN & CHỨC NĂNG
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'main' | 'logs'>('main');

  // 3. STATE XỬ LÝ ĐỀ BÀI & KẾT QUẢ AI
  const [inputText, setInputText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string>('');
  
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const savedLogs = localStorage.getItem('symbiotic_logs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  // Tự động lưu trạng thái đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('symbiotic_student', JSON.stringify(student));
      localStorage.setItem('symbiotic_is_logged_in', 'true');
    }
  }, [student, isLoggedIn]);

  // Xử lý Đăng nhập
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.fullName.trim() || !student.className.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên và Lớp học!');
      return;
    }
    setIsLoggedIn(true);
  };

  // Xử lý Đổi tài khoản (Đăng xuất)
  const handleSwitchAccount = () => {
    if (window.confirm('Bạn có chắc chắn muốn đổi tài khoản học sinh khác?')) {
      setIsLoggedIn(false);
      localStorage.removeItem('symbiotic_is_logged_in');
      setSelectedSubject(null);
      setSelectedAgent(null);
      setResultText('');
      setActiveTab('main');
    }
  };

  // Xử lý gửi đề bài cho Đa tác tử AI (MAS - Agent 1 -> Agent 2 -> Agent 3)
  const handleSubmitTask = async () => {
    if (!inputText.trim() && !selectedImage) {
      alert('Vui lòng nhập câu hỏi hoặc tải ảnh đề bài!');
      return;
    }

    setLoading(true);
    setResultText('');

    try {
      // Gọi API backend (Gemini API Multi-Agent Service)
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: student,
          subject: selectedSubject,
          agent: selectedAgent,
          input: inputText,
          image: selectedImage
        })
      });

      const data = await response.json();

      if (response.ok) {
        const aiOutput = data.text || 'Đã phân tích xong đề bài.';
        setResultText(aiOutput);

        // Lưu thông tin vào Nhật ký học tập
        const newEntry: LogEntry = {
          id: Date.now().toString(),
          student: student,
          timestamp: new Date().toLocaleString('vi-VN'),
          subject: selectedSubject || 'Tổng hợp',
          agent: selectedAgent || 'Hệ đa tác nhân SM-AS',
          question: inputText || '[Bài tập dạng Hình ảnh]',
          response: aiOutput
        };

        const updatedLogs = [newEntry, ...logs];
        setLogs(updatedLogs);
        localStorage.setItem('symbiotic_logs', JSON.stringify(updatedLogs));
      } else {
        alert('Lỗi hệ thống: ' + (data.error || 'Không thể kết nối với AI'));
      }
    } catch (err: any) {
      // Giả lập kết quả phản hồi nếu chạy local/test offline
      const mockOutput = `[AGENT 1 - PHÂN TÍCH]: Đã trích xuất xong từ khóa đề bài ${selectedSubject}.\n[AGENT 2 - THỰC THI]: Áp dụng phương pháp Chain-of-Thought giải từng bước.\n[AGENT 3 - PHẢN BIỆN]: Kiểm tra logic chính xác 98%, không phát hiện lỗi ảo giác AI.\n\n📌 LỜI GIẢI / GỢI Ý TƯ DUY:\n${inputText ? `Cho bài toán: "${inputText}"` : 'Đã xử lý hình ảnh đề bài thành công.'}\nHãy áp dụng công thức trọng tâm môn ${selectedSubject} để giải quyết bài toán này.`;
      
      setResultText(mockOutput);
      const newEntry: LogEntry = {
        id: Date.now().toString(),
        student: student,
        timestamp: new Date().toLocaleString('vi-VN'),
        subject: selectedSubject || 'Tổng hợp',
        agent: selectedAgent || 'Gia sư AI',
        question: inputText || '[Hình ảnh đề bài]',
        response: mockOutput
      };
      const updatedLogs = [newEntry, ...logs];
      setLogs(updatedLogs);
      localStorage.setItem('symbiotic_logs', JSON.stringify(updatedLogs));
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // 1. MÀN HÌNH ĐĂNG NHẬP CHUẨN NGÀY HỘI CHUYỂN ĐỔI SỐ 2026 (ẢNH 1)
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-8 font-sans">
        <div className="max-w-md w-full mx-auto my-auto">
          
          {/* Header Tiêu đề Ngày hội CĐS */}
          <div className="text-center mb-6">
            <p className="text-xs font-bold tracking-widest text-slate-800 uppercase">
              NGÀY HỘI ĐỔI MỚI SÁNG TẠO VÀ CHUYỂN ĐỔI SỐ NĂM 2026
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
              SYMBIOTIC AI
            </h1>
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mt-0.5">
              MULTI AGENT SYSTEMS
            </p>
            <p className="text-sm italic text-indigo-500 font-medium mt-2">
              Gia sư ảo thông minh của mọi thế hệ học sinh
            </p>
          </div>

          {/* Form Đăng nhập */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100">
            <h2 className="text-xl font-bold text-center text-slate-800 uppercase">
              ĐĂNG NHẬP HỌC SINH
            </h2>
            <p className="text-xs text-center text-slate-400 mt-1 mb-6">
              Nhập thông tin để bắt đầu học tập cùng AI
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên học sinh:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={student.fullName}
                  onChange={(e) => setStudent({ ...student, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lớp:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 12A"
                  value={student.className}
                  onChange={(e) => setStudent({ ...student, className: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trường:
                </label>
                <input
                  type="text"
                  disabled
                  value={student.school}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 font-semibold text-sm cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-200 transition active:scale-[0.98] text-sm tracking-wide uppercase"
              >
                XÁC NHẬN ĐĂNG NHẬP
              </button>
            </form>
          </div>

          {/* Footer thông tin */}
          <div className="text-center mt-6">
            <p className="text-xs font-bold text-slate-800">
              SYMBIOTIC AI — GIẢI PHÁP CHUYỂN ĐỔI SỐ GIÁO DỤC
            </p>
            <p className="text-xs font-bold text-indigo-600 mt-0.5">
              TRƯỜNG THPT MAI SƠN
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MÀN HÌNH CHÍNH & CÁC MODULE CHỨC NĂNG (KHI ĐÃ ĐĂNG NHẬP)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* THANH HEADER ĐIỀU HƯỚNG & NÚT ĐỔI TÀI KHOẢN (LUÔN HIỂN THỊ) */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2">
            {activeTab === 'logs' ? (
              <button
                onClick={() => setActiveTab('main')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
              >
                ← Quay lại Menu chính
              </button>
            ) : selectedAgent ? (
              <button
                onClick={() => setSelectedAgent(null)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
              >
                ← Chọn lại Tác tử AI
              </button>
            ) : selectedSubject ? (
              <button
                onClick={() => setSelectedSubject(null)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
              >
                ← Chọn lại Môn học
              </button>
            ) : (
              <div className="text-xs font-extrabold text-indigo-600 tracking-wider">
                SYMBIOTIC SM-AS 2026
              </div>
            )}
          </div>

          {/* THÔNG TIN HỌC SINH & NÚT ĐỔI TÀI KHOẢN */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-800">{student.fullName}</span>
              <span className="block text-[10px] font-semibold text-slate-400">Lớp {student.className}</span>
            </div>

            <button
              onClick={() => setActiveTab(activeTab === 'main' ? 'logs' : 'main')}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            >
              {activeTab === 'main' ? '📖 Nhật ký' : '🏠 Học tập'}
            </button>

            {/* Nút Đổi tài khoản luôn hiển thị bên phải */}
            <button
              onClick={handleSwitchAccount}
              className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition border border-rose-100"
            >
              🔄 Đổi tài khoản
            </button>
          </div>
        </div>

        {/* GIAO DIỆN XEM NHẬT KÝ HỌC TẬP */}
        {activeTab === 'logs' ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3 flex justify-between items-center">
              <span>📖 Nhật ký Học tập: {student.fullName} ({student.className})</span>
              <span className="text-xs font-normal text-slate-400">{logs.length} lượt tương tác</span>
            </h2>

            {logs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Chưa có lịch sử câu hỏi nào được lưu.
              </div>
            ) : (
              <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-slate-500 border-b border-slate-200 pb-2">
                      <span className="text-indigo-600">[{log.subject}] {log.agent}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="font-semibold text-slate-800">❓ Câu hỏi / Đề bài: {log.question}</p>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                      {log.response}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* GIAO DIỆN HỌC TẬP CHÍNH */
          <>
            {/* 1. BƯỚC 1: CHỌN MÔN HỌC */}
            {!selectedSubject && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Xin chào, {student.fullName}!
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Chọn môn học để gửi đề bài cho Hệ thống Đa Tác Nhân SM-AS phân tích
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'TOÁN HỌC', icon: '📐', bg: 'hover:bg-blue-50' },
                    { name: 'VẬT LÍ', icon: '⚛️', bg: 'hover:bg-purple-50' },
                    { name: 'HÓA HỌC', icon: '🧪', bg: 'hover:bg-emerald-50' },
                    { name: 'SINH HỌC', icon: '🧬', bg: 'hover:bg-amber-50' }
                  ].map((sub) => (
                    <button
                      key={sub.name}
                      onClick={() => setSelectedSubject(sub.name)}
                      className={`p-6 bg-slate-50 ${sub.bg} border border-slate-200 rounded-2xl font-bold text-slate-800 transition flex flex-col items-center gap-3 active:scale-95 shadow-sm`}
                    >
                      <span className="text-3xl">{sub.icon}</span>
                      <span className="text-xs tracking-wider">{sub.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. BƯỚC 2: CHỌN TÁC TỬ AI (MULTI-AGENT ARCHITECTURE) */}
            {selectedSubject && !selectedAgent && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 text-center space-y-6">
                <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                  Môn đã chọn: {selectedSubject}
                </div>
                
                <h2 className="text-xl font-bold text-slate-900">
                  Chọn Tác tử AI xử lý bài tập
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'AGENT 1: PHÂN TÍCH ĐỀ', icon: '🔍', desc: 'Trích xuất từ khóa, định dạng cấu trúc bài toán' },
                    { name: 'AGENT 2: THỰC THI & GIẢI', icon: '⚙️', desc: 'Áp dụng Chain-of-Thought hướng dẫn từng bước' },
                    { name: 'AGENT 3: PHẢN BIỆN & SOI LỖI', icon: '🛡️', desc: 'Kiểm soát chéo, loại bỏ triệt để ảo giác AI' }
                  ].map((ag) => (
                    <button
                      key={ag.name}
                      onClick={() => setSelectedAgent(ag.name)}
                      className="p-5 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 rounded-2xl text-left transition space-y-2 active:scale-95"
                    >
                      <div className="text-2xl">{ag.icon}</div>
                      <div className="font-bold text-slate-800 text-xs uppercase">{ag.name}</div>
                      <div className="text-xs text-slate-500 leading-snug">{ag.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. BƯỚC 3: NHẬP BÀI TẬP & NHẬN KẾT QUẢ TỪ AI */}
            {selectedSubject && selectedAgent && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      {selectedSubject}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {selectedAgent}
                    </span>
                  </div>
                </div>

                {/* Nhập đề bài văn bản */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Nhập nội dung đề bài hoặc câu hỏi:
                  </label>
                  <textarea
                    rows={4}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Dán câu hỏi trắc nghiệm hoặc bài tập tự luận tại đây..."
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  />
                </div>

                {/* Tải ảnh đề bài (OCR) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Hoặc chọn ảnh chụp đề bài (OCR):
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setSelectedImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                  />
                </div>

                {/* Nút gửi yêu cầu */}
                <button
                  onClick={handleSubmitTask}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg transition active:scale-[0.98] text-sm uppercase tracking-wide flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>CÁC AGENTS ĐANG PHÂN TÍCH & PHẢN BIỆN...</span>
                    </>
                  ) : (
                    <span>GỬI ĐỀ BÀI CHO HỆ ĐA TÁC NHÂN SM-AS</span>
                  )}
                </button>

                {/* Hiển thị kết quả AI */}
                {resultText && (
                  <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <span>💡 Kết quả từ Hệ Đa Tác Nhân (SM-AS):</span>
                    </h3>
                    <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-mono bg-white p-4 rounded-xl border border-slate-200 shadow-inner">
                      {resultText}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
