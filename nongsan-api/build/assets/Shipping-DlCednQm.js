import{r as o,A as T,j as e,t as E,a as t,N as g,C as x,S as F,F as P}from"./index-C1KJssbB.js";import{C as V}from"./CCard-TuxIymGC.js";import{C as $}from"./CCardHeader-BCnQryB8.js";import{c as H,a as K}from"./cil-truck-DteqEhGl.js";import{C as S}from"./CFormInput-BLnGKak4.js";import{c as Z}from"./cil-search-CDkY_4k-.js";import{C as _}from"./CCardBody-BQ3fVMWd.js";import{C as O,a as R,b,c as n,d as J,e as r}from"./CTable-XePYIz1r.js";import{C as W,a as Q}from"./CModalBody-Ci0NjX26.js";import{C as U,a as q,b as X}from"./CModalTitle-ALKUeE7b.js";import{C as Y,a as d}from"./CRow-CTGywBGK.js";import{C as u}from"./CFormControlWrapper-Bh3eI6Vk.js";import{C as k}from"./CFormSelect-C6A1rZex.js";import{C as ee}from"./CFormTextarea-BtQBV6LL.js";import{c as se}from"./cil-save-CHBg7z_U.js";var ae=["512 512","<path fill='var(--ci-primary-color, currentColor)' d='M253.924,127.592a64,64,0,1,0,64,64A64.073,64.073,0,0,0,253.924,127.592Zm0,96a32,32,0,1,1,32-32A32.037,32.037,0,0,1,253.924,223.592Z' class='ci-primary'/><path fill='var(--ci-primary-color, currentColor)' d='M376.906,68.515A173.922,173.922,0,0,0,108.2,286.426L229.107,472.039a29.619,29.619,0,0,0,49.635,0L399.653,286.426A173.921,173.921,0,0,0,376.906,68.515Zm-4.065,200.444L253.925,451.509,135.008,268.959C98.608,213.08,106.415,138.3,153.571,91.142a141.92,141.92,0,0,1,200.708,0C401.435,138.3,409.241,213.08,372.841,268.959Z' class='ci-primary'/>"];const be=()=>{const[L,G]=o.useState([]),[M,j]=o.useState(!0),[h,z]=o.useState(""),[A,m]=o.useState(!1),[l,I]=o.useState(null),[a,c]=o.useState({method:"",status:"",estimatedTime:"",note:""}),f=JSON.parse(localStorage.getItem("user")),C=localStorage.getItem("token");o.useEffect(()=>{f?.id&&N()},[]);const N=async()=>{j(!0);try{const i=await(await fetch(`${T}/get_shipping.php?user_id=${f.id}&role=${f.role}`,{headers:{Authorization:`Bearer ${C}`}})).json();i.status==="success"&&G(i.data)}catch(s){console.error("Lỗi tải dữ liệu vận chuyển:",s)}finally{j(!1)}},B=async()=>{if(l)try{const i=await(await fetch(`${T}/update_shipping.php`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${C}`},body:JSON.stringify({id:l.id,...a})})).json();i.status==="success"?(alert("Cập nhật trạng thái vận chuyển thành công!"),m(!1),N()):alert("Lỗi: "+i.message)}catch{alert("Lỗi kết nối máy chủ khi cập nhật.")}},p=L.filter(s=>s.id?.toLowerCase().includes(h.toLowerCase())||s.orderId?.toLowerCase().includes(h.toLowerCase())||s.customer?.toLowerCase().includes(h.toLowerCase())),v=s=>{I(s),c({method:s.method,status:s.status,estimatedTime:s.estimatedTime?s.estimatedTime.replace(" ","T").substring(0,16):"",note:s.note||""}),m(!0)},y=s=>{switch(s){case"Giao thành công":return"success";case"Đang giao hàng":return"warning";case"Chờ lấy hàng":return"info";case"Giao thất bại":return"danger";case"Đã hủy":return"secondary";default:return"light"}},D=s=>{switch(s){case"Giao nhanh":return"danger";case"Giao nội thành":return"success";case"Tự giao":return"primary";default:return"secondary"}},w=s=>s?new Date(s).toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit",year:"numeric"}):"Chưa xác định";return M?e.jsx("div",{className:"text-center py-5",children:e.jsx(E,{color:"success"})}):e.jsxs("div",{className:"shipping-page-container",children:[e.jsx("style",{children:`
  .card-green-theme { 
    background-color: #ffffff; 
    color: #111827; 
    border: 1px solid #e5e7eb; 
    border-radius: 12px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.05); 
  }

  .modal-green-content { 
    background-color: #ffffff; 
    color: #111827; 
    border: 1px solid #e5e7eb; 
    border-radius: 12px;
  }

  .modal-header, 
  .modal-footer { 
    border-color: #e5e7eb; 
  }

  .table-green-custom { 
    --cui-table-color: #111827; 
    --cui-table-bg: #ffffff; 
    --cui-table-border-color: #e5e7eb; 
    --cui-table-hover-bg: #f9fafb; 
  }

  .table-green-custom thead th { 
    background-color: #f3f4f6; 
    color: #374151; 
    font-weight: 700; 
    border-bottom: 2px solid #e5e7eb; 
    padding: 14px 16px; 
    text-transform: uppercase; 
    font-size: 0.85rem; 
    letter-spacing: 0.5px;
  }

  .table-green-custom td { 
    padding: 16px; 
    vertical-align: middle; 
    border-bottom: 1px solid #f1f1f1; 
    color: #111827;
  }

  .form-control-green, 
  .form-select-green { 
    background-color: #ffffff; 
    border: 1px solid #d1d5db; 
    color: #111827; 
    border-radius: 8px;
  }

  .form-control-green:focus, 
  .form-select-green:focus { 
    background-color: #ffffff; 
    border-color: #9ca3af; 
    color: #111827; 
    box-shadow: 0 0 0 0.2rem rgba(156,163,175,0.2); 
  }

  .text-id { 
    color: #374151; 
    font-weight: 700; 
  }

  .text-sub { 
    color: #6b7280; 
    font-size: 0.85rem; 
  }

  .mobile-card { 
    background-color: #ffffff; 
    border: 1px solid #e5e7eb; 
    border-radius: 12px; 
    padding: 15px; 
    margin-bottom: 15px; 
    box-shadow: 0 4px 10px rgba(0,0,0,0.04);
  }

  .mobile-card-row { 
    display: flex; 
    justify-content: space-between; 
    margin-bottom: 8px; 
    font-size: 0.95rem; 
    color: #111827;
  }
`}),e.jsxs(V,{className:"card-green-theme mb-4",children:[e.jsxs($,{className:"border-bottom border-secondary pt-3 pb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3",children:[e.jsxs("h5",{className:"mb-0 fw-bold d-flex align-items-center",style:{color:"#000000"},children:[e.jsx(t,{icon:H,className:"me-2 text-warning"})," Quản Lý Vận Chuyển"]}),e.jsx("div",{className:"d-flex w-100 w-md-auto",children:e.jsxs("div",{className:"position-relative w-100",style:{minWidth:"250px"},children:[e.jsx(S,{className:"form-control-green ps-5 w-100",placeholder:"Tìm mã vận đơn, đơn hàng...",value:h,onChange:s=>z(s.target.value)}),e.jsx(t,{icon:Z,className:"position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"})]})})]}),e.jsxs(_,{children:[e.jsx("div",{className:"d-none d-md-block",children:e.jsxs(O,{hover:!0,responsive:!0,className:"table-green-custom mb-0",children:[e.jsx(R,{children:e.jsxs(b,{children:[e.jsx(n,{children:"Mã Vận Đơn"}),e.jsx(n,{children:"Đơn Hàng"}),e.jsx(n,{children:"Phương Thức"}),e.jsx(n,{children:"Trạng Thái"}),e.jsx(n,{children:"Dự Kiến Giao"}),e.jsx(n,{children:"Ghi Chú"}),e.jsx(n,{className:"text-end",children:"Cập Nhật"})]})}),e.jsx(J,{children:p.length>0?p.map(s=>e.jsxs(b,{children:[e.jsx(r,{className:"text-id",children:s.id}),e.jsxs(r,{children:[e.jsx("div",{className:"fw-bold",children:s.orderId}),e.jsx("div",{className:"text-sub",children:s.customer})]}),e.jsx(r,{children:e.jsx(g,{color:D(s.method),children:s.method})}),e.jsx(r,{children:e.jsx(g,{color:y(s.status),shape:"rounded-pill",children:s.status})}),e.jsx(r,{children:e.jsxs("div",{className:"d-flex align-items-center small",children:[e.jsx(t,{icon:K,size:"sm",className:"me-2 text-warning"}),w(s.estimatedTime)]})}),e.jsx(r,{className:"text-sub small text-truncate",style:{maxWidth:"150px"},children:s.note}),e.jsx(r,{className:"text-end",children:e.jsx(x,{color:"link",className:"p-1 text-dark",onClick:()=>v(s),children:e.jsx(t,{icon:F})})})]},s.id)):e.jsx(b,{children:e.jsx(r,{colSpan:"7",className:"text-center py-4 text-muted",children:"Không có dữ liệu vận chuyển."})})})]})}),e.jsx("div",{className:"d-block d-md-none",children:p.map(s=>e.jsxs("div",{className:"mobile-card",children:[e.jsxs("div",{className:"d-flex justify-content-between mb-3 pb-2 border-bottom border-secondary",children:[e.jsx("div",{className:"fw-bold text-id",children:s.id}),e.jsx(g,{color:y(s.status),children:s.status})]}),e.jsxs("div",{className:"mobile-card-row",children:[e.jsx("span",{className:"text-sub",children:"Khách hàng:"}),e.jsx("span",{className:"fw-semibold",children:s.customer})]}),e.jsxs("div",{className:"mobile-card-row",children:[e.jsx("span",{className:"text-sub",children:"Mã đơn:"}),e.jsx("span",{children:s.orderId})]}),e.jsxs("div",{className:"mobile-card-row",children:[e.jsx("span",{className:"text-sub",children:"Dự kiến:"}),e.jsx("span",{className:"text-warning small",children:w(s.estimatedTime)})]}),e.jsx("div",{className:"mt-3 text-end border-top border-secondary pt-2",children:e.jsx(x,{size:"sm",color:"info",variant:"outline",onClick:()=>v(s),children:"Cập nhật"})})]},s.id))})]})]}),e.jsx(W,{visible:A,onClose:()=>m(!1),size:"lg",alignment:"center",children:e.jsxs("div",{className:"modal-green-content",children:[e.jsx(U,{children:e.jsxs(q,{children:["Cập Nhật Vận Đơn ",l?.id]})}),e.jsx(Q,{children:e.jsxs(Y,{children:[e.jsx(d,{md:12,className:"mb-4",children:e.jsxs("div",{className:"p-3 rounded",style:{backgroundColor:"#1E3923",border:"1px solid #558b6e"},children:[e.jsxs("div",{className:"d-flex justify-content-between mb-2",children:[e.jsxs("span",{children:[e.jsx(t,{icon:P,size:"sm",className:"me-1"})," ",l?.customer]}),e.jsx("span",{className:"text-warning fw-bold",children:l?.orderId})]}),e.jsxs("div",{className:"small",children:[e.jsx(t,{icon:ae,className:"me-1 text-danger"})," ",l?.address]})]})}),e.jsxs(d,{md:6,className:"mb-3",children:[e.jsx(u,{children:"Phương Thức Giao"}),e.jsxs(k,{className:"form-select-green",value:a.method,onChange:s=>c({...a,method:s.target.value}),children:[e.jsx("option",{value:"Giao nội thành",children:"Giao nội thành"}),e.jsx("option",{value:"Giao nhanh",children:"Giao nhanh"}),e.jsx("option",{value:"Tự giao",children:"Tự giao"})]})]}),e.jsxs(d,{md:6,className:"mb-3",children:[e.jsx(u,{children:"Trạng Thái"}),e.jsxs(k,{className:"form-select-green",value:a.status,onChange:s=>c({...a,status:s.target.value}),children:[e.jsx("option",{value:"Chờ lấy hàng",children:"Chờ lấy hàng"}),e.jsx("option",{value:"Đang giao hàng",children:"Đang giao hàng"}),e.jsx("option",{value:"Giao thành công",children:"Giao thành công"}),e.jsx("option",{value:"Giao thất bại",children:"Giao thất bại"})]})]}),e.jsxs(d,{md:6,className:"mb-3",children:[e.jsx(u,{children:"Thời Gian Dự Kiến"}),e.jsx(S,{type:"datetime-local",className:"form-control-green",value:a.estimatedTime,onChange:s=>c({...a,estimatedTime:s.target.value})})]}),e.jsxs(d,{md:6,className:"mb-3",children:[e.jsx(u,{children:"Ghi Chú"}),e.jsx(ee,{className:"form-control-green",rows:3,value:a.note,onChange:s=>c({...a,note:s.target.value})})]})]})}),e.jsxs(X,{children:[e.jsx(x,{color:"secondary",onClick:()=>m(!1),children:"Đóng"}),e.jsxs(x,{style:{backgroundColor:"#52b788",border:"none"},onClick:B,children:[e.jsx(t,{icon:se,className:"me-1"})," Lưu Thay Đổi"]})]})]})})]})};export{be as default};
