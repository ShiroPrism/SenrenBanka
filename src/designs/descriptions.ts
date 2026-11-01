/**
 * 各套设计在**切换页**上的本地化说明（SPEC §4）。
 *
 * - 与 `src/designs/<id>/messages.ts` 同源：这里只是把各设计的 `description`
 *   汇总成切换页可一次取用的索引，避免切换页去 import 8 个设计模块
 *   （那会给切换页带来不必要的模块边）。
 * - 纯数据，**不 import 任何 CSS / Page.astro / style.css**。
 * - 缺键时回退 `design.json.description`（英文/原始描述），由调用方处理。
 */

export const designDescriptions: Record<string, Record<string, string>> = {
  brutal: {
    'zh-CN': '新粗野告示板：粗黑描边、硬偏移阴影、酸性高亮与超大字号，把资料做成一块块不容忽视的标牌。',
    ja: 'ネオ・ブルータルの掲示板——太い黒枠、硬いオフセット影、アシッドな差し色と巨大な文字で、プロフィールを無視できない看板に。',
    en: 'A neo-brutalist noticeboard: thick black outlines, hard offset shadows, acid highlights and oversized type turn the profile into signs you cannot ignore.',
    ko: '네오 브루탈리즘 게시판 — 굵은 검정 테두리, 단단한 오프셋 그림자, 애시드 형광 강조와 거대한 글자로 프로필을 무시할 수 없는 표지판으로.',
  },
  deco: {
    'zh-CN': 'Art Deco 剧院节目单：墨黑台面、黄铜双线框、金色扇形与对称版式，把资料排成一册夜场演出手册。',
    ja: 'アール・デコの劇場プログラム——黒い舞台、真鍮の二重罫線、金色の扇、対称的な組版で夜の公演冊子に。',
    en: 'An Art Deco theatre programme: an ink-black stage, brass double rules, golden fans and symmetry turn the profile into an evening playbill.',
    ko: '아르데코 극장 프로그램 — 먹빛 무대, 황동 이중 괘선, 금빛 부채꼴과 대칭 조판으로 프로필을 한 편의 야간 공연 안내서로.',
  },
  ink: {
    'zh-CN': '宋式册页：宣纸底色、一列竖排题署、朱砂小印与青瓷细线，把资料排成一页摊开的册页。',
    ja: '宋版の冊子——宣紙の地、縦組みの題署、朱砂の小印、青磁の細線で、プロフィールを開いた一頁に。',
    en: 'A Song-style album leaf: rice-paper ground, a vertical title column, cinnabar seal and celadon rules lay the profile out as an opened page.',
    ko: '송식 화첩 — 화선지 바탕, 세로쓰기 제서, 주사 작은 인장과 청자 괘선으로 프로필을 펼친 한 장에.',
  },
  'fairy-kei': {
    'zh-CN': '复古少女玩具收藏箱：打开的展示盒、悬挂链接饰品与包装卡资料，糖果色贴纸和多层陈列组成不对称主页。',
    ja: 'レトロな少女の玩具コレクション——開いたショーケース、吊り下げチャームのリンク、パッケージカードのプロフィール。',
    en: 'A retro-girl toy collection case: an open display, charm-like links and a packaging-card profile in candy colours.',
    ko: '레트로 소녀 장난감 컬렉션 케이스 — 열린 진열장, 매달린 참 링크, 패키지 카드형 프로필. 캔디 컬러 스티커와 여러 겹 진열이 비대칭 홈을 이룹니다.',
  },
  'sticker-diary': {
    'zh-CN': '手帐贴纸日记：跨页笔记本、胶带、手写批注和页边书签，把所有资料逐页贴进一本自己的剪贴簿。',
    ja: 'ステッカー手帳の日記——見開きノート、テープ、手書きの注釈と栞でプロフィールを綴る。',
    en: 'A sticker diary: notebook spreads, tape, handwritten notes and bookmarks turn the profile into a scrapbook.',
    ko: '스티커 다이어리 — 노트 펼침면, 테이프, 손글씨 메모와 책갈피로 프로필을 한 권의 스크랩북에 붙여 둡니다.',
  },
  'pixel-pet-rpg': {
    'zh-CN': '像素宠物小镇：HUD、地图节点与地点面板组成可探索档案，项目是目的地，链接是物品栏。',
    ja: 'ピクセルペットの町——HUD、マップ地点、場所パネルでプロフィールを探索。プロジェクトは目的地、リンクは持ち物。',
    en: 'A pixel pet town: HUD, map stations and location panels turn links into inventory and projects into destinations.',
    ko: '픽셀 펫 타운 — HUD, 지도 지점, 장소 패널로 프로필을 탐험합니다. 링크는 소지품, 프로젝트는 목적지가 됩니다.',
  },
  'little-forest': {
    'zh-CN': '童话森林绘本：从入口木牌沿小径走向小屋，用路标、树轮与植物标本组织安静的资料叙事。',
    ja: 'おとぎの森の絵本——入口の看板から小道をたどり、道しるべ、年輪、植物標本でプロフィールを綴る。',
    en: 'A picture-book forest trail: an entrance sign, signposts, tree rings, botanical specimens and a cottage at the end.',
    ko: '동화 속 숲 그림책 — 입구 팻말에서 오솔길을 따라 오두막까지, 이정표와 나이테, 식물 표본으로 차분하게 풀어낸 프로필.',
  },
  'cute-alism': {
    'zh-CN': '硬核糖果拼贴：粗黑描边、硬阴影、夸张标题与错位色块贯穿全页，资料成为一套几何视觉系统。',
    ja: 'ハードキャンディ・コラージュ——太い黒線、ハードシャドウ、巨大な見出しと色ブロックで全編を構成。',
    en: 'Hard-candy collage: thick black outlines, hard shadows, oversized type and colour blocks across every section.',
    ko: '하드 캔디 콜라주 — 굵은 검정 외곽선, 단단한 그림자, 과장된 제목과 어긋난 색면이 전 페이지를 채웁니다.',
  },
  'magical-girl': {
    'zh-CN': '魔法少女档案：角色档案与舞台登场，用原创星轨、丝带、魔法阵和章回卡片组织华丽资料。',
    ja: '魔法少女のプロフィール——キャラクターカードと舞台登場。オリジナルの星の軌跡、リボン、魔法陣、章カードで構成。',
    en: 'A magical-girl dossier: a staged character entrance with original star trails, ribbons, magic circles and episode cards.',
    ko: '마법소녀 기록 — 캐릭터 기록과 무대 등장. 별길, 리본, 마법진, 장 카드로 꾸민 화려한 프로필.',
  },
  homepage99: {
    'zh-CN': '1999 年个人主页：左目录、密集中栏与徽章轨，粗双线、系统字体与离线计数器。',
    ja: '1999年の個人ホームページ——左の目次、密度のある本文、バッジの列。太い二重罫線とシステム書体、オフラインのカウンター。',
    en: "A 1999 personal homepage: left directory, dense main column and badge rail, with double rules, system fonts and an offline counter.",
    ko: '1999년 개인 홈페이지 — 왼쪽 목차, 빽빽한 가운데 단과 배지 레일. 굵은 이중 괘선, 시스템 글꼴, 오프라인 카운터.',
  },
  'html-only': {
    'zh-CN': '原生 HTML：只靠语义结构与浏览器默认样式呈现完整资料，不加载自定义 CSS 或 JavaScript。',
    ja: '素の HTML——意味構造とブラウザ既定の表示だけでプロフィールを提示し、独自の CSS や JavaScript を読み込まない。',
    en: 'Native HTML: the complete profile through semantic structure and browser defaults, with no custom CSS or JavaScript.',
    ko: '네이티브 HTML — 의미 구조와 브라우저 기본 스타일만으로 전체 프로필을 표시하며, 사용자 CSS나 JavaScript를 불러오지 않습니다.',
  },
  editorial: {
    'zh-CN': '杂志编排：一期一人，克制而讲究的留白与发丝线。',
    ja: '雑誌の組版——一期に一人。抑制的で、余白と罫線を重んじる。',
    en: 'Magazine layout: one person per issue, restrained whitespace and hairline rules.',
    ko: '잡지 편집 — 한 호에 한 사람. 절제된 여백과 실 같은 구분선.',
  },
  fast: {
    'zh-CN': '极简单色：紧凑栅格、无装饰，优先保证信息密度与加载速度。',
    ja: '極簡のモノクロ——密なグリッドと装飾なし。情報密度と速度を優先。',
    en: 'Minimal monochrome: a tight grid, no decoration, prioritising density and speed.',
    ko: '미니멀 모노크롬 — 촘촘한 그리드, 장식 없음. 정보 밀도와 속도 우선.',
  },
  frost: {
    'zh-CN': '毛玻璃与极光：柔和渐层、悬浮卡片，苹果风光的克制复刻。',
    ja: 'グラスとオーロラ——柔らかなレイヤーと浮遊するカード。Apple HIG の再現。',
    en: 'Frosted glass and aurora: soft layers, floating cards, a restrained Apple HIG echo.',
    ko: '프로스트 글라스와 오로라 — 부드러운 레이어, 떠 있는 카드. Apple HIG의 절제된 재현.',
  },
  govuk: {
    'zh-CN': 'GOV.UK 设计系统：强对比、方正栅格与标志性的黄色焦点样式。',
    ja: 'GOV.UK Design System——高いコントラストと正味のあるグリッド。',
    en: 'The GOV.UK Design System: high contrast, a strict grid and unmistakable focus styles.',
    ko: 'GOV.UK 디자인 시스템 — 강한 대비, 반듯한 그리드, 상징적인 포커스 스타일.',
  },
  kern: {
    'zh-CN': '瑞士排版：网格骨架、十字准星与紧凑的标签式信息组织。',
    ja: 'スイス・タイポグラフィ——グリッド骨格と十字、そして簡潔なラベル構成。',
    en: 'Swiss typography: a grid skeleton, crosshairs and tightly labelled information.',
    ko: '스위스 타이포그래피 — 그리드 골격과 십자 표시, 간결한 라벨 구성.',
  },
  material3: {
    'zh-CN': 'Material 3 设计系统：圆角、动态配色与大触控目标的宽屏双窗格。',
    ja: 'Material 3——角丸とダイナミックカラー、大きなタッチターゲット。',
    en: 'Material 3: rounded geometry, dynamic colour and generous touch targets.',
    ko: 'Material 3 디자인 시스템 — 둥근 모서리와 다이내믹 컬러, 넉넉한 터치 영역의 와이드 2단 구성.',
  },
  oxide: {
    'zh-CN': '终端风格：等宽排版、频道标签与顶部滚动进度线。',
    ja: 'ターミナル風——等幅書体、チャンネルラベルとスクロール進捗線。',
    en: 'Terminal-flavoured: monospace type, channel labels and a scroll progress line.',
    ko: '터미널 풍 — 고정폭 서체, 채널 라벨, 상단 스크롤 진행선.',
  },
  terminal: {
    'zh-CN': '真实终端会话：命令、逐字输入级联与输出式分区。',
    ja: '本物のターミナルセッション——コマンドとタイピング表示。',
    en: 'A real terminal session: commands, a typing cascade and output-shaped sections.',
    ko: '실제 터미널 세션 — 명령어, 타이핑 캐스케이드, 출력 형태의 섹션.',
  },
  receipt: {
    'zh-CN': '热敏小票机：一卷从票机吐出的长票，撕边、点引导线与七段数字。',
    ja: 'サーマルレシート——レシート機から出てくる長い紙、ミシン目とセグメント数字。',
    en: 'A thermal receipt: a long printed slip with torn edges, dot leaders and seven-segment digits.',
    ko: '감열 영수증 — 영수증기에서 나온 긴 종이. 뜯긴 가장자리, 점선 안내선, 세그먼트 숫자.',
  },
  archive: {
    'zh-CN': '图书馆卡片目录：一屉拉开的索引卡，打字机条目与归档印章。',
    ja: '図書館のカード目録——引き出した索引カードとタイプの記録、収蔵印。',
    en: 'A library card catalogue: a pulled-open drawer of index cards, typed entries and an archive stamp.',
    ko: '도서관 카드 목차 — 당겨 놓은 색인 카드 서랍, 타자로 찍은 기록과 보관 도장.',
  },
  radio: {
    'zh-CN': '短波收音机面板：刻度盘、琥珀指示灯与仪表模块。',
    ja: '短波受信機のパネル——ダイヤル、琥珀色のランプ、計器モジュール。',
    en: 'A shortwave receiver faceplate: tuning dial, amber lamps and instrument modules.',
    ko: '단파 수신기 패널 — 다이얼, 호박색 램프, 계기 모듈.',
  },
  fax: {
    'zh-CN': '传真机传输纸：传输表头、走纸孔与磨损的打字机字面。',
    ja: 'ファックスの送信紙——ヘッダー表、送り穴、かすれたタイプ文字。',
    en: 'A fax transmission sheet: header table, tractor holes and worn typewriter type.',
    ko: '팩스 전송지 — 전송 헤더 표, 이송 구멍, 닳은 타자 글자.',
  },
  pager: {
    'zh-CN': '寻呼机：单色 LCD、状态栏与逐条消息。',
    ja: 'ポケットベル——単色 LCD、ステータスバー、メッセージ一覧。',
    en: 'A pager: monochrome LCD, status bar and a list of messages.',
    ko: '삐삐 — 단색 LCD, 상태 표시줄, 한 줄씩 쌓이는 메시지.',
  },
  tape: {
    'zh-CN': '磁带与 J 卡：手写标签、曲目单与卷轴窗。',
    ja: 'カセットと J カード——手書きラベル、曲目リスト、リール窓。',
    en: 'A cassette and its J-card: handwritten label, track list and reel windows.',
    ko: '카세트와 J카드 — 손글씨 라벨, 수록곡 목록, 릴 창.',
  },
  poster: {
    'zh-CN': '丝网印刷海报：巨幅窄体标题、镂空字与套准标记。',
    ja: 'シルクスクリーンのポスター——巨大なコンデンス体、ステンシル、見当マーク。',
    en: 'A screen-print poster: oversized condensed display, stencil cuts and registration marks.',
    ko: '실크스크린 포스터 — 거대한 컨덴스드 제목, 스텐실 글자, 긴 괘선과 겹침 표시.',
  },
  lexicon: {
    'zh-CN': '三语辞典跨页：词条头、释义与参照项。',
    ja: '三言語の辞書見開き——見出し語、語義、参照項目。',
    en: 'A trilingual dictionary spread: headwords, definitions and cross-references.',
    ko: '다국어 사전 펼침면 — 표제어와 뜻풀이, 참조 항목.',
  },
};
