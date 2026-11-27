import type { Textos } from "../site";

// 日本語: pt.ts からの翻訳。
export const ja: Textos = {
  meta: {
    titulo: "Daniel Tinois、フルスタック開発者",
    descricao: "サンパウロの Verzel で働くフルスタック開発者（ミドル）。React、Next、Flutter、Node、Spring。プロジェクト、経歴、連絡先。",
  },
  ui: {
    pular: "本文へスキップ",
    secoes: "セクション",
    idioma: "言語",
    titulos: { projetos: "プロジェクト", trajetoria: "経歴", contato: "連絡先" },
    cidade: "サンパウロ",
    contribuicoes12m: "12か月で {n} コントリビューション",
    revisao: "更新",
    dica: "空か湖をクリック",
    cena: "写真のようなアスキーアートの情景：夜の崖の上に明かりのともる城、満月を映す湖へ落ちる滝、周りを囲む松林、そして時々空を横切るドラゴン。",
    stats: {
      legenda: "GitHub での公開コントリビューション（{de}〜{ate}）。",
      total: "12か月のコントリビューション",
      dias: "コントリビューションした日",
      sequencia: "最長連続記録",
      unidadeDias: "{n} 日",
      semanaPico: "最も多かった週",
      ver: "週ごとのデータを見る",
      semanaDe: "週の開始日",
      contribuicoes: "コントリビューション",
      emCurso: "（進行中）",
    },
    projeto: {
      problema: "課題",
      comoFunciona: "しくみ",
      dificil: "難しいところ",
      estado: "状況",
      papel: "役割",
      stack: "技術スタック",
      codigo: "コード",
    },
    copiar: { acao: "コピー", copiado: "コピーしました", falhou: "コピーできませんでした", rotulo: "メールアドレスをコピー" },
    voltarTopo: "トップへ戻る",
  },
  perfil: {
    cargo: "サンパウロの Verzel で働くフルスタック開発者（ミドル）。",
    resumo:
      "React と Next で Web を、Flutter でモバイルを、Node と Spring で API を作っています。イベントを失わず、データをでっち上げず、消してはいけないものを消さないソフトウェアを書きます。",
  },
  especificacoes: [
    { k: "所在地", v: "ブラジル・サンパウロ" },
    { k: "Web", v: "React, Next.js, TypeScript" },
    { k: "モバイル", v: "Flutter" },
    { k: "バックエンド", v: "Node, Spring, PostgreSQL" },
    { k: "プログラミング歴", v: "2020年から" },
    { k: "学歴", v: "FIAP ソフトウェア工学（2027年卒業予定）" },
  ],
  projetos: [
    {
      id: "devclean",
      nome: "DevClean",
      resumo: "Mac のディスクを圧迫している開発ツールを見つけ、安全なものだけを削除します。",
      problema:
        "DerivedData、シミュレータ、Android のイメージ、node_modules、キャッシュは合わせて数十 GB になります。汎用のクリーナーには、どれを作り直せるかが分かりません。",
      comoFunciona:
        "見つかった項目ごとに、どのツールが作ったか、容量、削除のリスク、あとで作り直す方法を表示します。アプリは確認のあとで既知のキャッシュだけをゴミ箱に移し、ゴミ箱を空にすることはありません。",
      dificil:
        "同じ TypeScript のエンジンが、JavaScriptCore を通して CLI でも SwiftUI アプリの中でも、macOS と iPhone で動きます。ルールは JSON ファイルなので、新しいスキャナにコードは要りません。移動の前に実際のパスと inode を再確認するので、ルールが間違っていても表示が増えるだけで、余計に消すことはありません。",
      estado: "自分の Mac で使用中",
      papel: "個人プロジェクト",
      stack: "TypeScript, Bun, Swift, SwiftUI, JavaScriptCore",
      codigo: "https://github.com/danieltinois/dev-macos-clean",
    },
    {
      id: "pato-commit",
      nome: "Pato Commit",
      resumo: "GitHub であなたの判断を待っているものだけを集めた受信箱。あなたのマシンで動きます。",
      problema: "レビュー待ちの PR、返事のない issue、失敗したワークフローが通知の中に埋もれてしまいます。",
      comoFunciona: "GitHub App の webhook を受け取り、あなたの対応が必要なものだけのリストを作ります。",
      dificil:
        "GitHub は各イベントを少なくとも 1 回届けます。各配信は署名を検証し、ID で重複を除き、応答の前に Postgres に保存します。条件付きの UPDATE で、処理するワーカーが 1 つだけになることを保証します。キューはテーブルで、Redis もブローカーも使いません。その理由は 3 つの ADR に書いてあります。",
      estado: "イベントの受信は完成。受信箱が次のマイルストーン",
      papel: "個人プロジェクト（ADR から CI まで）",
      stack: "Java 25, Spring Boot 4, PostgreSQL 18, Flyway, Next.js 16",
      codigo: "https://github.com/danieltinois/pato-commit",
    },
    {
      id: "resume-tailor",
      nome: "resume-tailor",
      resumo: "1 つのプロフィールから、求人ごとに合わせた履歴書を作ります。何もでっち上げません。",
      problema: "求人ごとに履歴書を合わせるのは手作業で、AI で書き直すツールは事実をでっち上げます。",
      comoFunciona:
        "求人票を貼り付けると、求められているスキルを見つけ、どの経験をどの順で見せるかを提案し、ATS で読める A4 の PDF を作ります。プロフィールはポルトガル語と英語に対応しています。",
      dificil:
        "文章は必ずプロフィールから取ります。生成器は ID でコピーし、未知の ID を拒否するので、あとから AI をつないでも会社名、役職、数値をでっち上げることはできません。OpenAPI の契約はテストで検証され、フロントエンドの型を生成します。E2E テストは登録から PDF までを通します。",
      estado: "動作中。Docker Compose で起動",
      papel: "個人プロジェクト",
      stack: "Java 21, Spring Boot, Angular, PostgreSQL, Typst, Playwright",
      codigo: "https://github.com/danieltinois/job-resume-generator",
    },
  ],
  trajetoria: [
    { quando: "2026", titulo: "Verzel", texto: "フルスタック開発者（ミドル）。" },
    {
      quando: "2026",
      titulo: "LBA Capital（フリーランス）",
      texto: "ボレート（ブラジルの振込用紙）の処理と更新の詰まりを、キューと webhook で解消。Node、Supabase、PostgreSQL。",
    },
    {
      quando: "2025",
      titulo: "FIAP NEXT で優勝",
      texto: "Astéria の課題：小規模スーパーのレジ管理。プロトタイプから経営陣へのピッチまで。",
    },
    {
      quando: "2025–2026",
      titulo: "Swift",
      texto: "インテグレーションチームで 1 年 7 か月：React で Web、Flutter でモバイル、EC 向けの API。",
    },
    { quando: "2024", titulo: "FIAP", texto: "ソフトウェア工学。2027年卒業予定。" },
    {
      quando: "2021–2025",
      titulo: "フリーランス",
      texto: "4 年間、EC サイト、ランディングページ、オーダーメイドのシステムを、契約からデプロイまで一人で担当。",
    },
    { quando: "2021", titulo: "最初のサイト", texto: "ボランティアで、救急診療所（UPA）の患者に受診後の案内をするサイト。" },
    { quando: "2020", titulo: "Minecraft のプラグイン", texto: "Java。プログラミングが、ほかの人に使われるものになった場所。" },
  ],
  contato: {
    titulo: "ここまで読んでくれましたか？話しましょう。",
    texto: "いちばん早いのはメールです。",
  },
};
