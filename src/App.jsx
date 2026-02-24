import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 🚨 lucide-react에서 에러를 유발하는 Spider를 빼고, 나머지 안전한 아이콘만 가져옵니다.
import { Flame, ChefHat, Cookie, Utensils, Trash2, Skull, Heart, Smartphone } from 'lucide-react';

// 🕷️ 에러가 절대 나지 않는 100% 안전한 커스텀 거미(Spider) 아이콘 컴포넌트
const CustomSpider = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* 몸통 */}
    <circle cx="12" cy="14" r="4" />
    {/* 머리 */}
    <circle cx="12" cy="8" r="2" />
    {/* 왼쪽 다리 4개 */}
    <path d="M8.5 12.5 L4 10" />
    <path d="M8 14 L3 14" />
    <path d="M8.5 15.5 L4 18" />
    <path d="M10 17 L7 21" />
    {/* 오른쪽 다리 4개 */}
    <path d="M15.5 12.5 L20 10" />
    <path d="M16 14 L21 14" />
    <path d="M15.5 15.5 L20 18" />
    <path d="M14 17 L17 21" />
    {/* 독니(더듬이) */}
    <path d="M11 6 L10 4" />
    <path d="M13 6 L14 4" />
  </svg>
);

// --- [사용자 설정] 이미지 경로 설정 ---
const IMG_ASSETS = {
  P_IDLE: "/assets/p_idle.png",
  P_UP: "/assets/p_up.png",
  P_DOWN: "/assets/p_down.png",
  P_LEFT: "/assets/p_left.png",
  P_RIGHT: "/assets/p_right.png",
  P_UP_LEFT: "/assets/p_up_left.png",
  P_UP_RIGHT: "/assets/p_up_right.png",
  P_DOWN_LEFT: "/assets/p_down_left.png",
  P_DOWN_RIGHT: "/assets/p_down_right.png",
  P_HAPPY_IDLE: "/assets/p_happy_idle.png",
  P_HAPPY_UP: "/assets/p_happy_up.png",
  P_HAPPY_DOWN: "/assets/p_happy_down.png",
  P_HAPPY_LEFT: "/assets/p_happy_left.png",
  P_HAPPY_RIGHT: "/assets/p_happy_right.png",
  P_HAPPY_UP_LEFT: "/assets/p_happy_up_left.png",
  P_HAPPY_UP_RIGHT: "/assets/p_happy_up_right.png",
  P_HAPPY_DOWN_LEFT: "/assets/p_happy_down_left.png",
  P_HAPPY_DOWN_RIGHT: "/assets/p_happy_down_right.png",
  BRO_NORMAL: "/assets/bro_normal.png",       
  BRO_WATCHING: "/assets/bro_watching.png",   
  BRO_KISSED: "/assets/bro_kissed.png",       
  BRO_ANGRY_SIDE: "/assets/bro_angry.png",    
  
  PIG_TOP: "/assets/pig_top.gif",
  PIG_BOTTOM: "/assets/pig_bottom.gif",
  PIG_LEFT: "/assets/pig_left.gif",
  PIG_RIGHT: "/assets/pig_right.gif",
};

const pixelFontStyle = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
@font-face {
  font-family: 'Galmuri11';
  src: url('https://cdn.jsdelivr.net/npm/galmuri/dist/Galmuri11.woff2') format('woff2');
}
.font-pixel { 
  font-family: 'Press Start 2P', 'Galmuri11', cursive;
  line-height: 1.4;
  letter-spacing: -1.5px;
}
.pixel-border { box-shadow: 4px 4px 0px 0px #3d2b1f; border: 4px solid #3d2b1f; }
.pixel-border-sm { box-shadow: 2px 2px 0px 0px #3d2b1f; border: 2px solid #3d2b1f; }
.pixel-btn:active { transform: translate(4px, 4px); box-shadow: none; }
.pixel-art { image-rendering: pixelated; -ms-interpolation-mode: nearest-neighbor; }
.scanlines {
  background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(61, 43, 31, 0.05) 50%, rgba(61, 43, 31, 0.05));
  background-size: 100% 4px; pointer-events: none;
}
`;

const GAME_DURATION = 60;
const OVEN_COUNT = 3;
const BAKE_TIME = 4000; 
const BURN_TIME = 7000; 

const POS = {
  STATION_HAND: { x: 15, y: 30 },
  BROTHER: { x: 90, y: 25 }, 
  OVENS: [ { x: 35, y: 20 }, { x: 50, y: 20 }, { x: 65, y: 20 } ]
};

export default function PixelCookieTycoon() {
  const [gameState, setGameState] = useState('intro');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 60 });
  const [playerDir, setPlayerDir] = useState('P_IDLE'); 
  const [playerMood, setPlayerMood] = useState('normal'); 
  
  const [brotherMood, setBrotherMood] = useState('watching'); 
  const [hand, setHand] = useState(null); 
  const [feedback, setFeedback] = useState(null); 
  
  const [score, setScore] = useState(0);
  const [eatenCount, setEatenCount] = useState(0);
  const [burntEatenCount, setBurntEatenCount] = useState(0);
  const [burntCount, setBurntCount] = useState(0);
  
  // 🔮 염력 사용 횟수 상태
  const [magicUsed, setMagicUsed] = useState(0);
  
  const [brotherText, setBrotherText] = useState("오픈 준비!");
  
  const brotherTimeoutRef = useRef(null);
  const moodTimeoutRef = useRef(null); 
  const playerMoodTimeoutRef = useRef(null);
  const kitchenRef = useRef(null);

  const [ovens, setOvens] = useState(Array(OVEN_COUNT).fill({ status: 'empty', progress: 0 }));

  const speakBrother = (text, duration = 2000, angry = false) => {
    if (brotherTimeoutRef.current) clearTimeout(brotherTimeoutRef.current);
    setBrotherText(text);
    if (angry && brotherMood !== 'kissed') changeBrotherMood('angry', duration);
    brotherTimeoutRef.current = setTimeout(() => setBrotherText("..."), duration);
  };

  const changeBrotherMood = (mood, duration = 2000) => {
    if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current);
    setBrotherMood(mood);
    moodTimeoutRef.current = setTimeout(() => setBrotherMood('watching'), duration);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { endGame(); return 0; }
        return prev - 1;
      });
    }, 1000);

    const ovenTick = setInterval(() => {
      setOvens((prevOvens) => 
        prevOvens.map((oven) => {
          if (oven.status === 'baking' || oven.status === 'done') {
            const newProgress = oven.progress + 100;
            if (oven.status === 'baking' && newProgress >= BAKE_TIME) return { ...oven, status: 'done', progress: newProgress };
            if (oven.status === 'done' && newProgress >= BURN_TIME) {
              setBurntCount(c => c + 1);
              speakBrother("탄내 나잖아!!", 2000, true);
              return { ...oven, status: 'burnt', progress: newProgress };
            }
            return { ...oven, progress: newProgress };
          }
          return oven;
        })
      );
    }, 100);

    return () => { clearInterval(timer); clearInterval(ovenTick); };
  }, [gameState]);

  // 🚨 [수정됨] 화재 8번 발생 OR 염력 5번 사용 시 즉시 게임 종료 (엔딩 트리거)
  useEffect(() => {
    if (gameState === 'playing') {
      if (burntCount >= 8 || magicUsed >= 5) {
        setGameState('ending');
      }
    }
  }, [burntCount, magicUsed, gameState]);

  const endGame = () => setGameState('ending');

  const movePlayer = (e) => {
    if (gameState !== 'playing' || !kitchenRef.current) return;
    const rect = kitchenRef.current.getBoundingClientRect();
    
    let targetX = ((e.clientX - rect.left) / rect.width) * 100;
    let targetY = ((e.clientY - rect.top) / rect.height) * 100;
    targetX = Math.max(5, Math.min(95, targetX));
    targetY = Math.max(20, Math.min(90, targetY));

    const dx = targetX - playerPos.x;
    const dy = targetY - playerPos.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI); 

    let newDir = 'P_DOWN';
    if (angle > -22.5 && angle <= 22.5) newDir = 'P_RIGHT';
    else if (angle > 22.5 && angle <= 67.5) newDir = 'P_DOWN_RIGHT';
    else if (angle > 67.5 && angle <= 112.5) newDir = 'P_DOWN';
    else if (angle > 112.5 && angle <= 157.5) newDir = 'P_DOWN_LEFT';
    else if (angle > 157.5 || angle <= -157.5) newDir = 'P_LEFT';
    else if (angle > -157.5 && angle <= -112.5) newDir = 'P_UP_LEFT';
    else if (angle > -112.5 && angle <= -67.5) newDir = 'P_UP';
    else if (angle > -67.5 && angle <= -22.5) newDir = 'P_UP_RIGHT';

    setPlayerDir(newDir);
    setPlayerPos({ x: targetX, y: targetY });
  };

  const showFeedback = (text) => {
    setFeedback(text);
    setTimeout(() => setFeedback(null), 1000);
  };

  const checkDistance = (targetPos, limit = 20) => {
    const dist = Math.sqrt(Math.pow(playerPos.x - targetPos.x, 2) + Math.pow(playerPos.y - targetPos.y, 2));
    return dist <= limit;
  };

  const interactBrother = () => {
    if (!checkDistance(POS.BROTHER, 25)) { showFeedback("더 가까이!"); return; }
    showFeedback("쪽! 😘");
    setBrotherMood('kissed'); 
    speakBrother("뭐하는거야...!!! 😳", 2000);
    if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current);
    moodTimeoutRef.current = setTimeout(() => setBrotherMood('watching'), 2000);
    setPlayerMood('happy');
    if (playerMoodTimeoutRef.current) clearTimeout(playerMoodTimeoutRef.current);
    playerMoodTimeoutRef.current = setTimeout(() => setPlayerMood('normal'), 2000);
  };

  const getDough = (isMagic) => {
    if (hand) { showFeedback("손이 꽉 찼다!"); return; }
    if (!isMagic) {
      if (!checkDistance(POS.STATION_HAND)) { showFeedback("너무 멀어!"); return; }
      setHand('dough_hand');
      showFeedback("반죽 끙차!");
    } else {
      setHand('dough_magic');
      setMagicUsed(p => p + 1); // 염력 사용 횟수 증가
      showFeedback("염력 소환!");
    }
  };

  const interactOven = (index) => {
    const oven = ovens[index];
    const ovenPos = POS.OVENS[index]; 
    if (oven.status === 'empty') {
      if (hand === 'dough_hand') {
        if (!checkDistance(ovenPos)) { showFeedback("너무 멀어!"); return; }
        setHand(null); startBaking(index);
      } else if (hand === 'dough_magic') {
        setHand(null); startBaking(index); showFeedback("슝~!");
      }
    } 
    else if ((oven.status === 'done' || oven.status === 'burnt') && !hand) {
       if (!checkDistance(ovenPos)) { showFeedback("너무 멀어!"); return; }
       setHand(oven.status === 'done' ? 'cookie' : 'burnt');
       resetOven(index);
       showFeedback(oven.status === 'done' ? "잘 익었다!" : "앗 뜨거!");
    }
  };

  const startBaking = (index) => {
    const newOvens = [...ovens];
    newOvens[index] = { status: 'baking', progress: 0 };
    setOvens(newOvens);
  };

  const resetOven = (index) => {
    const newOvens = [...ovens];
    newOvens[index] = { status: 'empty', progress: 0 };
    setOvens(newOvens);
  };

 const submitCookie = () => {
    //	제대로 팔았을 때 형의 랜덤 대사 
    const successDialogues = [
      "좋아, 다음!",
      "제법이네.",
      "빨리빨리 움직여!",
      "나쁘지 않아.",
      "왜 잘하지? 수상한데?",
    ];

    // 탄 쿠키를 형에게 제출했을 때 랜덤 대사
    const angryDialogues = [
      "장난하냐? 버려!",
      "이걸 팔라고?",
      "쓰레기통에나 넣어!",
      "다시 해와!",
      "너나 먹어라!",
	  
    ];

    if (hand === 'cookie') {
      setScore(p => p + 1); 
      setHand(null); 
      
      // 성공 대사 중 하나를 랜덤으로 뽑아서 출력 (1.5초 유지)
      const randomText = successDialogues[Math.floor(Math.random() * successDialogues.length)];
      speakBrother(randomText, 1500); 
      
      showFeedback("+100G");
    } else if (hand === 'burnt') {
      setHand(null); 
      
      // 분노 대사 중 하나를 랜덤으로 뽑아서 출력 (화난 표정 true)
      const randomAngryText = angryDialogues[Math.floor(Math.random() * angryDialogues.length)];
      speakBrother(randomAngryText, 2000, true); 
    } else { 
      showFeedback("줄 게 없다"); 
    }
  };
 const eatCookie = (e) => {
    e.stopPropagation();

    //  형의 랜덤 대사 목록 
    const normalDialogues = [
      "그만 좀 먹어!",
      "재료 없다고!",
      "또 처먹냐?",
      "거덜내려고 작정했냐?",
      "돼지 새끼야!",
      "니 반죽으로 써버린다",
    ];

    const burntDialogues = [
      "죽고 싶냐?",
      "그걸 왜 먹어!?",
      "배탈 난다...",
      "레데아랑 합일시켜줄까?",
      "신성-암세포를 지 몸으로 처 만드네",
      "하...",
    ];

    if (hand === 'cookie') {
      setEatenCount(p => p + 1);
      setHand(null);
      showFeedback("맛있다!");
      
      // 정상 쿠키 먹을 때마다 랜덤 대사 출력 (true = 화난 표정)
      const randomText = normalDialogues[Math.floor(Math.random() * normalDialogues.length)];
      speakBrother(randomText, 2000, true);

    } else if (hand === 'burnt') {
      setBurntEatenCount(p => p + 1); 
      
      //  탄 쿠키를 먹으면 화재 횟수(burntCount)를 1 차감합니다! (최소 0까지만)
      setBurntCount(p => Math.max(0, p - 1)); 

      setHand(null);
      
      // 피드백
      showFeedback("으윽... (화재 은폐!)");
      
      // 탄 쿠키 먹을 때마다 랜덤 대사 출력
      const randomBurntText = burntDialogues[Math.floor(Math.random() * burntDialogues.length)];
      speakBrother(randomBurntText, 2000, true);
    }
  };
  const getBrotherImage = () => {
    switch(brotherMood) {
        case 'kissed': return IMG_ASSETS.BRO_KISSED;
        case 'angry': return IMG_ASSETS.BRO_ANGRY_SIDE;
        case 'watching': return IMG_ASSETS.BRO_WATCHING;
        default: return IMG_ASSETS.BRO_NORMAL;
    }
  };

  // 🚨 순서에 따라 우선순위 적용됨)
  const getEndingStats = () => {
     if (magicUsed >= 5) return { title: "질서의 천벌", desc: "염력을 너무 많이 써서일까요? 어디에선가 천둥 소리가 들려옵니다...", color: "bg-[#7209b7]", emoji: "⚡" };
     if (burntCount >= 8) return { 
  title: "화재 발생!", 
  desc: (
    <>
      화재가 나서 주방이 싹 타버렸습니다... 형만 간신히 건져서 잽싸게 탈출했습니다.
      질서의 사제단에게는 천벌이 잘못 맞아서 불이 난 거라고 어떻게 둘러대면 되지 않을까요?<br/>
      <span className="text-pink-300">(TIP: 쿠키를 태웠을 때는 잽싸게 먹어보세요!)</span>
    </>
  ), 
  color: "bg-slate-900", 
  emoji: "🔥" 
};
     if (burntEatenCount >= 3) return { title: "신성-암세포", desc: "숯덩이를 너무 많이 먹어 실려갔습니다. 형이 칼리스터를 찾고 있는 것 같습니다...", color: "bg-[#4a4e69]", emoji: "🐛" };
     if (eatenCount >= 6) return { 
       title: "뚱됒모니움", 
       desc: "쿠키를 너무 많이 먹어서 굴러다니게 되었습니다... 동그란 털동물이 될 것만 같습니다.", 
       color: "bg-[#f28482]", 
       isPigEnding: true 
     };
     if (score >= 13) return { title: "천국의 맛", desc: "다크렐름 최고의 쿠키 가게가 되었습니다! 어? 이상한 앵무새가 갑자기 찾아왔습니다...", color: "bg-[#f4a261]", emoji: "🦜" };
     return { title: "폐업 위기", desc: "매출이 저조합니다. 형이 파시아를 어디 뒀는지 찾고 있습니다.", color: "bg-[#000080]", emoji: "📉" };
  };

  return (
    <div className="w-full h-screen bg-[#3d2b1f] flex items-center justify-center font-pixel overflow-hidden select-none touch-none p-2 md:p-6">
      <style dangerouslySetInnerHTML={{ __html: pixelFontStyle }} />

      <div className="fixed inset-0 z-[9999] bg-[#3d2b1f] flex-col items-center justify-center text-white hidden portrait:flex">
         <Smartphone size={64} className="mb-6 animate-pulse rotate-90" />
         <h2 className="text-xl md:text-2xl font-bold mb-2">가로 모드로 돌려주세요!</h2>
         <p className="text-xs md:text-sm opacity-80 text-center px-4">이 게임은 가로 화면에 최적화되어 있습니다.<br/>(화면 회전 잠금을 해제해 주세요)</p>
      </div>

      <div className="relative w-full max-w-[900px] aspect-[4/3] max-h-screen bg-[#fdf0d5] pixel-border flex flex-col p-2 md:p-4">
        
        <div className="h-12 md:h-16 flex justify-between items-center mb-2 md:mb-4 px-1 md:px-2 z-10 shrink-0">
          <div className="flex gap-2 md:gap-4">
             <div className="bg-white px-2 py-1 md:px-4 md:py-2 pixel-border-sm flex items-center gap-1 md:gap-2 text-[10px] md:text-sm text-[#3d2b1f]">
                <ChefHat className="w-4 h-4 md:w-5 md:h-5"/> <span>{score} PACKS</span>
             </div>
             <div className="bg-[#f28482] text-white px-2 py-1 md:px-4 md:py-2 pixel-border-sm flex items-center gap-1 md:gap-2 text-[10px] md:text-sm">
                <Flame className="w-4 h-4 md:w-5 md:h-5" fill="white"/> <span>{burntCount}/8</span>
             </div>
          </div>
          <div className="bg-[#3d2b1f] text-[#81b29a] px-3 py-1 md:px-6 md:py-2 pixel-border-sm text-sm md:text-xl tracking-widest">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>

        {gameState === 'playing' && (
          <div 
            ref={kitchenRef} onPointerDown={movePlayer}
            className="flex-1 relative bg-[#fdf0d5] pixel-border-sm overflow-hidden cursor-crosshair active:cursor-grabbing touch-none"
          >
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#3d2b1f 1px, transparent 1px), linear-gradient(90deg, #3d2b1f 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

             <div className="absolute left-2 md:left-6 top-1/4 flex flex-col gap-3 md:gap-6 scale-75 md:scale-100 origin-left z-10">
                <PixelStation 
                  label="HAND" color="bg-[#F4C2C2]" icon={<Utensils size={32} color="white"/>} 
                  onPointerDown={(e) => {e.stopPropagation(); getDough(false)}} 
                />
                {/* 🕷️ 커스텀 Spider 컴포넌트 적용 완료 */}
                <PixelStation 
                  label="TERES" color="bg-[#90e0ef]" icon={<CustomSpider size={32} color="#3d2b1f"/>} 
                  onPointerDown={(e) => {e.stopPropagation(); getDough(true)}} 
                />
             </div>

             <div className="absolute top-2 md:top-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-4 scale-75 md:scale-100 origin-top z-10">
                {ovens.map((oven, idx) => (
                  <PixelOven key={idx} status={oven.status} progress={oven.progress} onPointerDown={(e) => { e.stopPropagation(); interactOven(idx); }} />
                ))}
             </div>

             <div className="absolute right-0 top-12 md:top-20 bottom-0 w-24 md:w-40 bg-[#ddb892] border-l-4 border-[#3d2b1f] flex flex-col items-center pt-2 md:pt-4 z-10">
                <div className="absolute -left-24 md:-left-36 top-10 w-24 md:w-32 bg-white text-[#3d2b1f] text-[8px] md:text-xs p-1 md:p-2 pixel-border-sm text-center break-keep">
                   {brotherText}
                   <div className="absolute top-2 -right-2 md:-right-3 w-2 h-2 md:w-3 md:h-3 bg-white border-t-2 border-r-2 border-[#3d2b1f] rotate-45"></div>
                </div>

                <div className="w-20 h-20 md:w-36 md:h-36 relative mt-2 cursor-pointer hover:scale-105 transition-transform" onPointerDown={(e) => { e.stopPropagation(); interactBrother(); }}>
                    <img src={getBrotherImage()} alt="Brother" className="w-full h-full object-contain pixel-art drop-shadow-md" />
                    {brotherMood === 'kissed' && <Heart className="absolute top-0 right-0 text-pink-500 animate-bounce w-4 h-4 md:w-6 md:h-6" fill="currentColor"/>}
                </div>
                <div className="text-[12px] md:text-xs -mt-1 md:-mt-2 font-bold mb-2 md:mb-4 text-[#3d2b1f]">형아</div>

                <button onPointerDown={(e) => { e.stopPropagation(); submitCookie(); }} className="w-16 h-12 md:w-28 md:h-20 bg-[#81b29a] text-white pixel-border pixel-btn flex flex-col items-center justify-center mb-2 md:mb-4 hover:bg-[#6fa189]">
                  <ChefHat className="w-4 h-4 md:w-6 md:h-6" />
                  <span className="text-[6px] md:text-[10px] mt-1">SERVE</span>
                </button>

                {hand === 'burnt' && (
                  <button onPointerDown={(e) => { e.stopPropagation(); setHand(null); }} className="w-10 h-10 md:w-16 md:h-16 bg-[#3d2b1f] text-white pixel-border pixel-btn flex items-center justify-center hover:bg-red-600">
                    <Trash2 className="w-4 h-4 md:w-6 md:h-6"/>
                  </button>
                )}
             </div>

             <div className="absolute w-20 h-20 md:w-32 md:h-32 pointer-events-none z-20 transition-all duration-200 ease-out" style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%`, transform: 'translate(-50%, -50%)' }}>
                <AnimatePresence>
                  {feedback && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -20 }} exit={{ opacity: 0 }} className="absolute -top-6 md:-top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] md:text-[10px] bg-white text-[#3d2b1f] border-2 border-[#3d2b1f] px-1 md:px-2 py-0.5 md:py-1 z-30">
                      {feedback}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative w-full h-full">
                   <img src={playerMood === 'happy' ? IMG_ASSETS[playerDir.replace('P_', 'P_HAPPY_')] : (IMG_ASSETS[playerDir] || IMG_ASSETS.P_IDLE)} alt="Player" className="w-full h-full object-contain pixel-art drop-shadow-lg" />
                   {hand && (
                      <div className={`absolute top-1/2 w-5 h-5 md:w-8 md:h-8 animate-bounce z-10 -translate-y-1/2 ${['P_LEFT', 'P_UP_LEFT', 'P_DOWN_LEFT'].includes(playerDir) ? 'left-1 md:left-2' : 'right-1 md:right-2'}`}>
                        {hand === 'dough_hand' && <div className="w-full h-full bg-[#f4d58d] border-2 border-[#3d2b1f]" />}
                        {hand === 'dough_magic' && <div className="w-full h-full bg-[#90e0ef] border-2 border-[#3d2b1f] shadow-[0_0_10px_#90e0ef]" />}
                        {hand === 'cookie' && <div className="w-full h-full bg-[#d4a373] rounded-full border-2 border-[#3d2b1f]" />}
                        {hand === 'burnt' && <div className="w-full h-full bg-[#3d2b1f] rounded-full border-2 border-red-500" />}
                      </div>
                   )}
                   {(hand === 'cookie' || hand === 'burnt') && (
                     <button onPointerDown={eatCookie} className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-auto bg-[#f28482] text-white text-[6px] md:text-[8px] px-1 md:px-2 py-0.5 md:py-1 border border-[#3d2b1f] md:border-2 hover:bg-[#e07a5f]">
                       {hand === 'cookie' ? 'EAT' : 'EAT?'}
                     </button>
                   )}
                </div>
                <div className="absolute bottom-0 md:-bottom-1 left-1/2 -translate-x-1/2 w-10 md:w-16 h-1.5 md:h-3 bg-[#3d2b1f] opacity-30 rounded-[50%] -z-10"></div>
             </div>

             <div className="absolute inset-0 pointer-events-none scanlines opacity-30 z-30"></div>
          </div>
        )}

        {gameState === 'intro' && (
           <div className="absolute inset-2 md:inset-4 z-50 bg-[#fdf0d5] pixel-border flex flex-col items-center justify-center gap-4 md:gap-8 p-4">
              <h1 className="text-2xl md:text-6xl text-center leading-relaxed text-[#3d2b1f] drop-shadow-[2px_2px_0_rgba(129,178,154,1)] md:drop-shadow-[4px_4px_0_rgba(129,178,154,1)]">
                PQ's<br/><span className="text-[#f28482]">SWEET BAKERY</span>
              </h1>
              <div className="bg-white p-3 md:p-6 pixel-border-sm text-[8px] md:text-xs leading-loose max-w-xs md:max-w-md text-[#3d2b1f]">
                 <p className="border-b-2 border-[#f28482] inline-block mb-1 md:mb-2">★ 게임하는 법 ★</p>
                 <p>1. [클릭/터치] 로 움직이세요</p>
                 <p>2. 도우를 가져와서 오븐에 넣고 형한테 가져다주세요</p>
                 <p className="text-[#f28482] mt-1 md:mt-2">★ 손반죽(PINK)은 가까이 가야 잡힙니다!</p>
                 <p className="text-[#90e0ef] font-bold drop-shadow-[1px_1px_0_#3d2b1f]">★ 염력반죽(BLUE)은 어디에서나 잡힙니다!</p>
                 <p className="text-[#81b29a] font-bold mt-1 md:mt-2">★ HINT: 형한테 가까이 다가가 터치하면 뽀뽀!</p>
              </div>
              <button onClick={() => setGameState('playing')} className="px-6 py-3 md:px-8 md:py-4 bg-[#89CFF0] text-white text-sm md:text-xl pixel-border pixel-btn hover:bg-[#89CFF0]">
  START BAKING
</button>
           </div>
        )}

        {gameState === 'ending' && (
           <EndingScreen stats={{ score, eatenCount, burntEatenCount, burntCount, magicUsed }} ending={getEndingStats()} onRetry={() => window.location.reload()} />
        )}
      </div>
    </div>
  );
}

function PixelStation({ label, color, icon, onPointerDown }) {
  return (
    <div onPointerDown={onPointerDown} className={`w-16 h-16 md:w-24 md:h-24 ${color} pixel-border pixel-btn flex flex-col items-center justify-center cursor-pointer group hover:brightness-110`}>
      <div className="mb-1 md:mb-2 scale-75 md:scale-110 group-hover:scale-125 transition-transform">{icon}</div>
      <span className="text-[6px] md:text-[10px] font-bold text-white drop-shadow-md">{label}</span>
    </div>
  );
}

function PixelOven({ status, progress, onPointerDown }) {
  let bg = "bg-[#a5a58d]", light = "bg-[#6c757d]";
  if (status === 'baking') { bg = "bg-[#f4a261]"; light = "bg-yellow-400 animate-pulse"; } 
  else if (status === 'done') { bg = "bg-[#81b29a]"; light = "bg-green-400"; } 
  else if (status === 'burnt') { bg = "bg-[#3d2b1f]"; light = "bg-red-600 animate-ping"; }

  return (
    <div onPointerDown={onPointerDown} className={`w-16 h-20 md:w-24 md:h-32 ${bg} pixel-border relative flex flex-col items-center p-1 md:p-2 cursor-pointer hover:mt-[-4px] transition-all`}>
       <div className="w-full h-8 md:h-12 bg-[#3d2b1f] border-2 border-white/20 mb-1 md:mb-2 flex items-center justify-center overflow-hidden">
          {status === 'baking' && <Flame className="text-orange-500 animate-bounce w-4 h-4 md:w-6 md:h-6"/>}
          {status === 'done' && <Cookie className="text-[#f4d58d] animate-pulse w-4 h-4 md:w-6 md:h-6"/>}
          {status === 'burnt' && <Skull className="text-gray-400 w-4 h-4 md:w-6 md:h-6"/>}
       </div>
       <div className="w-full h-2 md:h-4 bg-[#3d2b1f] border border-gray-500 p-0.5 flex items-center">
          {status !== 'empty' && status !== 'burnt' && <div className="h-full bg-[#f28482]" style={{ width: `${(progress / BAKE_TIME) * 100}%`, maxWidth: '100%' }} />}
          {status === 'burnt' && <div className="w-full h-full bg-red-600 animate-pulse" />}
       </div>
       <div className={`absolute top-1 right-1 md:top-2 md:right-2 w-2 h-2 md:w-3 md:h-3 ${light} border border-black`}></div>
       <div className="mt-auto flex gap-1">
          <div className="w-2 h-2 md:w-4 md:h-4 bg-white/20 border border-black rounded-full"></div>
          <div className="w-2 h-2 md:w-4 md:h-4 bg-white/20 border border-black rounded-full"></div>
       </div>
    </div>
  );
}

function EndingScreen({ stats, ending, onRetry }) {
  return (
    <div className={`absolute inset-2 md:inset-4 z-50 ${ending.color} pixel-border flex flex-col items-center justify-center text-white p-4 md:p-8 text-center overflow-hidden`}>
       
       {/* 👇 수정된 부분: 뚱됒모니움 엔딩일 때 상하좌우 GIF 렌더링, 아닐 때는 일반 이모지 */}
       {ending.isPigEnding ? (
         <>
           <img src={IMG_ASSETS.PIG_TOP} alt="top" className="absolute top-4 left-1/2 -translate-x-1/2 w-16 md:w-24 animate-bounce" />
           <img src={IMG_ASSETS.PIG_BOTTOM} alt="bottom" className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 md:w-24 animate-bounce" />
           <img src={IMG_ASSETS.PIG_LEFT} alt="left" className="absolute left-4 top-1/2 -translate-y-1/2 w-16 md:w-24 animate-bounce" />
           <img src={IMG_ASSETS.PIG_RIGHT} alt="right" className="absolute right-4 top-1/2 -translate-y-1/2 w-16 md:w-24 animate-bounce" />
         </>
       ) : (
         <div className="text-4xl md:text-6xl mb-2 md:mb-4 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)] md:drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
           {ending.emoji}
         </div>
       )}

       {/* 아래 요소들에 z-10을 주어 GIF 위로 올라오게 합니다 */}
       <h2 className="text-xl md:text-3xl mb-2 md:mb-4 drop-shadow-md z-10">{ending.title}</h2>
       <p className="text-[10px] md:text-sm mb-4 md:mb-8 max-w-xs md:max-w-md bg-black/30 p-2 md:p-4 border-2 border-white/50 leading-loose z-10">
         {ending.desc}
       </p>
       
       <div className="flex flex-wrap gap-2 md:gap-4 justify-center text-[8px] md:text-xs mb-4 md:mb-8 z-10">
          <div className="bg-black/50 p-1 md:p-2 border border-white">SOLD: {stats.score}</div>
          <div className="bg-black/50 p-1 md:p-2 border border-white text-pink-300">ATE: {stats.eatenCount}</div>
          <div className="bg-black/50 p-1 md:p-2 border border-white text-gray-400">ATE(BURNT): {stats.burntEatenCount}</div>
       </div>

       <button onClick={onRetry} className="px-4 py-2 md:px-6 md:py-3 bg-white text-[#3d2b1f] text-sm md:text-base pixel-border hover:bg-gray-200 active:translate-y-1 active:shadow-none z-10">
         TRY AGAIN
       </button>
    </div>
  );
}