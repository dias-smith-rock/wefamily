type MemberRole = "Parent" | "Child" | "Grandmother";

type ProfileBadge =
  | { kind: "app" }
  | { kind: "child" }
  | { kind: "elderly" };

export type FamilyMemberMock = {
  id: string;
  name: string;
  initials: string;
  avatarClass: string;
  role: MemberRole;
  badge: ProfileBadge;
  tasks: string[];
};

export const MOCK_FAMILY_MEMBERS: FamilyMemberMock[] = [
  {
    id: "1",
    name: "Sarah Chen",
    initials: "SC",
    avatarClass: "bg-emerald-500",
    role: "Parent",
    badge: { kind: "app" },
    tasks: [
      "Review weekly chore rotation",
      "Approve Emma’s screen-time request",
    ],
  },
  {
    id: "2",
    name: "Emma Chen",
    initials: "EC",
    avatarClass: "bg-violet-500",
    role: "Child",
    badge: { kind: "child" },
    tasks: [
      "Math homework — Chapter 4",
      "Practice piano (20 min)",
      "Pack backpack for field trip",
    ],
  },
  {
    id: "3",
    name: "Mei-Ling Wang",
    initials: "MW",
    avatarClass: "bg-sky-500",
    role: "Grandmother",
    badge: { kind: "elderly" },
    tasks: [
      "Morning walk checklist",
      "Blood pressure log entry",
    ],
  },
  {
    id: "4",
    name: "David Chen",
    initials: "DC",
    avatarClass: "bg-indigo-600",
    role: "Parent",
    badge: { kind: "app" },
    tasks: [
      "Grocery pickup — Saturday 4pm",
      "Fix leaky faucet in guest bath",
    ],
  },
  {
    id: "5",
    name: "Leo Chen",
    initials: "LC",
    avatarClass: "bg-fuchsia-500",
    role: "Child",
    badge: { kind: "child" },
    tasks: [
      "Reading log — 15 pages",
      "Tidy LEGO station",
    ],
  },
  {
    id: "6",
    name: "Robert Wang",
    initials: "RW",
    avatarClass: "bg-amber-500",
    role: "Grandmother",
    badge: { kind: "elderly" },
    tasks: [
      "Medication reminder — evening dose",
      "Call clinic to confirm appointment",
      "Water indoor plants",
    ],
  },
];

function StatCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: number;
  valueClassName: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span
          className={`text-4xl font-bold tabular-nums tracking-tight sm:text-5xl ${valueClassName}`}
        >
          ({value})
        </span>
      </p>
    </div>
  );
}

function ProfileTag({ badge }: { badge: ProfileBadge }) {
  if (badge.kind === "app") {
    return (
      <span className="inline-flex w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 ring-1 ring-inset ring-green-600/15">
        Active App User
      </span>
    );
  }
  if (badge.kind === "child") {
    return (
      <span className="inline-flex w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-600/15">
        Child Profile
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-600/15">
      Elderly Profile
    </span>
  );
}

function MemberCard({ member }: { member: FamilyMemberMock }) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
      <div className="flex min-h-0 items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold uppercase text-white ${member.avatarClass}`}
          aria-hidden
        >
          {member.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h2 className="truncate text-lg font-semibold text-gray-900">
              {member.name}
            </h2>
            <span className="text-sm font-medium text-gray-400">
              {member.role}
            </span>
          </div>
          <div className="mt-3">
            <ProfileTag badge={member.badge} />
          </div>
        </div>
      </div>

      <div className="my-5 h-px bg-gray-100" role="separator" />

      <ul className="space-y-3">
        {member.tasks.map((task) => (
          <li key={task} className="flex min-h-[44px] items-start gap-3 sm:min-h-0">
            <span
              className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center sm:h-4 sm:w-4"
              aria-hidden
            >
              <span className="inline-flex h-4 w-4 rounded-full border-2 border-gray-300 bg-white sm:mt-0.5" />
            </span>
            <span className="text-sm leading-snug text-gray-500">{task}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function FamilyMembers() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Family Members</h1>
        <p className="mt-1 text-sm text-gray-500">
          预览数据：成员、角色与进行中的任务（只读控制台）。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Registered Users"
          value={2}
          valueClassName="text-green-600"
        />
        <StatCard
          label="Managed Profiles"
          value={3}
          valueClassName="text-purple-600"
        />
        <StatCard
          label="Pending Tasks"
          value={10}
          valueClassName="text-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_FAMILY_MEMBERS.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
