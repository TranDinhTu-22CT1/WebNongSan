import{r as a,j as e,t as Q,a as l,I as M,J as Z,K as g,M as j,N as B,C as o,A as v}from"./index-C1KJssbB.js";import{C as q}from"./CCard-TuxIymGC.js";import{C as W}from"./CCardHeader-BCnQryB8.js";import{C as X,a as L}from"./CRow-CTGywBGK.js";import{C as U}from"./CCardBody-BQ3fVMWd.js";import{C as Y,a as ee,b as C,c,d as re,e as n}from"./CTable-XePYIz1r.js";import{c as se}from"./cil-check-circle-BlU9eaow.js";import{c as A}from"./cil-warning-C7g3f07Q.js";import{C as P,a as z}from"./CModalBody-Ci0NjX26.js";import{C as _,a as G,b as V}from"./CModalTitle-ALKUeE7b.js";import{C as D}from"./CFormControlWrapper-Bh3eI6Vk.js";import{C as ae}from"./CFormTextarea-BtQBV6LL.js";import{C as oe}from"./CFormSelect-C6A1rZex.js";var ne=["512 512","<path fill='var(--ci-primary-color, currentColor)' d='M496,496H448.771L379.249,368H40a24.028,24.028,0,0,1-24-24V40A24.028,24.028,0,0,1,40,16H472a24.028,24.028,0,0,1,24,24ZM48,336H398.284L464,456.993V48H48Z' class='ci-primary'/>"];const je=()=>{const[F,I]=a.useState([]),[$,y]=a.useState(!0),[t,x]=a.useState("All"),[E,d]=a.useState(!1),[i,N]=a.useState(null),[m,w]=a.useState(""),[K,h]=a.useState(!1),[p,k]=a.useState(""),f=localStorage.getItem("token"),u=async()=>{y(!0);try{const s=await(await fetch(`${v}/handle_reviews.php`,{headers:{Authorization:`Bearer ${f}`}})).json();s.status==="success"&&I(s.data)}catch(r){console.error("Lỗi tải đánh giá:",r)}finally{y(!1)}};a.useEffect(()=>{u()},[]);const S=r=>{N(r),w(r.reply||""),d(!0)},R=r=>{N(r),k(""),h(!0)},O=async()=>{if(!m.trim())return alert("Vui lòng nhập nội dung phản hồi!");try{(await(await fetch(`${v}/handle_reviews.php`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${f}`},body:JSON.stringify({action:"reply",id:i.id,reply:m})})).json()).status==="success"&&(alert("Đã gửi phản hồi thành công!"),d(!1),u())}catch{alert("Lỗi kết nối server.")}},J=async()=>{if(!p)return alert("Vui lòng chọn lý do báo cáo!");try{(await(await fetch(`${v}/handle_reviews.php`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${f}`},body:JSON.stringify({action:"report",id:i.id,reason:p})})).json()).status==="success"&&(alert("Đã gửi báo cáo vi phạm thành công!"),h(!1),u())}catch{alert("Lỗi kết nối server.")}},b=F.filter(r=>{if(t==="All")return!0;const s=(r.type||r.target_type||"").toLowerCase();return t==="Product"?s==="product"||s==="sản phẩm":t==="Store"?s==="vendor"||s==="gian hàng":!0}),T=r=>[...Array(5)].map((s,H)=>e.jsx(l,{icon:M,size:"sm",className:H<parseInt(r)?"text-warning":"text-secondary opacity-25"},H));return $?e.jsx("div",{className:"text-center py-5",children:e.jsx(Q,{color:"success"})}):e.jsxs("div",{className:"reviews-page-container",children:[e.jsx("style",{children:`
  .reviews-page-container {
    color: #000000;
  }

  .card-green-theme { 
    background-color: #ffffff; 
    color: #000000; 
    border: 1px solid #e5e7eb; 
    border-radius: 12px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.05); 
  }

  .modal-green-content { 
    background-color: #ffffff; 
    color: #000000; 
    border: 1px solid #e5e7eb; 
  }

  .table-green-custom { 
    --cui-table-color: #000000; 
    --cui-table-bg: #ffffff; 
    --cui-table-border-color: #e5e7eb; 
    --cui-table-hover-bg: #f9fafb; 
  }

  .table-green-custom thead th { 
    background-color: #f3f4f6; 
    color: #000000; 
    font-weight: 600; 
    border-bottom: 2px solid #e5e7eb; 
    padding: 14px 16px; 
    font-size: 0.85rem; 
  }

  .table-green-custom td { 
    padding: 16px; 
    vertical-align: middle; 
    border-bottom: 1px solid #f1f1f1; 
    color: #000000;
  }

  .form-control-green, 
  .form-select-green { 
    background-color: #ffffff; 
    border: 1px solid #d1d5db; 
    color: #000000; 
  }

  .form-control-green:focus, 
  .form-select-green:focus { 
    border-color: #9ca3af; 
    box-shadow: 0 0 0 0.2rem rgba(156,163,175,0.2); 
    background-color: #ffffff; 
    color: #000000; 
  }

  /* Tabs */
  .nav-pills .nav-link { 
    color: #000000; 
    cursor: pointer; 
    border-radius: 8px;
  }

  .nav-pills .nav-link.active { 
    background-color: #374151 !important; 
    color: #ffffff !important;   /* giữ trắng cho tab active */
  }

  /* Reply box */
  .reply-box { 
    background-color: #f9fafb; 
    border-left: 3px solid #9ca3af; 
    padding: 10px; 
    margin-top: 8px; 
    border-radius: 6px; 
    font-size: 0.9rem; 
    color: #000000;
  }

  /* Mobile card */
  .mobile-card { 
    background-color: #ffffff; 
    border: 1px solid #e5e7eb; 
    border-radius: 12px; 
    padding: 15px; 
    margin-bottom: 15px; 
    box-shadow: 0 4px 10px rgba(0,0,0,0.04);
    color: #000000;
  }

  /* Xóa các text trắng cũ */
  .text-white-50 {
    color: #6b7280 !important;
  }

  .bg-dark {
    background-color: #f3f4f6 !important;
    color: #000000 !important;
  }

`}),e.jsxs(q,{className:"card-green-theme mb-4",children:[e.jsx(W,{className:"border-bottom border-secondary pt-3 pb-3",children:e.jsxs(X,{className:"align-items-center",children:[e.jsx(L,{md:6,children:e.jsxs("h5",{className:"mb-0 fw-bold",style:{color:"#000000"},children:[e.jsx(l,{icon:M,className:"me-2 text-warning"})," Quản Lý Đánh Giá & Phản Hồi"]})}),e.jsx(L,{md:6,className:"text-md-end mt-3 mt-md-0",children:e.jsxs(Z,{variant:"pills",className:"justify-content-md-end",children:[e.jsx(g,{children:e.jsx(j,{active:t==="All",onClick:()=>x("All"),children:"Tất cả"})}),e.jsx(g,{children:e.jsx(j,{active:t==="Product",onClick:()=>x("Product"),children:"Sản phẩm"})}),e.jsx(g,{children:e.jsx(j,{active:t==="Store",onClick:()=>x("Store"),children:"Gian hàng"})})]})})]})}),e.jsxs(U,{children:[e.jsx("div",{className:"d-none d-md-block",children:e.jsxs(Y,{hover:!0,responsive:!0,className:"table-green-custom mb-0",children:[e.jsx(ee,{children:e.jsxs(C,{children:[e.jsx(c,{children:"Khách Hàng"}),e.jsx(c,{children:"Đối Tượng"}),e.jsx(c,{className:"text-center",children:"Đánh Giá"}),e.jsx(c,{style:{width:"40%"},children:"Nội Dung / Phản Hồi"}),e.jsx(c,{children:"Ngày"}),e.jsx(c,{className:"text-end",children:"Hành Động"})]})}),e.jsx(re,{children:b.length>0?b.map(r=>e.jsxs(C,{children:[e.jsx(n,{children:e.jsx("strong",{children:r.customer})}),e.jsxs(n,{children:[e.jsx("div",{className:"fw-semibold",children:r.targetName}),e.jsx(B,{color:r.type==="Sản phẩm"||r.target_type==="product"?"success":"info",size:"sm",children:r.type||(r.target_type==="product"?"Sản phẩm":"Gian hàng")})]}),e.jsx(n,{className:"text-center",children:T(r.rating)}),e.jsxs(n,{children:[e.jsxs("div",{className:"mb-2",children:['"',r.comment,'"']}),r.reply&&e.jsxs("div",{className:"reply-box",children:[e.jsxs("div",{className:"fw-bold text-success mb-1",children:[e.jsx(l,{icon:se,size:"sm",className:"me-1"}),"Phản hồi:"]}),e.jsx("em",{className:"text-white-50",children:r.reply})]}),(r.status==="reported"||r.status==="Đã báo cáo")&&e.jsx(B,{color:"danger",className:"mt-1",children:"Đã báo cáo vi phạm"})]}),e.jsx(n,{children:r.date||new Date(r.created_at).toLocaleDateString("vi-VN")}),e.jsxs(n,{className:"text-end",children:[e.jsx(o,{color:"link",className:"text-white p-1",onClick:()=>S(r),children:e.jsx(l,{icon:ne})}),e.jsx(o,{color:"link",className:"text-danger p-1 ms-1",onClick:()=>R(r),children:e.jsx(l,{icon:A})})]})]},r.id)):e.jsx(C,{children:e.jsx(n,{colSpan:"6",className:"text-center py-4",children:"Không có đánh giá nào trong mục này."})})})]})}),e.jsx("div",{className:"d-block d-md-none",children:b.map(r=>e.jsxs("div",{className:"mobile-card",children:[e.jsxs("div",{className:"d-flex justify-content-between mb-2",children:[e.jsx("div",{className:"fw-bold",children:r.customer}),e.jsx("div",{children:T(r.rating)})]}),e.jsx("div",{className:"small text-white-50 mb-2",children:r.targetName}),e.jsxs("div",{className:"fst-italic border-start border-3 border-warning ps-2 mb-3",children:['"',r.comment,'"']}),r.reply&&e.jsxs("div",{className:"reply-box mb-3 small",children:[e.jsx("strong",{children:"Phản hồi:"})," ",r.reply]}),e.jsxs("div",{className:"d-flex justify-content-between align-items-center pt-2 border-top border-secondary",children:[e.jsx("small",{className:"text-white-50",children:r.date||new Date(r.created_at).toLocaleDateString("vi-VN")}),e.jsxs("div",{children:[e.jsx(o,{size:"sm",color:"success",variant:"outline",className:"me-2",onClick:()=>S(r),children:"Trả lời"}),e.jsx(o,{size:"sm",color:"danger",variant:"outline",onClick:()=>R(r),children:"Báo cáo"})]})]})]},r.id))})]})]}),e.jsx(P,{visible:E,onClose:()=>d(!1),alignment:"center",children:e.jsxs("div",{className:"modal-green-content rounded",children:[e.jsx(_,{children:e.jsx(G,{children:"Phản Hồi Đánh Giá"})}),e.jsx(z,{children:i&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-3",children:[e.jsx("label",{className:"small text-white-50",children:"Khách viết:"})," ",e.jsxs("div",{className:"p-2 bg-dark rounded",children:['"',i.comment,'"']})]}),e.jsx(D,{children:"Câu trả lời của bạn:"}),e.jsx(ae,{rows:4,className:"form-control-green",value:m,onChange:r=>w(r.target.value),placeholder:"Nhập nội dung phản hồi..."})]})}),e.jsxs(V,{children:[e.jsx(o,{color:"secondary",onClick:()=>d(!1),children:"Đóng"}),e.jsx(o,{style:{backgroundColor:"#52b788",border:"none"},onClick:O,children:"Gửi Phản Hồi"})]})]})}),e.jsx(P,{visible:K,onClose:()=>h(!1),alignment:"center",children:e.jsxs("div",{className:"modal-green-content rounded",children:[e.jsx(_,{children:e.jsxs(G,{className:"text-danger",children:[e.jsx(l,{icon:A,className:"me-2"}),"Báo Cáo"]})}),e.jsxs(z,{children:[e.jsxs("p",{children:["Báo cáo đánh giá của ",e.jsx("strong",{children:i?.customer}),"?"]}),e.jsx(D,{children:"Lý do:"}),e.jsxs(oe,{className:"form-select-green",value:p,onChange:r=>k(r.target.value),children:[e.jsx("option",{value:"",children:"-- Chọn lý do --"}),e.jsx("option",{value:"spam",children:"Spam / Quảng cáo"}),e.jsx("option",{value:"rude",children:"Ngôn từ thô tục"}),e.jsx("option",{value:"fake",children:"Đánh giá sai sự thật"})]})]}),e.jsxs(V,{children:[e.jsx(o,{color:"secondary",onClick:()=>h(!1),children:"Hủy"}),e.jsx(o,{color:"danger",onClick:J,children:"Gửi Báo Cáo"})]})]})})]})};export{je as default};
