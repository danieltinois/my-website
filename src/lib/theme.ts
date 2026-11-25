// Script inline do <head> (padrão do guia "Preventing flash before hydration" do Next):
// aplica o tema salvo em localStorage, ou o do sistema, antes da primeira pintura, e
// acompanha a mudança do sistema enquanto não houver escolha salva.
// Conteúdo fixo, sem dado de usuário: seguro para dangerouslySetInnerHTML.
export const THEME_SCRIPT = `(function(){try{var d=document.documentElement,s=localStorage.getItem("theme"),m=matchMedia("(prefers-color-scheme: dark)");var a=function(){d.setAttribute("data-theme",s==="dark"||s==="light"?s:m.matches?"dark":"light")};a();m.addEventListener("change",function(){s=localStorage.getItem("theme");a()})}catch(e){}})()`;
