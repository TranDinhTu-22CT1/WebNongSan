import{r as k,j as e,C as T,a as B,c as K,b as U,d as Y}from"./index-C1KJssbB.js";import{c as Z}from"./cil-x-0440B5Ce.js";import{c as F,a as D,b as Q}from"./cil-reload-DWHLt0u9.js";import{C as J,a as H}from"./CRow-CTGywBGK.js";import{C as ee}from"./CFormInput-BLnGKak4.js";import"./CFormControlWrapper-Bh3eI6Vk.js";function te({visible:i}){const a=k.useRef(null),t=k.useRef(!1);return k.useEffect(()=>{if(!i||t.current)return;t.current=!0;const s=n=>new Promise(o=>{const h=document.createElement("script");h.src=n,h.onload=o,document.head.appendChild(h)}),c=n=>{if(document.querySelector(`link[href="${n}"]`))return;const o=document.createElement("link");o.rel="stylesheet",o.href=n,document.head.appendChild(o)};async function u(){c("https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css"),c("https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"),window.jQuery||await s("https://code.jquery.com/jquery-3.6.0.min.js"),window.ChessBoard||await s("https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js"),window.Chess||await s("https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js"),g()}function g(){const n={move:"https://lichess.org/assets/sound/standard/Move.ogg",capture:"https://lichess.org/assets/sound/standard/Capture.ogg",check:"https://lichess.org/assets/sound/standard/Check.ogg",end:"https://lichess.org/assets/sound/standard/GenericNotify.ogg"},o=(m,b=0)=>{m&&setTimeout(()=>{try{let y=n.move;l.in_check()?y=n.check:m.captured&&(y=n.capture),new Audio(y).play().catch(()=>{})}catch{}},b)},h=()=>{try{new Audio(n.end).play().catch(()=>{})}catch{}};a.current.innerHTML=`
        <style>
          .chess-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,.65);
            backdrop-filter: blur(6px);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow-y: auto;
            padding: 10px;
          }
          .chess-card-container {
            width: 100%;
            max-width: 1100px;
            margin: auto;
          }
          .piece-417db {
            z-index: 9999 !important;
            cursor: grabbing !important;
            filter: drop-shadow(0 10px 14px rgba(0,0,0,.35));
            transform: scale(1.08);
          }
          img {
            transition: transform .15s cubic-bezier(.22,.61,.36,1), left .15s cubic-bezier(.22,.61,.36,1), top .15s cubic-bezier(.22,.61,.36,1);
          }
          .board-green .white-1e1d7 { background:#e6f2e6 }
          .board-green .black-3c85d { background:#4f7942 }
          .board-classic .white-1e1d7 { background:#f0d9b5 }
          .board-classic .black-3c85d { background:#b58863 }
          .board-blue .white-1e1d7 { background:#dee9f5 }
          .board-blue .black-3c85d { background:#4a6fa5 }
          .board-dark .white-1e1d7 { background:#444 }
          .board-dark .black-3c85d { background:#222 }
          #promotion-layer {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            z-index: 10001;
            text-align: center;
            width: 90%;
            max-width: 320px;
          }
          .promo-choice {
            border: 2px solid #eee;
            background: #f8f9fa;
            border-radius: 8px;
            cursor: pointer;
            transition: 0.2s;
            padding: 5px;
            margin: 5px;
            flex: 1;
          }
          .promo-choice:hover {
            background: #e9ecef;
            border-color: #0d6efd;
            transform: translateY(-3px);
          }
          .promo-choice img { width: 100%; max-width: 60px; height: auto; }
          #result-modal {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            z-index: 10005;
            justify-content: center;
            align-items: center;
            padding: 20px;
          }
          .result-card {
            background: white;
            padding: 25px;
            border-radius: 20px;
            max-width: 450px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          @keyframes bounceIn {
            from { opacity: 0; transform: scale(0.5); }
            to { opacity: 1; transform: scale(1); }
          }
          .result-gif { width: 100%; border-radius: 10px; margin-bottom: 20px; max-height: 200px; object-fit: cover; }
          @media (max-width: 991.98px) {
            .col-lg-8 { margin-bottom: 1rem; }
            #board { margin: 0 auto; }
            .card-body { padding: 1rem; }
            .result-card h2 { font-size: 1.5rem; }
          }
        </style>

        <div class="chess-overlay">
          <div id="result-modal">
            <div class="result-card">
              <img id="result-gif" class="result-gif" src="" />
              <h2 id="result-title" class="fw-bold mb-3"></h2>
              <p id="result-text" class="text-muted mb-4 fw-bold"></p>
              <button id="restart-btn" class="btn btn-dark btn-lg w-100">Ván mới thôi nào</button>
            </div>
          </div>

          <div id="promotion-layer">
            <button id="cancel-promotion" style="position:absolute; top:5px; right:10px; border:none; background:none; font-size:18px; cursor:pointer;">✖</button>
            <h6 class="fw-bold mb-3">Chọn quân phong cấp</h6>
            <div class="d-flex justify-content-center">
              <div class="promo-choice" data-promo="q"><img src="https://chessboardjs.com/img/chesspieces/wikipedia/wQ.png" /></div>
              <div class="promo-choice" data-promo="r"><img src="https://chessboardjs.com/img/chesspieces/wikipedia/wR.png" /></div>
              <div class="promo-choice" data-promo="b"><img src="https://chessboardjs.com/img/chesspieces/wikipedia/wB.png" /></div>
              <div class="promo-choice" data-promo="n"><img src="https://chessboardjs.com/img/chesspieces/wikipedia/wN.png" /></div>
            </div>
          </div>

          <div class="chess-card-container">
            <div class="card shadow-lg">
              <div class="card-header bg-dark text-white fw-bold d-flex justify-content-between align-items-center p-3">
                <span>♟️ Chơi cờ vua</span>
                <button id="closeChess" class="btn btn-sm btn-outline-light">✖</button>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-12 col-lg-8 d-flex justify-content-center position-relative">
                    <div id="board" style="width: 100%; max-width: 600px;"></div>
                  </div>
                  <div class="col-12 col-lg-4 mt-3 mt-lg-0">
                    <div class="d-flex flex-column gap-3 h-100">
                      <div id="status" class="alert alert-info fw-bold text-center mb-0 p-2">👉 Đến lượt bạn</div>
                      <div class="row row-cols-2 row-cols-lg-1 g-2">
                        <div class="col">
                          <label class="fw-bold small">🎨 Màu bàn cờ</label>
                          <select id="boardTheme" class="form-select form-select-sm">
                            <option value="classic">Cổ điển</option>
                            <option value="blue">Xanh dương</option>
                            <option value="green" selected>Xanh lá</option>
                            <option value="dark">Tối</option>
                          </select>
                        </div>
                        <div class="col">
                          <label class="fw-bold small">♟️ Kiểu quân cờ</label>
                          <select id="style" class="form-select form-select-sm">
                            <option value="wikipedia">Wikipedia</option>
                            <option value="alpha">Alpha</option>
                            <option value="cburnett">Cburnett</option>
                            <option value="cardinal">Cardinal</option>
                            <option value="merida" selected>Merida</option>
                          </select>
                        </div>
                        <div class="col-12">
                          <label class="fw-bold small">🤖 ELO AI</label>
                          <select id="aiElo" class="form-select form-select-sm">
                            <option value="800">800 (Người mới)</option>
                            <option value="1000">1000</option>
                            <option value="1200">1200</option>
                            <option value="1400" selected>1400</option>
                            <option value="1600">1600</option>
                            <option value="1800">1800</option>
                            <option value="2000">2000</option>
                            <option value="2200">2200</option>
                            <option value="2400">2400 (Master)</option>
                          </select>
                        </div>
                      </div>
                      <button id="reset" class="btn btn-dark btn-lg mt-lg-auto w-100">🔄 Ván mới</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;const l=new window.Chess;let v,M=!1,C=1400,E=null;const I=document.getElementById("status"),z=document.getElementById("board"),S=document.getElementById("promotion-layer"),L=document.getElementById("result-modal"),r={win:["https://media.giphy.com/media/3o7TKVUn7iM8FMEU24/giphy.gif","https://media.giphy.com/media/1GT5PZLjMwYBW/giphy.gif"],lose:["https://media.giphy.com/media/6gDSyjaOPwZ4A/giphy.gif","https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif"],draw:["https://media.giphy.com/media/26u4b45b8KlgAB7iM/giphy.gif","https://media.giphy.com/media/xT9IgusfDcqpPFzjdS/giphy.gif"]},d={win:["Ghê đấy! Check VAR ngay!","Thắng rồi! Bộ não của bạn nhanh hơn Stockfish rồi."],lose:{low:["Mức 800 mà cũng thua?","Về chơi cờ cá ngựa đi bạn ơi!"],mid:["Sai một li, đi luôn cả ván cờ.","Nước cờ của bạn... khó hiểu thật."],high:["Thua Grandmaster không có gì xấu hổ.","Bạn đã trụ vững? Đẳng cấp!"]}};function x(){S.style.display="none",E=null,v.position(l.fen(),!0)}document.getElementById("cancel-promotion").onclick=x;function f(m){h();const b=document.getElementById("result-title"),y=document.getElementById("result-text"),P=document.getElementById("result-gif");let _,A;if(m==="human")b.innerText="CHÚC MỪNG! 🎉",b.style.color="#28a745",A=d.win[Math.floor(Math.random()*d.win.length)],_=r.win[Math.floor(Math.random()*r.win.length)];else if(m==="ai"){b.innerText="BẠN ĐÃ THUA! 💀",b.style.color="#dc3545";let V=C<=1200?d.lose.low:C>=2e3?d.lose.high:d.lose.mid;A=V[Math.floor(Math.random()*V.length)],_=r.lose[Math.floor(Math.random()*r.lose.length)]}else b.innerText="HÒA CỜ! 🤝",b.style.color="#007bff",A="Kẻ tám lạng, người nửa cân!",_=r.draw[Math.floor(Math.random()*r.draw.length)];y.innerText=A,P.src=_,L.style.display="flex"}document.getElementById("restart-btn").onclick=()=>{L.style.display="none",document.getElementById("reset").click()};const w={wikipedia:"https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",alpha:"https://chessboardjs.com/img/chesspieces/alpha/{piece}.png",cburnett:"https://lichess1.org/assets/piece/cburnett/{piece}.svg",cardinal:"https://lichess1.org/assets/piece/cardinal/{piece}.svg",merida:"https://lichess1.org/assets/piece/merida/{piece}.svg"},j={800:{skill:1,depth:6,time:150},1e3:{skill:3,depth:8,time:250},1200:{skill:5,depth:10,time:350},1400:{skill:8,depth:12,time:500},1600:{skill:12,depth:14,time:700},1800:{skill:15,depth:16,time:900},2e3:{skill:18,depth:18,time:1200},2200:{skill:20,depth:20,time:1600},2400:{skill:20,depth:22,time:2e3}},p=new Worker("/stockfish.js");p.postMessage("uci"),p.postMessage("isready");function O(m){const b=j[m];p.postMessage(`setoption name Skill Level value ${b.skill}`),p.postMessage("setoption name UCI_LimitStrength value true"),p.postMessage(`setoption name UCI_Elo value ${m}`)}O(1400),p.onmessage=m=>{if(!m.data.startsWith("bestmove"))return;M=!1;const b=m.data.split(" ")[1];if(!b||b==="(none)")return;const y=l.move(b,{sloppy:!0});o(y,250),v.position(l.fen(),!0),$(),l.game_over()&&(l.in_checkmate()?f("ai"):f("draw"))};function X(m){S.style.display="none";const b=l.move({from:E.from,to:E.to,promotion:m});if(o(b),v.position(l.fen(),!0),$(),l.game_over()){l.in_checkmate()?f("human"):f("draw");return}M=!0,I.innerText="🤖 Stockfish đang suy nghĩ...",p.postMessage("position fen "+l.fen()),p.postMessage(`go depth ${j[C].depth} movetime ${j[C].time}`),E=null}document.querySelectorAll(".promo-choice").forEach(m=>{m.onclick=()=>X(m.getAttribute("data-promo"))});function R(m){v=window.ChessBoard("board",{draggable:!0,position:l.fen(),pieceTheme:w[m],onDragStart:(b,y)=>{if(M||l.game_over()||y.startsWith("b"))return!1},onDrop:(b,y)=>{const P=l.get(b);if(P&&P.type==="p"&&(y.endsWith("8")||y.endsWith("1"))){if(!new window.Chess(l.fen()).move({from:b,to:y,promotion:"q"}))return"snapback";E={from:b,to:y},S.style.display="block";return}const A=l.move({from:b,to:y,promotion:"q"});if(!A)return"snapback";if(o(A),$(),l.game_over()){l.in_checkmate()?f("human"):f("draw");return}M=!0,I.innerText="🤖 Stockfish đang suy nghĩ...",p.postMessage("position fen "+l.fen()),p.postMessage(`go depth ${j[C].depth} movetime ${j[C].time}`)},onSnapEnd:()=>v.position(l.fen(),!1)})}function $(){l.in_checkmate()?I.innerText="⚠️ Chiếu hết!":l.in_draw()?I.innerText="🤝 Hòa cờ":l.in_check()?I.innerText="⚡ Bị chiếu":I.innerText="👉 Đến lượt bạn"}R("merida"),G("green");const q=()=>{v&&v.resize()};window.addEventListener("resize",q);function G(m){z.classList.remove("board-classic","board-blue","board-green","board-dark"),z.classList.add("board-"+m)}document.getElementById("boardTheme").onchange=m=>G(m.target.value),document.getElementById("style").onchange=m=>{v.destroy(),R(m.target.value)},document.getElementById("aiElo").onchange=m=>{C=Number(m.target.value),O(C)},document.getElementById("reset").onclick=()=>{l.reset(),M=!1,v.destroy(),R(document.getElementById("style").value),G(document.getElementById("boardTheme").value),O(C),$(),S.style.display="none"},document.getElementById("closeChess").onclick=()=>{window.removeEventListener("resize",q),a.current.innerHTML="",t.current=!1}}u()},[i]),e.jsx("div",{ref:a})}const N=15,se={easy:200,medium:350,hard:600},W={HUMAN:"X",BOT:"O",dirs:[[1,0],[0,1],[1,1],[1,-1]],memory:{},inBoard(i,a){return i>=0&&a>=0&&i<N&&a<N},countContinuous(i,a,t,s,c,u){let g=0,n=0,o=1;for(;this.inBoard(a+s*o,t+c*o)&&i[a+s*o][t+c*o]===u;)g++,o++;return(!this.inBoard(a+s*o,t+c*o)||i[a+s*o][t+c*o]&&i[a+s*o][t+c*o]!==u)&&n++,{cnt:g,blocks:n}},evaluatePoint(i,a,t,s){let c=0;for(let[u,g]of this.dirs){const n=this.countContinuous(i,a,t,u,g,s),o=this.countContinuous(i,a,t,-u,-g,s),h=n.cnt+o.cnt+1,l=n.blocks+o.blocks;if(h>=5)return 1e7;l===0?h===4?c+=5e5:h===3?c+=5e3:h===2&&(c+=500):l===1&&(h===4?c+=5e3:h===3?c+=500:h===2&&(c+=100))}return c},getNeighbors(i){const a=[];for(let t=0;t<N;t++)for(let s=0;s<N;s++)!i[t][s]&&this.isNear(i,t,s,1)&&a.push({r:t,c:s});return a},isNear(i,a,t,s){for(let c=-s;c<=s;c++)for(let u=-s;u<=s;u++)if(this.inBoard(a+c,t+u)&&i[a+c][t+u])return!0;return!1},rememberHumanMove(i,a){const t=`${i},${a}`;this.memory[t]=(this.memory[t]||0)+1},minimax(i,a,t,s,c){const u=this.getNeighbors(i);if(a===0||u.length===0)return this.evaluateBoard(i);if(c){let g=-1/0;for(const n of u){i[n.r][n.c]=this.BOT;const o=this.minimax(i,a-1,t,s,!1);if(i[n.r][n.c]=null,g=Math.max(g,o),t=Math.max(t,o),s<=t)break}return g}else{let g=1/0;for(const n of u){i[n.r][n.c]=this.HUMAN;const o=this.minimax(i,a-1,t,s,!0);if(i[n.r][n.c]=null,g=Math.min(g,o),s=Math.min(s,o),s<=t)break}return g}},evaluateBoard(i){let a=0;for(let t=0;t<N;t++)for(let s=0;s<N;s++)i[t][s]===this.BOT&&(a+=this.evaluatePoint(i,t,s,this.BOT)),i[t][s]===this.HUMAN&&(a-=this.evaluatePoint(i,t,s,this.HUMAN)*1.2);return a},bestMove(i,a){let t=!1;for(let n=0;n<N;n++)for(let o=0;o<N;o++)if(i[n][o]){t=!0;break}if(!t)return{r:Math.floor(N/2),c:Math.floor(N/2)};let s=-1/0,c=null;const u=this.getNeighbors(i),g=a==="hard"?2:a==="medium"?1:0;for(const n of u){i[n.r][n.c]=this.BOT;const o=this.minimax(i,g,-1/0,1/0,!1);i[n.r][n.c]=null;const h=o+(this.memory[`${n.r},${n.c}`]||0)*10;h>s&&(s=h,c=n)}return c||u[0]}};function ie({visible:i,setVisible:a}){const t=Array(N).fill(null).map(()=>Array(N).fill(null)),[s,c]=k.useState(t),[u,g]=k.useState(!0),[n,o]=k.useState(null),[h,l]=k.useState(null),[v,M]=k.useState("hard"),[C,E]=k.useState([]);if(!i)return null;const I=(r,d,x)=>{for(let[f,w]of W.dirs){let j=[{r:d,c:x}];for(let p=1;p<5&&r[d+f*p]?.[x+w*p]===r[d][x];p++)j.push({r:d+f*p,c:x+w*p});for(let p=1;p<5&&r[d-f*p]?.[x-w*p]===r[d][x];p++)j.push({r:d-f*p,c:x-w*p});if(j.length>=5)return j}return null},z=()=>{c(t),g(!0),l(null),o(null),E([])},S=(r,d)=>{if(!u||s[r][d]||h)return;const x=s.map(w=>[...w]);x[r][d]="X",c(x),o({r,c:d}),W.rememberHumanMove(r,d);const f=I(x,r,d);if(f){l("X"),E(f);return}g(!1),setTimeout(()=>L(x),se[v])},L=r=>{if(h)return;const{r:d,c:x}=W.bestMove(r,v),f=r.map(j=>[...j]);f[d][x]="O",c(f),o({r:d,c:x});const w=I(f,d,x);w?(l("O"),E(w)):g(!0)};return e.jsx("div",{style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:99999},children:e.jsxs("div",{style:{width:560,background:"#0f172a",borderRadius:20,padding:16},children:[e.jsxs("div",{className:"d-flex justify-content-between mb-2",children:[e.jsx("b",{style:{color:"#e5e7eb"},children:"🤖 Caro AI – Zebra Rebuild"}),e.jsx(T,{size:"sm",onClick:()=>a(!1),style:{background:"#ef4444",border:"none",color:"#fff",width:32,height:32,padding:0,borderRadius:8},children:e.jsx(B,{icon:Z})})]}),["easy","medium","hard"].map(r=>e.jsx(T,{size:"sm",className:"me-2",color:v===r?"info":"secondary",onClick:()=>{r!==v&&(M(r),z())},children:r.toUpperCase()},r)),e.jsx("div",{style:{margin:"8px 0",color:h?"#22c55e":"#93c5fd"},children:h?`🎉 ${h} thắng!`:`Lượt: ${u?"X (Bạn)":"O (AI)"}`}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:`repeat(${N},1fr)`,gap:2,background:"#334155",padding:6,borderRadius:14},children:s.map((r,d)=>r.map((x,f)=>{const w=C.some(j=>j.r===d&&j.c===f);return e.jsx("div",{onClick:()=>S(d,f),style:{width:30,height:30,background:w?"#22c55e":n?.r===d&&n?.c===f?"#fde68a":"#e5e7eb",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",cursor:"pointer",color:w?"#fff":x==="X"?"#ef4444":"#2563eb",borderRadius:4,transition:"all 0.2s",boxShadow:w?"0 0 10px #22c55e":"none"},children:x},`${d}-${f}`)}))}),e.jsxs(T,{className:"w-100 mt-3",onClick:z,style:{background:"linear-gradient(135deg, #22c55e, #16a34a)",border:"none",color:"#fff",fontWeight:"bold",borderRadius:12,padding:"10px 0"},children:[e.jsx(B,{icon:F,className:"me-2"}),"Chơi lại"]})]})})}function de(){const[i,a]=k.useState(!1),[t,s]=k.useState(0),[c,u]=k.useState(!1),[g,n]=k.useState(0),[o,h]=k.useState(""),[l,v]=k.useState(!1),[M,C]=k.useState(()=>localStorage.getItem("enable_splash")==="true"),E=()=>{s(Date.now()),a(!0)},I=()=>{n(Date.now()),u(!0)},z=()=>{const r=/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,d=o.match(r);d?.[1]?window.dispatchEvent(new CustomEvent("play-youtube-video",{detail:{videoId:d[1]}})):alert("Link Youtube không hợp lệ")},S=()=>{const r=!l;v(r),window.dispatchEvent(new CustomEvent("toggle-neko",{detail:r}))},L=()=>{const r=!M;C(r),window.dispatchEvent(new CustomEvent("toggle-splash",{detail:{enabled:r}}))};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
          .plugin-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 24px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            height: 100%;
          }

          .plugin-card:hover {
            transform: translateY(-5px);
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }

          .rgb-glow {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: -1;
            opacity: 0.15;
            background: linear-gradient(120deg, #6366f1, #38bdf8, #34d399, #a855f7);
            background-size: 300% 300%;
            animation: rgbMove 8s linear infinite;
          }

          @keyframes rgbMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .icon-box {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            background: rgba(255,255,255,0.1);
          }

          .btn-custom {
            border: none;
            border-radius: 12px;
            padding: 10px 20px;
            font-weight: 600;
            transition: all 0.2s;
          }

          .btn-custom:active {
            transform: scale(0.95);
          }

          .input-dark {
            background: rgba(0,0,0,0.2) !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            color: white !important;
            border-radius: 12px !important;
          }

          .setting-label {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: rgba(255,255,255,0.5);
            margin-bottom: 12px;
            font-weight: bold;
          }
        `}),e.jsxs(J,{className:"g-4",children:[e.jsx(H,{md:6,lg:4,children:e.jsxs("div",{className:"plugin-card",children:[e.jsx("div",{className:"rgb-glow"}),e.jsx("div",{className:"icon-box",style:{color:"#22d3ee"},children:e.jsx(B,{icon:K,size:"xl"})}),e.jsx("h5",{className:"fw-bold text-white",children:"Cờ Vua Stockfish"}),e.jsx("p",{className:"text-white-50 small flex-grow-1",children:"Thách thức trí tuệ với AI Stockfish. Giao diện chuyên nghiệp, hỗ trợ nhiều cấp độ."}),e.jsxs(T,{className:"w-100 btn-custom mt-3",style:{background:"linear-gradient(90deg,#22d3ee,#38bdf8)",color:"#000"},onClick:E,children:[e.jsx(B,{icon:D,className:"me-2"})," Chơi Ngay"]})]})}),e.jsx(H,{md:6,lg:4,children:e.jsxs("div",{className:"plugin-card",children:[e.jsx("div",{className:"rgb-glow"}),e.jsx("div",{className:"icon-box",style:{color:"#a78bfa"},children:e.jsx(B,{icon:Q,size:"xl"})}),e.jsx("h5",{className:"fw-bold text-white",children:"Cờ Caro 5 Quân"}),e.jsx("p",{className:"text-white-50 small flex-grow-1",children:"Trò chơi giải trí cổ điển. Đối đầu với máy hoặc luyện tập phản xạ nhanh."}),e.jsxs(T,{className:"w-100 btn-custom mt-3",style:{background:"linear-gradient(90deg,#a78bfa,#f472b6)",color:"#000"},onClick:I,children:[e.jsx(B,{icon:D,className:"me-2"})," Vào Bàn"]})]})}),e.jsx(H,{md:6,lg:4,children:e.jsxs("div",{className:"plugin-card",children:[e.jsx("div",{className:"rgb-glow"}),e.jsx("div",{className:"icon-box",style:{color:"#fb7185"},children:e.jsx(B,{icon:U,size:"xl"})}),e.jsx("h5",{className:"fw-bold text-white",children:"YouTube Background"}),e.jsx("p",{className:"text-white-50 small mb-3",children:"Dán link YouTube để nghe nhạc không quảng cáo khi làm việc."}),e.jsx(ee,{placeholder:"Dán link tại đây...",value:o,onChange:r=>h(r.target.value),className:"input-dark mb-3"}),e.jsxs(T,{className:"w-100 btn-custom",style:{background:"linear-gradient(90deg,#fb7185,#facc15)",color:"#000"},onClick:z,children:[e.jsx(B,{icon:U,className:"me-2"})," Phát Nhạc"]})]})}),e.jsx(H,{md:12,lg:12,children:e.jsxs("div",{className:"plugin-card",children:[e.jsx("div",{className:"rgb-glow"}),e.jsxs("div",{className:"d-flex align-items-center mb-4",children:[e.jsx("div",{className:"icon-box mb-0 me-3",style:{color:"#34d399"},children:e.jsx(B,{icon:Y,size:"xl"})}),e.jsx("h5",{className:"fw-bold text-white mb-0",children:"Cấu Hình Hệ Thống"})]}),e.jsx("div",{className:"setting-label",children:"Hiệu ứng tương tác"}),e.jsxs("div",{className:"d-flex gap-3",children:[e.jsxs(T,{className:`btn-custom ${l?"bg-success":"bg-dark"}`,style:{flex:1,color:"#fff"},onClick:S,children:["🐱 Neko: ",l?"Bật":"Tắt"]}),e.jsxs(T,{className:`btn-custom ${M?"bg-success":"bg-dark"}`,style:{flex:1,color:"#fff"},onClick:L,children:["✨ Splash: ",M?"Bật":"Tắt"]})]})]})})]}),i&&e.jsxs("div",{style:{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999},children:[e.jsx("div",{style:{background:"rgba(0,0,0,0.8)",position:"absolute",inset:0},onClick:()=>a(!1)}),e.jsx("div",{style:{position:"relative",zIndex:1},children:e.jsx(te,{visible:i,setVisible:a},t)})]}),c&&e.jsxs("div",{style:{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999},children:[e.jsx("div",{style:{background:"rgba(0,0,0,0.8)",position:"absolute",inset:0},onClick:()=>u(!1)}),e.jsx("div",{style:{position:"relative",zIndex:1},children:e.jsx(ie,{visible:c,setVisible:u},g)})]})]})}export{de as default};
