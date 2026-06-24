import { redirect } from "next/navigation";

export default async function RSVPDonePage({ searchParams }: { searchParams: Promise<{ name?: string }> }) {
  const { name } = await searchParams;
  const target = name
    ? `/events/newwww/rsvp/done?name=${encodeURIComponent(name)}`
    : "/events/newwww/rsvp/done";
  redirect(target);
}
