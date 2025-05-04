import React from 'react';

const Forbidden403 = () => {
  return (
    <>
      <style>{`
.forbidden-body {
  background-color: #1C2127;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  font-family: 'Poppins', sans-serif;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 60px;
}

.message-box {
  max-width: 420px;
  color: white;
  animation: fadeIn 1s ease-in-out;
}

.message-box h1 {
  font-size: 42px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #FF6B6B;
}

.message-box p {
  font-size: 18px;
  line-height: 1.5;
  font-weight: 300;
  color: #E0E0E0;
}

.container {
  text-align: center;
}

.neon {
  font-family: 'Varela Round', sans-serif;
  font-size: 90px;
  color: #5BE0B3;
  letter-spacing: 3px;
  text-shadow: 0 0 5px #6EECC1;
  animation: flux 2s linear infinite;
}

.door-frame {
  height: 495px;
  width: 295px;
  border-radius: 90px 90px 0 0;
  background-color: #8594A5;
  display: flex;
  justify-content: center;
  align-items: center;
}

.door {
  height: 450px;
  width: 250px;
  border-radius: 70px 70px 0 0;
  background-color: #A0AEC0;
  position: relative;
}

.eye {
  top: 15px;
  left: 25px;
  height: 5px;
  width: 15px;
  border-radius: 50%;
  background-color: white;
  animation: eye 7s ease-in-out infinite;
  position: absolute;
}

.eye2 {
  left: 65px;
}

.window {
  height: 40px;
  width: 130px;
  background-color: #1C2127;
  border-radius: 3px;
  margin: 80px auto;
  position: relative;
}

.leaf {
  height: 40px;
  width: 130px;
  background-color: #8594A5;
  border-radius: 3px;
  margin: 80px auto;
  animation: leaf 7s infinite;
  transform-origin: right;
}

.handle {
  height: 8px;
  width: 50px;
  border-radius: 4px;
  background-color: #EBF3FC;
  position: absolute;
  margin-top: 250px;
  margin-left: 30px;
}

.rectangle {
  height: 70px;
  width: 25px;
  background-color: #CBD8E6;
  border-radius: 4px;
  position: absolute;
  margin-top: 220px;
  margin-left: 20px;
}

@keyframes leaf {
  0% { transform: scaleX(1); }
  5% { transform: scaleX(0.2); }
  70% { transform: scaleX(0.2); }
  75% { transform: scaleX(1); }
  100% { transform: scaleX(1); }
}

@keyframes eye {
  0%, 5% { opacity: 0; transform: translateX(0); }
  15% { opacity: 1; }
  20% { transform: translateX(15px); }
  35% { transform: translateX(15px); }
  40% { transform: translateX(-15px); }
  60% { transform: translateX(-15px); }
  65% { transform: translateX(0); }
}

@keyframes flux {
  0%, 100% {
    text-shadow: 0 0 5px #00FFC6, 0 0 15px #00FFC6, 0 0 50px #00FFC6, 0 0 50px #00FFC6, 0 0 2px #B9FFE8, 2px 2px 3px #12E29C;
    color: #4BFFEF;
  }
  50% {
    text-shadow: 0 0 3px #00B58D, 0 0 7px #00B58D, 0 0 25px #00B58D, 0 0 25px #00B58D, 0 0 2px #00B58D, 2px 2px 3px #006A60;
    color: #63D3AE;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
      `}</style>

      <div className="forbidden-body">
        <link href="https://fonts.googleapis.com/css?family=Varela+Round" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Poppins" rel="stylesheet" />

        <div className="message-box">
          <h1>Không có quyền truy cập</h1>
          <p>Bạn không có quyền truy cập vào trang này. Vui lòng kiểm tra quyền truy cập hoặc liên hệ quản trị viên nếu bạn nghĩ đây là sự nhầm lẫn.</p>
        </div>

        <div className="container">
          <div className="neon">403</div>
          <div className="door-frame">
            <div className="door">
              <div className="rectangle"></div>
              <div className="handle"></div>
              <div className="window">
                <div className="eye"></div>
                <div className="eye eye2"></div>
                <div className="leaf"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Forbidden403;
