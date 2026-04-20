import{r as C,j as s,C as A,a as N,c as K,b as U}from"./index-C1KJssbB.js";import{c as Z}from"./cil-x-0440B5Ce.js";import{c as Y,a as X,b as F}from"./cil-reload-DWHLt0u9.js";import{C as Q,a as W}from"./CRow-CTGywBGK.js";import{C as J}from"./CFormInput-BLnGKak4.js";import"./CFormControlWrapper-Bh3eI6Vk.js";function ee({visible:i}){const a=C.useRef(null),e=C.useRef(!1);return C.useEffect(()=>{if(!i||e.current)return;e.current=!0;const t=n=>new Promise(o=>{const h=document.createElement("script");h.src=n,h.onload=o,document.head.appendChild(h)}),r=n=>{if(document.querySelector(`link[href="${n}"]`))return;const o=document.createElement("link");o.rel="stylesheet",o.href=n,document.head.appendChild(o)};async function u(){r("https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css"),r("https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"),window.jQuery||await t("https://code.jquery.com/jquery-3.6.0.min.js"),window.ChessBoard||await t("https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js"),window.Chess||await t("https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js"),f()}function f(){const n={move:"https://lichess.org/assets/sound/standard/Move.ogg",capture:"https://lichess.org/assets/sound/standard/Capture.ogg",check:"https://lichess.org/assets/sound/standard/Check.ogg",end:"https://lichess.org/assets/sound/standard/GenericNotify.ogg"},o=(m,b=0)=>{m&&setTimeout(()=>{try{let y=n.move;l.in_check()?y=n.check:m.captured&&(y=n.capture),new Audio(y).play().catch(()=>{})}catch{}},b)},h=()=>{try{new Audio(n.end).play().catch(()=>{})}catch{}};a.current.innerHTML=`
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
      `;const l=new window.Chess;let x,I=!1,k=1400,M=null;const B=document.getElementById("status"),z=document.getElementById("board"),T=document.getElementById("promotion-layer"),O=document.getElementById("result-modal"),c={win:["https://media.giphy.com/media/3o7TKVUn7iM8FMEU24/giphy.gif","https://media.giphy.com/media/1GT5PZLjMwYBW/giphy.gif"],lose:["https://media.giphy.com/media/6gDSyjaOPwZ4A/giphy.gif","https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif"],draw:["https://media.giphy.com/media/26u4b45b8KlgAB7iM/giphy.gif","https://media.giphy.com/media/xT9IgusfDcqpPFzjdS/giphy.gif"]},d={win:["Ghê đấy! Check VAR ngay!","Thắng rồi! Bộ não của bạn nhanh hơn Stockfish rồi."],lose:{low:["Mức 800 mà cũng thua?","Về chơi cờ cá ngựa đi bạn ơi!"],mid:["Sai một li, đi luôn cả ván cờ.","Nước cờ của bạn... khó hiểu thật."],high:["Thua Grandmaster không có gì xấu hổ.","Bạn đã trụ vững? Đẳng cấp!"]}};function v(){T.style.display="none",M=null,x.position(l.fen(),!0)}document.getElementById("cancel-promotion").onclick=v;function g(m){h();const b=document.getElementById("result-title"),y=document.getElementById("result-text"),L=document.getElementById("result-gif");let P,S;if(m==="human")b.innerText="CHÚC MỪNG! 🎉",b.style.color="#28a745",S=d.win[Math.floor(Math.random()*d.win.length)],P=c.win[Math.floor(Math.random()*c.win.length)];else if(m==="ai"){b.innerText="BẠN ĐÃ THUA! 💀",b.style.color="#dc3545";let H=k<=1200?d.lose.low:k>=2e3?d.lose.high:d.lose.mid;S=H[Math.floor(Math.random()*H.length)],P=c.lose[Math.floor(Math.random()*c.lose.length)]}else b.innerText="HÒA CỜ! 🤝",b.style.color="#007bff",S="Kẻ tám lạng, người nửa cân!",P=c.draw[Math.floor(Math.random()*c.draw.length)];y.innerText=S,L.src=P,O.style.display="flex"}document.getElementById("restart-btn").onclick=()=>{O.style.display="none",document.getElementById("reset").click()};const w={wikipedia:"https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",alpha:"https://chessboardjs.com/img/chesspieces/alpha/{piece}.png",cburnett:"https://lichess1.org/assets/piece/cburnett/{piece}.svg",cardinal:"https://lichess1.org/assets/piece/cardinal/{piece}.svg",merida:"https://lichess1.org/assets/piece/merida/{piece}.svg"},j={800:{skill:1,depth:6,time:150},1e3:{skill:3,depth:8,time:250},1200:{skill:5,depth:10,time:350},1400:{skill:8,depth:12,time:500},1600:{skill:12,depth:14,time:700},1800:{skill:15,depth:16,time:900},2e3:{skill:18,depth:18,time:1200},2200:{skill:20,depth:20,time:1600},2400:{skill:20,depth:22,time:2e3}},p=new Worker("/stockfish.js");p.postMessage("uci"),p.postMessage("isready");function R(m){const b=j[m];p.postMessage(`setoption name Skill Level value ${b.skill}`),p.postMessage("setoption name UCI_LimitStrength value true"),p.postMessage(`setoption name UCI_Elo value ${m}`)}R(1400),p.onmessage=m=>{if(!m.data.startsWith("bestmove"))return;I=!1;const b=m.data.split(" ")[1];if(!b||b==="(none)")return;const y=l.move(b,{sloppy:!0});o(y,250),x.position(l.fen(),!0),_(),l.game_over()&&(l.in_checkmate()?g("ai"):g("draw"))};function D(m){T.style.display="none";const b=l.move({from:M.from,to:M.to,promotion:m});if(o(b),x.position(l.fen(),!0),_(),l.game_over()){l.in_checkmate()?g("human"):g("draw");return}I=!0,B.innerText="🤖 Stockfish đang suy nghĩ...",p.postMessage("position fen "+l.fen()),p.postMessage(`go depth ${j[k].depth} movetime ${j[k].time}`),M=null}document.querySelectorAll(".promo-choice").forEach(m=>{m.onclick=()=>D(m.getAttribute("data-promo"))});function $(m){x=window.ChessBoard("board",{draggable:!0,position:l.fen(),pieceTheme:w[m],onDragStart:(b,y)=>{if(I||l.game_over()||y.startsWith("b"))return!1},onDrop:(b,y)=>{const L=l.get(b);if(L&&L.type==="p"&&(y.endsWith("8")||y.endsWith("1"))){if(!new window.Chess(l.fen()).move({from:b,to:y,promotion:"q"}))return"snapback";M={from:b,to:y},T.style.display="block";return}const S=l.move({from:b,to:y,promotion:"q"});if(!S)return"snapback";if(o(S),_(),l.game_over()){l.in_checkmate()?g("human"):g("draw");return}I=!0,B.innerText="🤖 Stockfish đang suy nghĩ...",p.postMessage("position fen "+l.fen()),p.postMessage(`go depth ${j[k].depth} movetime ${j[k].time}`)},onSnapEnd:()=>x.position(l.fen(),!1)})}function _(){l.in_checkmate()?B.innerText="⚠️ Chiếu hết!":l.in_draw()?B.innerText="🤝 Hòa cờ":l.in_check()?B.innerText="⚡ Bị chiếu":B.innerText="👉 Đến lượt bạn"}$("merida"),G("green");const q=()=>{x&&x.resize()};window.addEventListener("resize",q);function G(m){z.classList.remove("board-classic","board-blue","board-green","board-dark"),z.classList.add("board-"+m)}document.getElementById("boardTheme").onchange=m=>G(m.target.value),document.getElementById("style").onchange=m=>{x.destroy(),$(m.target.value)},document.getElementById("aiElo").onchange=m=>{k=Number(m.target.value),R(k)},document.getElementById("reset").onclick=()=>{l.reset(),I=!1,x.destroy(),$(document.getElementById("style").value),G(document.getElementById("boardTheme").value),R(k),_(),T.style.display="none"},document.getElementById("closeChess").onclick=()=>{window.removeEventListener("resize",q),a.current.innerHTML="",e.current=!1}}u()},[i]),s.jsx("div",{ref:a})}const E=15,te={easy:200,medium:350,hard:600},V={HUMAN:"X",BOT:"O",dirs:[[1,0],[0,1],[1,1],[1,-1]],memory:{},inBoard(i,a){return i>=0&&a>=0&&i<E&&a<E},countContinuous(i,a,e,t,r,u){let f=0,n=0,o=1;for(;this.inBoard(a+t*o,e+r*o)&&i[a+t*o][e+r*o]===u;)f++,o++;return(!this.inBoard(a+t*o,e+r*o)||i[a+t*o][e+r*o]&&i[a+t*o][e+r*o]!==u)&&n++,{cnt:f,blocks:n}},evaluatePoint(i,a,e,t){let r=0;for(let[u,f]of this.dirs){const n=this.countContinuous(i,a,e,u,f,t),o=this.countContinuous(i,a,e,-u,-f,t),h=n.cnt+o.cnt+1,l=n.blocks+o.blocks;if(h>=5)return 1e7;l===0?h===4?r+=5e5:h===3?r+=5e3:h===2&&(r+=500):l===1&&(h===4?r+=5e3:h===3?r+=500:h===2&&(r+=100))}return r},getNeighbors(i){const a=[];for(let e=0;e<E;e++)for(let t=0;t<E;t++)!i[e][t]&&this.isNear(i,e,t,1)&&a.push({r:e,c:t});return a},isNear(i,a,e,t){for(let r=-t;r<=t;r++)for(let u=-t;u<=t;u++)if(this.inBoard(a+r,e+u)&&i[a+r][e+u])return!0;return!1},rememberHumanMove(i,a){const e=`${i},${a}`;this.memory[e]=(this.memory[e]||0)+1},minimax(i,a,e,t,r){const u=this.getNeighbors(i);if(a===0||u.length===0)return this.evaluateBoard(i);if(r){let f=-1/0;for(const n of u){i[n.r][n.c]=this.BOT;const o=this.minimax(i,a-1,e,t,!1);if(i[n.r][n.c]=null,f=Math.max(f,o),e=Math.max(e,o),t<=e)break}return f}else{let f=1/0;for(const n of u){i[n.r][n.c]=this.HUMAN;const o=this.minimax(i,a-1,e,t,!0);if(i[n.r][n.c]=null,f=Math.min(f,o),t=Math.min(t,o),t<=e)break}return f}},evaluateBoard(i){let a=0;for(let e=0;e<E;e++)for(let t=0;t<E;t++)i[e][t]===this.BOT&&(a+=this.evaluatePoint(i,e,t,this.BOT)),i[e][t]===this.HUMAN&&(a-=this.evaluatePoint(i,e,t,this.HUMAN)*1.2);return a},bestMove(i,a){let e=!1;for(let n=0;n<E;n++)for(let o=0;o<E;o++)if(i[n][o]){e=!0;break}if(!e)return{r:Math.floor(E/2),c:Math.floor(E/2)};let t=-1/0,r=null;const u=this.getNeighbors(i),f=a==="hard"?2:a==="medium"?1:0;for(const n of u){i[n.r][n.c]=this.BOT;const o=this.minimax(i,f,-1/0,1/0,!1);i[n.r][n.c]=null;const h=o+(this.memory[`${n.r},${n.c}`]||0)*10;h>t&&(t=h,r=n)}return r||u[0]}};function se({visible:i,setVisible:a}){const e=Array(E).fill(null).map(()=>Array(E).fill(null)),[t,r]=C.useState(e),[u,f]=C.useState(!0),[n,o]=C.useState(null),[h,l]=C.useState(null),[x,I]=C.useState("hard"),[k,M]=C.useState([]);if(!i)return null;const B=(c,d,v)=>{for(let[g,w]of V.dirs){let j=[{r:d,c:v}];for(let p=1;p<5&&c[d+g*p]?.[v+w*p]===c[d][v];p++)j.push({r:d+g*p,c:v+w*p});for(let p=1;p<5&&c[d-g*p]?.[v-w*p]===c[d][v];p++)j.push({r:d-g*p,c:v-w*p});if(j.length>=5)return j}return null},z=()=>{r(e),f(!0),l(null),o(null),M([])},T=(c,d)=>{if(!u||t[c][d]||h)return;const v=t.map(w=>[...w]);v[c][d]="X",r(v),o({r:c,c:d}),V.rememberHumanMove(c,d);const g=B(v,c,d);if(g){l("X"),M(g);return}f(!1),setTimeout(()=>O(v),te[x])},O=c=>{if(h)return;const{r:d,c:v}=V.bestMove(c,x),g=c.map(j=>[...j]);g[d][v]="O",r(g),o({r:d,c:v});const w=B(g,d,v);w?(l("O"),M(w)):f(!0)};return s.jsx("div",{style:{position:"fixed",inset:0,background:"rgba(15,23,42,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:99999},children:s.jsxs("div",{style:{width:560,background:"#0f172a",borderRadius:20,padding:16},children:[s.jsxs("div",{className:"d-flex justify-content-between mb-2",children:[s.jsx("b",{style:{color:"#e5e7eb"},children:"🤖 Caro AI – Zebra Rebuild"}),s.jsx(A,{size:"sm",onClick:()=>a(!1),style:{background:"#ef4444",border:"none",color:"#fff",width:32,height:32,padding:0,borderRadius:8},children:s.jsx(N,{icon:Z})})]}),["easy","medium","hard"].map(c=>s.jsx(A,{size:"sm",className:"me-2",color:x===c?"info":"secondary",onClick:()=>{c!==x&&(I(c),z())},children:c.toUpperCase()},c)),s.jsx("div",{style:{margin:"8px 0",color:h?"#22c55e":"#93c5fd"},children:h?`🎉 ${h} thắng!`:`Lượt: ${u?"X (Bạn)":"O (AI)"}`}),s.jsx("div",{style:{display:"grid",gridTemplateColumns:`repeat(${E},1fr)`,gap:2,background:"#334155",padding:6,borderRadius:14},children:t.map((c,d)=>c.map((v,g)=>{const w=k.some(j=>j.r===d&&j.c===g);return s.jsx("div",{onClick:()=>T(d,g),style:{width:30,height:30,background:w?"#22c55e":n?.r===d&&n?.c===g?"#fde68a":"#e5e7eb",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",cursor:"pointer",color:w?"#fff":v==="X"?"#ef4444":"#2563eb",borderRadius:4,transition:"all 0.2s",boxShadow:w?"0 0 10px #22c55e":"none"},children:v},`${d}-${g}`)}))}),s.jsxs(A,{className:"w-100 mt-3",onClick:z,style:{background:"linear-gradient(135deg, #22c55e, #16a34a)",border:"none",color:"#fff",fontWeight:"bold",borderRadius:12,padding:"10px 0"},children:[s.jsx(N,{icon:Y,className:"me-2"}),"Chơi lại"]})]})})}function ce(){const[i,a]=C.useState(!1),[e,t]=C.useState(0),[r,u]=C.useState(!1),[f,n]=C.useState(0),[o,h]=C.useState(""),l=()=>{t(Date.now()),a(!0)},x=()=>{n(Date.now()),u(!0)},I=()=>{const k=/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,M=o.match(k);M&&M[1]?window.dispatchEvent(new CustomEvent("play-youtube-video",{detail:{videoId:M[1]}})):alert("Link Youtube không hợp lệ")};return s.jsxs(s.Fragment,{children:[s.jsx("style",{children:`
        .rgb-bg {
          border-radius: 22px;
          padding: 26px;
          background: linear-gradient(
            120deg,
            rgba(99,102,241,0.55),
            rgba(56,189,248,0.55),
            rgba(52,211,153,0.55),
            rgba(168,85,247,0.55)
          );
          background-size: 300% 300%;
          animation: rgbMove 14s ease infinite;
        }

        @keyframes rgbMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}),s.jsxs(Q,{className:"g-4",children:[s.jsx(W,{md:6,children:s.jsxs("div",{className:"rgb-bg h-100 d-flex flex-column",children:[s.jsxs("h5",{className:"fw-bold mb-2",children:[s.jsx(N,{icon:K,className:"me-2"}),"Cờ vua"]}),s.jsx("p",{className:"text-muted small",children:"Đấu Stockfish trong giao diện gọn gàng."}),s.jsxs(A,{className:"w-100 fw-bold mt-auto",style:{background:"linear-gradient(90deg,#22d3ee,#a7f3d0)",border:"none",color:"#000"},onClick:l,children:[s.jsx(N,{icon:X,className:"me-2"}),"Mở bàn cờ"]})]})}),s.jsx(W,{md:6,children:s.jsxs("div",{className:"rgb-bg h-100 d-flex flex-column",children:[s.jsxs("h5",{className:"fw-bold mb-2",children:[s.jsx(N,{icon:F,className:"me-2"}),"Cờ caro"]}),s.jsx("p",{className:"text-muted small",children:"Chơi caro 5 quân – giải trí nhanh."}),s.jsxs(A,{className:"w-100 fw-bold mt-auto",style:{background:"linear-gradient(90deg,#a78bfa,#f472b6)",border:"none",color:"#000"},onClick:x,children:[s.jsx(N,{icon:X,className:"me-2"}),"Chơi ngay"]})]})}),s.jsx(W,{md:6,children:s.jsxs("div",{className:"rgb-bg h-100 d-flex flex-column",children:[s.jsxs("h5",{className:"fw-bold mb-2",children:[s.jsx(N,{icon:U,className:"me-2"}),"Phát nhạc & Video"]}),s.jsx("p",{className:"text-muted small",children:"Dán link Youtube để phát (chạy nền)."}),s.jsx(J,{placeholder:"https://www.youtube.com/watch?v=...",value:o,onChange:k=>h(k.target.value),className:"mb-3"}),s.jsxs(A,{className:"w-100 fw-bold mt-auto",style:{background:"linear-gradient(90deg,#fb7185,#facc15)",border:"none",color:"#000"},onClick:I,children:[s.jsx(N,{icon:U,className:"me-2"}),"Phát video"]})]})})]}),i&&s.jsx("div",{style:{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,pointerEvents:"none"},children:s.jsx("div",{style:{pointerEvents:"auto"},children:s.jsx(ee,{visible:i,setVisible:a},e)})}),r&&s.jsx("div",{style:{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,pointerEvents:"none"},children:s.jsx("div",{style:{pointerEvents:"auto"},children:s.jsx(se,{visible:r,setVisible:u},f)})})]})}export{ce as default};
