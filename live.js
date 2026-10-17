/* Real API adapter; keys never leave the server. */
(() => {
  if(new URLSearchParams(location.search).get('test')==='poster'){
    const savedSet=wx.setStorageSync;wx.setStorageSync=(key,value)=>savedSet(key+'-poster-test',value);
    const saved=wx.getStorageSync('nuwa-demo-v1-poster-test');
    PAGE.state=saved?E.restore(saved):Object.assign(E.fresh(),{index:E.FLOW.indexOf('S13'),age:'9-10',moment:'repair'});
    PAGE.data.v=E.model(PAGE.state);PAGE.data.chat=false;
    const badge=document.createElement('div');badge.textContent='海报接口测试 · 独立于故事进度';badge.style.cssText='position:fixed;top:0;left:0;z-index:2000;background:#284d47;color:white;font-size:11px;padding:4px 8px;border-radius:0 0 8px 0';document.body.append(badge);
  }
  let busyChat=false,busyPoster=false,answer='',chatError='';
  const sessionReady=fetch('/api/session').then(r=>{if(!r.ok)throw Error('服务连接失败');});
  const journey=()=>PAGE.state.journeyId||(PAGE.state.journeyId=crypto.randomUUID());
  async function api(path,body){await sessionReady;const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.error||'请求失败');return d;}
  const button=(label,fn)=>{const b=document.createElement('button');b.className='secondary';b.textContent=label;b.onclick=fn;return b;};
  const oldRender=render;
  render=function(){oldRender();const s=PAGE.state;journey();
    const brand=document.querySelector('.topbar .brand');if(brand){const home=document.createElement('a');home.href='/';home.textContent=brand.textContent;home.title='返回首页';home.style.cssText='color:inherit;text-decoration:none';brand.replaceChildren(home);}
    const chat=document.querySelector('.chat-panel');
    if(chat){
      const note=chat.querySelector('.demo-note');if(note)note.textContent='实时 AI 助教 · 免费 GLM Flash · 回答仅供学习参考';
      chat.querySelector('.question')?.remove();chat.querySelector('.answer')?.remove();chat.querySelector('.chat-empty')?.remove();
      const box=document.createElement('div');box.style.cssText='max-height:55vh;overflow:auto';
      const response=document.createElement('div');response.className='answer';response.style.whiteSpace='pre-wrap';response.textContent=busyChat?'云启正在思考……':(chatError||answer||'你好，我是云启。你想了解女娲故事中的什么？');box.append(response);
      const input=document.createElement('textarea');input.className='description';input.maxLength=200;input.placeholder='例如：女娲为什么用五色石补天？（最多200字）';input.value=PAGE.chatDraft||'';input.oninput=()=>PAGE.chatDraft=input.value;box.append(input);
      const submit=button(busyChat?'正在回答……':'问问云启',async()=>{const q=input.value.trim();if(!q||busyChat)return;busyChat=true;chatError='';render();try{const d=await api('/api/chat',{question:q,ageBand:s.age,sceneId:E.FLOW[s.index]});answer=d.answer;}catch(e){chatError=e.message;}finally{busyChat=false;render();}});submit.disabled=busyChat;box.append(submit);
      chat.insertBefore(box,chat.lastElementChild);
    }
    const id=E.FLOW[s.index];
    if(id==='S13'){
      const description=document.querySelector('.description');
      if(description){
        const note=description.parentElement.querySelector('.demo-note');if(note)note.textContent='按你的描述实时生成1张竖版海报。每次旅程成功生成后保留同一张；也可选择示例体验。';
        const b=button(busyPoster?'正在绘制，请稍候……':'生成我的神话海报',async()=>{
          if(busyPoster)return;if(!s.moment||!s.description.trim()){PAGE.setData({notice:'请选择画面并填写描述。'});return;}
          busyPoster=true;PAGE.setData({notice:''});render();
          try{const d=await api('/api/poster',{journeyId:journey(),moment:s.moment,description:s.description,ageBand:s.age});s.poster=true;s.posterUrl=d.imageUrl;s.posterMode='live';s.game3=true;if(PAGE.state===s)PAGE.refresh();}
          catch(e){if(PAGE.state===s)PAGE.setData({notice:e.message+' 可重试或查看示例。'});}
          finally{busyPoster=false;render();}
        });b.disabled=busyPoster;description.parentElement.insertBefore(b,note||description.nextSibling);
      }
      if(s.poster&&s.posterMode==='live'){
        const note=document.querySelector('.poster')?.parentElement.querySelector('.demo-note');if(note)note.textContent='AI生成 · 根据本次描述绘制。本次旅程保留同一张海报。';
        for(const b of document.querySelectorAll('button'))if(b.textContent==='保存示例海报')b.textContent='保存我的AI海报';
      }
      if(s.poster&&new URLSearchParams(location.search).get('test')==='poster'){
        const host=document.querySelector('.poster')?.parentElement;
        if(host)host.append(button('开始新的海报测试',()=>{PAGE.state=Object.assign(E.fresh(),{index:E.FLOW.indexOf('S13'),age:'9-10',moment:'repair'});PAGE.setData({notice:''});PAGE.refresh();}));
      }
    }
    if(s.posterMode==='live'&&s.posterUrl){for(const img of document.querySelectorAll('.poster,.end-poster'))img.src=s.posterUrl;
      if(id==='S14'){const foot=document.querySelector('.footnote');if(foot)foot.textContent='四格漫画是选做拓展，暂未配置外部工具。海报由AI生成。';}}
    for(const b of document.querySelectorAll('button'))if(b.textContent.includes('查看示例海报'))b.disabled=busyPoster;
  };
  PAGE.preview=function(){wx.previewImage({urls:[this.state.posterMode==='live'?this.state.posterUrl:'/assets/painting.jpg']});};
  PAGE.savePoster=function(){const a=document.createElement('a');a.href=this.state.posterMode==='live'?this.state.posterUrl:asset('/assets/painting.jpg');a.download=this.state.posterMode==='live'?'神韵山海-AI海报.png':'女娲补天-示例海报.jpg';a.click();};
  const sample=PAGE.sample;PAGE.sample=function(){if(busyPoster)return;sample.call(this);if(this.state.poster){this.state.posterMode='sample';this.refresh();}};
  const restart=PAGE.restart;PAGE.restart=function(){if(busyPoster){this.setData({notice:'请等待海报生成完成再重新开始。'});return;}restart.call(this);};
  render();
})();
