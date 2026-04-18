import{r as c,_ as M,R as h,B as S,D as r,X as U,j as e,a as y,C as T,N as W,S as q,A as K}from"./index-C1KJssbB.js";import{C as Q}from"./CCard-TuxIymGC.js";import{C as X}from"./CCardHeader-BCnQryB8.js";import{C as N}from"./CFormInput-BLnGKak4.js";import{c as Y}from"./cil-search-CDkY_4k-.js";import{c as ee}from"./cil-plus-D8mtC-W5.js";import{C as se}from"./CCardBody-BQ3fVMWd.js";import{C as ae,a as re,b as R,c as v,d as oe,e as C}from"./CTable-XePYIz1r.js";import{C as m}from"./CFormControlWrapper-Bh3eI6Vk.js";import{c as te}from"./cil-trash-CBbKHhHb.js";import{C as ne,a as ce}from"./CModalBody-Ci0NjX26.js";import{C as le,a as ie,b as de}from"./CModalTitle-ALKUeE7b.js";import{C as me,a as b}from"./CRow-CTGywBGK.js";import{C as D}from"./CFormSelect-C6A1rZex.js";import{c as he}from"./cil-basket--JByOd6R.js";const B=c.forwardRef((l,j)=>{var{className:p,id:u,invalid:g,label:n,reverse:d,size:t,type:x="checkbox",valid:f}=l,a=M(l,["className","id","invalid","label","reverse","size","type","valid"]);return h.createElement("div",{className:S("form-check form-switch",{"form-check-reverse":d,[`form-switch-${t}`]:t,"is-invalid":g,"is-valid":f},p)},h.createElement("input",Object.assign({type:x,className:S("form-check-input",{"is-invalid":g,"is-valid":f}),id:u},a,{ref:j})),n&&h.createElement(m,Object.assign({customClassName:"form-check-label"},u&&{htmlFor:u}),n))});B.propTypes={className:r.string,id:r.string,invalid:r.bool,label:r.oneOfType([r.string,r.node]),reverse:r.bool,size:r.oneOf(["lg","xl"]),type:r.oneOf(["checkbox","radio"]),valid:r.bool};B.displayName="CFormSwitch";const F=c.createContext({}),$=c.forwardRef((l,j)=>{var{children:p,animated:u,className:g,color:n,value:d=0,variant:t}=l,x=M(l,["children","animated","className","color","value","variant"]);const{stacked:f}=c.useContext(F);return h.createElement("div",Object.assign({className:S("progress-bar",{[`bg-${n}`]:n,[`progress-bar-${t}`]:t,"progress-bar-animated":u},g)},!f&&{style:{width:`${d}%`}},x,{ref:j}),p)});$.propTypes={animated:r.bool,children:r.node,className:r.string,color:U,value:r.number,variant:r.oneOf(["striped"])};$.displayName="CProgressBar";const A=c.forwardRef((l,j)=>{var{children:p,className:u,height:g,progressBarClassName:n,thin:d,value:t,white:x}=l,f=M(l,["children","className","height","progressBarClassName","thin","value","white"]);const{stacked:a}=c.useContext(F);return h.createElement("div",Object.assign({className:S("progress",{"progress-thin":d,"progress-white":x},u)},t!==void 0&&{role:"progressbar","aria-valuenow":t,"aria-valuemin":0,"aria-valuemax":100},{style:Object.assign(Object.assign({},g?{height:`${g}px`}:{}),a?{width:`${t}%`}:{}),ref:j}),h.Children.toArray(p).some(o=>o.type&&o.type.displayName==="CProgressBar")?h.Children.map(p,o=>{if(h.isValidElement(o)&&o.type.displayName==="CProgressBar")return h.cloneElement(o,Object.assign(Object.assign({},t&&{value:t}),f))}):h.createElement($,Object.assign({},n&&{className:n},{value:t},f),p))});A.propTypes={children:r.node,className:r.string,height:r.number,progressBarClassName:r.string,thin:r.bool,value:r.number,white:r.bool};A.displayName="CProgress";var pe=["512 512","<path fill='var(--ci-primary-color, currentColor)' d='M485.887,263.261,248,25.373A31.791,31.791,0,0,0,225.373,16H64A48.055,48.055,0,0,0,16,64V225.078A32.115,32.115,0,0,0,26.091,248.4L279.152,486.125a23.815,23.815,0,0,0,16.41,6.51q.447,0,.9-.017a23.828,23.828,0,0,0,16.79-7.734L486.581,296.479A23.941,23.941,0,0,0,485.887,263.261ZM295.171,457.269,48,225.078V64A16.019,16.019,0,0,1,64,48H225.373L457.834,280.462Z' class='ci-primary'/><path fill='var(--ci-primary-color, currentColor)' d='M148,96a52,52,0,1,0,52,52A52.059,52.059,0,0,0,148,96Zm0,72a20,20,0,1,1,20-20A20.023,20.023,0,0,1,148,168Z' class='ci-primary'/>"];const k=`${K}/promotions.php`,ue=JSON.parse(localStorage.getItem("user")||"{}"),O=ue.id||1,Le=()=>{const[l,j]=c.useState([]),[p,u]=c.useState([]),[g,n]=c.useState(!1),[d,t]=c.useState(null),[x,f]=c.useState(""),[a,o]=c.useState({code:"",name:"",type:"percent",value:"",scope:"order",productId:"",startDate:"",endDate:"",limit:100}),_=async()=>{try{const i=await(await fetch(`${k}?action=get_all&vendor_id=${O}`)).json();j(Array.isArray(i)?i:[])}catch(s){console.error("Lỗi tải dữ liệu:",s)}},G=async(s,i)=>{const P=i?0:1;try{const E=await(await fetch(`${k}?action=toggle_status`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:s,status:P})})).json();E.status==="success"?j(l.map(L=>L.id===s?{...L,status:P}:L)):alert("Lỗi: "+E.message)}catch(w){console.error("Lỗi kết nối status:",w)}},H=async()=>{try{const i=await(await fetch(`${k}?action=get_vendor_products&vendor_id=${O}`)).json();u(Array.isArray(i)?i:[])}catch(s){console.error("Lỗi tải sản phẩm:",s)}};c.useEffect(()=>{_(),H()},[]);const I=s=>new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(s),V=(s=null)=>{s?(t(s),o({...s,startDate:s.start_date,endDate:s.end_date,limit:s.usage_limit,productId:s.product_id||""})):(t(null),o({code:"",name:"",type:"percent",value:"",scope:"order",productId:"",startDate:"",endDate:"",limit:100})),n(!0)},z=async()=>{if(!a.code||!a.value)return alert("Vui lòng nhập đủ thông tin mã và giá trị!");if(a.scope==="product"&&!a.productId)return alert("Vui lòng chọn sản phẩm áp dụng!");const s={id:d?d.id:null,...a,vendor_id:O};try{const w=await(await fetch(`${k}?action=${d?"update":"create"}`,{method:"POST",body:JSON.stringify(s)})).json();w.status==="success"?(alert("Thành công!"),_(),n(!1)):alert("Lỗi: "+w.message)}catch{alert("Lỗi kết nối!")}},Z=async s=>{if(window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?"))try{(await(await fetch(`${k}?action=delete&id=${s}`)).json()).status==="success"&&_()}catch{alert("Lỗi khi xóa")}},J=l.filter(s=>s.code.toLowerCase().includes(x.toLowerCase())||s.name.toLowerCase().includes(x.toLowerCase()));return e.jsxs("div",{className:"promotions-page-container",children:[e.jsx("style",{children:`
  .card-green-theme { 
    background-color: #ffffff; 
    color: #2c2c2c; 
    border: 1px solid #e5e7eb; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
  }

  .modal-green-content { 
    background-color: #ffffff; 
    color: #2c2c2c; 
    border: 1px solid #e5e7eb; 
  }

  .modal-header, .modal-footer { 
    border-color: #e5e7eb; 
  }

  .table-green-custom { 
    --cui-table-color: #2c2c2c; 
    --cui-table-bg: #ffffff; 
    --cui-table-border-color: #e5e7eb; 
    --cui-table-hover-bg: #f9fafb; 
  }

  .table-green-custom thead th { 
    background-color: #f3f4f6; 
    color: #374151; 
    font-weight: 600; 
    border-bottom: 2px solid #e5e7eb; 
    padding: 14px 16px; 
  }

  .table-green-custom td { 
    padding: 16px; 
    vertical-align: middle; 
    border-bottom: 1px solid #f1f1f1; 
  }

  .form-control-green, 
  .form-select-green { 
    background-color: #ffffff; 
    border: 1px solid #d1d5db; 
    color: #2c2c2c; 
  }

  .form-control-green:focus, 
  .form-select-green:focus { 
    background-color: #ffffff; 
    border-color: #9ca3af; 
    color: #2c2c2c; 
    box-shadow: 0 0 0 0.2rem rgba(156, 163, 175, 0.2); 
  }

  .coupon-code { 
    background-color: #f3f4f6; 
    color: #111827; 
    padding: 4px 10px; 
    border-radius: 6px; 
    font-weight: 600; 
    font-family: monospace; 
    letter-spacing: 1px; 
    display: inline-block; 
    border: 1px dashed #9ca3af; 
  }

  .text-value { 
    color: #111827; 
    font-weight: 700; 
  }

  .btn-action:hover { 
    color: #111827 !important; 
    transform: scale(1.1); 
    transition: 0.2s; 
  }
`}),e.jsxs(Q,{className:"card-green-theme mb-4",children:[e.jsxs(X,{className:"border-bottom border-secondary pt-3 pb-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3",children:[e.jsxs("h5",{className:"mb-0 fw-bold d-flex align-items-center",style:{color:"#000000"},children:[e.jsx(y,{icon:pe,className:"me-2 text-warning"})," Quản Lý Mã Giảm Giá"]}),e.jsxs("div",{className:"d-flex w-100 w-md-auto gap-2",children:[e.jsxs("div",{className:"position-relative w-100",style:{minWidth:"200px"},children:[e.jsx(N,{className:"form-control-green ps-5",placeholder:"Tìm mã, tên...",value:x,onChange:s=>f(s.target.value)}),e.jsx(y,{icon:Y,className:"position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50"})]}),e.jsxs(T,{style:{backgroundColor:"#52b788",border:"none"},onClick:()=>V(),className:"fw-semibold text-white text-nowrap",children:[e.jsx(y,{icon:ee,className:"me-1"})," Tạo Mã"]})]})]}),e.jsx(se,{children:e.jsx("div",{className:"d-none d-md-block",children:e.jsxs(ae,{hover:!0,responsive:!0,className:"table-green-custom mb-0",children:[e.jsx(re,{children:e.jsxs(R,{children:[e.jsx(v,{children:"Mã Voucher"}),e.jsx(v,{children:"Tên Chương Trình"}),e.jsx(v,{children:"Mức Giảm"}),e.jsx(v,{children:"Phạm Vi"}),e.jsx(v,{children:"Thời Gian"}),e.jsx(v,{style:{width:"15%"},children:"Lượt Dùng"}),e.jsx(v,{className:"text-center",children:"Trạng Thái"}),e.jsx(v,{className:"text-end",children:"Hành Động"})]})}),e.jsx(oe,{children:J.map(s=>e.jsxs(R,{children:[e.jsx(C,{children:e.jsx("div",{className:"coupon-code",children:s.code})}),e.jsx(C,{children:e.jsx("div",{className:"fw-semibold",children:s.name})}),e.jsx(C,{className:"text-value",children:s.type==="percent"?`${s.value}%`:I(s.value)}),e.jsxs(C,{children:[e.jsx(W,{color:s.scope==="order"?"info":"warning",children:s.scope==="order"?"Cửa hàng":"Sản phẩm lẻ"}),s.product_name&&e.jsx("div",{className:"small text-truncate",style:{maxWidth:"120px"},children:s.product_name})]}),e.jsxs(C,{className:"small",children:[e.jsx("div",{children:s.start_date}),e.jsxs("div",{className:"text-white-50",children:["đến ",s.end_date]})]}),e.jsxs(C,{children:[e.jsxs("div",{className:"d-flex justify-content-between small mb-1",children:[e.jsx("span",{children:s.used_count}),e.jsxs("span",{className:"text-white-50",children:["/ ",s.usage_limit]})]}),e.jsx(A,{color:s.used_count>=s.usage_limit?"danger":"success",value:s.used_count/s.usage_limit*100,height:6})]}),e.jsx(C,{className:"text-center",children:e.jsx(B,{checked:Number(s.status)===1,onChange:()=>G(s.id,Number(s.status)===1)})}),e.jsxs(C,{className:"text-end",children:[e.jsx(T,{color:"link",className:"btn-action text-white p-1",onClick:()=>V(s),children:e.jsx(y,{icon:q})}),e.jsx(T,{color:"link",className:"btn-action text-danger p-1",onClick:()=>Z(s.id),children:e.jsx(y,{icon:te})})]})]},s.id))})]})})})]}),e.jsx(ne,{visible:g,onClose:()=>n(!1),size:"lg",alignment:"center",children:e.jsxs("div",{className:"modal-green-content",children:[e.jsx(le,{children:e.jsx(ie,{children:d?"Cập Nhật":"Tạo Mới"})}),e.jsx(ce,{children:e.jsxs(me,{children:[e.jsxs(b,{md:6,className:"mb-3",children:[e.jsx(m,{children:"Mã Voucher"}),e.jsx(N,{className:"form-control-green text-uppercase fw-bold",value:a.code,onChange:s=>o({...a,code:s.target.value.toUpperCase()})})]}),e.jsxs(b,{md:6,className:"mb-3",children:[e.jsx(m,{children:"Tên Chương Trình"}),e.jsx(N,{className:"form-control-green",value:a.name,onChange:s=>o({...a,name:s.target.value})})]}),e.jsxs(b,{md:12,className:"mb-3",children:[e.jsx(m,{children:"Phạm Vi Áp Dụng"}),e.jsxs(D,{className:"form-select-green",value:a.scope,onChange:s=>o({...a,scope:s.target.value,productId:""}),children:[e.jsx("option",{value:"order",children:"Giảm toàn bộ sản phẩm của cửa hàng"}),e.jsx("option",{value:"product",children:"Giảm cho sản phẩm cụ thể"})]})]}),a.scope==="product"&&e.jsxs(b,{md:12,className:"mb-3",children:[e.jsxs(m,{children:[e.jsx(y,{icon:he,className:"me-1"})," Chọn Sản Phẩm"]}),e.jsxs(D,{className:"form-select-green",value:a.productId,onChange:s=>o({...a,productId:s.target.value}),children:[e.jsx("option",{value:"",children:"-- Chọn sản phẩm --"}),p.map(s=>e.jsxs("option",{value:s.id,children:[s.name," - (",I(s.price),")"]},s.id))]})]}),e.jsxs(b,{md:4,className:"mb-3",children:[e.jsx(m,{children:"Loại Giảm"}),e.jsxs(D,{className:"form-select-green",value:a.type,onChange:s=>o({...a,type:s.target.value}),children:[e.jsx("option",{value:"percent",children:"Phần trăm (%)"}),e.jsx("option",{value:"fixed",children:"Tiền mặt (VNĐ)"})]})]}),e.jsxs(b,{md:8,className:"mb-3",children:[e.jsx(m,{children:"Giá Trị Giảm"}),e.jsx(N,{type:"number",className:"form-control-green",value:a.value,onChange:s=>o({...a,value:s.target.value})})]}),e.jsxs(b,{md:4,className:"mb-3",children:[e.jsx(m,{children:"Số Lượng Mã"}),e.jsx(N,{type:"number",className:"form-control-green",value:a.limit,onChange:s=>o({...a,limit:s.target.value})})]}),e.jsxs(b,{md:4,className:"mb-3",children:[e.jsx(m,{children:"Ngày Bắt Đầu"}),e.jsx(N,{type:"date",className:"form-control-green",value:a.startDate,onChange:s=>o({...a,startDate:s.target.value})})]}),e.jsxs(b,{md:4,className:"mb-3",children:[e.jsx(m,{children:"Ngày Kết Thúc"}),e.jsx(N,{type:"date",className:"form-control-green",value:a.endDate,onChange:s=>o({...a,endDate:s.target.value})})]})]})}),e.jsxs(de,{children:[e.jsx(T,{color:"secondary",onClick:()=>n(!1),children:"Hủy"}),e.jsx(T,{style:{backgroundColor:"#52b788",border:"none"},onClick:z,children:"Lưu Mã"})]})]})})]})};export{Le as default};
