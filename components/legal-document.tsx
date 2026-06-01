import type { Dictionary } from "@/lib/i18n/types";

type LegalSection = Dictionary["legal"]["privacy"]["sections"][number];

type LegalDocumentProps = {
  intro: string;
  sections: LegalSection[];
  contactLead: string;
  supportEmail: string;
};

export function LegalDocument({
  intro,
  sections,
  contactLead,
  supportEmail,
}: LegalDocumentProps) {
  return (
    <>
      <p>{intro}</p>

      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            {section.heading}
          </h2>
          {section.lead ? <p className="mt-4">{section.lead}</p> : null}
          {section.items?.length ? (
            <ul className="mt-4 list-disc space-y-3 pl-5 text-neutral-700 marker:text-neutral-400">
              {section.items.map((item, index) => (
                <li key={`${section.heading}-item-${index}`}>
                  {item.term ? (
                    <>
                      <span className="font-medium text-neutral-900">
                        {item.term}
                      </span>{" "}
                      {item.body}
                    </>
                  ) : (
                    item.body
                  )}
                </li>
              ))}
            </ul>
          ) : null}
          {section.paragraphs?.map((paragraph, index) => (
            <p key={`${section.heading}-p-${index}`} className="mt-4">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <section>
        <p className="mt-4">
          {contactLead}{" "}
          <a
            href={`mailto:${supportEmail}`}
            className="font-medium text-[#007AFF] underline-offset-2 hover:underline"
          >
            {supportEmail}
          </a>
        </p>
      </section>
    </>
  );
}
