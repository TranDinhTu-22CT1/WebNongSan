import{r as n,_ as F,R as s,B as $,D as t,X as W,A as E,j as e,t as O,a as m,C as w,z as R,N as z,F as D}from"./index-C1KJssbB.js";import{C as I,a as V}from"./CRow-CTGywBGK.js";import{C as M}from"./CCard-TuxIymGC.js";import{C as A}from"./CCardBody-BQ3fVMWd.js";import{c as L}from"./cil-wallet-BrU51gCv.js";import{c as G}from"./cil-check-circle-BlU9eaow.js";import{C as P}from"./CCardHeader-BCnQryB8.js";import{C as K,a as U,b as T,c as f,d as Z,e as h}from"./CTable-XePYIz1r.js";import{C as q,a as J}from"./CModalBody-Ci0NjX26.js";import{C as X,a as Y,b as Q}from"./CModalTitle-ALKUeE7b.js";import{C as y}from"./CFormControlWrapper-Bh3eI6Vk.js";import{C as N}from"./CFormInput-BLnGKak4.js";import{c as ee}from"./cil-credit-card-KG5pHjdT.js";const k=n.forwardRef((l,u)=>{var{children:c,className:p}=l,i=F(l,["children","className"]);return s.createElement("div",Object.assign({className:$("card-footer",p)},i,{ref:u}),c)});k.propTypes={children:t.node,className:t.string};k.displayName="CCardFooter";const C=n.forwardRef((l,u)=>{var{className:c,color:p,footer:i,icon:j,padding:x=!0,title:g,value:a}=l,d=F(l,["className","color","footer","icon","padding","title","value"]);return s.createElement(M,Object.assign({className:c},d,{ref:u}),s.createElement(A,{className:`d-flex align-items-center ${x===!1&&"p-0"}`},s.createElement("div",{className:`me-3 text-white bg-${p} ${x?"p-3":"p-4"}`},j),s.createElement("div",null,s.createElement("div",{className:`fs-6 fw-semibold text-${p}`},a),s.createElement("div",{className:"text-body-secondary text-uppercase fw-semibold small"},g))),i&&s.createElement(k,null,i))});C.propTypes={className:t.string,color:W,footer:t.oneOfType([t.string,t.node]),icon:t.oneOfType([t.string,t.node]),padding:t.bool,title:t.oneOfType([t.string,t.node]),value:t.oneOfType([t.string,t.node,t.number])};C.displayName="CWidgetStatsF";var re=["512 512","<path fill='var(--ci-primary-color, currentColor)' d='M247.759,14.358,16,125.946V184H496V125.638ZM464,152H48v-5.946L248.241,49.642,464,146.362Z' class='ci-primary'/><rect width='416' height='32' x='48' y='408' fill='var(--ci-primary-color, currentColor)' class='ci-primary'/><rect width='480' height='32' x='16' y='464' fill='var(--ci-primary-color, currentColor)' class='ci-primary'/><rect width='32' height='160' x='56' y='216' fill='var(--ci-primary-color, currentColor)' class='ci-primary'/><rect width='32' height='160' x='424' y='216' fill='var(--ci-primary-color, currentColor)' class='ci-primary'/><rect width='32' height='160' x='328' y='216' fill='var(--ci-primary-color, currentColor)' class='ci-primary'/><rect width='32' height='160' x='152' y='216' fill='var(--ci-primary-color, currentColor)' class='ci-primary'/><rect width='32' height='160' x='240' y='216' fill='var(--ci-primary-color, currentColor)' class='ci-primary'/>"],ae=["512 512","<path fill='var(--ci-primary-color, currentColor)' d='M256.25,16A240,240,0,0,0,88,84.977V16H56V144H184V112H106.287A208,208,0,0,1,256.25,48C370.8,48,464,141.2,464,255.75S370.8,463.5,256.25,463.5,48.5,370.3,48.5,255.75h-32A239.75,239.75,0,0,0,425.779,425.279,239.75,239.75,0,0,0,256.25,16Z' class='ci-primary'/><polygon fill='var(--ci-primary-color, currentColor)' points='240 111.951 239.465 288 368 288 368 256 271.563 256 272 112.049 240 111.951' class='ci-primary'/>"];const fe=()=>{const[l,u]=n.useState(!0),[c,p]=n.useState({balance:0,total_withdrawn:0}),[i,j]=n.useState([]),[x,g]=n.useState(!1),[a,d]=n.useState({amount:"",bankName:"",accountNumber:"",accountHolder:""}),v=JSON.parse(localStorage.getItem("user")),S=localStorage.getItem("token");n.useEffect(()=>{v?.id&&H()},[]);const H=async()=>{try{u(!0);const o=await(await fetch(`${E}/get_wallet.php?vendor_id=${v.id}`,{headers:{Authorization:`Bearer ${S}`}})).json();o.status==="success"&&(p(o.wallet),j(o.history))}catch(r){console.error("Lỗi đồng bộ ví:",r)}finally{u(!1)}},B=async()=>{const r=parseFloat(a.amount);if(!r||r<=0||r>c.balance)return alert("Số tiền rút không hợp lệ hoặc vượt quá số dư!");if(!a.bankName||!a.accountNumber||!a.accountHolder)return alert("Vui lòng điền đầy đủ thông tin ngân hàng!");try{const o=await fetch(`${E}/request_withdrawal.php`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${S}`},body:JSON.stringify({vendor_id:v.id,amount:r,bank_name:a.bankName,account_number:a.accountNumber,account_holder:a.accountHolder})});if(!o.ok)throw new Error(`Mã lỗi Server: ${o.status}`);const _=await o.json();_.status==="success"?(alert("Gửi yêu cầu rút tiền thành công!"),g(!1),d({amount:"",bankName:"",accountNumber:"",accountHolder:""}),H()):alert("Server thông báo: "+_.message)}catch(o){alert(`Lỗi kết nối máy chủ: ${o.message}`)}},b=r=>new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(r);return l?e.jsx("div",{className:"text-center py-5",children:e.jsx(O,{color:"success"})}):e.jsxs("div",{className:"wallet-container",children:[e.jsx("style",{children:`
  .wallet-container {
    color: #111827;
  }

  .card-green-theme { 
    background-color: #ffffff; 
    color: #111827; 
    border: 1px solid #e5e7eb; 
    border-radius: 12px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.05); 
    --cui-body-color: #111827;
    --cui-secondary-color: #6b7280;
    --cui-emphasis-color: #111827;
  }

  .card-green-theme .text-body,
  .card-green-theme .text-body-emphasis,
  .card-green-theme .text-high-emphasis,
  .card-green-theme .text-dark,
  .card-green-theme .fw-bold,
  .card-green-theme .fw-semibold {
    color: #111827 !important;
  }

  .card-green-theme .text-body-secondary,
  .card-green-theme .text-medium-emphasis,
  .card-green-theme .text-muted,
  .card-green-theme small,
  .card-green-theme .small {
    color: #6b7280 !important;
  }

  .card-green-theme .text-success,
  .card-green-theme .text-info,
  .card-green-theme .text-warning,
  .card-green-theme .text-danger,
  .card-green-theme .text-primary {
    color: initial;
  }

  .card-green-theme .text-success { color: var(--cui-success) !important; }
  .card-green-theme .text-info { color: var(--cui-info) !important; }
  .card-green-theme .text-warning { color: var(--cui-warning) !important; }
  .card-green-theme .text-danger { color: var(--cui-danger) !important; }
  .card-green-theme .text-primary { color: var(--cui-primary) !important; }

  .text-price { 
    color: #111827; 
    font-weight: 600; 
  }

  .form-control-green { 
    background-color: #ffffff; 
    border: 1px solid #d1d5db; 
    color: #111827; 
    border-radius: 8px;
  }

  .form-control-green:focus { 
    background-color: #ffffff; 
    border-color: #9ca3af; 
    color: #111827; 
    box-shadow: 0 0 0 0.2rem rgba(156,163,175,0.2); 
  }

  .table-green { 
    --cui-table-color: #111827; 
    --cui-table-bg: #ffffff;
    --cui-table-border-color: #e5e7eb; 
    --cui-table-hover-bg: #f9fafb;
  }

  .table-green thead th {
    background-color: #f3f4f6;
    color: #374151;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
  }

  .text-uppercase-custom { 
    text-transform: uppercase; 
    font-size: 0.85rem; 
    font-weight: 600; 
    color: #374151; 
  }

  .text-white-50 {
    color: #6b7280 !important;
  }
`}),e.jsxs(I,{className:"mb-4",children:[e.jsx(V,{md:6,children:e.jsx(C,{className:"card-green-theme mb-3",icon:e.jsx(m,{icon:L,height:24}),title:"SỐ DƯ KHẢ DỤNG",value:b(c.balance),color:"success"})}),e.jsx(V,{md:6,children:e.jsx(C,{className:"card-green-theme mb-3",icon:e.jsx(m,{icon:G,height:24}),title:"TỔNG TIỀN ĐÃ RÚT",value:b(c.total_withdrawn),color:"info"})})]}),e.jsxs(M,{className:"card-green-theme",children:[e.jsxs(P,{className:"d-flex justify-content-between align-items-center border-secondary",children:[e.jsxs("h5",{className:"mb-0 fw-bold",children:[e.jsx(m,{icon:ae,className:"me-2"}),"Lịch sử yêu cầu rút tiền"]}),e.jsxs(w,{color:"warning",className:"fw-bold",onClick:()=>g(!0),children:[e.jsx(m,{icon:R,className:"me-1"})," Rút Tiền Ngay"]})]}),e.jsx(A,{children:e.jsxs(K,{hover:!0,responsive:!0,className:"table-green mb-0",children:[e.jsx(U,{children:e.jsxs(T,{children:[e.jsx(f,{children:"Ngày"}),e.jsx(f,{children:"Số Tiền"}),e.jsx(f,{children:"Ngân Hàng"}),e.jsx(f,{children:"Số Tài Khoản"}),e.jsx(f,{children:"Chủ Tài Khoản"}),e.jsx(f,{className:"text-center",children:"Trạng Thái"})]})}),e.jsx(Z,{children:i.length>0?i.map((r,o)=>e.jsxs(T,{children:[e.jsx(h,{children:new Date(r.created_at).toLocaleDateString("vi-VN")}),e.jsx(h,{className:"text-price",children:b(r.amount)}),e.jsx(h,{children:r.bank_name}),e.jsx(h,{className:"fw-bold text-info",children:r.account_number}),e.jsx(h,{className:"text-uppercase-custom",children:r.account_holder}),e.jsx(h,{className:"text-center",children:e.jsx(z,{color:r.status==="approved"?"success":r.status==="pending"?"warning":"danger",shape:"rounded-pill",children:r.status==="approved"?"Thành công":r.status==="pending"?"Chờ duyệt":"Từ chối"})})]},o)):e.jsx(T,{children:e.jsx(h,{colSpan:"6",className:"text-center py-3 text-white-50",children:"Chưa có lịch sử giao dịch"})})})]})})]}),e.jsx(q,{visible:x,onClose:()=>g(!1),alignment:"center",children:e.jsxs("div",{style:{backgroundColor:"#2F5233",color:"#fff"},className:"rounded",children:[e.jsx(X,{className:"border-secondary",children:e.jsx(Y,{children:"Tạo lệnh rút tiền"})}),e.jsxs(J,{children:[e.jsxs("div",{className:"mb-3",children:[e.jsxs(y,{children:["Số tiền rút (Tối đa: ",b(c.balance),")"]}),e.jsx(N,{className:"form-control-green",type:"number",value:a.amount,onChange:r=>d({...a,amount:r.target.value})})]}),e.jsxs("div",{className:"mb-3",children:[e.jsxs(y,{children:[e.jsx(m,{icon:re,size:"sm",className:"me-1"})," Tên ngân hàng"]}),e.jsx(N,{className:"form-control-green",placeholder:"Ví dụ: Vietcombank, MB...",value:a.bankName,onChange:r=>d({...a,bankName:r.target.value})})]}),e.jsxs("div",{className:"mb-3",children:[e.jsxs(y,{children:[e.jsx(m,{icon:ee,size:"sm",className:"me-1"})," Số tài khoản"]}),e.jsx(N,{className:"form-control-green",placeholder:"Nhập số tài khoản",value:a.accountNumber,onChange:r=>d({...a,accountNumber:r.target.value})})]}),e.jsxs("div",{className:"mb-3",children:[e.jsxs(y,{children:[e.jsx(m,{icon:D,size:"sm",className:"me-1"})," Chủ tài khoản (Viết hoa không dấu)"]}),e.jsx(N,{className:"form-control-green",placeholder:"NGUYEN VAN A",value:a.accountHolder,onChange:r=>d({...a,accountHolder:r.target.value.toUpperCase()})})]})]}),e.jsxs(Q,{className:"border-secondary",children:[e.jsx(w,{color:"secondary",onClick:()=>g(!1),children:"Hủy"}),e.jsx(w,{color:"warning",className:"fw-bold",onClick:B,children:"Gửi yêu cầu"})]})]})})]})};export{fe as default};
