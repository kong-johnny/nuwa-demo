const story = typeof require === 'function' ? require('./story') : STORY;
const FLOW=story.flow;
const BOOKS=[
 {id:'chuci',title:'楚辞 · 天问',source:'传统归于战国屈原',quote:'女娲有体，孰制匠之？',meaning:'女娲作为人类的创造者，她的形体又是谁所造就的？'},
 {id:'shanhaijing',title:'山海经 · 大荒西经',source:'卷十六 · 全书形成过程复杂',quote:'有神十人，名曰女娲之肠，化为神，处栗广之野。横道而处。',meaning:'女娲腹部化生的十位神人，居住在栗广之野，道旁而处。'},
 {id:'liji',title:'礼记 · 明堂位',source:'传世礼学文献',quote:'垂之和钟，叔之离磬，女娲之笙簧。',meaning:'文章列举古代器乐传统时，把“笙簧”与女娲联系起来。'}
];
const TASKS=['炼五色石，以补苍天','断鳌足，以立四极','杀黑龙，以济冀州','积芦灰，以止淫水'];
const LABELS=['开启神话之旅','进入女娲世界','认识女娲','继续追寻女娲','进入造人故事','看看女娲怎么做','让我也来试试','下一步 · 选衣色','下一步 · 选心愿','完成创作','继续神话','发生什么事了？','女娲会怎么办？','看看古籍中的办法','开始排列','核对顺序','继续','回顾我的经历','创作我的神话海报','进入拓展任务','返回我的海报'];
function fresh(){return {v:1,index:0,age:'',choices:{},books:[],head:'',color:'',wish:'',name:'',order:[],attempts:0,hint:false,game1:false,game2:false,game3:false,moment:'',description:'',poster:false};}
function restore(raw){const s=Object.assign(fresh(),raw&&raw.v===1?raw:{});s.index=Math.max(0,Math.min(20,Number(s.index)||0));if(!Array.isArray(s.books))s.books=[];if(!Array.isArray(s.order))s.order=[];return s;}
function ready(s){const id=FLOW[s.index];if(id==='S01')return !!s.age;if(['S03','S06','S09'].includes(id))return s.choices[id]!==undefined;if(id==='S04')return s.books.length===3;if(id==='G1_01')return !!s.head;if(id==='G1_02')return !!s.color;if(id==='G1_03')return !!s.wish;if(id==='G2_01')return s.order.length===4;if(id==='S13')return !!s.poster;return true;}
function choose(s,key){const id=FLOW[s.index];if(id==='S01')s.age=key;else if(id==='G1_01')s.head=key;else if(id==='G1_02')s.color=key;else if(id==='G1_03')s.wish=key;else if(id==='S13'){s.moment=key;}else s.choices[id]=Number(key);}
function next(s){if(!ready(s))return '请先完成当前的小任务。';const id=FLOW[s.index];if(id==='G2_01'){const wrong=s.order.findIndex((n,i)=>n!==i);if(wrong!==-1){s.attempts++;return '第'+(wrong+1)+'个位置还需要调整。'+(wrong===0?'先找到修补天空的那一项。':'可以查看原文提示。');}s.game2=true;}if(id==='G1_04')s.game1=true;if(id==='S14'){s.index=19;return '';}s.index=Math.min(20,s.index+1);return '';}
function sample(s){if(!s.moment||!s.description.trim())return '请先选画面，并写下你的描述。';if(s.description.length>120)return '描述请控制在120字以内。';s.poster=true;s.game3=true;return '';}
function model(s){const sc=story.scenes[s.index],id=sc.id;let options=[],selected='',feedback='';
 const sets={S01:[['6-8','6—8岁','看图发现'],['9-10','9—10岁','读故事解谜'],['11-12','11—12岁','神话创作']],S03:[['0','盘古开天地','天地如何开辟'],['1','女娲抟土造人','生命从何而来'],['2','女娲炼石补天','世界如何被守护']],S06:[['0','一捏一塑','抟黄土作人'],['1','挥绳成形','引绳于泥']],G1_01:[['round','圆圆脸','软萌可爱'],['oval','鹅蛋脸','灵动秀气'],['square','方圆脸','元气满满']],G1_02:[['red','朱砂红','温暖'],['blue','晴空蓝','清朗'],['yellow','杏子黄','明亮']],G1_03:[['friend','认识朋友','星光之愿'],['forest','守护山林','绿叶之愿'],['cloud','探索云彩','云纹之愿']],S09:[['0','天空有裂隙','修补苍天'],['1','大地摇摇欲坠','稳定天地'],['2','洪水中的人们','救护生命']],S12:[['0','造人的想象',''],['1','补天的勇气',''],['2','守护的力量','']],S13:[['creation','女娲造人',''],['repair','女娲补天',''],['restoration','世界安宁','']]};
 selected=id==='S01'?s.age:id==='G1_01'?s.head:id==='G1_02'?s.color:id==='G1_03'?s.wish:id==='S13'?s.moment:String(s.choices[id]);
 options=(sets[id]||[]).map(a=>({key:a[0],label:a[1],sub:a[2],active:a[0]===selected}));
 const feedbacks={S03:['盘古故事主要讲天地如何开辟。我们再找找人的起源吧。','对啦！抟土造人讲的是人从何而来的想象。','补天讲女娲怎样救护世界，另一个故事才在讲造人。'],S06:['她把黄土捏成一个个不同的人形。','传说她让更多人从泥点中出现。'],S09:['天空需要修补，才能重新遮护大地。','支撑天地的四极也需要重新稳固。','救护人们、止住灾害，同样十分重要。']};
 if(feedbacks[id]&&s.choices[id]!==undefined)feedback=feedbacks[id][s.choices[id]];
 const child=id.startsWith('G1')||['S07','S12'].includes(id);
 const hints={'6-8':'先找一找：谁在做什么？你看到了哪些颜色？','9-10':'留意人物、动作和背景，试着说出它们的联系。','11-12':'想一想：古籍记载与我们的故事改编有什么区别？'};
 return {id,index:s.index,title:sc.title.replace(/^.*?：/,''),narrator:sc.narrator,options,feedback,child,cover:id==='S00',books:BOOKS.map(b=>Object.assign({},b,{read:s.books.includes(b.id)})),bookCount:s.books.length,button:LABELS[s.index],ready:ready(s),progress:Math.round(s.index/20*100),age:s.age,hintText:hints[s.age]||'一卷山海，一场关于创造与守护的旅行。',head:s.head||'round',color:s.color||'yellow',wish:({friend:'星光之愿 · 认识朋友',forest:'绿叶之愿 · 守护山林',cloud:'云纹之愿 · 探索云彩'})[s.wish]||'每一种模样，都值得被喜欢',name:s.name,slots:[0,1,2,3].map((n)=>({pos:n,label:s.order[n]===undefined?'点击下方卡片':TASKS[s.order[n]],filled:s.order[n]!==undefined})),tasks:[2,0,3,1].map(n=>({key:n,label:TASKS[n],used:s.order.includes(n)})),attempts:s.attempts,hint:s.hint,original:TASKS.join('；')+'。',poster:s.poster,moment:s.moment,description:s.description,template:story.game3.defaultTemplates[s.moment]||'',game1:s.game1,game2:s.game2,game3:s.game3};
}
const Engine={FLOW,BOOKS,TASKS,fresh,restore,ready,choose,next,sample,model};
if(typeof module!=='undefined')module.exports=Engine;
