// Script inline do <head> (padrão do guia "Preventing flash before hydration" do Next):
// aplica o tema antes da primeira pintura. Escuro é o padrão do site; o claro só vale
// quando a pessoa escolheu no botão (salvo em localStorage).
// Conteúdo fixo, sem dado de usuário: seguro para dangerouslySetInnerHTML.
export const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem("theme");document.documentElement.setAttribute("data-theme",s==="light"?"light":"dark")}catch(e){document.documentElement.setAttribute("data-theme","dark")}})()`;
