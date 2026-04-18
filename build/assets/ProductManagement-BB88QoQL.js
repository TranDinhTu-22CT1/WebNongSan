import{r as a,j as e,A as P}from"./index-C1KJssbB.js";import{S as _}from"./search-3J6mYX74.js";import{I as v}from"./image-XxvqmY5z.js";import{S as I}from"./store-CuVpJ6j0.js";import{P as R}from"./package-CgsAp4Qp.js";import{c as w}from"./createLucideIcon-CHmH_pTm.js";import{E as L}from"./eye-B0Lp8rGO.js";import{C as H}from"./circle-check-big-r0QEh48E.js";import{S as W}from"./shield-alert-BvHTb5dT.js";import{T as B}from"./trash-2-kWit_p0a.js";import{C as O}from"./circle-x-xTUBvf4C.js";import{O as k}from"./octagon-alert-CBYP62KV.js";const E=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],M=w("map-pin",E);const D=[["path",{d:"m15 11-1 9",key:"5wnq3a"}],["path",{d:"m19 11-4-7",key:"cnml18"}],["path",{d:"M2 11h20",key:"3eubbj"}],["path",{d:"m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4",key:"yiazzp"}],["path",{d:"M4.5 15.5h15",key:"13mye1"}],["path",{d:"m5 11 4-7",key:"116ra9"}],["path",{d:"m9 11 1 9",key:"1ojof7"}]],$=w("shopping-basket",D),p=`${P}/handle_products.php`,u=()=>{const i=localStorage.getItem("token");return{"Content-Type":"application/json",...i?{Authorization:`Bearer ${i}`,"X-Access-Token":i}:{}}},te=()=>{const[i,N]=a.useState([]),[S,m]=a.useState(!0),[d,h]=a.useState("pending"),[l,C]=a.useState(""),[r,y]=a.useState(null),[f,o]=a.useState(null),[x,g]=a.useState(""),c=async()=>{m(!0);try{const n=await(await fetch(`${p}?action=list`)).json();n.status==="success"?N(n.data):console.error("Lỗi từ server:",n.message)}catch(t){console.error("Lỗi kết nối API:",t)}finally{m(!1)}};a.useEffect(()=>{c()},[]);const j=async t=>{if(window.confirm("Xác nhận phê duyệt sản phẩm này?"))try{const s=await(await fetch(p,{method:"POST",headers:u(),body:JSON.stringify({action:"approve",id:t})})).json();s.status==="success"?(alert("Duyệt thành công!"),c(),o(null)):alert("Lỗi: "+s.message)}catch{alert("Lỗi kết nối API")}},z=async t=>{if(!x.trim()){alert("Vui lòng nhập lý do đình chỉ!");return}try{const s=await(await fetch(p,{method:"POST",headers:u(),body:JSON.stringify({action:"ban",id:t,ban_reason:x})})).json();s.status==="success"?(alert("Đã đình chỉ sản phẩm!"),c(),o(null),g("")):alert("Lỗi: "+s.message)}catch{alert("Lỗi kết nối API")}},A=async t=>{if(window.confirm("Cảnh báo: Hành động này sẽ xóa vĩnh viễn sản phẩm khỏi hệ thống. Xác nhận?"))try{const s=await(await fetch(p,{method:"POST",headers:u(),body:JSON.stringify({action:"delete",id:t})})).json();s.status==="success"?(alert("Đã xóa sản phẩm!"),c()):alert("Lỗi: "+s.message)}catch{alert("Lỗi kết nối API")}},b=a.useMemo(()=>i.filter(t=>{const n=t.name.toLowerCase().includes(l.toLowerCase())||t.store.toLowerCase().includes(l.toLowerCase());return d==="banned"?t.is_banned===1&&n:t.approval_status===d&&t.is_banned===0&&n}),[i,d,l]),T=t=>new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(t);return S?e.jsx("div",{style:{padding:"50px",textAlign:"center",fontFamily:"Inter",color:"#1b2559",fontWeight:600},children:"Đang tải dữ liệu sản phẩm..."}):e.jsxs("div",{className:"admin-container-bg",children:[e.jsx("style",{children:`
        .admin-container-bg { padding: 50px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        /* CONTAINER DUY NHẤT CHỨA TẤT CẢ */
        .master-form-container {
          background: #ffffff;
          border-radius: 40px; /* Bo góc cực đại cho hiện đại */
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          border: 1px solid #ffffff;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* PHẦN HEADER BÊN TRONG CONTAINER */
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }

        .header-text h1 { font-size: 32px; font-weight: 800; margin: 0; color: #1b2559; letter-spacing: -1px; }
        .header-text p { color: #a3aed0; margin: 5px 0 0 0; font-weight: 500; font-size: 15px; }

        /* THANH ĐIỀU KHIỂN (SEARCH & TABS) */
        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          gap: 20px;
        }

        .tab-group {
          display: flex;
          background: #f4f7fe;
          padding: 8px;
          border-radius: 20px;
          gap: 5px;
        }

        .tab-btn {
          padding: 12px 25px;
          border-radius: 15px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          color: #a3aed0;
          background: transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tab-btn.active {
          background: #ffffff;
          color: #4318ff;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        }

        .search-wrapper {
          background: #f4f7fe;
          border-radius: 20px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          width: 380px;
          border: 1px solid transparent;
          transition: 0.3s;
        }
        .search-wrapper:focus-within { border-color: #4318ff; background: #fff; }
        .search-wrapper input { background: transparent; border: none; outline: none; margin-left: 12px; width: 100%; font-weight: 600; color: #1b2559; }

        /* BẢNG DỮ LIỆU */
        .table-scroll { overflow-x: auto; }
        table { width: 100%; border-collapse: separate; border-spacing: 0 15px; }
        th { padding: 10px 20px; color: #a3aed0; font-size: 12px; text-transform: uppercase; text-align: left; font-weight: 800; }
        td { background: #ffffff; padding: 20px; border-top: 1px solid #f1f4f9; border-bottom: 1px solid #f1f4f9; vertical-align: middle; }
        td:first-child { border-left: 1px solid #f1f4f9; border-top-left-radius: 20px; border-bottom-left-radius: 20px; }
        td:last-child { border-right: 1px solid #f1f4f9; border-top-right-radius: 20px; border-bottom-right-radius: 20px; }
        
        tr:hover td { background: #fbfcfe; border-color: #e0e5f2; }

        .badge { padding: 8px 16px; border-radius: 12px; font-size: 11px; font-weight: 800; display: inline-block; }
        .bg-pending { background: #fff7ed; color: #c2410c; }
        .bg-approved { background: #f0fdf4; color: #15803d; }
        .bg-rejected { background: #fef2f2; color: #b91c1c; }

        .btn-action { width: 42px; height: 42px; border-radius: 14px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; background: #f4f7fe; color: #707eae; }
        .btn-action:hover { transform: translateY(-3px); background: #4318ff; color: #fff; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(11, 16, 45, 0.4); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-body { background: white; border-radius: 35px; padding: 40px; width: 90%; max-width: 800px; box-shadow: 0 40px 100px rgba(0,0,0,0.2); }
      `}),e.jsxs("div",{className:"master-form-container",children:[e.jsxs("div",{className:"form-header",children:[e.jsxs("div",{className:"header-text",children:[e.jsx("h1",{children:"Quản lý Kiểm duyệt"}),e.jsx("p",{children:"Phê duyệt sản phẩm nông sản từ các nhà vườn"})]}),e.jsxs("div",{className:"search-wrapper",children:[e.jsx(_,{size:20,color:"#a3aed0"}),e.jsx("input",{placeholder:"Tìm tên sản phẩm hoặc nhà vườn...",value:l,onChange:t=>C(t.target.value)})]})]}),e.jsxs("div",{className:"controls-row",children:[e.jsxs("div",{className:"tab-group",children:[e.jsxs("button",{className:`tab-btn ${d==="pending"?"active":""}`,onClick:()=>h("pending"),children:["Chờ phê duyệt (",i.filter(t=>t.approval_status==="pending"&&!t.is_banned).length,")"]}),e.jsxs("button",{className:`tab-btn ${d==="approved"?"active":""}`,onClick:()=>h("approved"),children:["Đang kinh doanh (",i.filter(t=>t.approval_status==="approved"&&!t.is_banned).length,")"]}),e.jsxs("button",{className:`tab-btn ${d==="banned"?"active":""}`,onClick:()=>h("banned"),children:["Vi phạm / Bị cấm (",i.filter(t=>t.is_banned===1).length,")"]})]}),e.jsxs("div",{style:{color:"#a3aed0",fontSize:"14px",fontWeight:600},children:["Hiển thị: ",e.jsx("span",{style:{color:"#4318ff"},children:b.length})," sản phẩm"]})]}),e.jsx("div",{className:"table-scroll",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Thông tin sản phẩm"}),e.jsx("th",{children:"Giá niêm yết"}),e.jsx("th",{children:"Khu vực trồng"}),e.jsx("th",{children:"Phê duyệt"}),e.jsx("th",{style:{textAlign:"right"},children:"Hành động"})]})}),e.jsx("tbody",{children:b.length>0?b.map(t=>{let n=null;try{const s=JSON.parse(t.images);s&&s.length>0&&(n=s[0])}catch{}return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"15px"},children:[e.jsx("div",{style:{width:55,height:55,borderRadius:"16px",background:"#f4f7fe",overflow:"hidden",border:"1px solid #f1f4f9"},children:n?e.jsx("img",{src:n,style:{width:"100%",height:"100%",objectFit:"cover"},alt:"p"}):e.jsx(v,{size:22,color:"#a3aed0",style:{margin:"16px"}})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:800,color:"#1b2559",fontSize:"15px"},children:t.name}),e.jsxs("div",{style:{fontSize:"13px",color:"#a3aed0",fontWeight:600},children:[e.jsx(I,{size:12,style:{verticalAlign:"middle"}})," ",t.store]})]})]})}),e.jsxs("td",{children:[e.jsx("div",{style:{fontWeight:800,color:"#4318ff",fontSize:"15px"},children:T(t.price)}),e.jsxs("div",{style:{fontSize:"12px",color:"#707eae",fontWeight:600},children:[e.jsx(R,{size:12,style:{verticalAlign:"middle"}})," ",t.stock," ",t.unit]})]}),e.jsxs("td",{children:[e.jsxs("div",{style:{fontWeight:700,color:"#1b2559",fontSize:"14px"},children:[e.jsx(M,{size:13,style:{verticalAlign:"middle",color:"#4318ff"}})," ",t.origin]}),e.jsx("div",{style:{fontSize:"12px",color:"#a3aed0",fontWeight:600},children:t.category})]}),e.jsx("td",{children:e.jsx("span",{className:`badge bg-${t.approval_status}`,children:t.is_banned?"BỊ ĐÌNH CHỈ":t.approval_status.toUpperCase()})}),e.jsx("td",{children:e.jsxs("div",{style:{display:"flex",gap:"10px",justifyContent:"flex-end"},children:[e.jsx("button",{onClick:()=>{y(t),o("view")},className:"btn-action",title:"Xem chi tiết",children:e.jsx(L,{size:18})}),d==="pending"&&e.jsx("button",{onClick:()=>j(t.id),className:"btn-action",style:{color:"#10b981",background:"#f0fdf4"},title:"Duyệt",children:e.jsx(H,{size:18})}),!t.is_banned&&e.jsx("button",{onClick:()=>{y(t),g(""),o("ban")},className:"btn-action",style:{color:"#e11d48",background:"#fef2f2"},title:"Cấm",children:e.jsx(W,{size:18})}),e.jsx("button",{onClick:()=>A(t.id),className:"btn-action",title:"Xóa",children:e.jsx(B,{size:18})})]})})]},t.id)}):e.jsx("tr",{children:e.jsxs("td",{colSpan:"5",style:{textAlign:"center",padding:"100px 0",color:"#a3aed0"},children:[e.jsx($,{size:48,style:{margin:"0 auto 15px",opacity:.3}}),e.jsx("p",{style:{fontWeight:600},children:"Không có sản phẩm nào trong danh sách này"})]})})})]})})]}),f&&r&&e.jsx("div",{className:"modal-overlay",onClick:()=>o(null),children:e.jsxs("div",{className:"modal-body",onClick:t=>t.stopPropagation(),children:[f==="view"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"},children:[e.jsxs("div",{style:{display:"flex",gap:"30px"},children:[(()=>{let t="";try{t=JSON.parse(r.images)[0]}catch{}return t?e.jsx("img",{src:t,style:{width:150,height:150,borderRadius:"30px",objectFit:"cover",border:"6px solid #f4f7fe"},alt:"p"}):e.jsx("div",{style:{width:150,height:150,borderRadius:"30px",background:"#f4f7fe",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx(v,{size:40,color:"#a3aed0"})})})(),e.jsxs("div",{children:[e.jsx("h2",{style:{margin:0,fontSize:28,fontWeight:800,color:"#1b2559"},children:r.name}),e.jsxs("div",{style:{marginTop:10,display:"flex",gap:"10px"},children:[e.jsx("span",{className:`badge bg-${r.approval_status}`,children:r.approval_status}),e.jsx("span",{style:{background:"#f4f7fe",padding:"6px 15px",borderRadius:"12px",fontSize:13,fontWeight:700,color:"#707eae"},children:r.status})]})]})]}),e.jsx("button",{onClick:()=>o(null),style:{border:"none",background:"#f4f7fe",width:45,height:45,borderRadius:"15px",cursor:"pointer",color:"#a3aed0"},children:e.jsx(O,{size:22})})]}),r.is_banned===1&&r.ban_reason&&e.jsxs("div",{style:{marginTop:"20px",padding:"15px",background:"#fff1f2",borderRadius:"15px",color:"#be123c",fontSize:"14px",fontWeight:600},children:[e.jsx(k,{size:16,style:{verticalAlign:"middle",marginRight:"5px"}})," Lý do đình chỉ: ",r.ban_reason]}),e.jsxs("div",{style:{marginTop:"30px",padding:"25px",background:"#f8fafc",borderRadius:"25px",color:"#475569",fontSize:"15px",lineHeight:"1.6"},children:[e.jsx("strong",{children:"Mô tả sản phẩm:"})," ",e.jsx("br",{}),r.description||"Không có mô tả chi tiết."]}),e.jsxs("div",{style:{display:"flex",gap:"15px",marginTop:"35px"},children:[r.approval_status==="pending"&&!r.is_banned&&e.jsx("button",{onClick:()=>j(r.id),style:{flex:1,padding:"18px",borderRadius:"20px",border:"none",background:"#4318ff",color:"white",fontWeight:800,cursor:"pointer"},children:"PHÊ DUYỆT SẢN PHẨM"}),e.jsx("button",{onClick:()=>o(null),style:{flex:1,padding:"18px",borderRadius:"20px",border:"none",background:"#f4f7fe",color:"#707eae",fontWeight:800,cursor:"pointer"},children:"ĐÓNG LẠI"})]})]}),f==="ban"&&e.jsxs("div",{style:{textAlign:"center"},children:[e.jsx("div",{style:{background:"#fff1f2",width:90,height:90,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"},children:e.jsx(k,{size:40,color:"#e11d48"})}),e.jsx("h2",{style:{color:"#1b2559",fontSize:"26px"},children:"Đình chỉ sản phẩm này?"}),e.jsx("p",{style:{color:"#a3aed0",marginBottom:"30px",fontWeight:500},children:"Sản phẩm sẽ bị gỡ bỏ khỏi cửa hàng ngay lập tức."}),e.jsx("textarea",{value:x,onChange:t=>g(t.target.value),style:{width:"100%",padding:"20px",borderRadius:"20px",border:"1px solid #e0e5f2",outline:"none",height:"120px",background:"#f8fafc",fontSize:"15px"},placeholder:"Nhập lý do đình chỉ (bắt buộc)..."}),e.jsxs("div",{style:{display:"flex",gap:"15px",marginTop:"30px"},children:[e.jsx("button",{onClick:()=>o(null),style:{flex:1,padding:"18px",borderRadius:"18px",border:"none",background:"#f4f7fe",fontWeight:700,cursor:"pointer",color:"#1b2559"},children:"QUAY LẠI"}),e.jsx("button",{onClick:()=>z(r.id),style:{flex:1,padding:"18px",borderRadius:"18px",border:"none",background:"#e11d48",color:"white",fontWeight:700,cursor:"pointer"},children:"XÁC NHẬN CẤM BÁN"})]})]})]})})]})};export{te as default};
