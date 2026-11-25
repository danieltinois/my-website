import { EMAIL } from "@/src/data/site";

// o único botão em signal do site (docs/design.md, cor: regra 1)
const EmailCta = () => (
  <a
    href={`mailto:${EMAIL}`}
    className="block w-full bg-signal px-6 py-3 text-center text-lead font-semibold text-on-signal no-underline hover:underline sm:inline-block sm:w-auto"
  >
    {EMAIL}
  </a>
);

export default EmailCta;
