/* Liella! ミキサー／ポータル共通データ
   全ページ（index.html ポータル / mixer.html / quiz.html / compare.html）から読み込む。 */

/* メンバー。c=イメージカラー(hex)、cn=公式のカラー名、bd=誕生日[月,日]、gen=期別 */
const MEMBERS = [
  {slug:"kanon",     name:"澁谷かのん",            en:"SHIBUYA KANON",     cv:"CV.伊達さゆり",   c:"#ff7f27", cn:"マリーゴールド",         bd:[5,1],   gen:1},
  {slug:"keke",      name:"唐可可",                en:"TANG KEKE",         cv:"CV.Liyuu",        c:"#38dfd4", cn:"パステルブルー",         bd:[7,17],  gen:1},
  {slug:"chisato",   name:"嵐千砂都",              en:"ARASHI CHISATO",    cv:"CV.岬なこ",       c:"#ff6e90", cn:"ピーチピンク",           bd:[2,25],  gen:1},
  {slug:"sumire",    name:"平安名すみれ",          en:"HEANNA SUMIRE",     cv:"CV.ペイトン尚未", c:"#74f466", cn:"メロングリーン",         bd:[9,28],  gen:1},
  {slug:"ren",       name:"葉月恋",                en:"HAZUKI REN",        cv:"CV.青山なぎさ",   c:"#3a3ad0", cn:"サファイアブルー",       bd:[11,24], gen:1},
  {slug:"kinako",    name:"桜小路きな子",          en:"SAKURAKOJI KINAKO", cv:"CV.鈴原希実",     c:"#ffd21e", cn:"メイズイエロー",         bd:[4,10],  gen:2},
  {slug:"mei",       name:"米女メイ",              en:"YONEME MEI",        cv:"CV.薮島朱音",     c:"#ff3535", cn:"ルージュ",               bd:[10,29], gen:2},
  {slug:"shiki",     name:"若菜四季",              en:"WAKANA SHIKI",      cv:"CV.大熊和奏",     c:"#57e0ab", cn:"アイスグリーンホワイト", bd:[6,17],  gen:2},
  {slug:"natsumi",   name:"鬼塚夏美",              en:"ONITSUKA NATSUMI",  cv:"CV.絵森彩",       c:"#ff51c4", cn:"オニナッツピンク",       bd:[8,7],   gen:2},
  {slug:"margarete", name:"ウィーン・マルガレーテ", en:"WIEN MARGARETE",    cv:"CV.結那",         c:"#e49dfd", cn:"エレガントパープル",     bd:[1,20],  gen:3},
  {slug:"fuyumari",  name:"鬼塚冬毬",              en:"ONITSUKA TOMARI",   cv:"CV.坂倉花",       c:"#4cd2e2", cn:"スモーキーブルー",       bd:[12,28], gen:3},
];

/* 曲。stem:true=声ステム＋伴奏、members省略時は全員 */
const SONGS = [
  { id:"skip", title:"スキップ・カプセル", stem:true, members:MEMBERS,
    fullBase:"audio/", vocalBase:"audio/vocal/", instBase:"audio/inst/", imgBase:"img/",
    full:{file:"full.m4a"},
    parts:[ {key:"drums",label:"ドラム",file:"drums.m4a"},
            {key:"bass", label:"ベース",file:"bass.m4a"},
            {key:"brass",label:"管楽器",file:"brass.m4a"},
            {key:"other",label:"その他",file:"other.m4a"} ] },
  { id:"orange", title:"オレンジのままで", stem:true, members:MEMBERS, cover:"img/orange_cover.jpg",
    spotify:"https://open.spotify.com/track/6dadcX0AZur4CcsU2TPqJC", apple:"https://music.apple.com/jp/album/1825102105",
    fullBase:"audio/orange/", vocalBase:"audio/orange/vocal/", instBase:"audio/orange/inst/", imgBase:"img/",
    full:{file:"full.m4a"},
    parts:[ {key:"drums",label:"ドラム",file:"drums.m4a"},
            {key:"bass", label:"ベース",file:"bass.m4a"},
            {key:"other",label:"その他",file:"other.m4a"} ] },
  { id:"universe", title:"UNIVERSE!!", stem:true, cover:"img/universe_cover.jpg",
    spotify:"https://open.spotify.com/track/27rVLAVa8XxQwugu3LqQ3H", apple:"https://music.apple.com/jp/album/1765314184",
    members:MEMBERS.filter(m=>["kanon","keke","chisato","sumire","ren","kinako","mei","shiki","natsumi"].includes(m.slug)),
    fullBase:"audio/universe/", vocalBase:"audio/universe/vocal/", instBase:"audio/universe/inst/", imgBase:"img/",
    full:{file:"full.m4a"},
    parts:[ {key:"drums",label:"ドラム",file:"drums.m4a"},
            {key:"bass", label:"ベース",file:"bass.m4a"},
            {key:"other",label:"その他",file:"other.m4a"} ] },
];

/* 重ね方プリセット。slugs=null は全員、[] はオケのみ */
const GROUPS = [
  {id:"all", label:"全員",  cat:"期別", slugs:null},
  {id:"inst",label:"オケのみ", cat:"期別", slugs:[]},
  {id:"g1",  label:"1期生", cat:"期別", slugs:["kanon","keke","chisato","sumire","ren"]},
  {id:"g2",  label:"2期生", cat:"期別", slugs:["kinako","mei","shiki","natsumi"]},
  {id:"g3",  label:"3期生", cat:"期別", slugs:["margarete","fuyumari"]},
  {id:"catchu",   label:"CatChu!",      cat:"ユニット", slugs:["kanon","sumire","mei"]},
  {id:"kaleido",  label:"KALEIDOSCORE", cat:"ユニット", slugs:["keke","ren","margarete"]},
  {id:"syncrise", label:"5yncri5e!",    cat:"ユニット", slugs:["chisato","kinako","shiki","natsumi","fuyumari"]},
];
const PRESET_CATS = ["期別","ユニット"];
const UNITS = GROUPS.filter(g=>g.cat==="ユニット");

/* 色ユーティリティ */
const hex2rgb=h=>{h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.substr(i,2),16));};
const lum=h=>{const[r,g,b]=hex2rgb(h);return (0.299*r+0.587*g+0.114*b)/255;};
const darken=(h,a)=>{const[r,g,b]=hex2rgb(h).map(x=>Math.round(x*(1-a)));return `rgb(${r},${g},${b})`;};
const tint=(h,a)=>{const[r,g,b]=hex2rgb(h);return `rgba(${r},${g},${b},${a})`;};
const textCol=h=>lum(h)>0.62?darken(h,0.45):h;

/* 共通ヘルパー */
const encPath=p=>encodeURI(p);
const iconOf=m=>encPath('img/'+m.slug+'_icon.png');
const artOf=m=>encPath('img/'+m.slug+'.png');
const unitOf=slug=>{const u=UNITS.find(g=>g.slugs.includes(slug));return u?u.label:'';};
const fmtTime=t=>{t=Math.max(0,t|0);return (t/60|0)+':'+String(t%60).padStart(2,'0');};

/* 誕生日：次の誕生日までの日数（今日なら0） */
function daysToBirthday(m,today){
  const now=today||new Date();
  const t=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  let d=new Date(now.getFullYear(),m.bd[0]-1,m.bd[1]);
  if(d<t) d=new Date(now.getFullYear()+1,m.bd[0]-1,m.bd[1]);
  return Math.round((d-t)/86400000);
}
/* 誕生日が近い順 */
function byUpcomingBirthday(today){
  return MEMBERS.slice().sort((a,b)=>daysToBirthday(a,today)-daysToBirthday(b,today));
}
