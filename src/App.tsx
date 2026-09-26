import React, { useState, useEffect } from 'react';

// Định dạng dữ liệu học sinh & nhật ký
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
  // State quản lý thông tin học sinh
  const [student, setStudent] = useState<StudentInfo>(() => {
    const saved = localStorage.getItem('symbiotic_student');
    return saved ? JSON.parse(saved) : { fullName: '', className: '', school: 'THPT MAI SƠN - Sơn La' };
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('symbiotic_is_logged_in') === 'true';
  });

  // State điều hướng giao diện
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  // State xử lý nội dung & tác vụ
  const [inputText, setInputText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const savedLogs = localStorage.getItem('symbiotic_logs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  // Lưu thông tin học sinh vào LocalStorage khi thay đổi
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

  // Đổi tài khoản (Đăng xuất)
  const handleSwitchAccount = () => {
    if (window.confirm('Bạn có chắc chắn muốn đổi tài khoản học sinh khác?')) {
      setIsLoggedIn(false);
      localStorage.removeItem('symbiotic_is_logged_in');
      setSelectedSubject(null);
      setSelectedAgent(null);
      setResultText('');
    }
  };

  // Xử lý gửi yêu cầu tới AI
  const handleSubmitTask = async () => {
    if (!inputText.trim() && !selectedImage) {
      alert('Vui lòng nhập nội dung câu hỏi hoặc tải lên hình ảnh đề bài!');
      return;
    }

    setLoading(true);
    setResultText('');

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          agent: selectedAgent,
          input: inputText,
          image: selectedImage,
          responseFormat: selectedAgent === 'GIẢI NHANH 1S' ? 'json' : 'text'
        })
      });

      const data = await response.json();

      if (response.ok) {
        const aiOutput = data.text || 'Không nhận được phản hồi từ AI.';
        setResultText(aiOutput);

        // Lưu thông tin vào Nhật ký học tập
        const newEntry: LogEntry = {
          id: Date.now().toString(),
          student: student,
          timestamp: new Date().toLocaleString('vi-VN'),
          subject: selectedSubject || 'Tổng hợp',
          agent: selectedAgent || 'Điều phối MAS',
          question: inputText || '[Hình ảnh đề bài]',
          response: aiOutput
        };

        const updatedLogs = [newEntry, ...logs];
        setLogs(updatedLogs);
        localStorage.setItem('symbiotic_logs', JSON.stringify(updatedLogs));
      } else {
        alert('Lỗi xử lý: ' + (data.error || 'Máy chủ AI bận'));
      }
    } catch (err: any) {
      alert('Lỗi kết nối: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. MÀN HÌNH ĐĂNG NHẬP (Chuẩn ảnh 1)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 md:p-8 font-sans">
        <div className="max-w-md w-mx mx-auto my-auto w-full">
          {/* Header Tiêu đề */}
          <div className="text-center mb-6">
            <p className="text-xs font-bold tracking-widest text-slate-800 uppercase">
              NGÀY HỘI CHUYỂN ĐỔI SỐ NĂM 2026
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
            <p className="text-xs text-center text-slate-500 mt-1 mb-6">
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
                  className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-slate-500 font-semibold text-sm cursor-not-allowed"
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

  // 2. MÀN HÌNH CHÍNH & CÁC MODULE CHỨC NĂNG
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Thanh Điều Hướng Header (Back Button & Đổi tài khoản) */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2">
            {(selectedSubject || selectedAgent || showLogs) ? (
              <button
                onClick={() => {
                  if (selectedAgent) setSelectedAgent(null);
                  else if (selectedSubject) setSelectedSubject(null);
                  else if (showLogs) setShowLogs(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
              >
                ← Quay lại
              </button>
            ) : (
              <div className="text-xs font-extrabold text-indigo-600 tracking-wider">
                SYMBIOTIC MAS
              </div>
            )}
          </div>

          {/* Thông tin học sinh & Nút Đổi Tài Khoản */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-800">{student.fullName}</span>
              <span className="block text-[10px] font-semibold text-slate-400">Lớp {student.className}</span>
            </div>
            
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            >
              📖 Nhật ký
            </button>

            <button
              onClick={handleSwitchAccount}
              className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition border border-rose-100"
            >
              🔄 Đổi tài khoản
            </button>
          </div>
        </div>

        {/* Nội dung Màn hình Nhật Ký */}
        {showLogs ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3">
              📖 Nhật ký Học tập của {student.fullName} ({student.className})
            </h2>
            {logs.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">Chưa có lịch sử câu hỏi nào.</p>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-slate-500">
                      <span>[{log.subject}] {log.agent}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="font-semibold text-slate-800">❓ Câu hỏi: {log.question}</p>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap">
                      💡 {log.response}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Lựa chọn 1: Chọn Môn học */}
            {!selectedSubject && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 text-center space-y-6">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Xin chào, {student.fullName}!
                </h2>
                <p className="text-sm text-slate-500">
                  Chọn môn học để gửi đề bài cho các Tác tử AI phân tích.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'TOÁN HỌC', icon: '📐' },
                    { name: 'VẬT LÍ', icon: '⚛️' },
                    { name: 'HÓA HỌC', icon: '🧪' },
                    { name: 'SINH HỌC', icon: '🧬' }
                  ].map((sub) => (
                    <button
                      key={sub.name}
                      onClick={() => setSelectedSubject(sub.name)}
                      className="p-5 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 rounded-2xl font-bold text-slate-700 transition flex flex-col items-center gap-2 shadow-sm active:scale-95"
                    >
                      <span className="text-2xl">{sub.icon}</span>
                      <span className="text-xs tracking-wider">{sub.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lựa chọn 2: Chọn Chức năng / Tác tử AI */}
            {selectedSubject && !selectedAgent && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 text-center space-y-6">
                <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-2">
                  Môn học: {selectedSubject}
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Chọn Tác tử AI hỗ trợ
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'GIẢI NHANH 1S', icon: '⚡', desc: 'Giải trắc nghiệm & Casio siêu tốc' },
                    { name: 'GIA SƯ AI', icon: '🎯', desc: 'Hướng dẫn phương pháp giải chi tiết' },
                    { name: 'LUYỆN SKILL', icon: '📚', desc: 'Tạo bài tập tương tự rèn kỹ năng' }
                  ].map((ag) => (
                    <button
                      key={ag.name}
                      onClick={() => setSelectedAgent(ag.name)}
                      className="p-6 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 rounded-2xl text-left transition space-y-2 active:scale-95"
                    >
                      <div className="text-3xl">{ag.icon}</div>
                      <div className="font-bold text-slate-800 text-sm">{ag.name}</div>
                      <div className="text-xs text-slate-500">{ag.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lựa chọn 3: Nhập đề bài & Nhận kết quả */}
            {selectedSubject && selectedAgent && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg mr-2">
                      {selectedSubject}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      Tác tử: {selectedAgent}
                    </span>
                  </div>
                </div>

                {/* Ô Nhập văn bản đề bài */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Nhập câu hỏi hoặc nội dung bài tập:
                  </label>
                  <textarea
                    rows={4}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập đề bài hoặc yêu cầu hỗ trợ tại đây..."
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  />
                </div>

                {/* Tải ảnh đề bài */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Tải ảnh đề bài (nếu có):
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

                <button
                  onClick={handleSubmitTask}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg transition active:scale-[0.98] text-sm uppercase tracking-wide flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Tác tử đang xử lý...</span>
                    </>
                  ) : (
                    <span>GỬI ĐỀ BÀI CHO AI PHÂN TÍCH</span>
                  )}
                </button>

                {/* Kết quả phản hồi từ AI */}
                {resultText && (
                  <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <h3 className="font-bold text-slate-800 text-sm">
                      💡 Kết quả phân tích ({selectedAgent}):
                    </h3>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono bg-white p-4 rounded-xl border border-slate-100">
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
