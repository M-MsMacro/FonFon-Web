import { PeopleIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui";
import { t } from "@/lib/strings";

export const metadata = { title: t.patients.title };

export default function ProHomePage() {
  return (
    <div className="pt-16">
      <EmptyState icon={<PeopleIcon className="size-8" />} message={t.patients.select} />
    </div>
  );
}
