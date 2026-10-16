/* Small DOM adapter for the bundled WXML template. All story actions use the
   very same Page controller and engine as the native mini program. No network API. */
window.require=()=>Engine;
const asset=p=>p.startsWith('/assets/')?'../miniprogram'+p:p;
window.wx={
 getStorageSync:k=>JSON.parse(localStorage.getItem(k)||'null'),setStorageSync:(k,v)=>localStorage.setItem(k,JSON.stringify(v)),
 showModal:o=>{const confirm=o.showCancel===false?(alert(o.title+'\n'+o.content),true):window.confirm(o.title+'\n'+o.content);if(o.success)o.success({confirm});},
 showToast:o=>alert(o.title),previewImage:o=>window.open(asset(o.urls[0]),'_blank','noopener'),
 getImageInfo:o=>o.success({path:asset(o.src)}),
 saveImageToPhotosAlbum:o=>{const a=document.createElement('a');a.href=o.filePath;a.download='女娲补天-示例海报.jpg';a.click();wx.showToast({title:'已打开图片下载；手机也可点击海报后长按保存。'});}
};
let PAGE,lastScene='',readTop=0;
const evaluate=(exp,ctx)=>{try{return Function('c','with(c){return ('+exp+')}')(ctx);}catch(e){console.error('Template expression',exp,e);return '';}};
function value(s,ctx){if(/^{{[\s\S]*}}$/.test(s)&&s.indexOf('}}')===s.length-2)return evaluate(s.slice(2,-2),ctx);return s.replace(/{{([\s\S]*?)}}/g,(_,e)=>String(evaluate(e,ctx)??''));}
function text(s,ctx){return document.createTextNode(String(value(s,ctx)??''));}
function children(parent,list,ctx){let branch=false;for(const n of list){const a=n.attrs;if(a['wx:if']!==undefined){branch=!!value(a['wx:if'],ctx);if(!branch)continue;}else if(a['wx:else']!==undefined){if(branch)continue;branch=true;}else branch=false;
 if(a['wx:for']){(value(a['wx:for'],ctx)||[]).forEach((item,index)=>parent.appendChild(make(n,Object.assign({},ctx,{item,index}))));}else parent.appendChild(make(n,ctx));if(n.tail)parent.appendChild(text(n.tail,ctx));}}
function make(n,ctx){const a=n.attrs,tag=({view:'div',text:'span','scroll-view':'div',image:'img',swiper:'div','swiper-item':'div'})[n.tag]||n.tag;const el=document.createElement(tag);if(n.tag==='swiper-item')el.className='swiper-item';
 for(const [k,v]of Object.entries(a)){if(k.startsWith('wx:')||k.startsWith('bind')||k.startsWith('catch')||['mode','scroll-y','enhanced','show-scrollbar','scroll-top','current','indicator-dots','indicator-active-color','previous-margin','next-margin'].includes(k))continue;const val=value(v,ctx);if(k==='disabled'){el.disabled=!!val;continue;}if(k==='value'){el.value=val;continue;}el.setAttribute(k,k==='src'?asset(val):String(val));}
 if(n.text)el.appendChild(text(n.text,ctx));children(el,n.children,ctx);
 const handler=a.bindtap||a.catchtap;if(handler)el.addEventListener('click',event=>{if(a.catchtap)event.stopPropagation();PAGE[handler]({currentTarget:{dataset:{...el.dataset}},detail:{},target:event.target});});
 if(a.bindinput){el.dataset.input=a.bindinput;el.addEventListener('input',()=>PAGE[a.bindinput]({detail:{value:el.value}}));}
 if(n.tag==='swiper'){
  el.tabIndex=0;el.setAttribute('role','group');el.setAttribute('aria-label','古籍摘读，左右滑动或使用翻页按钮');
  el.addEventListener('scroll',()=>{
   clearTimeout(el._timer);
   el._timer=setTimeout(()=>{
    if(!el.isConnected||!el.clientWidth)return;
    const idx=Math.max(0,Math.min(el.children.length-1,Math.round(el.scrollLeft/el.clientWidth)));
    if(idx!==PAGE.data.bookIndex)PAGE.bookChange({detail:{current:idx}});
   },150);
  });
 }

 return el;
}
function render(){const host=document.getElementById('app');const old=host.querySelector('.reading');const scene=PAGE.data.v.id;readTop=scene===lastScene&&old?old.scrollTop:0;const active=document.activeElement;const focus=active?.dataset?.input;const start=active?.selectionStart,end=active?.selectionEnd;host.replaceChildren();children(host,TEMPLATE.children,PAGE.data);const r=host.querySelector('.reading');if(r)r.scrollTop=readTop;const b=host.querySelector('.books');if(b){b.scrollLeft=PAGE.data.bookIndex*b.clientWidth;addBookNavigation(b);}lastScene=scene;if(focus){const x=host.querySelector('[data-input="'+focus+'"]');if(x){x.focus({preventScroll:true});try{x.setSelectionRange(start,end);}catch(e){}}}}
function addBookNavigation(books){
 const nav=document.createElement('div');nav.className='book-navigation';
 const index=PAGE.data.bookIndex;
 const move=delta=>PAGE.bookChange({detail:{current:index+delta}});
 const previous=document.createElement('button');previous.textContent='← 上一卷';previous.disabled=index===0;previous.onclick=()=>move(-1);
 const status=document.createElement('span');status.textContent=`第 ${index+1} / ${books.children.length} 卷`;status.setAttribute('aria-live','polite');
 const next=document.createElement('button');next.textContent='下一卷 →';next.disabled=index===books.children.length-1;next.onclick=()=>move(1);
 nav.append(previous,status,next);books.after(nav);
 books.querySelectorAll('.book-toggle').forEach((button,i)=>{button.dataset.index=i;button.setAttribute('aria-expanded',String(PAGE.data.bookOpen&&index===i));});
}
window.Page=definition=>{PAGE=definition;PAGE.setData=function(patch){Object.assign(this.data,patch);render();};window.demoPage=PAGE;PAGE.onLoad();};
