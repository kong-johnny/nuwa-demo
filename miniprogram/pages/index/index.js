const E=require('../../lib/engine');
const KEY='nuwa-demo-v1';
Page({
 data:{v:{},chat:false,answered:false,notice:'',bookIndex:0,bookOpen:false,shaking:false},
 onLoad(){try{this.state=E.restore(wx.getStorageSync(KEY));}catch(e){this.state=E.fresh();}this.refresh();},
 refresh(){this.setData({v:E.model(this.state)});try{wx.setStorageSync(KEY,this.state);}catch(e){this.setData({notice:'本机空间不足，进度暂时无法保存。'});}},
 pick(e){if(this.state.poster&&E.FLOW[this.state.index]==='S13')return;E.choose(this.state,String(e.currentTarget.dataset.key));this.setData({notice:''});this.refresh();},
 next(){const notice=E.next(this.state);this.setData({notice,bookOpen:false});this.refresh();},
 back(){if(this.state.index>0){this.state.index--;this.setData({notice:'',bookOpen:false});this.refresh();}},
 bookChange(e){this.setData({bookIndex:e.detail.current,bookOpen:false});},
 toggleBook(){const open=!this.data.bookOpen;if(open){const id=E.BOOKS[this.data.bookIndex].id;if(!this.state.books.includes(id))this.state.books.push(id);}this.setData({bookOpen:open});this.refresh();},
 task(e){const n=Number(e.currentTarget.dataset.key);if(!this.state.order.includes(n))this.state.order.push(n);this.setData({notice:''});this.refresh();},
 undo(e){this.state.order.splice(Number(e.currentTarget.dataset.pos),1);this.refresh();},
 clear(){this.state.order=[];this.setData({notice:''});this.refresh();},
 hint(){this.state.hint=true;this.refresh();},
 solve(){if(this.state.attempts>=3){this.state.order=[0,1,2,3];this.state.hint=true;this.refresh();}},
 nameInput(e){this.state.name=e.detail.value.slice(0,16);this.refresh();},
 descriptionInput(e){this.state.description=e.detail.value.slice(0,120);this.refresh();},
 useTemplate(){if(!this.state.poster){this.state.description=E.model(this.state).template;this.refresh();}},
 sample(){this.setData({notice:E.sample(this.state)});this.refresh();},
 openChat(){this.setData({chat:true});},closeChat(){this.setData({chat:false});},ask(){this.setData({answered:true});},noop(){},
 shake(){if(E.FLOW[this.state.index]==='S08'){this.setData({shaking:true});setTimeout(()=>this.setData({shaking:false}),500);}},
 preview(){wx.previewImage({urls:['/assets/painting.jpg']});},
 savePoster(){wx.getImageInfo({src:'/assets/painting.jpg',success:r=>wx.saveImageToPhotosAlbum({filePath:r.path,success:()=>wx.showToast({title:'示例海报已保存'}),fail:()=>wx.showModal({title:'未能保存到相册',content:'可点击海报进入预览后长按保存；也可在微信设置中检查相册权限。',showCancel:false})}),fail:()=>wx.showToast({title:'图片读取失败',icon:'none'})});},
 restart(){wx.showModal({title:'重新开始旅行？',content:'将清除本机的本次进度、人物选择和示例海报记录。',success:r=>{if(r.confirm){this.state=E.fresh();this.setData({notice:'',bookIndex:0,bookOpen:false,chat:false});this.refresh();}}});},
 review(){this.state.index=2;this.setData({notice:''});this.refresh();}
});
