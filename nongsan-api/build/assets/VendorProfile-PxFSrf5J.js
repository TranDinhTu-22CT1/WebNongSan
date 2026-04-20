import{r as n,A as N,j as e,t as U,a as l,N as B,F as D,C as m,S as k,T as O}from"./index-C1KJssbB.js";import{C,a as t}from"./CRow-CTGywBGK.js";import{C as S}from"./CCard-TuxIymGC.js";import{C as P}from"./CCardBody-BQ3fVMWd.js";import{c as R}from"./cil-cloud-upload-Ca9_6_ej.js";import{c as $}from"./cil-check-circle-BlU9eaow.js";import{c as J}from"./cil-warning-C7g3f07Q.js";import{C as X}from"./CCardHeader-BCnQryB8.js";import{c as K}from"./cil-x-0440B5Ce.js";import{c as W}from"./cil-save-CHBg7z_U.js";import{c as G}from"./cil-wallet-BrU51gCv.js";import{C as d}from"./CFormControlWrapper-Bh3eI6Vk.js";import{C as h}from"./CFormInput-BLnGKak4.js";import{C as Y}from"./CFormTextarea-BtQBV6LL.js";import{C as q,a as Q}from"./CModalBody-Ci0NjX26.js";import{C as ee,a as ae,b as se}from"./CModalTitle-ALKUeE7b.js";import{C as oe}from"./CAlert-DQH8wuWN.js";var re=["512 512","<path fill='var(--ci-primary-color, currentColor)' d='M457.47,55.833c-53.026-53.026-139.307-53.026-192.332,0L168.971,152,191.6,174.627,287.765,78.46A104,104,0,0,1,434.843,225.539l-96.167,96.167L361.3,344.333l96.167-96.167C510.5,195.14,510.5,108.86,457.47,55.833Z' class='ci-primary'/><path fill='var(--ci-primary-color, currentColor)' d='M225.539,434.843a104,104,0,0,1-147.078,0h0a104,104,0,0,1,0-147.078l90.511-90.511-22.627-22.627L55.833,265.138A136,136,0,1,0,248.166,457.47l90.51-90.51-22.627-22.627Z' class='ci-primary'/><rect width='320' height='32' x='93.824' y='243.48' fill='var(--ci-primary-color, currentColor)' class='ci-primary' transform='rotate(-45 253.823 259.48)'/>"];const ve=()=>{const[a,f]=n.useState({id:"",shopName:"",ownerName:"",email:"",phone:"",address:"",description:"",avatar:"",joinDate:"",isApproved:!1,momoPartnerCode:"",momoLinkedAt:null}),[L,A]=n.useState(!0),[c,b]=n.useState(!1),[T,g]=n.useState("https://via.placeholder.com/150"),[v,y]=n.useState(null),[w,_]=n.useState(null),[Z,x]=n.useState(!1),[u,z]=n.useState("");n.useEffect(()=>{j()},[]);const j=async()=>{try{const s=JSON.parse(localStorage.getItem("user"));if(!s)return;const i=await(await fetch(`${N}/get_profile.php?id=${s.id}`)).json();if(i.status==="success"){const o=i.data;f({id:o.id,shopName:o.shop_name||"",ownerName:o.name||"",email:o.email||"",phone:o.phone||"",address:o.address||"",description:o.description||"",avatar:o.avatar||"",joinDate:o.created_at||"",isApproved:o.is_approved==1,momoPartnerCode:o.momo_partner_code||"",momoLinkedAt:o.momo_linked_at||null}),o.avatar&&g(o.avatar)}}catch(s){console.error("Lỗi tải profile:",s)}finally{A(!1)}},I=async()=>{if(!u)return alert("Vui lòng nhập số điện thoại ZaloPay");try{const r=await(await fetch(`${N}/link_momo.php`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:a.id,momo_partner_code:u})})).json();r.status==="success"?(alert("Liên kết ví ZaloPay thành công!"),x(!1),j()):alert("Lỗi: "+r.message)}catch{alert("Lỗi kết nối server")}},F=()=>{_({...a}),b(!0)},M=()=>{f(w),g(w.avatar||"https://via.placeholder.com/150"),y(null),b(!1)},p=s=>{const{name:r,value:i}=s.target;f({...a,[r]:i})},E=s=>{const r=s.target.files[0];r&&(g(URL.createObjectURL(r)),y(r))},H=async()=>{const s=new FormData;s.append("id",a.id),s.append("name",a.ownerName),s.append("shop_name",a.shopName),s.append("phone",a.phone),s.append("address",a.address),s.append("description",a.description),v&&s.append("avatar",v);try{const i=await(await fetch(`${N}/update_profile.php`,{method:"POST",body:s})).json();if(i.status==="success"){alert("Cập nhật hồ sơ thành công!");const V={...JSON.parse(localStorage.getItem("user")),name:a.ownerName,avatar:i.new_avatar||a.avatar};localStorage.setItem("user",JSON.stringify(V)),b(!1),j()}else alert("Lỗi: "+i.message)}catch{alert("Lỗi kết nối server")}};return L?e.jsx("div",{className:"text-center py-5",children:e.jsx(U,{color:"success"})}):e.jsxs("div",{className:"profile-page-container",children:[e.jsx("style",{children:`
  .card-green-theme { 
    background-color: #ffffff; 
    color: #2c2c2c; 
    border: 1px solid #e5e7eb; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
  }

  .form-control-green { 
    background-color: #ffffff; 
    border: 1px solid #d1d5db; 
    color: #2c2c2c; 
  }

  .form-control-green:focus { 
    border-color: #9ca3af; 
    color: #2c2c2c; 
    box-shadow: 0 0 0 0.2rem rgba(156, 163, 175, 0.2); 
    background-color: #ffffff; 
  }

  .form-control-green:disabled { 
    background-color: #f9fafb; 
    border: none; 
    border-bottom: 1px solid #d1d5db; 
    opacity: 1; 
    border-radius: 0; 
    color: #6b7280; 
  }

  .section-title { 
    color: #111827; 
    font-weight: 700; 
    margin-bottom: 20px; 
    border-bottom: 1px solid #e5e7eb; 
    padding-bottom: 10px; 
  }

  .label-custom { 
    color: #6b7280; 
    font-weight: 500; 
    font-size: 0.9rem; 
  }
  
  /* Avatar Profile */
  .avatar-main-img { 
    width: 160px !important; 
    height: 160px !important; 
    object-fit: cover !important; 
    border-radius: 50% !important; 
    border: 4px solid #e5e7eb !important; 
    display: block; 
    margin: 0 auto; 
    background: #f3f4f6;
  }

  .zalopay-integration-box { 
    background: #f9fafb; 
    border: 1px solid #e5e7eb; 
    border-radius: 12px; 
    padding: 20px; 
    margin-bottom: 25px; 
  }

  .modal-zalopay-theme { 
    background-color: #ffffff; 
    color: #2c2c2c; 
    border: 1px solid #e5e7eb; 
  }

  .btn-zalopay { 
    background-color: #374151; 
    color: white; 
    border: none; 
    font-weight: 600; 
  }

  .btn-zalopay:hover { 
    background-color: #111827; 
    color: white; 
  }
`}),e.jsxs(C,{children:[e.jsx(t,{xs:12,md:5,lg:4,xl:3,className:"mb-4",children:e.jsx(S,{className:"card-green-theme h-100",children:e.jsxs(P,{className:"text-center d-flex flex-column align-items-center py-5",children:[e.jsxs("div",{className:"position-relative mb-4",children:[e.jsx("img",{src:T,alt:"Avatar",className:"avatar-main-img"}),c&&e.jsxs("label",{htmlFor:"avatar-upload",style:{position:"absolute",bottom:10,right:10,backgroundColor:"#ffd166",padding:8,borderRadius:"50%",cursor:"pointer",color:"#1E3923",zIndex:10},children:[e.jsx(l,{icon:R}),e.jsx("input",{type:"file",id:"avatar-upload",hidden:!0,accept:"image/*",onChange:E})]})]}),e.jsx("h3",{className:"fw-bold mb-1",children:a.ownerName}),e.jsx("p",{className:"opacity-75 mb-3",children:a.shopName||"Chưa đặt tên shop"}),e.jsx(B,{color:a.isApproved?"success":"warning",className:"mb-4 p-2",children:a.isApproved?"ĐÃ XÁC MINH":"CHỜ DUYỆT"}),e.jsxs("div",{className:"w-100 px-3 text-start small border-top border-secondary pt-3",children:[e.jsx("div",{className:"label-custom mb-1",children:"Thanh toán ZaloPay:"}),a.momoPartnerCode?e.jsxs("div",{className:"text-info d-flex align-items-center fw-bold",children:[e.jsx(l,{icon:$,className:"me-2"})," Đã liên kết"]}):e.jsxs("div",{className:"text-warning d-flex align-items-center",children:[e.jsx(l,{icon:J,className:"me-2"})," Chưa liên kết"]})]})]})})}),e.jsx(t,{xs:12,md:7,lg:8,xl:9,className:"mb-4",children:e.jsxs(S,{className:"card-green-theme h-100",children:[e.jsxs(X,{className:"d-flex justify-content-between align-items-center border-bottom border-secondary pt-3 pb-3",children:[e.jsxs("h5",{className:"mb-0 fw-bold",children:[e.jsx(l,{icon:D,className:"me-2 text-warning"})," Hồ Sơ Vendor"]}),e.jsx("div",{className:"d-flex gap-2",children:c?e.jsxs(e.Fragment,{children:[e.jsxs(m,{color:"secondary",onClick:M,children:[e.jsx(l,{icon:K})," Hủy"]}),e.jsxs(m,{color:"success",className:"text-white",onClick:H,children:[e.jsx(l,{icon:W})," Lưu Lại"]})]}):e.jsxs(m,{color:"warning",className:"fw-bold",onClick:F,children:[e.jsx(l,{icon:k,className:"me-2"})," Sửa Hồ Sơ"]})})]}),e.jsxs(P,{className:"p-4",children:[e.jsxs("div",{className:"section-title",children:[e.jsx(l,{icon:G,className:"me-2"}),"Thanh Toán"]}),e.jsx("div",{className:"zalopay-integration-box",children:e.jsxs(C,{className:"align-items-center",children:[e.jsxs(t,{xs:12,md:8,children:[e.jsxs("div",{className:"d-flex align-items-center mb-2",children:[e.jsx("img",{src:"./Logo FA-13.png",width:"35",height:"35",alt:"ZaloPay",className:"me-3",style:{borderRadius:"8px"}}),e.jsx("h6",{className:"mb-0 fw-bold",children:"Ví Điện Tử ZaloPay"})]}),e.jsx("p",{className:"mb-0 small text-white-50",children:a.momoPartnerCode?`Tài khoản: ${a.momoPartnerCode}`:"Liên kết ZaloPay để nhận thanh toán doanh thu tự động."})]}),e.jsx(t,{xs:12,md:4,className:"text-md-end mt-3 mt-md-0",children:e.jsxs(m,{className:"btn-zalopay text-white fw-bold",onClick:()=>x(!0),children:[e.jsx(l,{icon:a.momoPartnerCode?k:re,className:"me-2"}),a.momoPartnerCode?"Đổi Ví":"Liên Kết"]})})]})}),e.jsxs("div",{className:"section-title",children:[e.jsx(l,{icon:O,className:"me-2"}),"Thông Tin Chung"]}),e.jsxs(C,{className:"mb-4",children:[e.jsxs(t,{md:6,className:"mb-3",children:[e.jsx(d,{className:"label-custom",children:"Tên Cửa Hàng"}),e.jsx(h,{name:"shopName",value:a.shopName,onChange:p,disabled:!c,className:"form-control-green"})]}),e.jsxs(t,{md:6,className:"mb-3",children:[e.jsx(d,{className:"label-custom",children:"Chủ Sở Hữu"}),e.jsx(h,{name:"ownerName",value:a.ownerName,onChange:p,disabled:!c,className:"form-control-green"})]}),e.jsxs(t,{md:6,className:"mb-3",children:[e.jsx(d,{className:"label-custom",children:"Số Điện Thoại"}),e.jsx(h,{name:"phone",value:a.phone,onChange:p,disabled:!c,className:"form-control-green"})]}),e.jsxs(t,{md:6,className:"mb-3",children:[e.jsx(d,{className:"label-custom",children:"Email"}),e.jsx(h,{value:a.email,disabled:!0,className:"form-control-green"})]}),e.jsxs(t,{xs:12,className:"mb-3",children:[e.jsx(d,{className:"label-custom",children:"Địa Chỉ"}),e.jsx(h,{name:"address",value:a.address,onChange:p,disabled:!c,className:"form-control-green"})]}),e.jsxs(t,{xs:12,children:[e.jsx(d,{className:"label-custom",children:"Giới Thiệu"}),e.jsx(Y,{name:"description",rows:3,value:a.description,onChange:p,disabled:!c,className:"form-control-green"})]})]})]})]})})]}),e.jsx(q,{visible:Z,onClose:()=>x(!1),alignment:"center",children:e.jsxs("div",{className:"modal-zalopay-theme",children:[e.jsx(ee,{children:e.jsx(ae,{children:"Liên Kết ZaloPay"})}),e.jsxs(Q,{children:[e.jsx("div",{className:"text-center mb-4",children:e.jsx("img",{src:"https://img.mservice.io/momo-payment/240404101918_62855100.png",width:"60",alt:"ZaloPay",style:{borderRadius:"12px"}})}),e.jsxs("div",{className:"mb-3",children:[e.jsx(d,{children:"Số điện thoại ZaloPay"}),e.jsx(h,{className:"form-control-green",placeholder:"0xxx",value:u,onChange:s=>z(s.target.value)})]}),e.jsx(oe,{color:"info",className:"small",children:"Vui lòng nhập đúng số điện thoại đã đăng ký ZaloPay để nhận tiền doanh thu hàng tuần."})]}),e.jsxs(se,{children:[e.jsx(m,{color:"secondary",onClick:()=>x(!1),children:"Đóng"}),e.jsx(m,{className:"btn-zalopay",onClick:I,children:"Xác Nhận"})]})]})})]})};export{ve as default};
