import{r as a,j as e,A as I}from"./index-C1KJssbB.js";import{c as d}from"./createLucideIcon-CHmH_pTm.js";import{P as L,S as P}from"./save-Dl6FaGVU.js";import{Z as D}from"./zap-DM5VdiO8.js";import{E as _}from"./eye-B0Lp8rGO.js";import{T as R}from"./trash-2-kWit_p0a.js";import{X as v}from"./x-kA5k0IeU.js";import{T as E}from"./triangle-alert-BpnGgcH0.js";const H=[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1",key:"bkv52"}],["path",{d:"M12 8v13",key:"1c76mn"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",key:"6wjy6b"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",key:"1ihvrl"}]],V=d("gift",H);const W=[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]],$=d("moon",W);const O=[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],j=d("square-pen",O);const q=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],B=d("sun",q);const G=[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",key:"vktsd0"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}]],X=d("tag",G),u=`${I}/sale.php`,te=()=>{const[o,k]=a.useState([]),[g,b]=a.useState(!1),[w,c]=a.useState(!1),[N,l]=a.useState(!1),[n,m]=a.useState("create"),[h,S]=a.useState(!1),[s,i]=a.useState({name:"",type:"Flash Sale",discount:"",status:"Active",start:"",end:"",usageLimit:""}),x=async()=>{try{const r=await(await fetch(`${u}?action=list`)).json();r.status==="success"&&k(r.data)}catch(t){console.error("Lỗi lấy danh sách ưu đãi:",t)}};a.useEffect(()=>{x()},[]);const p=(t,r=null)=>{m(t),i(r?{...r}:{name:"",type:"Flash Sale",discount:"",status:"Active",start:"",end:"",usageLimit:""}),c(!0)},C=t=>{i(t),l(!0)},z=async t=>{if(t.preventDefault(),!s.name||!s.discount)return;b(!0);const T={action:n==="edit"?"update":"create",...s};try{const y=await(await fetch(u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(T)})).json();y.status==="success"?(x(),c(!1)):alert("Lỗi: "+y.message)}catch{alert("Không thể kết nối đến máy chủ API!")}finally{b(!1)}},M=async()=>{try{const r=await(await fetch(u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"delete",id:s.id})})).json();r.status==="success"?(x(),l(!1)):alert("Lỗi xóa: "+r.message)}catch{alert("Lỗi kết nối API!")}},f={active:o.filter(t=>t.status==="Active").length,total:o.length,vouchers:o.filter(t=>t.type==="Voucher").length};return e.jsxs("div",{className:`sale-admin-wrapper ${h?"dark-mode":""}`,children:[e.jsx("style",{children:`
        /* BIẾN MÀU SẮC CHỦ ĐẠO */
        .sale-admin-wrapper {
          --bg-card: #ffffff;
          --bg-input: #ffffff;
          --bg-input-disabled: #f8f9fe;
          --text-main: #1b2559;
          --text-sub: #a3aed0;
          --border-color: #e0e5f2;
          --btn-action-bg: #f4f7fe;
          
          background: var(--bg-body);
          min-height: 100vh;
          padding: 20px;
          display: flex;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s ease;
        }

        /* CHẾ ĐỘ DARK MODE */
        .sale-admin-wrapper.dark-mode {
          --bg-body: #0b1437;
          --bg-card: #111c44;
          --bg-input: #1b254b;
          --bg-input-disabled: #0b1437;
          --text-main: #ffffff;
          --text-sub: #a3aed0;
          --border-color: #2b3674;
          --btn-action-bg: #1b254b;
        }

        .main-card { background: var(--bg-card); width: 100%; max-width: 1200px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.04); padding: 30px; border: 1px solid var(--border-color); }
        .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid var(--border-color); }
        
        .btn-create { background: #4318ff; color: white; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
        
        .stats-inner-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-item { background: var(--bg-card); padding: 20px; border-radius: 20px; display: flex; align-items: center; gap: 15px; border: 1px solid var(--border-color); }

        table { width: 100%; border-collapse: collapse; }
        th { padding: 15px 20px; text-align: left; color: var(--text-sub); font-size: 12px; text-transform: uppercase; }
        td { padding: 18px 20px; border-bottom: 1px solid var(--border-color); font-size: 14px; color: var(--text-main); }

        .btn-action { width: 34px; height: 34px; border-radius: 8px; border: none; background: var(--btn-action-bg); color: var(--text-sub); cursor: pointer; margin-left: 6px; }

        .overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px; }
        .modal-card { background: var(--bg-card); border-radius: 28px; width: 100%; max-width: 550px; padding: 35px; position: relative; border: 1px solid var(--border-color); margin: auto; }
        
        /* NÚT X ĐÓNG FORM */
        .btn-close-x {
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          border: none;
          color: var(--text-sub);
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .btn-close-x:hover {
          background: #fee2e2;
          color: #ef4444;
          transform: rotate(90deg);
        }

        .input-group { margin-bottom: 20px; }
        .input-group label { display: block; font-size: 11px; font-weight: 800; color: var(--text-sub); margin-bottom: 8px; text-transform: uppercase; }
        
        .input-group input, .input-group select { 
          width: 100%; 
          padding: 14px; 
          border: 1px solid var(--border-color); 
          border-radius: 14px; 
          background-color: var(--bg-input); 
          color: var(--text-main); 
          font-weight: 500;
          outline: none;
        }
        
        .input-group input:disabled, .input-group select:disabled { 
          background: var(--bg-input-disabled); 
          cursor: not-allowed; 
          opacity: 0.7;
        }

        .dark-mode-toggle {
          position: fixed; top: 20px; right: 20px; background: var(--bg-card); border: 1px solid var(--border-color);
          width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-main); box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 10;
        }

        .badge-Active { background: #e6fffa; color: #047857; }
        .badge-Expired { background: #fee2e2; color: #ef4444; }

        .btn-danger-outline {
          background: transparent;
          border: 1.5px solid #ef4444;
          color: #ef4444;
          padding: 12px 24px;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-danger-outline:hover {
          background: #ef4444;
          color: white;
        }
      `}),e.jsx("button",{className:"dark-mode-toggle",onClick:()=>S(!h),children:h?e.jsx(B,{size:20}):e.jsx($,{size:20})}),e.jsxs("div",{className:"main-card",children:[e.jsxs("div",{className:"header-section",children:[e.jsxs("div",{children:[e.jsx("h1",{style:{fontSize:"24px",fontWeight:800,color:"var(--text-main)"},children:"Quản lý Ưu đãi"}),e.jsx("p",{style:{color:"var(--text-sub)",fontSize:"14px"},children:"Theo dõi và điều chỉnh chiến dịch khuyến mãi"})]}),e.jsxs("button",{className:"btn-create",onClick:()=>p("create"),children:[e.jsx(L,{size:18})," Tạo chiến dịch"]})]}),e.jsxs("div",{className:"stats-inner-grid",children:[e.jsxs("div",{className:"stat-item",children:[e.jsx("div",{className:"icon-circle",style:{background:"#eef2ff",color:"#4318ff",width:40,height:40,borderRadius:10,display:"flex",alignItems:"center",justifyItems:"center",justifyContent:"center"},children:e.jsx(D,{size:18})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"12px",color:"var(--text-sub)"},children:"Đang chạy"}),e.jsx("b",{style:{fontSize:"18px",color:"var(--text-main)"},children:f.active})]})]}),e.jsxs("div",{className:"stat-item",children:[e.jsx("div",{className:"icon-circle",style:{background:"#ecfdf5",color:"#10b981",width:40,height:40,borderRadius:10,display:"flex",alignItems:"center",justifyItems:"center",justifyContent:"center"},children:e.jsx(V,{size:18})}),e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:"12px",color:"var(--text-sub)"},children:"Vouchers"}),e.jsx("b",{style:{fontSize:"18px",color:"var(--text-main)"},children:f.vouchers})]})]})]}),e.jsx("div",{style:{overflowX:"auto"},children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Chiến dịch"}),e.jsx("th",{children:"Loại"}),e.jsx("th",{children:"Mức giảm"}),e.jsx("th",{children:"Lượt dùng"}),e.jsx("th",{children:"Trạng thái"}),e.jsx("th",{style:{textAlign:"right"},children:"Thao tác"})]})}),e.jsxs("tbody",{children:[o.length===0&&e.jsx("tr",{children:e.jsx("td",{colSpan:"6",style:{textAlign:"center",padding:"30px"},children:"Chưa có chiến dịch nào."})}),o.map(t=>e.jsxs("tr",{children:[e.jsxs("td",{children:[e.jsx("div",{style:{fontWeight:700,color:"var(--text-main)"},children:t.name}),e.jsxs("div",{style:{fontSize:"12px",color:"var(--text-sub)"},children:[t.start||"..."," - ",t.end||"..."]})]}),e.jsx("td",{children:e.jsx("span",{style:{color:"var(--text-sub)"},children:t.type})}),e.jsx("td",{children:e.jsx("b",{style:{color:"#10b981"},children:t.type==="Voucher"?Number(t.discount).toLocaleString()+"đ":t.discount+"%"})}),e.jsx("td",{children:e.jsx("span",{style:{color:"var(--text-main)",fontSize:"13px",fontWeight:600},children:t.usage})}),e.jsx("td",{children:e.jsx("span",{style:{padding:"4px 10px",borderRadius:8,fontSize:11,fontWeight:700},className:`badge-${t.status}`,children:t.status==="Active"?"Hoạt động":"Kết thúc"})}),e.jsxs("td",{style:{textAlign:"right"},children:[e.jsx("button",{className:"btn-action",onClick:()=>p("view",t),children:e.jsx(_,{size:16})}),e.jsx("button",{className:"btn-action",onClick:()=>p("edit",t),children:e.jsx(j,{size:16})}),e.jsx("button",{className:"btn-action",style:{color:"#ef4444"},onClick:()=>C(t),children:e.jsx(R,{size:16})})]})]},t.id))]})]})})]}),w&&e.jsx("div",{className:"overlay",onClick:()=>c(!1),children:e.jsxs("form",{className:"modal-card",onClick:t=>t.stopPropagation(),onSubmit:z,children:[e.jsx("button",{type:"button",className:"btn-close-x",onClick:()=>c(!1),children:e.jsx(v,{size:22,strokeWidth:2.5})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"15px",marginBottom:"25px"},children:[e.jsx("div",{style:{background:"var(--btn-action-bg)",width:45,height:45,borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",color:"#4318ff"},children:e.jsx(X,{size:20})}),e.jsxs("div",{children:[e.jsx("h2",{style:{margin:0,fontSize:"18px",color:"var(--text-main)"},children:n==="create"?"Thêm mới chiến dịch":n==="edit"?"Chỉnh sửa chiến dịch":"Chi tiết chiến dịch"}),e.jsxs("p",{style:{margin:0,fontSize:"13px",color:"var(--text-sub)"},children:["Mã ID: ",s.id||"Tự động"]})]})]}),e.jsxs("div",{className:"input-group",children:[e.jsx("label",{children:"Tên chương trình"}),e.jsx("input",{disabled:n==="view",value:s.name,onChange:t=>i({...s,name:t.target.value}),placeholder:"Ví dụ: Giảm giá ngày nhà giáo...",required:!0})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"15px"},children:[e.jsxs("div",{className:"input-group",children:[e.jsx("label",{children:"Loại hình"}),e.jsxs("select",{disabled:n==="view",value:s.type,onChange:t=>i({...s,type:t.target.value}),children:[e.jsx("option",{value:"Flash Sale",children:"Flash Sale (%)"}),e.jsx("option",{value:"Voucher",children:"Voucher (vnđ)"}),e.jsx("option",{value:"Discount",children:"Giảm trực tiếp (%)"})]})]}),e.jsxs("div",{className:"input-group",children:[e.jsxs("label",{children:["Mức giảm ",s.type==="Voucher"?"(vnđ)":"(%)"]}),e.jsx("input",{disabled:n==="view",type:"number",value:s.discount,onChange:t=>i({...s,discount:t.target.value}),placeholder:"20",required:!0})]})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"15px"},children:[e.jsxs("div",{className:"input-group",children:[e.jsx("label",{children:"Ngày bắt đầu"}),e.jsx("input",{disabled:n==="view",type:"date",value:s.start||"",onChange:t=>i({...s,start:t.target.value})})]}),e.jsxs("div",{className:"input-group",children:[e.jsx("label",{children:"Ngày kết thúc"}),e.jsx("input",{disabled:n==="view",type:"date",value:s.end||"",onChange:t=>i({...s,end:t.target.value})})]})]}),n==="create"&&e.jsxs("div",{className:"input-group",children:[e.jsx("label",{children:"Giới hạn lượt dùng (Để trống = Không giới hạn)"}),e.jsx("input",{type:"number",value:s.usageLimit||"",onChange:t=>i({...s,usageLimit:t.target.value}),placeholder:"Ví dụ: 500"})]}),n!=="view"?e.jsxs("button",{className:"btn-create",disabled:g,style:{width:"100%",padding:"16px",justifyContent:"center",marginTop:"10px"},type:"submit",children:[e.jsx(P,{size:18})," ",g?"ĐANG XỬ LÝ...":n==="create"?"Kích hoạt ngay":"Lưu thay đổi"]}):e.jsxs("button",{type:"button",className:"btn-create",style:{width:"100%",background:"var(--btn-action-bg)",color:"#4318ff",justifyContent:"center"},onClick:()=>m("edit"),children:[e.jsx(j,{size:18})," Chuyển sang Chỉnh sửa"]})]},n)}),N&&e.jsx("div",{className:"overlay",onClick:()=>l(!1),children:e.jsxs("div",{className:"modal-card",style:{maxWidth:"400px",textAlign:"center"},onClick:t=>t.stopPropagation(),children:[e.jsx("button",{type:"button",className:"btn-close-x",onClick:()=>l(!1),children:e.jsx(v,{size:22,strokeWidth:2.5})}),e.jsx("div",{style:{background:"#fee2e2",color:"#ef4444",width:60,height:60,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"},children:e.jsx(E,{size:30})}),e.jsx("h2",{style:{color:"var(--text-main)",marginBottom:"10px"},children:"Xác nhận xóa?"}),e.jsxs("p",{style:{color:"var(--text-sub)",fontSize:"14px",marginBottom:"30px"},children:["Bạn có chắc chắn muốn xóa chiến dịch ",e.jsxs("strong",{children:['"',s.name,'"']}),"? Hành động này không thể hoàn tác."]}),e.jsxs("div",{style:{display:"flex",gap:"12px"},children:[e.jsx("button",{style:{flex:1,background:"var(--btn-action-bg)",color:"var(--text-main)",border:"none",padding:"12px",borderRadius:"14px",cursor:"pointer",fontWeight:700},onClick:()=>l(!1),children:"Hủy bỏ"}),e.jsx("button",{className:"btn-danger-outline",style:{flex:1},onClick:M,children:"Xóa ngay"})]})]})})]})};export{te as default};
