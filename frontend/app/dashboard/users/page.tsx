import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { UsersPanel } from "@/components/dashboard/users-panel";

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mt-6">
      <UsersPanel currentUserId={user.id} />
    </div>
  );
}
