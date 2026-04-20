import{r as n,j as e,a as o,C as c,t as je,Q as ve,S as Y,N as P,A as v}from"./index-C1KJssbB.js";import{C as Ce}from"./CCard-TuxIymGC.js";import{C as ye}from"./CCardBody-BQ3fVMWd.js";import{C as x}from"./CFormInput-BLnGKak4.js";import{c as Ne}from"./cil-search-CDkY_4k-.js";import{c as we}from"./cil-plus-D8mtC-W5.js";import{C as ke,a as Se,b as ee,c as p,d as Te,e as g}from"./CTable-XePYIz1r.js";import{C as j,c as se}from"./cil-ban-BKV8qAqO.js";import{c as Ae}from"./cil-check-circle-BlU9eaow.js";import{c as _e}from"./cil-warning-C7g3f07Q.js";import{c as Ie}from"./cil-storage-t_tIazFU.js";import{c as Me}from"./cil-info-CmGCY32x.js";import{c as Pe}from"./cil-trash-CBbKHhHb.js";import{C as D,a as L}from"./CModalBody-Ci0NjX26.js";import{C as V,a as z,b as B}from"./CModalTitle-ALKUeE7b.js";import{C as h}from"./CFormControlWrapper-Bh3eI6Vk.js";import{C as H,a as l}from"./CRow-CTGywBGK.js";import{c as De}from"./cil-x-0440B5Ce.js";import{c as Le}from"./cil-cloud-upload-Ca9_6_ej.js";import{C as Ve}from"./CFormSelect-C6A1rZex.js";import{C as ze}from"./CFormTextarea-BtQBV6LL.js";import{c as Be}from"./cil-save-CHBg7z_U.js";import{C as $e}from"./CAlert-DQH8wuWN.js";var Fe=["512 512","<path fill='var(--ci-primary-color, currentColor)' d='M478.465,89.022,329.6,47.382,180.3,89.438,41.459,50.052h0A20,20,0,0,0,16,69.293v340.6a24.093,24.093,0,0,0,17.449,23.089l146.817,41.65,149.365-42.074,140.983,39.436A20,20,0,0,0,496,452.728V112.135A24.08,24.08,0,0,0,478.465,89.022ZM163,436.466,48,403.842V85.17l115,32.624Zm150.615-32.647L195,437.231V118.542L313.615,85.13ZM464,436.91,345.615,403.8V85.089L464,118.2Z' class='ci-primary'/>"],Oe=["512 512","<polygon fill='var(--ci-primary-color, currentColor)' points='348.071 141.302 260.308 229.065 172.545 141.302 149.917 163.929 237.681 251.692 149.917 339.456 172.545 362.083 260.308 274.32 348.071 362.083 370.699 339.456 282.935 251.692 370.699 163.929 348.071 141.302' class='ci-primary'/><path fill='var(--ci-primary-color, currentColor)' d='M425.706,86.294A240,240,0,0,0,86.294,425.706,240,240,0,0,0,425.706,86.294ZM256,464C141.309,464,48,370.691,48,256S141.309,48,256,48s208,93.309,208,208S370.691,464,256,464Z' class='ci-primary'/>"];const Xe=`${v}/handle_categories.php`,ae=(C="")=>({name:"",category:C,price:"",stock:"",unit:"kg",origin:"",description:"",status:"Còn hàng",images:[]}),hs=()=>{const[C,$]=n.useState([]),[y,F]=n.useState([]),[re,R]=n.useState(!0),[O,te]=n.useState(""),ne=JSON.parse(localStorage.getItem("user"))||{},N=localStorage.getItem("token"),w=ne.id,[oe,k]=n.useState(!1),[ce,S]=n.useState(!1),[ie,T]=n.useState(!1),[le,u]=n.useState(!1),[f,K]=n.useState(null),[t,de]=n.useState(null),[A,me]=n.useState(null),[_,U]=n.useState(null),[b,Z]=n.useState(""),[G,J]=n.useState(""),[a,m]=n.useState(()=>ae()),X=async()=>{if(w){R(!0);try{const r=await(await fetch(`${v}/get_products.php?vendor_id=${w}`,{headers:{Authorization:`Bearer ${N}`}})).json();if(Array.isArray(r)){const d=r.map(i=>{let M=[];try{M=i.images?JSON.parse(i.images):[]}catch{M=[]}return{...i,images:Array.isArray(M)?M:[]}});$(d)}else $([])}catch(s){console.error("Lỗi kết nối API:",s)}finally{R(!1)}}},he=async()=>{try{const r=await(await fetch(`${Xe}?action=list_parents`)).json();if(r.status==="success"&&Array.isArray(r.data)){const d=Array.from(new Set(r.data.map(i=>(i?.name||"").trim()).filter(Boolean)));F(d),m(i=>i.category?i:{...i,category:d[0]||""})}else F([])}catch(s){console.error("Lỗi tải danh mục:",s),F([])}};n.useEffect(()=>{X(),he()},[]);const xe=async()=>{if(!b||parseInt(b)<=0)return alert("Vui lòng nhập số lượng cộng thêm hợp lệ!");try{const r=await(await fetch(`${v}/update_stock.php`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${N}`},body:JSON.stringify({product_id:_.id,quantity_added:parseInt(b)})})).json();r.status==="success"?(alert(`Thành công! Đã cộng thêm ${b} vào kho.`),u(!1),Z(""),X()):alert("Lỗi: "+r.message)}catch{alert("Lỗi kết nối Server.")}},pe=async()=>{if(!a.name||!a.price)return alert("Vui lòng nhập tên và giá sản phẩm!");const s=new FormData;s.append("vendor_id",w),s.append("name",a.name),s.append("category",a.category),s.append("price",a.price),s.append("stock",a.stock),s.append("unit",a.unit),s.append("origin",a.origin),s.append("description",a.description),s.append("status",a.status),f&&s.append("id",f.id),a.images.forEach(r=>{typeof r=="string"?s.append("existing_images[]",r):s.append("new_images[]",r)});try{const i=await(await fetch(`${v}/${f?"update_product.php":"add_product.php"}`,{method:"POST",headers:{Authorization:`Bearer ${N}`},body:s})).json();i.status==="success"?(alert(f?"Cập nhật thành công!":"Thêm mới thành công!"),X(),k(!1)):alert("Lỗi: "+(i.message||"Không thể lưu"))}catch(r){console.error(r),alert("Lỗi kết nối đến Server.")}},ge=async()=>{if(A)try{const r=await(await fetch(`${v}/delete_product.php`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${N}`},body:JSON.stringify({id:A.id,vendor_id:w})})).json();r.status==="success"?($(C.filter(d=>d.id!==A.id)),T(!1)):alert("Không thể xóa: "+r.message)}catch{alert("Lỗi kết nối khi xóa.")}},ue=s=>{const r=Array.from(s.target.files);if(a.images.length+r.length>5)return alert("Chỉ được tối đa 5 ảnh.");m({...a,images:[...a.images,...r]}),s.target.value=null},fe=s=>{const r=a.images.filter((d,i)=>i!==s);m({...a,images:r})},I=(s=null)=>{s?(K(s),m({...s,images:Array.isArray(s.images)?s.images:[]})):(K(null),m(ae(y[0]||""))),k(!0)},Q=s=>{de(s);const r=s.images&&s.images.length>0?s.images[0]:"https://via.placeholder.com/300?text=No+Image";J(r),S(!0)},W=s=>new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(s),be=s=>{switch(s){case"Còn hàng":return"success";case"Hết hàng":return"danger";case"Sắp có hàng":return"warning";default:return"secondary"}},q=C.filter(s=>s.name.toLowerCase().includes(O.toLowerCase())||s.category.toLowerCase().includes(O.toLowerCase())),E=a.category&&!y.includes(a.category)?[a.category,...y]:y;return e.jsxs("div",{className:"product-page-container",children:[e.jsx("style",{children:`
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
    font-size: 0.85rem; 
  }

  .table-green-custom td { 
    padding: 16px; 
    vertical-align: middle; 
    border-bottom: 1px solid #f1f1f1; 
  }

  .product-avatar {
    width: 56px !important;
    height: 56px !important;
    min-width: 56px;
    min-height: 56px;
    border-radius: 50%;
    overflow: hidden;
  }

  .product-avatar .avatar-img {
    width: 56px !important;
    height: 56px !important;
    object-fit: cover;
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

  .badge-status { 
    padding: 5px 12px; 
    border-radius: 20px; 
    font-size: 0.8rem; 
    font-weight: 600; 
  }

  .badge-active { 
    background: #ecfdf5; 
    color: #065f46; 
    border: 1px solid #a7f3d0; 
  }

  .badge-out { 
    background: #fef2f2; 
    color: #991b1b; 
    border: 1px solid #fecaca; 
  }

  .badge-soon { 
    background: #fffbeb; 
    color: #92400e; 
    border: 1px solid #fde68a; 
  }

  .text-price { 
    color: #dc2626; 
    font-weight: 700; 
  }

  .btn-icon { 
    color: #6b7280; 
    transition: 0.2s; 
    opacity: 0.8; 
  }

  .btn-icon:hover { 
    color: #111827; 
    opacity: 1; 
    transform: scale(1.1); 
  }

  .btn-icon.delete:hover { 
    color: #dc2626; 
  }

  .image-upload-container { 
    display: flex; 
    gap: 10px; 
    flex-wrap: wrap; 
  }

  .image-preview-box { 
    width: 80px; 
    height: 80px; 
    border-radius: 8px; 
    position: relative; 
    border: 1px solid #e5e7eb; 
    overflow: hidden; 
    background: #f9fafb;
  }

  .image-preview-box img { 
    width: 100%; 
    height: 100%; 
    object-fit: cover; 
  }

  .btn-remove-img { 
    position: absolute; 
    top: 2px; 
    right: 2px; 
    background: rgba(220,38,38,0.85); 
    width: 20px; 
    height: 20px; 
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    cursor: pointer; 
    color: white; 
    font-size: 10px; 
  }

  .upload-btn-box { 
    width: 80px; 
    height: 80px; 
    border: 2px dashed #d1d5db; 
    border-radius: 8px; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    cursor: pointer; 
    color: #6b7280; 
    background: #ffffff;
  }

  .upload-btn-box:hover { 
    border-color: #9ca3af; 
    color: #111827; 
    background: #f9fafb; 
  }

  .detail-main-img { 
    width: 100%; 
    max-width: 300px; 
    height: 300px; 
    object-fit: cover; 
    border-radius: 12px; 
    background: #f3f4f6; 
    border: 1px solid #e5e7eb;
  }

  .detail-gallery-thumbs { 
    display: flex; 
    gap: 10px; 
    justify-content: center; 
    margin-top: 15px; 
  }

  .detail-thumb { 
    width: 50px; 
    height: 50px; 
    border-radius: 6px; 
    cursor: pointer; 
    opacity: 0.6; 
    border: 2px solid transparent; 
    object-fit: cover; 
  }

  .detail-thumb.active { 
    opacity: 1; 
    border-color: #9ca3af; 
  }

  .detail-label { 
    color: #6b7280; 
    font-size: 0.85rem; 
    margin-bottom: 2px; 
  }

  .detail-value { 
    font-weight: 600; 
    font-size: 1rem; 
    margin-bottom: 12px; 
    color: #111827;
  }

  .mobile-product-card { 
    background: #ffffff; 
    border: 1px solid #e5e7eb; 
    border-radius: 10px; 
    padding: 15px; 
    margin-bottom: 15px; 
    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  }

  .mobile-card-header { 
    display: flex; 
    align-items: center; 
    border-bottom: 1px dashed #e5e7eb; 
    padding-bottom: 10px; 
    margin-bottom: 10px; 
  }

  .mobile-card-img { 
    width: 60px; 
    height: 60px; 
    border-radius: 50%; 
    object-fit: cover; 
    border: 2px solid #e5e7eb; 
    margin-right: 15px; 
  }
`}),e.jsx(Ce,{className:"card-green-theme mb-4",children:e.jsxs(ye,{children:[e.jsxs("div",{className:"d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3",children:[e.jsx("h4",{className:"mb-0 fw-bold",style:{color:"#000000"},children:"Quản Lý Nông Sản"}),e.jsxs("div",{className:"d-flex gap-2 w-100 w-md-auto",children:[e.jsxs("div",{className:"position-relative w-100",style:{minWidth:"250px"},children:[e.jsx(x,{className:"form-control-green ps-5",placeholder:"Tìm sản phẩm...",value:O,onChange:s=>te(s.target.value)}),e.jsx(o,{icon:Ne,className:"position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"})]}),e.jsxs(c,{style:{backgroundColor:"#419c72",border:"none"},onClick:()=>I(),className:"text-white text-nowrap",children:[e.jsx(o,{icon:we,className:"me-2"})," Thêm mới"]})]})]}),re?e.jsx("div",{className:"text-center py-5",children:e.jsx(je,{color:"success"})}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"d-none d-md-block",children:e.jsxs(ke,{hover:!0,responsive:!0,className:"table-green-custom mb-0",children:[e.jsx(Se,{children:e.jsxs(ee,{children:[e.jsx(p,{children:"Sản Phẩm"}),e.jsx(p,{children:"Danh Mục"}),e.jsx(p,{children:"Xuất Xứ"}),e.jsx(p,{children:"Giá / Đơn vị"}),e.jsx(p,{children:"Kho"}),e.jsx(p,{className:"text-center",children:"Kiểm Duyệt"}),e.jsx(p,{children:"Trạng Thái"}),e.jsx(p,{className:"text-end",children:"Hành Động"})]})}),e.jsx(Te,{children:q.map(s=>{const r=s.images&&s.images.length>0?s.images[0]:"https://via.placeholder.com/60?text=No+Image",d=s.is_banned==1;return e.jsxs(ee,{className:d?"bg-danger bg-opacity-10":"",children:[e.jsx(g,{children:e.jsxs("div",{className:"d-flex align-items-center",children:[e.jsx(ve,{src:r,className:"me-3 product-avatar",style:{border:"2px solid #fff"}}),e.jsxs("div",{children:[e.jsxs("div",{className:"fw-semibold d-flex align-items-center",children:[s.name,d&&e.jsx(j,{content:"Sản phẩm bị cấm bán",children:e.jsx(o,{icon:se,className:"text-danger ms-2"})})]}),e.jsxs("div",{className:"small",style:{color:"#000000"},children:[e.jsx(o,{icon:Fe,size:"sm",className:"me-1"}),s.origin||"Chưa xác định"]})]})]})}),e.jsx(g,{children:s.category}),e.jsx(g,{children:s.origin}),e.jsxs(g,{children:[e.jsx("span",{className:"text-price",children:W(s.price)})," / ",s.unit]}),e.jsx(g,{className:"fw-bold",children:s.stock}),e.jsxs(g,{className:"text-center",children:[s.approval_status==="approved"&&e.jsx(j,{content:"Đã duyệt",children:e.jsx(o,{icon:Ae,className:"text-success"})}),s.approval_status==="pending"&&e.jsx(j,{content:"Chờ admin duyệt",children:e.jsx(o,{icon:_e,className:"text-warning"})}),s.approval_status==="rejected"&&e.jsx(j,{content:"Bị từ chối",children:e.jsx(o,{icon:Oe,className:"text-danger"})})]}),e.jsx(g,{children:e.jsx("span",{className:`badge-status ${s.status==="Còn hàng"?"badge-active":s.status==="Hết hàng"?"badge-out":"badge-soon"}`,children:s.status})}),e.jsxs(g,{className:"text-end",children:[e.jsx(j,{content:"Nhập thêm hàng",children:e.jsx(c,{color:"link",className:"btn-icon p-1 text-success",onClick:()=>{U(s),u(!0)},children:e.jsx(o,{icon:Ie,size:"xl"})})}),e.jsx(c,{color:"link",className:"btn-icon p-1",onClick:()=>Q(s),children:e.jsx(o,{icon:Me})}),e.jsx(c,{color:"link",className:"btn-icon p-1",onClick:()=>I(s),children:e.jsx(o,{icon:Y})}),e.jsx(c,{color:"link",className:"btn-icon delete p-1",onClick:()=>{me(s),T(!0)},children:e.jsx(o,{icon:Pe})})]})]},s.id)})})]})}),e.jsx("div",{className:"d-block d-md-none",children:q.map(s=>e.jsxs("div",{className:"mobile-product-card",children:[e.jsxs("div",{className:"d-flex justify-content-between mb-2",children:[e.jsx("span",{className:"fw-bold text-white",children:s.name}),s.is_banned==1&&e.jsx(P,{color:"danger",children:"Bị Cấm"})]}),e.jsxs("div",{className:"small text-white-50 mb-1",children:["Xuất xứ: ",s.origin]}),e.jsxs("div",{className:"small text-muted-custom mb-1",children:["Tồn kho: ",s.stock," ",s.unit]}),e.jsxs("div",{className:"text-end mt-2 pt-2 border-top border-secondary",children:[e.jsx(c,{size:"sm",color:"success",variant:"outline",className:"me-2",onClick:()=>{U(s),u(!0)},children:"Nhập kho"}),e.jsx(c,{size:"sm",color:"info",variant:"outline",className:"me-2",onClick:()=>Q(s),children:"Chi tiết"}),e.jsx(c,{size:"sm",color:"warning",variant:"outline",onClick:()=>I(s),children:"Sửa"})]})]},s.id))})]})]})}),e.jsx(D,{visible:le,onClose:()=>u(!1),alignment:"center",children:e.jsxs("div",{className:"modal-green-content",children:[e.jsx(V,{children:e.jsx(z,{children:"Nhập kho sản phẩm"})}),e.jsxs(L,{children:[e.jsxs("p",{children:["Sản phẩm: ",e.jsx("strong",{children:_?.name})]}),e.jsxs("p",{children:["Tồn hiện tại: ",e.jsxs(P,{color:"info",children:[_?.stock," ",_?.unit]})]}),e.jsxs("div",{className:"mt-3",children:[e.jsx(h,{children:"Số lượng cộng thêm vào kho:"}),e.jsx(x,{type:"number",className:"form-control-green",placeholder:"Ví dụ: 10",value:b,onChange:s=>Z(s.target.value)})]})]}),e.jsxs(B,{children:[e.jsx(c,{color:"secondary",onClick:()=>u(!1),children:"Hủy"}),e.jsx(c,{style:{backgroundColor:"#52b788",border:"none"},onClick:xe,className:"text-white",children:"Xác nhận nhập kho"})]})]})}),e.jsx(D,{visible:oe,onClose:()=>k(!1),size:"lg",alignment:"center",children:e.jsxs("div",{className:"modal-green-content",children:[e.jsx(V,{children:e.jsx(z,{children:f?"Cập Nhật Sản Phẩm":"Thêm Mới"})}),e.jsx(L,{children:e.jsxs(H,{children:[e.jsxs(l,{xs:12,className:"mb-3",children:[e.jsx(h,{children:"Hình ảnh (Tối đa 5)"}),e.jsxs("div",{className:"image-upload-container",children:[a.images.map((s,r)=>{const d=typeof s=="string"?s:URL.createObjectURL(s);return e.jsxs("div",{className:"image-preview-box",children:[e.jsx("img",{src:d,alt:"preview"}),e.jsx("span",{className:"btn-remove-img",onClick:()=>fe(r),children:e.jsx(o,{icon:De})})]},r)}),a.images.length<5&&e.jsxs(e.Fragment,{children:[e.jsxs("label",{htmlFor:"p-upload",className:"upload-btn-box",children:[e.jsx(o,{icon:Le,size:"xl"}),e.jsx("span",{style:{fontSize:"0.7rem"},children:"Upload"})]}),e.jsx(x,{type:"file",id:"p-upload",multiple:!0,accept:"image/*",style:{display:"none"},onChange:ue})]})]})]}),e.jsxs(l,{xs:12,className:"mb-3",children:[e.jsx(h,{children:"Tên Sản Phẩm"}),e.jsx(x,{className:"form-control-green",value:a.name,onChange:s=>m({...a,name:s.target.value})})]}),e.jsxs(l,{md:6,xs:12,className:"mb-3",children:[e.jsx(h,{children:"Danh Mục"}),e.jsx(Ve,{className:"form-select-green",value:a.category,onChange:s=>m({...a,category:s.target.value}),disabled:E.length===0,children:E.length===0?e.jsx("option",{value:"",children:"Chưa có danh mục khả dụng"}):E.map(s=>e.jsx("option",{value:s,children:s},s))})]}),e.jsxs(l,{md:6,xs:12,className:"mb-3",children:[e.jsx(h,{children:"Xuất Xứ"}),e.jsx(x,{className:"form-control-green",placeholder:"Ví dụ: Đà Lạt, Tiền Giang...",value:a.origin,onChange:s=>m({...a,origin:s.target.value})})]}),e.jsxs(l,{xs:6,className:"mb-3",children:[e.jsx(h,{children:"Giá (VNĐ)"}),e.jsx(x,{type:"number",className:"form-control-green",value:a.price,onChange:s=>m({...a,price:s.target.value})})]}),e.jsxs(l,{xs:3,className:"mb-3",children:[e.jsx(h,{children:"Kho"}),e.jsx(x,{type:"number",className:"form-control-green",value:a.stock,onChange:s=>m({...a,stock:s.target.value})})]}),e.jsxs(l,{xs:3,className:"mb-3",children:[e.jsx(h,{children:"Đơn vị"}),e.jsx(x,{className:"form-control-green",value:a.unit,onChange:s=>m({...a,unit:s.target.value})})]}),e.jsxs(l,{xs:12,className:"mb-3",children:[e.jsx(h,{children:"Mô tả"}),e.jsx(ze,{rows:3,className:"form-control-green",value:a.description,onChange:s=>m({...a,description:s.target.value})})]})]})}),e.jsxs(B,{children:[e.jsx(c,{color:"secondary",onClick:()=>k(!1),children:"Hủy"}),e.jsxs(c,{style:{backgroundColor:"#52b788",border:"none"},onClick:pe,className:"text-white",children:[e.jsx(o,{icon:Be,className:"me-2"}),"Lưu"]})]})]})}),e.jsx(D,{visible:ce,onClose:()=>S(!1),size:"lg",alignment:"center",children:e.jsxs("div",{className:"modal-green-content",children:[e.jsx(V,{children:e.jsx(z,{children:"Chi Tiết Sản Phẩm"})}),e.jsx(L,{children:t&&e.jsxs(e.Fragment,{children:[t.is_banned==1&&e.jsxs($e,{color:"danger",className:"d-flex align-items-center mb-4",children:[e.jsx(o,{icon:se,className:"flex-shrink-0 me-2",size:"xl"}),e.jsx("div",{children:e.jsx("strong",{children:"Sản phẩm này đã bị Admin cấm bán!"})})]}),e.jsxs(H,{children:[e.jsxs(l,{md:5,className:"text-center mb-3",children:[e.jsx("img",{src:G,className:"detail-main-img",alt:"Product"}),e.jsx("div",{className:"detail-gallery-thumbs",children:t.images&&t.images.map((s,r)=>e.jsx("img",{src:s,className:`detail-thumb ${G===s?"active":""}`,onClick:()=>J(s)},r))})]}),e.jsxs(l,{md:7,className:"ps-md-4",children:[e.jsx("h3",{className:"fw-bold mb-1",children:t.name}),e.jsxs("div",{className:"mb-3 text-muted-custom small",children:["Mã SP: #",t.id]}),e.jsxs("div",{className:"d-flex gap-2 mb-3",children:[e.jsx(P,{color:be(t.status),shape:"rounded-pill",children:t.status}),e.jsx(P,{color:t.approval_status==="approved"?"success":"warning",shape:"rounded-pill",children:t.approval_status==="approved"?"Đã Kiểm Duyệt":"Chờ Duyệt"})]}),e.jsxs(H,{children:[e.jsxs(l,{xs:6,children:[e.jsx("div",{className:"detail-label",children:"Danh mục"}),e.jsx("div",{className:"detail-value",children:t.category})]}),e.jsxs(l,{xs:6,children:[e.jsx("div",{className:"detail-label",children:"Xuất xứ"}),e.jsx("div",{className:"detail-value",children:t.origin||"Chưa xác định"})]})," ",e.jsxs(l,{xs:6,children:[e.jsx("div",{className:"detail-label",children:"Giá bán"}),e.jsxs("div",{className:"detail-value text-price",children:[W(t.price)," / ",t.unit]})]}),e.jsxs(l,{xs:6,children:[e.jsx("div",{className:"detail-label",children:"Kho hiện tại"}),e.jsxs("div",{className:"detail-value",children:[t.stock," ",t.unit]})]})]}),e.jsx("div",{className:"detail-label mt-2",children:"Mô tả chi tiết:"}),e.jsx("p",{className:"detail-value fw-normal small opacity-75 border-top pt-2",children:t.description||"Chưa có mô tả."})]})]})]})}),e.jsxs(B,{children:[e.jsx(c,{color:"secondary",onClick:()=>S(!1),children:"Đóng"}),e.jsxs(c,{style:{backgroundColor:"#52b788",border:"none"},onClick:()=>{S(!1),I(t)},className:"text-white",children:[e.jsx(o,{icon:Y,className:"me-2"})," Sửa Thông Tin"]})]})]})}),e.jsx(D,{visible:ie,onClose:()=>T(!1),alignment:"center",children:e.jsxs("div",{className:"modal-green-content",children:[e.jsx(V,{children:e.jsx(z,{className:"text-danger",children:"Xóa Sản Phẩm?"})}),e.jsxs(L,{children:["Bạn có chắc muốn xóa ",e.jsx("strong",{children:A?.name})," không?"]}),e.jsxs(B,{children:[e.jsx(c,{color:"secondary",onClick:()=>T(!1),children:"Hủy"}),e.jsx(c,{color:"danger",className:"text-white",onClick:ge,children:"Xóa Luôn"})]})]})})]})};export{hs as default};
